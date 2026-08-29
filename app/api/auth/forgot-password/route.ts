import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const requestSchema = z.object({ email: z.string().email() });
const genericResponse = { success: true, message: "If an account exists for that email, a password reset link has been sent." };

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(genericResponse);
  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json(genericResponse);

  const recent = await prisma.verificationToken.findFirst({ where: { userId: user.id, tokenType: "PASSWORD_RESET", createdAt: { gt: new Date(Date.now() - 60 * 1000) } } });
  if (recent) return NextResponse.json(genericResponse);

  const rawToken = randomBytes(32).toString("hex");
  await prisma.verificationToken.deleteMany({ where: { userId: user.id, tokenType: "PASSWORD_RESET" } });
  const token = await prisma.verificationToken.create({ data: { userId: user.id, tokenHash: createHash("sha256").update(rawToken).digest("hex"), tokenType: "PASSWORD_RESET", expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
  try {
    await sendPasswordResetEmail({ email: user.email, name: user.name, token: rawToken });
  } catch {
    await prisma.verificationToken.delete({ where: { id: token.id } });
  }
  return NextResponse.json(genericResponse);
}
