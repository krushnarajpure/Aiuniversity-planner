import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const loginUrl = new URL("/login", request.url);
  if (!token) {
    loginUrl.searchParams.set("verified", "invalid");
    return NextResponse.redirect(loginUrl);
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const record = await prisma.verificationToken.findFirst({ where: { tokenHash, tokenType: "EMAIL_VERIFICATION" } });
  if (!record) {
    loginUrl.searchParams.set("verified", "invalid");
    return NextResponse.redirect(loginUrl);
  }
  if (record.expiresAt <= new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    loginUrl.searchParams.set("verified", "expired");
    return NextResponse.redirect(loginUrl);
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.delete({ where: { id: record.id } }),
  ]);
  loginUrl.searchParams.set("verified", "1");
  return NextResponse.redirect(loginUrl);
}