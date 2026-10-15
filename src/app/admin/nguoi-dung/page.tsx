import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPagination } from "../_components/admin-pagination";
import { UserActionButton } from "./user-action-button";
import { Search, User as UserIcon } from "lucide-react";
import type { Prisma } from "@prisma/client";

export const metadata = {
  title: "Quản lý người dùng — Phố Đặc Sản Admin",
};

export default async function AdminNguoiDungPage(props: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const currentAdmin = await requireAdmin();
  const searchParams = await props.searchParams;

  const searchQuery = searchParams.q?.trim() || "";
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const pageSize = 20;

  const where: Prisma.UserWhereInput = {};

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { email: { contains: searchQuery, mode: "insensitive" } },
      { phone: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const [users, totalItems] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        ownedShop: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý người dùng"
        description="Danh sách tài khoản thành viên, người bán và quản trị viên trong hệ thống."
      />

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form method="GET" action="/admin/nguoi-dung" className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={searchQuery}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="pl-8 text-xs h-9"
          />
        </form>

        <div className="text-xs text-muted-foreground">
          Tổng cộng: <strong className="text-foreground">{totalItems}</strong> người dùng
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Gian hàng sở hữu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đăng ký</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <UserIcon className="size-6 text-muted-foreground/60" />
                    <span>Không tìm thấy người dùng nào phù hợp.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const isSelf = u.id === currentAdmin.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          {u.name}
                          {isSelf && (
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                              Bạn
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{u.email}</div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {u.phone || "—"}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={u.role === "ADMIN" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {u.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs">
                      {u.ownedShop ? (
                        <span className="font-medium text-foreground">{u.ownedShop.name}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-destructive/10 text-destructive border-destructive/30"
                        }`}
                      >
                        {u.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(u.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <UserActionButton
                        userId={u.id}
                        userName={u.name}
                        status={u.status}
                        role={u.role}
                        isSelf={isSelf}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          baseUrl="/admin/nguoi-dung"
          searchParams={{
            q: searchQuery || undefined,
          }}
        />
      </div>
    </div>
  );
}
