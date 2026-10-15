import Link from "next/link";
import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPagination } from "../_components/admin-pagination";
import { ShopActionButtons } from "./shop-action-buttons";
import { Search, MapPin, Store } from "lucide-react";
import type { Prisma, ShopStatus } from "@prisma/client";

export const metadata = {
  title: "Quản lý gian hàng — Phố Đặc Sản Admin",
};

const statusTabs = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "REJECTED", label: "Bị từ chối" },
  { value: "SUSPENDED", label: "Tạm đình chỉ" },
];

const statusBadgeConfig: Record<ShopStatus, { label: string; className: string }> = {
  PENDING: { label: "Chờ duyệt", className: "bg-warning/15 text-warning border-warning/30" },
  ACTIVE: { label: "Hoạt động", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  REJECTED: { label: "Bị từ chối", className: "bg-destructive/15 text-destructive border-destructive/30" },
  SUSPENDED: { label: "Tạm đình chỉ", className: "bg-muted text-muted-foreground border-border" },
};

export default async function AdminGianHangPage(props: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  await requireAdmin();
  const searchParams = await props.searchParams;

  const currentTab = searchParams.status || "ALL";
  const searchQuery = searchParams.q?.trim() || "";
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const pageSize = 20;

  const where: Prisma.ShopWhereInput = {};

  if (currentTab !== "ALL" && ["PENDING", "ACTIVE", "REJECTED", "SUSPENDED"].includes(currentTab)) {
    where.status = currentTab as ShopStatus;
  }

  if (searchQuery) {
    where.name = { contains: searchQuery, mode: "insensitive" };
  }

  const [shops, totalItems, statusCounts] = await Promise.all([
    db.shop.findMany({
      where,
      include: {
        owner: true,
        province: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.shop.count({ where }),
    db.shop.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const counts: Record<string, number> = {
    ALL: 0,
    PENDING: 0,
    ACTIVE: 0,
    REJECTED: 0,
    SUSPENDED: 0,
  };

  for (const item of statusCounts) {
    counts[item.status] = item._count.id;
    counts.ALL += item._count.id;
  }

  const totalPages = Math.ceil(totalItems / pageSize);

  const buildTabUrl = (statusValue: string) => {
    const params = new URLSearchParams();
    if (statusValue !== "ALL") params.set("status", statusValue);
    if (searchQuery) params.set("q", searchQuery);
    return `/admin/gian-hang?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý gian hàng"
        description="Kiểm duyệt hồ sơ đăng ký mới, phân quyền gói dịch vụ và quản lý trạng thái các gian hàng."
      />

      {/* Tabs and Search filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5 border-b pb-2 sm:border-0 sm:pb-0">
          {statusTabs.map((tab) => {
            const isActive = currentTab === tab.value;
            const count = counts[tab.value] ?? 0;
            return (
              <Link
                key={tab.value}
                href={buildTabUrl(tab.value)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        <form method="GET" action="/admin/gian-hang" className="relative w-full sm:w-64">
          {currentTab !== "ALL" && (
            <input type="hidden" name="status" value={currentTab} />
          )}
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={searchQuery}
            placeholder="Tìm theo tên shop..."
            className="pl-8 text-xs h-9"
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gian hàng</TableHead>
              <TableHead>Chủ sở hữu</TableHead>
              <TableHead>Gói</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Store className="size-6 text-muted-foreground/60" />
                    <span>Không tìm thấy gian hàng nào phù hợp điều kiện lọc.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              shops.map((shop) => {
                const badge = statusBadgeConfig[shop.status];
                return (
                  <TableRow key={shop.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          {shop.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">{shop.slug}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3 text-primary" />
                            {shop.province.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <p className="font-medium text-foreground">{shop.owner.name}</p>
                        <p className="text-muted-foreground">{shop.owner.email}</p>
                        <p className="text-muted-foreground">{shop.phone}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[11px]">
                        {shop.plan}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${badge.className}`}
                        >
                          {badge.label}
                        </Badge>
                        {shop.statusReason && (
                          <p className="text-[11px] text-muted-foreground italic max-w-xs line-clamp-2">
                            Lý do: {shop.statusReason}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(shop.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <ShopActionButtons
                        shopId={shop.id}
                        shopName={shop.name}
                        status={shop.status}
                        currentPlan={shop.plan}
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
          baseUrl="/admin/gian-hang"
          searchParams={{
            status: currentTab !== "ALL" ? currentTab : undefined,
            q: searchQuery || undefined,
          }}
        />
      </div>
    </div>
  );
}
