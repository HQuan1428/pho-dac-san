import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, Phone, Store, MapPin, Package, Users, PackageOpen } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/server/access";
import { getShopDetail } from "@/server/store/catalog";
import { ProductCard } from "@/components/common/product-card";
import { RegionTag } from "@/components/common/region-tag";
import { EmptyState } from "@/components/common/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/store/follow-button";
import { SortSelector } from "@/components/store/search-filters";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; "sap-xep"?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const shop = await db.shop.findFirst({
    where: { slug, status: "ACTIVE" },
    include: { province: true },
  });
  if (!shop) return { title: "Gian hàng không tồn tại — Phố Đặc Sản" };

  return {
    title: `${shop.name} (${shop.province.name}) — Gian hàng chính gốc | Phố Đặc Sản`,
    description: shop.description || `Gian hàng đặc sản ${shop.name} tại ${shop.province.name}.`,
  };
}

export default async function ShopDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const page = Math.max(1, parseInt(query.page || "1", 10) || 1);
  const sort = query["sap-xep"] || "moi-nhat";

  const data = await getShopDetail(slug, page, sort);
  if (!data) {
    notFound();
  }

  const { shop, products, total, totalPages, currentPage } = data;
  const user = await getCurrentUser();

  let isFollowing = false;
  if (user) {
    const follow = await db.shopFollow.findUnique({
      where: {
        userId_shopId: {
          userId: user.id,
          shopId: shop.id,
        },
      },
    });
    isFollowing = Boolean(follow);
  }

  const createPageUrl = (pageNumber: number) => {
    const p = new URLSearchParams();
    if (sort !== "moi-nhat") p.set("sap-xep", sort);
    p.set("page", String(pageNumber));
    return `/gian-hang/${slug}?${p.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 space-y-8">
      {/* Shop Profile Header */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        {/* Banner */}
        <div className="relative h-40 w-full bg-gradient-to-r from-emerald-800/80 via-emerald-700/60 to-zinc-800 sm:h-52">
          {shop.banner && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.banner}
              alt={shop.name}
              className="size-full object-cover opacity-80"
            />
          )}
        </div>

        {/* Shop Info bar */}
        <div className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4 -mt-12 sm:-mt-16">
              <Avatar className="size-24 sm:size-28 rounded-xl border-4 border-card bg-card shadow-md">
                {shop.logo && <AvatarImage src={shop.logo} alt={shop.name} />}
                <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                  {shop.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {shop.name}
                  </h1>
                  {shop.plan !== "FREE" && (
                    <BadgeCheck className="size-5 shrink-0 text-success" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5 text-primary" />
                    <RegionTag province={shop.province.name} />
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5" />
                    <span>{shop.phone}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium">
                  <Package className="size-4 text-foreground" />
                  <strong className="text-foreground">{shop._count.products}</strong> sản phẩm
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-medium">
                  <Users className="size-4 text-foreground" />
                  <strong className="text-foreground">{shop._count.followers}</strong> người theo dõi
                </span>
              </div>

              <FollowButton
                shopId={shop.id}
                initialFollowed={isFollowing}
                pathname={`/gian-hang/${slug}`}
                size="default"
              />
            </div>
          </div>

          {/* Shop description */}
          {shop.description && (
            <p className="mt-4 text-sm text-foreground/80 leading-relaxed border-t pt-4">
              {shop.description}
            </p>
          )}
        </div>
      </div>

      {/* Shop Products Section */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-2">
            <Store className="size-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Tất cả sản phẩm ({total})
            </h2>
          </div>

          <SortSelector currentSort={sort} />
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card p-12 text-center">
            <EmptyState
              icon={PackageOpen}
              title="Gian hàng chưa có sản phẩm nào"
              description="Vui lòng quay lại sau khi gian hàng cập nhật sản phẩm mới."
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.href} product={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={createPageUrl(currentPage - 1)}
                      text="Trước"
                    />
                  </PaginationItem>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href={createPageUrl(p)}
                      isActive={p === currentPage}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href={createPageUrl(currentPage + 1)}
                      text="Sau"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
