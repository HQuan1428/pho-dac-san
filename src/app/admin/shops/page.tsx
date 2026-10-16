import Link from "next/link";
import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
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
  ACTIVE: { label: "Hoạt động", className: "bg-success/15 text-success border-success/30" },
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
    return `/admin/shops?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý gian hàng"
        description="Kiểm duyệt hồ sơ đăng ký mới, phân quyền gói dịch vụ và quản lý trạng thái các gian hàng."
      />

      {/* Toolbar above table */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1">
            {statusTabs.map((tab) => {
              const isActive = currentTab === tab.value;
              const count = counts[tab.value] ?? 0;
              return (
                <Link
                  key={tab.value}
                  href={buildTabUrl(tab.value)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold"
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

          {/* Search box */}
          <form method="GET" action="/admin/shops" className="relative w-full sm:w-60">
            {currentTab !== "ALL" && (
              <input type="hidden" name="status" value={currentTab} />
            )}
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Tìm theo tên shop..."
              className="h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>
        </div>

        <div className="text-xs text-muted-foreground">
          Tổng cộng: <strong className="text-foreground">{totalItems}</strong> gian hàng
        </div>
      </div>

      {/* Table: compact rows h-11, sticky header, pagination footer */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/60 dark:bg-muted/30 backdrop-blur z-10">
              <TableRow className="h-11">
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
                    <TableRow key={shop.id} className="h-11">
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                            {shop.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
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
                        <div className="text-xs">
                          <p className="font-medium text-foreground">{shop.owner.name}</p>
                          <p className="text-[11px] text-muted-foreground">{shop.owner.email} · {shop.phone}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {shop.plan}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${badge.className}`}
                          >
                            {badge.label}
                          </Badge>
                          {shop.statusReason && (
                            <p className="text-[10px] text-muted-foreground italic max-w-xs line-clamp-1">
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
        </div>

        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          baseUrl="/admin/shops"
          searchParams={{
            status: currentTab !== "ALL" ? currentTab : undefined,
            q: searchQuery || undefined,
          }}
        />
      </div>
    </div>
  );
}
