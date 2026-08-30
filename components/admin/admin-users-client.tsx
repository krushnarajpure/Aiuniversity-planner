"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import {
  deleteAdminUser,
  getAdminUserDetail,
  updateAdminUser,
  type AdminUserDetail,
  type AdminUserRow,
  type AdminUsersStats,
} from "@/actions/admin";

const INITIAL_SORT = "newest";

function formatDate(value: Date | string | null) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function getInitial(name: string | null | undefined) {
  return (name ?? "").trim().charAt(0)?.toUpperCase() || "U";
}

function formatCgpa(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "Not provided";
  return Number(value).toFixed(2);
}

function formatStudyHours(hours: number | null | undefined) {
  if (hours === null || hours === undefined || Number.isNaN(hours)) return "0h";
  return `${Math.max(0, Number(hours)).toFixed(1)}h`;
}

export function AdminUsersClient({
  users,
  total,
  page,
  pageSize,
  stats,
  universities,
  departments,
  semesters,
  search,
  university,
  department,
  semester,
  minCgpa,
  maxCgpa,
  sort,
}: {
  users: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
  stats: AdminUsersStats;
  universities: string[];
  departments: string[];
  semesters: string[];
  search: string;
  university: string;
  department: string;
  semester: string;
  minCgpa: string;
  maxCgpa: string;
  sort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(search);
  const [filters, setFilters] = useState({
    university,
    department,
    semester,
    minCgpa,
    maxCgpa,
  });
  const [sortValue, setSortValue] = useState(sort || INITIAL_SORT);
  const [isPending, startTransition] = useTransition();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [detailsUser, setDetailsUser] = useState<AdminUserDetail | null>(null);
  const [editUser, setEditUser] = useState<AdminUserRow | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (filters.university) params.set("university", filters.university);
      if (filters.department) params.set("department", filters.department);
      if (filters.semester) params.set("semester", filters.semester);
      if (filters.minCgpa) params.set("minCgpa", filters.minCgpa);
      if (filters.maxCgpa) params.set("maxCgpa", filters.maxCgpa);
      if (sortValue && sortValue !== INITIAL_SORT) params.set("sort", sortValue);
      params.set("page", "1");
      const target = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      startTransition(() => {
        router.replace(target, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, filters, sortValue, pathname, router]);

  useEffect(() => {
    setQuery(search);
    setFilters({ university, department, semester, minCgpa, maxCgpa });
    setSortValue(sort || INITIAL_SORT);
  }, [search, university, department, semester, minCgpa, maxCgpa, sort]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  const applyFilterUpdate = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ university: "", department: "", semester: "", minCgpa: "", maxCgpa: "" });
    setSortValue(INITIAL_SORT);
    setQuery("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    startTransition(() => {
      router.refresh();
    });
    window.setTimeout(() => setRefreshing(false), 400);
  };

  const handleViewProfile = async (userId: string) => {
    const details = await getAdminUserDetail(userId);
    if (!details) {
      toast.error("User details could not be loaded.");
      return;
    }
    setDetailsUser(details);
    setMenuOpenId(null);
  };

  const handleOpenEdit = (user: AdminUserRow) => {
    setEditUser(user);
    setMenuOpenId(null);
  };

  const handleSaveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editUser) return;

    const formData = new FormData(event.currentTarget);
    formData.set("userId", editUser.id);

    const result = await updateAdminUser(formData);
    if (result.success) {
      toast.success(result.message);
      setEditUser(null);
      startTransition(() => router.refresh());
      return;
    }

    toast.error(result.message);
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = window.confirm("Delete this user? This action cannot be undone and may remove associated records.");
    if (!confirmed) return;

    const formData = new FormData();
    formData.set("userId", userId);
    const result = await deleteAdminUser(formData);

    if (result.success) {
      toast.success(result.message);
      setMenuOpenId(null);
      startTransition(() => router.refresh());
      return;
    }

    toast.error(result.message);
  };

  const handleExport = () => {
    if (users.length === 0) {
      toast.error("There are no users to export.");
      return;
    }

    const headers = ["Name", "Email", "University", "Department", "Semester", "CGPA", "Target CGPA", "Joined"];
    const rows = users.map((user) => [
      user.name,
      user.email,
      user.university ?? "Not provided",
      user.department ?? "Not provided",
      user.semester ?? "Not provided",
      formatCgpa(user.cgpa),
      user.targetCgpa ? Number(user.targetCgpa).toFixed(2) : "Not provided",
      formatDate(user.createdAt),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-users.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("User list exported.");
  };

  return (
    <section className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">User management</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">User Management</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">View and manage all registered students.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users by name, email, university..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Users</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.totalUsers}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">All registered users</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Active Users</span>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.activeUsers}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Currently active</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">New Users</span>
            <CalendarDays className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.newUsers}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Joined this month</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Universities</span>
            <Building2 className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.universities}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Total universities</p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={filters.university}
              onChange={(event) => applyFilterUpdate("university", event.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">All Universities</option>
              {universities.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={filters.department}
              onChange={(event) => applyFilterUpdate("department", event.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">All Departments</option>
              {departments.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={filters.semester}
              onChange={(event) => applyFilterUpdate("semester", event.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">All Semesters</option>
              {semesters.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 dark:border-slate-700 dark:bg-slate-800">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">CGPA</span>
            <input
              value={filters.minCgpa}
              onChange={(event) => applyFilterUpdate("minCgpa", event.target.value)}
              type="number"
              step="0.01"
              min="0"
              max="4"
              placeholder="Min"
              className="w-20 border-0 bg-transparent px-1 py-1 text-sm text-slate-700 outline-none dark:text-slate-200"
            />
            <span className="text-slate-400">—</span>
            <input
              value={filters.maxCgpa}
              onChange={(event) => applyFilterUpdate("maxCgpa", event.target.value)}
              type="number"
              step="0.01"
              min="0"
              max="4"
              placeholder="Max"
              className="w-20 border-0 bg-transparent px-1 py-1 text-sm text-slate-700 outline-none dark:text-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sortValue}
              onChange={(event) => setSortValue(event.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="cgpa-desc">Highest CGPA</option>
              <option value="cgpa-asc">Lowest CGPA</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-lg font-medium text-slate-900 dark:text-white">No users found</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Avatar</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">University</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">CGPA</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          getInitial(user.name)
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.email}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.university || "Not provided"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.department || "Not provided"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.semester || "Not provided"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatCgpa(user.cgpa)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => setMenuOpenId(menuOpenId === user.id ? null : user.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                          aria-label={`Open actions for ${user.name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {menuOpenId === user.id && (
                          <div className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                            <button
                              type="button"
                              onClick={() => handleViewProfile(user.id)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              <Eye className="h-4 w-4" />
                              View Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(user)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit User
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} users
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => startTransition(() => router.replace(`${pathname}?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(window.location.search).entries()), page: String(Math.max(1, page - 1)) }).toString()}` || pathname, { scroll: false }))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => startTransition(() => {
                  const params = new URLSearchParams(window.location.search);
                  params.set("page", String(pageNumber));
                  router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                })}
                className={`h-9 w-9 rounded-lg text-sm font-medium ${pageNumber === page ? "bg-primary text-white" : "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"}`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => startTransition(() => {
                const params = new URLSearchParams(window.location.search);
                params.set("page", String(Math.min(totalPages, page + 1)));
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
              })}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {detailsUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xl font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  {detailsUser.image ? (
                    <img src={detailsUser.image} alt={detailsUser.name} className="h-full w-full object-cover" />
                  ) : (
                    getInitial(detailsUser.name)
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{detailsUser.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{detailsUser.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailsUser(null)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Account status</p>
                <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Active</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Member Since</p>
                <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">{formatDate(detailsUser.createdAt)}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/60">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Academic Information</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-slate-500 dark:text-slate-400">University</dt><dd>{detailsUser.university || "Not provided"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500 dark:text-slate-400">Department</dt><dd>{detailsUser.department || "Not provided"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500 dark:text-slate-400">Semester</dt><dd>{detailsUser.semester || "Not provided"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500 dark:text-slate-400">CGPA</dt><dd>{formatCgpa(detailsUser.cgpa)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500 dark:text-slate-400">Target CGPA</dt><dd>{detailsUser.targetCgpa ? Number(detailsUser.targetCgpa).toFixed(2) : "Not provided"}</dd></div>
                </dl>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/60">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Academic Summary</p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Courses Enrolled</span><span>{detailsUser.courseCount}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Assignments</span><span>{detailsUser.assignmentCount}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Exams</span><span>{detailsUser.examCount}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Study Hours</span><span>{formatStudyHours(detailsUser.studyHours)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Edit user</p>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Update profile</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
                <input
                  name="name"
                  defaultValue={editUser.name}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">University</label>
                <input
                  name="university"
                  defaultValue={editUser.university ?? ""}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Department</label>
                <input
                  name="department"
                  defaultValue={editUser.department ?? ""}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Semester</label>
                  <input
                    name="semester"
                    defaultValue={editUser.semester ?? ""}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">CGPA</label>
                  <input
                    name="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    defaultValue={editUser.cgpa ?? ""}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Target CGPA</label>
                <input
                  name="targetCgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  defaultValue={editUser.targetCgpa ?? ""}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Account Status</p>
                <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Active</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
