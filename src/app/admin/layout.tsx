import { requireAdmin } from "@/server/access";
import { AdminAppShell } from "./_components/admin-app-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return <AdminAppShell admin={admin}>{children}</AdminAppShell>;
}
