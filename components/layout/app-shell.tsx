import { AppShellClient } from "./app-shell-client";

export async function AppShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  return (
    <AppShellClient userName={userName} unreadCount={0}>
      {children}
    </AppShellClient>
  );
}
