"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { removeProfileImageFromSupabase, uploadProfileImageToSupabase } from "@/lib/storage";
import { z } from "zod";
import { changePasswordSchema } from "@/lib/validations";

const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  university: z.string().trim().optional().or(z.literal("")),
  department: z.string().trim().optional().or(z.literal("")),
  semester: z.string().trim().optional().or(z.literal("")),
  cgpa: z.coerce.number().min(0).max(4).optional().or(z.literal("").transform(() => undefined)),
  targetCgpa: z.coerce.number().min(0).max(4).optional().or(z.literal("").transform(() => undefined)),
});

export type ProfileState = {
  success: boolean;
  message: string;
};

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("You must be logged in to do this");
  return session.user.id;
}

async function handleAvatarUpload(userId: string, formData: FormData) {
  const avatarValue = formData.get("avatar");

  if (avatarValue instanceof File) {
    if (!ALLOWED_AVATAR_TYPES.has(avatarValue.type)) {
      throw new Error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
    }

    if (avatarValue.size > MAX_AVATAR_SIZE) {
      throw new Error("Profile image must be 5MB or smaller.");
    }

    return uploadProfileImageToSupabase(avatarValue, userId);
  }

  return undefined;
}

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const userId = await requireUserId();

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    university: formData.get("university") || "",
    department: formData.get("department") || "",
    semester: formData.get("semester") || "",
    cgpa: formData.get("cgpa") || "",
    targetCgpa: formData.get("targetCgpa") || "",
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: "Please check your profile details and try again." };
  }

  let avatarUrl: string | null | undefined;
  const removeAvatar = formData.get("removeAvatar") === "true";

  try {
    if (removeAvatar) {
      avatarUrl = null;
      await removeProfileImageFromSupabase(userId);
    } else {
      avatarUrl = await handleAvatarUpload(userId, formData);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update profile photo.";
    return { success: false, message };
  }

  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!currentUser) {
    return { success: false, message: "User not found." };
  }

  const emailTaken = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });

  if (emailTaken && emailTaken.id !== userId) {
    return { success: false, message: "This email is already in use by another account." };
  }

  const payload = {
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase().trim(),
    university: parsed.data.university || null,
    department: parsed.data.department || null,
    semester: parsed.data.semester || null,
    cgpa: parsed.data.cgpa ?? null,
    targetCgpa: parsed.data.targetCgpa ?? null,
    ...(avatarUrl !== undefined ? { image: avatarUrl } : {}),
  };

  await prisma.user.update({
    where: { id: userId },
    data: payload,
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true, message: "Profile updated successfully." };
}

export async function getProfile() {
  const userId = await requireUserId();
  return prisma.user.findUnique({ where: { id: userId } });
}

export type ChangePasswordState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const userId = await requireUserId();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
  });

  if (!parsed.success) {
    return { success: false, message: "Please fix the errors below", errors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, message: "User not found" };
  }

  if (!user.password) {
    return { success: false, message: "This account does not have a password yet" };
  }

  const isCurrentValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!isCurrentValid) {
    return {
      success: false,
      message: "Current password is incorrect",
      errors: { currentPassword: ["Current password is incorrect"] },
    };
  }

  const hashedNewPassword = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashedNewPassword } });

  return { success: true, message: "Password changed successfully" };
}
