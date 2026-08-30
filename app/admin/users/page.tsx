import { getAdminUsers } from "@/actions/admin";
import { AdminUsersClient } from "@/components/admin/admin-users-client";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    university?: string;
    department?: string;
    semester?: string;
    minCgpa?: string;
    maxCgpa?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const page = Math.max(1, Number(params.page) || 1);
  const university = params.university || "";
  const department = params.department || "";
  const semester = params.semester || "";
  const minCgpa = params.minCgpa || "";
  const maxCgpa = params.maxCgpa || "";
  const sort = params.sort || "newest";

  const data = await getAdminUsers({
    query,
    university,
    department,
    semester,
    minCgpa,
    maxCgpa,
    sort,
    page,
    pageSize: 10,
  });

  return (
    <AdminUsersClient
      users={data.users}
      total={data.total}
      page={data.page}
      pageSize={data.pageSize}
      stats={data.stats}
      universities={data.universities}
      departments={data.departments}
      semesters={data.semesters}
      search={query}
      university={university}
      department={department}
      semester={semester}
      minCgpa={minCgpa}
      maxCgpa={maxCgpa}
      sort={sort}
    />
  );
}
