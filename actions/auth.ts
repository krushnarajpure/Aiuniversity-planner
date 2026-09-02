"use server";

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { sendVerificationEmail, sendOrganizationVerificationEmail } from "@/lib/email";

const blockedEmailDomains = new Set(["mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com", "yopmail.com", "fakeinbox.com"]);

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
    accountType: formData.get("accountType") || "STUDENT",
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
  if (blockedEmailDomains.has(email.split("@")[1] ?? "")) {
    return { success: false, message: "Temporary or disposable email addresses are not allowed.", errors: { email: ["Use a permanent email address."] } };
  }

  if (formData.get("accountType") === "ADMIN") {
    return { success: false, message: "Admin registration is not available from this page." };
  }

  const accountType = formData.get("accountType") === "ORGANIZATION" ? "ORGANIZATION" : "STUDENT";
  if (accountType === "ORGANIZATION") {
    const companyName = String(formData.get("companyName") || "").trim();
    const recruiterName = String(formData.get("recruiterName") || "").trim();
    const recruiterDesignation = String(formData.get("recruiterDesignation") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const website = String(formData.get("website") || "").trim();
    const description = String(formData.get("companyDescription") || "").trim();
    if (companyName.length < 2 || recruiterName.length < 2 || recruiterDesignation.length < 2 || !/^\+?[0-9\s().-]{7,20}$/.test(phone) || (website && !/^https?:\/\//i.test(website)) || description.length < 20) {
      return { success: false, message: "Please complete valid organization and recruiter details before registering." };
    }
  }
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

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      university,
      department,
      semester,
      role: accountType,
      organization: accountType === "ORGANIZATION" ? { create: { companyName: String(formData.get("companyName")), description: String(formData.get("companyDescription")), recruiterName: String(formData.get("recruiterName")), recruiterDesignation: String(formData.get("recruiterDesignation")), phone: String(formData.get("phone")), website: String(formData.get("website") || "") || null, industry: String(formData.get("industry") || "") || null, location: String(formData.get("location") || "") || null, companySize: String(formData.get("companySize") || "") || null, verificationMessage: "Registration submitted. Awaiting administrator approval." } } : undefined,
    },
  });

  const createdUser = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
  if (createdUser) {
    const rawToken = randomBytes(32).toString("hex");
    await prisma.verificationToken.create({ data: { userId: createdUser.id, tokenHash: createHash("sha256").update(rawToken).digest("hex"), tokenType: "EMAIL_VERIFICATION", expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
    try {
      if (accountType === "ORGANIZATION") {
        const companyName = String(formData.get("companyName"));
        const recruiterName = String(formData.get("recruiterName"));
        await sendOrganizationVerificationEmail({ email, companyName, recruiterName, token: rawToken });
      } else {
        await sendVerificationEmail({ email, name: createdUser.name, token: rawToken });
      }
    } catch {
      return { success: true, message: accountType === "ORGANIZATION" ? "Organization registered. Email verification is pending; contact support if the verification email does not arrive." : "Account created. Email verification is pending; contact support if the verification email does not arrive." };
    }
  }

  return {
    success: true,
    message: accountType === "ORGANIZATION" ? "Registration submitted. Verify your email, then wait for administrator approval." : "Account created. Please verify your email before logging in.",
  };
}
