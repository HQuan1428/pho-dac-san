import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
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

      {/* Toolbar above table */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form method="GET" action="/admin/nguoi-dung" className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={searchQuery}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>

        <div className="text-xs text-muted-foreground">
          Tổng cộng: <strong className="text-foreground">{totalItems}</strong> người dùng
        </div>
      </div>

      {/* Table: compact rows h-11, sticky header, pagination footer */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/60 dark:bg-muted/30 backdrop-blur z-10">
              <TableRow className="h-11">
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
                users.map((u) => (
                  <TableRow key={u.id} className="h-11">
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-xs text-foreground">{u.name || "Chưa đặt tên"}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{u.email}</p>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs">
                      {u.phone || "—"}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={u.role === "ADMIN" ? "default" : "outline"}
                        className="text-[10px] font-semibold"
                      >
                        {u.role}
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
                        variant={u.status === "ACTIVE" ? "outline" : "destructive"}
                        className="text-[10px]"
                      >
                        {u.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
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
                      {u.id !== currentAdmin.id && (
                        <UserActionButton
                          userId={u.id}
                          userName={u.name || u.email}
                          status={u.status}
                          role={u.role}
                          isSelf={u.id === currentAdmin.id}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

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
