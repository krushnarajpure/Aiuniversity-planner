"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdminId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/login");
  return session.user.id;
}

export async function deleteUser(formData: FormData) {
  await requireAdminId();
  const userId = String(formData.get("userId") || "");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role !== "STUDENT") return;
  await prisma.user.delete({ where: { id: userId } });
  redirect("/admin/users");
}