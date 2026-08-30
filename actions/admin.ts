"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  university: string | null;
  department: string | null;
  semester: string | null;
  cgpa: number | null;
  targetCgpa: number | null;
  createdAt: Date;
};

export type AdminUsersStats = {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  universities: number;
};

export type AdminUserDetail = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  university: string | null;
  department: string | null;
  semester: string | null;
  cgpa: number | null;
  targetCgpa: number | null;
  createdAt: Date;
  courseCount: number;
  assignmentCount: number;
  examCount: number;
  studyHours: number | null;
};

async function requireAdminId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/login");
  return session.user.id;
}

export async function getAdminUsers({
  query = "",
  university = "",
  department = "",
  semester = "",
  minCgpa,
  maxCgpa,
  sort = "newest",
  page = 1,
  pageSize = 10,
}: {
  query?: string;
  university?: string;
  department?: string;
  semester?: string;
  minCgpa?: string;
  maxCgpa?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireAdminId();

  const normalizedQuery = query.trim();
  const min = minCgpa && !Number.isNaN(Number(minCgpa)) ? Number(minCgpa) : undefined;
  const max = maxCgpa && !Number.isNaN(Number(maxCgpa)) ? Number(maxCgpa) : undefined;

  const where: any = { role: "STUDENT" };

  if (normalizedQuery) {
    where.OR = [
      { name: { contains: normalizedQuery, mode: "insensitive" } },
      { email: { contains: normalizedQuery, mode: "insensitive" } },
      { university: { contains: normalizedQuery, mode: "insensitive" } },
      { department: { contains: normalizedQuery, mode: "insensitive" } },
    ];
  }

  if (university) {
    where.university = { equals: university, mode: "insensitive" };
  }

  if (department) {
    where.department = { equals: department, mode: "insensitive" };
  }

  if (semester) {
    where.semester = { equals: semester, mode: "insensitive" };
  }

  if (min !== undefined || max !== undefined) {
    where.cgpa = {} as any;
    if (min !== undefined) {
      where.cgpa.gte = min;
    }
    if (max !== undefined) {
      where.cgpa.lte = max;
    }
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  if (sort === "name-asc") orderBy = { name: "asc" };
  if (sort === "name-desc") orderBy = { name: "desc" };
  if (sort === "cgpa-desc") orderBy = { cgpa: "desc" };
  if (sort === "cgpa-asc") orderBy = { cgpa: "asc" };

  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || 10);

  const [users, total, stats, universities, departments, semesters] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        university: true,
        department: true,
        semester: true,
        cgpa: true,
        targetCgpa: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
    prisma.user.groupBy({
      by: ["role"],
      where: { role: "STUDENT" },
      _count: { _all: true },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT", university: { not: null } },
      select: { university: true },
      distinct: ["university"],
      orderBy: { university: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT", department: { not: null } },
      select: { department: true },
      distinct: ["department"],
      orderBy: { department: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT", semester: { not: null } },
      select: { semester: true },
      distinct: ["semester"],
      orderBy: { semester: "asc" },
    }),
  ]);

  const totalUsers = await prisma.user.count({ where: { role: "STUDENT" } });
  const activeUsers = await prisma.user.count({ where: { role: "STUDENT", updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } });
  const newUsers = await prisma.user.count({ where: { role: "STUDENT", createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } });
  const universitiesCount = await prisma.user.groupBy({ by: ["university"], where: { role: "STUDENT", university: { not: null } } }).then((items) => items.filter((item) => item.university).length);

  return {
    users,
    total: total,
    page: safePage,
    pageSize: safePageSize,
    stats: {
      totalUsers,
      activeUsers,
      newUsers,
      universities: universitiesCount,
    },
    universities: universities.map((u) => u.university).filter(Boolean) as string[],
    departments: departments.map((d) => d.department).filter(Boolean) as string[],
    semesters: semesters.map((s) => s.semester).filter(Boolean) as string[],
  };
}

export async function getAdminUserDetail(userId: string) {
  await requireAdminId();

  const user = await prisma.user.findFirst({
    where: { id: userId, role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      university: true,
      department: true,
      semester: true,
      cgpa: true,
      targetCgpa: true,
      createdAt: true,
      _count: {
        select: { courses: true, assignments: true, exams: true },
      },
      studyPlans: { select: { plan: true } },
    },
  });

  if (!user) return null;

  const studyHours = user.studyPlans.reduce((sum, plan) => {
    const value = plan.plan as any;
    if (value && typeof value === "object") {
      const total = Number(value.totalHours ?? value.hours ?? 0);
      if (!Number.isNaN(total)) return sum + total;
    }
    return sum;
  }, 0);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    university: user.university,
    department: user.department,
    semester: user.semester,
    cgpa: user.cgpa,
    targetCgpa: user.targetCgpa,
    createdAt: user.createdAt,
    courseCount: user._count.courses,
    assignmentCount: user._count.assignments,
    examCount: user._count.exams,
    studyHours,
  } satisfies AdminUserDetail;
}

export async function updateAdminUser(formData: FormData) {
  await requireAdminId();

  const userId = String(formData.get("userId") || "");
  const name = String(formData.get("name") || "").trim();
  const university = String(formData.get("university") || "").trim();
  const department = String(formData.get("department") || "").trim();
  const semester = String(formData.get("semester") || "").trim();
  const cgpaValue = formData.get("cgpa");
  const targetCgpaValue = formData.get("targetCgpa");

  if (!userId) {
    return { success: false, message: "User not found." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!user || user.role !== "STUDENT") {
    return { success: false, message: "Only student profiles can be edited here." };
  }

  const cgpa = cgpaValue === "" || cgpaValue === null ? null : Number(cgpaValue);
  const targetCgpa = targetCgpaValue === "" || targetCgpaValue === null ? null : Number(targetCgpaValue);

  if ((cgpa !== null && Number.isNaN(cgpa)) || (targetCgpa !== null && Number.isNaN(targetCgpa))) {
    return { success: false, message: "CGPA values must be valid numbers." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || "Student",
      university: university || null,
      department: department || null,
      semester: semester || null,
      cgpa: cgpa !== null && cgpa >= 0 && cgpa <= 4 ? cgpa : null,
      targetCgpa: targetCgpa !== null && targetCgpa >= 0 && targetCgpa <= 4 ? targetCgpa : null,
    },
  });

  return { success: true, message: "User updated successfully." };
}

export async function deleteAdminUser(formData: FormData) {
  await requireAdminId();

  const userId = String(formData.get("userId") || "");
  if (!userId) {
    return { success: false, message: "User not found." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, image: true },
  });

  if (!user || user.role !== "STUDENT") {
    return { success: false, message: "Only student profiles can be deleted from this page." };
  }

  await prisma.user.delete({ where: { id: userId } });

  if (user.image) {
    try {
      const filePath = user.image.split("/storage/v1/object/public/avatars/")[1];
      if (filePath) {
        const { supabase } = await import("@/lib/supabase");
        await supabase.storage.from("avatars").remove([filePath]);
      }
    } catch {
      // Ignore storage cleanup failures to avoid blocking deletion.
    }
  }

  return { success: true, message: "User deleted successfully." };
}

export async function deleteUser(formData: FormData) {
  const result = await deleteAdminUser(formData);
  if (result.success) {
    redirect("/admin/users");
  }
  return result;
}