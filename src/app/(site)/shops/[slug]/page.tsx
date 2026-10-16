import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BadgeCheck, Phone, Package, Users, PackageOpen, Layers } from "lucide-react";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/server/access";
import { getShopDetail, mapProductToCardData } from "@/server/store/catalog";
import { ProductCard } from "@/components/store/product-card";
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
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; "sap-xep"?: string; "danh-muc"?: string }>;
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
  const categorySlug = query["danh-muc"] || "";

  const data = await getShopDetail(slug, page, sort);
  if (!data) {
    notFound();
  }

  const { shop } = data;
  let products = data.products;
  let total = data.total;
  let totalPages = data.totalPages;
  let currentPage = data.currentPage;

  // Categories of this shop
  const shopCategories = await db.category.findMany({
    where: {
      products: { some: { shopId: shop.id, status: "ACTIVE" } },
    },
    include: {
      _count: {
        select: { products: { where: { shopId: shop.id, status: "ACTIVE" } } },
      },
    },
    orderBy: { name: "asc" },
  });

  // If a category filter is active, refine query
  if (categorySlug) {
    const pageSize = 12;
    const where: Prisma.ProductWhereInput = {
      shopId: shop.id,
      status: "ACTIVE",
      category: { slug: categorySlug },
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "ban-chay") orderBy = { soldCount: "desc" };
    else if (sort === "danh-gia") orderBy = { ratingAvg: "desc" };

    const [filteredCount, filteredRaw] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        include: {
          shop: { include: { province: true } },
          variants: { orderBy: { price: "asc" } },
          province: true,
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    total = filteredCount;
    totalPages = Math.ceil(total / pageSize) || 1;
    currentPage = page;
    products = filteredRaw.map(mapProductToCardData);
  }

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
    if (categorySlug) p.set("danh-muc", categorySlug);
    if (sort !== "moi-nhat") p.set("sap-xep", sort);
    p.set("page", String(pageNumber));
    return `/shops/${slug}?${p.toString()}`;
  };

  const createCategoryUrl = (catSlug: string | null) => {
    const p = new URLSearchParams();
    if (catSlug) p.set("danh-muc", catSlug);
    if (sort !== "moi-nhat") p.set("sap-xep", sort);
    return `/shops/${slug}${p.toString() ? `?${p.toString()}` : ""}`;
  };

  return (
    <div className="container-page py-6 md:py-8 space-y-8">
      {/* Shop Profile Header */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        {/* Full-width banner (h-48 md:h-64) */}
        <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950">
          {shop.banner && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.banner}
              alt={shop.name}
              className="size-full object-cover opacity-85"
            />
          )}
        </div>

        {/* Info row with logo overlapping, stats, and follow button */}
        <div className="relative px-5 md:px-7 pb-6 pt-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 -mt-12 md:-mt-16">
              <Avatar className="size-24 md:size-28 rounded-2xl border-4 border-card bg-card shadow-md shrink-0">
                {shop.logo && <AvatarImage src={shop.logo} alt={shop.name} />}
                <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                  {shop.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                    {shop.name}
                  </h1>
                  {shop.plan !== "FREE" && (
                    <BadgeCheck className="size-5 shrink-0 text-success" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <RegionTag province={shop.province.name} />
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Phone className="size-3" />
                    <span>{shop.phone}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Stats & Follow Button */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium">
                  <Package className="size-3.5 text-foreground" />
                  <strong className="text-foreground">{shop._count.products}</strong> món
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-medium">
                  <Users className="size-3.5 text-foreground" />
                  <strong className="text-foreground">{shop._count.followers}</strong> người theo dõi
                </span>
              </div>

              <FollowButton
                shopId={shop.id}
                initialFollowed={isFollowing}
                pathname={`/shops/${slug}`}
                size="default"
              />
            </div>
          </div>

          {/* Shop description */}
          {shop.description && (
            <p className="mt-4 text-xs md:text-sm text-foreground/80 leading-relaxed border-t pt-3.5 max-w-4xl">
              {shop.description}
            </p>
          )}
        </div>
      </div>

      {/* Main Content: Sidebar (categories of this shop) + Product Grid */}
      <div className="grid gap-6 lg:grid-cols-[240px_1fr] items-start">
        {/* Left Sidebar: Categories of this shop */}
        <aside className="w-full lg:w-[240px] shrink-0 rounded-xl border bg-card p-4 shadow-xs lg:sticky lg:top-20 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground border-b pb-2.5">
            <Layers className="size-4 text-primary" />
            <span>Danh mục gian hàng</span>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <Link
              href={createCategoryUrl(null)}
              className={cn(
                "flex items-center justify-between rounded-md px-2.5 py-2 transition hover:bg-muted",
                !categorySlug
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground"
              )}
            >
              <span>Tất cả sản phẩm</span>
              <span className="text-[11px]">({shop._count.products})</span>
            </Link>

            {shopCategories.map((cat) => {
              const isSelected = categorySlug === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={createCategoryUrl(cat.slug)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2.5 py-2 transition hover:bg-muted",
                    isSelected
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[11px] ml-1 shrink-0">({cat._count.products})</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Right Product Grid Area */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-3.5 py-2 shadow-xs">
            <div className="text-xs text-muted-foreground">
              {categorySlug ? (
                <span>
                  Đang xem: <strong className="text-foreground">{shopCategories.find((c) => c.slug === categorySlug)?.name}</strong> ({total})
                </span>
              ) : (
                <span>Tất cả đặc sản ({total})</span>
              )}
            </div>

            <SortSelector currentSort={sort} />
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card p-10 text-center">
              <EmptyState
                icon={PackageOpen}
                title="Chưa có sản phẩm nào trong mục này"
                description="Vui lòng chọn danh mục khác hoặc quay lại sau."
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
    </div>
  );
}
