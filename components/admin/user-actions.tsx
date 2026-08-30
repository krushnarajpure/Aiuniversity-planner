"use client";

import { deleteUser } from "@/actions/admin";

export function UserActions({ userId }: { userId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <form
        action={async (formData: FormData) => {
          await deleteUser(formData);
        }}
        onSubmit={(event) => {
          if (!window.confirm("Delete this student and all associated data?")) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="userId" value={userId} />
        <button
          type="submit"
          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
        >
          Delete
        </button>
      </form>
    </div>
  );
}