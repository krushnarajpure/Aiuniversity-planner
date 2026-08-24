import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({ token: z.string().length(64), password: z.string().min(8, "Password must be at least 8 characters") });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || "Invalid reset request." }, { status: 400 });
  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await prisma.verificationToken.findFirst({ where: { tokenHash, tokenType: "PASSWORD_RESET" } });
  if (!record) return NextResponse.json({ success: false, message: "Invalid or already-used password reset link." }, { status: 400 });
  if (record.expiresAt <= new Date()) { await prisma.verificationToken.delete({ where: { id: record.id } }); return NextResponse.json({ success: false, message: "This password reset link has expired. Please request a new one." }, { status: 400 }); }
  const password = await bcrypt.hash(parsed.data.password, 10);
  await prisma.$transaction([prisma.user.update({ where: { id: record.userId }, data: { password } }), prisma.verificationToken.delete({ where: { id: record.id } })]);
  return NextResponse.json({ success: true, message: "Password reset successfully. You can now login." });
}
