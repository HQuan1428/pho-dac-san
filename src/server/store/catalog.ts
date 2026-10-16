import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getProductImageUrl } from "@/components/store/placeholder";
import { getCategoryImageUrl } from "@/components/store/category-image";
import type { ProductCardData } from "@/components/common/product-card";
import type { ShopCardData } from "@/components/common/shop-card";

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    shop: { include: { province: true } };
    variants: true;
    province: true;
  };
}>;

export function mapProductToCardData(product: ProductWithDetails): ProductCardData {
  const minVariant = product.variants.length > 0
    ? product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0])
    : null;

  return {
    href: `/products/${product.shop.slug}/${product.slug}`,
    name: product.name,
    image: getProductImageUrl(product.images, product.province.name),
    price: minVariant ? minVariant.price : 0,
    originalPrice: minVariant?.compareAtPrice ?? undefined,
    province: product.province.name,
    shopName: product.shop.name,
    rating: product.ratingAvg,
    reviewCount: product.ratingCount,
  };
}

export type ShopWithCounts = Prisma.ShopGetPayload<{
  include: {
    province: true;
    _count: {
      select: {
        products: true;
        followers: true;
      };
    };
  };
}>;

export function mapShopToCardData(shop: ShopWithCounts): ShopCardData {
  return {
    href: `/shops/${shop.slug}`,
    name: shop.name,
    logo: shop.logo ?? undefined,
    province: shop.province.name,
    productCount: shop._count.products,
    followerCount: shop._count.followers,
    verified: shop.plan !== "FREE",
  };
}

export async function getMarketplaceHomeData() {
  const [categories, regions, newestRaw, bestSellingRaw, featuredShopsRaw] = await Promise.all([
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { products: { where: { status: "ACTIVE", shop: { status: "ACTIVE" } } } },
        },
      },
    }),
    db.region.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        provinces: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { products: { where: { status: "ACTIVE", shop: { status: "ACTIVE" } } } },
            },
          },
        },
      },
    }),
    db.product.findMany({
      where: {
        status: "ACTIVE",
        shop: { status: "ACTIVE" },
      },
      include: {
        shop: { include: { province: true } },
        variants: { orderBy: { price: "asc" } },
        province: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.product.findMany({
      where: {
        status: "ACTIVE",
        shop: { status: "ACTIVE" },
      },
      include: {
        shop: { include: { province: true } },
        variants: { orderBy: { price: "asc" } },
        province: true,
      },
      orderBy: { soldCount: "desc" },
      take: 8,
    }),
    db.shop.findMany({
      where: { status: "ACTIVE" },
      include: {
        province: true,
        _count: {
          select: {
            products: { where: { status: "ACTIVE" } },
            followers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return {
    categories,
    regions,
    newestProducts: newestRaw.map(mapProductToCardData),
    bestSellingProducts: bestSellingRaw.map(mapProductToCardData),
    featuredShops: featuredShopsRaw.map(mapShopToCardData),
  };
}

export type SearchParams = {
  q?: string;
  "danh-muc"?: string;
  vung?: string;
  tinh?: string;
  "gia-tu"?: string;
  "gia-den"?: string;
  "sap-xep"?: string;
  page?: string;
};

export async function searchProducts(searchParams: SearchParams) {
  const q = searchParams.q?.trim();
  const categorySlug = searchParams["danh-muc"]?.trim();
  const regionSlug = searchParams.vung?.trim();
  const provinceSlug = searchParams.tinh?.trim();
  const minPrice = searchParams["gia-tu"] ? parseInt(searchParams["gia-tu"], 10) : undefined;
  const maxPrice = searchParams["gia-den"] ? parseInt(searchParams["gia-den"], 10) : undefined;
  const sort = searchParams["sap-xep"] || "moi-nhat";
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const pageSize = 24;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    shop: { status: "ACTIVE" },
  };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { shop: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (provinceSlug) {
    where.province = { slug: provinceSlug };
  } else if (regionSlug) {
    where.province = { region: { slug: regionSlug } };
  }

  // Minimum variant price filter:
  // If minPrice is specified, every variant must be >= minPrice
  // If maxPrice is specified, at least one variant must be <= maxPrice
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.variants = {
      ...(minPrice !== undefined && { every: { price: { gte: minPrice } } }),
      ...(maxPrice !== undefined && { some: { price: { lte: maxPrice } } }),
    };
  }

  // Handle sorting
  let productsRaw: ProductWithDetails[] = [];
  let total = 0;

  if (sort === "gia-tang" || sort === "gia-giam") {
    // For price sort, retrieve all matching product IDs with variant prices,
    // compute minimum variant price, and slice by pagination.
    const candidates = await db.product.findMany({
      where,
      select: {
        id: true,
        variants: { select: { price: true } },
      },
    });

    total = candidates.length;

    const scored = candidates.map((c) => ({
      id: c.id,
      minPrice: c.variants.length > 0 ? Math.min(...c.variants.map((v) => v.price)) : 0,
    }));

    if (sort === "gia-tang") {
      scored.sort((a, b) => a.minPrice - b.minPrice);
    } else {
      scored.sort((a, b) => b.minPrice - a.minPrice);
    }

    const pagedIds = scored.slice((page - 1) * pageSize, page * pageSize).map((s) => s.id);

    if (pagedIds.length > 0) {
      const items = await db.product.findMany({
        where: { id: { in: pagedIds } },
        include: {
          shop: { include: { province: true } },
          variants: { orderBy: { price: "asc" } },
          province: true,
        },
      });

      // Preserve the sorted order
      const itemMap = new Map(items.map((it) => [it.id, it]));
      productsRaw = pagedIds.map((id) => itemMap.get(id)!).filter(Boolean);
    }
  } else {
    // Standard Prisma orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

    if (sort === "ban-chay") {
      orderBy = { soldCount: "desc" };
    } else if (sort === "danh-gia") {
      orderBy = { ratingAvg: "desc" };
    } else {
      orderBy = { createdAt: "desc" };
    }

    const [count, items] = await Promise.all([
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

    total = count;
    productsRaw = items;
  }

  // Load filter reference metadata
  const [categories, regions] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.region.findMany({
      orderBy: { sortOrder: "asc" },
      include: { provinces: { orderBy: { name: "asc" } } },
    }),
  ]);

  return {
    products: productsRaw.map(mapProductToCardData),
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
    currentPage: page,
    categories,
    regions,
  };
}

export async function getProductDetail(shopSlug: string, productSlug: string) {
  const product = await db.product.findFirst({
    where: {
      slug: productSlug,
      status: "ACTIVE",
      shop: {
        slug: shopSlug,
        status: "ACTIVE",
      },
    },
    include: {
      shop: {
        include: {
          province: true,
          _count: {
            select: {
              products: { where: { status: "ACTIVE" } },
              followers: true,
            },
          },
        },
      },
      variants: {
        orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
      },
      province: true,
      category: true,
      reviews: {
        include: {
          user: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) return null;

  // Fetch related products in the same category
  const relatedRaw = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "ACTIVE",
      shop: { status: "ACTIVE" },
    },
    include: {
      shop: { include: { province: true } },
      variants: { orderBy: { price: "asc" } },
      province: true,
    },
    take: 4,
    orderBy: { soldCount: "desc" },
  });

  return {
    product,
    relatedProducts: relatedRaw.map(mapProductToCardData),
  };
}

export async function getShopDetail(slug: string, page = 1, sort = "moi-nhat") {
  const shop = await db.shop.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },
    include: {
      province: true,
      _count: {
        select: {
          products: { where: { status: "ACTIVE" } },
          followers: true,
        },
      },
    },
  });

  if (!shop) return null;

  const pageSize = 12;
  const where: Prisma.ProductWhereInput = {
    shopId: shop.id,
    status: "ACTIVE",
  };

  let productsRaw: ProductWithDetails[] = [];
  let total = 0;

  if (sort === "gia-tang" || sort === "gia-giam") {
    const candidates = await db.product.findMany({
      where,
      select: {
        id: true,
        variants: { select: { price: true } },
      },
    });

    total = candidates.length;
    const scored = candidates.map((c) => ({
      id: c.id,
      minPrice: c.variants.length > 0 ? Math.min(...c.variants.map((v) => v.price)) : 0,
    }));

    if (sort === "gia-tang") {
      scored.sort((a, b) => a.minPrice - b.minPrice);
    } else {
      scored.sort((a, b) => b.minPrice - a.minPrice);
    }

    const pagedIds = scored.slice((page - 1) * pageSize, page * pageSize).map((s) => s.id);
    if (pagedIds.length > 0) {
      const items = await db.product.findMany({
        where: { id: { in: pagedIds } },
        include: {
          shop: { include: { province: true } },
          variants: { orderBy: { price: "asc" } },
          province: true,
        },
      });
      const itemMap = new Map(items.map((it) => [it.id, it]));
      productsRaw = pagedIds.map((id) => itemMap.get(id)!).filter(Boolean);
    }
  } else {
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "ban-chay") orderBy = { soldCount: "desc" };
    else if (sort === "danh-gia") orderBy = { ratingAvg: "desc" };

    const [count, items] = await Promise.all([
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

    total = count;
    productsRaw = items;
  }

  return {
    shop,
    products: productsRaw.map(mapProductToCardData),
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
    currentPage: page,
  };
}

export type SearchSuggestionResult = {
  products: {
    id: string;
    name: string;
    href: string;
    image: string;
    price: number;
    shopName: string;
  }[];
  shops: {
    id: string;
    name: string;
    href: string;
    logo?: string | null;
    province: string;
  }[];
  categories: {
    id: string;
    name: string;
    slug: string;
    href: string;
    image?: string | null;
  }[];
};

export async function suggestSearch(query: string): Promise<SearchSuggestionResult> {
  const q = query.trim();
  if (!q) {
    return { products: [], shops: [], categories: [] };
  }

  const [productsRaw, shopsRaw, categoriesRaw] = await Promise.all([
    db.product.findMany({
      where: {
        status: "ACTIVE",
        shop: { status: "ACTIVE" },
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        shop: { select: { name: true, slug: true } },
        variants: { orderBy: { price: "asc" }, select: { price: true }, take: 1 },
        province: { select: { name: true } },
      },
      take: 5,
    }),
    db.shop.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        province: { select: { name: true } },
      },
      take: 5,
    }),
    db.category.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { sortOrder: "asc" },
      take: 5,
    }),
  ]);

  return {
    products: productsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      href: `/products/${p.shop.slug}/${p.slug}`,
      image: getProductImageUrl(p.images, p.province.name),
      price: p.variants[0]?.price ?? 0,
      shopName: p.shop.name,
    })),
    shops: shopsRaw.map((s) => ({
      id: s.id,
      name: s.name,
      href: `/shops/${s.slug}`,
      logo: s.logo,
      province: s.province.name,
    })),
    categories: categoriesRaw.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      href: `/search?danh-muc=${c.slug}`,
      image: getCategoryImageUrl(c.slug),
    })),
  };
}

export async function getFeaturedCategories() {
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
    take: 8,
    select: { id: true, name: true, slug: true },
  });
}

