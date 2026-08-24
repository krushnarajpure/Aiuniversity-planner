"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { createHash, randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export type RegisterState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function registerUser(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    university: formData.get("university") || undefined,
    department: formData.get("department") || undefined,
    semester: formData.get("semester") || undefined,
  };

  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, password, university, department, semester } = parsed.data;
  const email = parsed.data.email.toLowerCase().trim();

  // Check if a user with this email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return {
      success: false,
      message: "An account with this email already exists",
      errors: { email: ["Email is already registered"] },
    };
  }

  // Hash the password before storing it — never store plain text passwords
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      university,
      department,
      semester,
    },
  });

  const rawToken = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({ data: { userId: user.id, tokenHash: createHash("sha256").update(rawToken).digest("hex"), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
  try {
    await sendVerificationEmail({ email, name, token: rawToken });
  } catch {
    await prisma.user.delete({ where: { id: user.id } });
    return { success: false, message: "Account created, but we could not send the verification email. Please check the server email configuration." };
  }

  return {
    success: true,
    message: "Registration successful! Please check your email to verify your account.",
  };
}
