import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const shopUpdates = [
  {
    slug: "nha-mam-sam-son",
    logo: "/images/shops/nha-mam-sam-son-logo.webp",
    banner: "/images/shops/nha-mam-sam-son-banner.webp",
  },
  {
    slug: "tra-tan-cuong-xanh",
    logo: "/images/shops/tra-tan-cuong-xanh-logo.webp",
    banner: "/images/shops/tra-tan-cuong-xanh-banner.webp",
  },
  {
    slug: "dac-san-cho-duyet",
    logo: "/images/shops/dac-san-cho-duyet-logo.webp",
    banner: "/images/shops/dac-san-cho-duyet-banner.webp",
  },
];

const productUpdates = [
  {
    shopSlug: "nha-mam-sam-son",
    productSlug: "mam-tom-sam-son-hu-thuy-tinh",
    images: [
      "/images/products/mam-tom-sam-son-1.webp",
      "/images/products/mam-tom-sam-son-2.webp",
    ],
  },
  {
    shopSlug: "nha-mam-sam-son",
    productSlug: "muc-kho-sam-son-loai-1",
    images: [
      "/images/products/muc-kho-sam-son-1.webp",
      "/images/products/muc-kho-sam-son-2.webp",
    ],
  },
  {
    shopSlug: "nha-mam-sam-son",
    productSlug: "nem-chua-thanh-hoa",
    images: [
      "/images/products/nem-chua-thanh-hoa-1.webp",
      "/images/products/nem-chua-thanh-hoa-2.webp",
    ],
  },
  {
    shopSlug: "tra-tan-cuong-xanh",
    productSlug: "che-tan-cuong-dac-biet",
    images: [
      "/images/products/che-tan-cuong-1.webp",
      "/images/products/che-tan-cuong-2.webp",
    ],
  },
  {
    shopSlug: "tra-tan-cuong-xanh",
    productSlug: "che-bup-thai-nguyen-hop-qua",
    images: [
      "/images/products/che-bup-thai-nguyen-hop-qua-1.webp",
      "/images/products/che-bup-thai-nguyen-hop-qua-2.webp",
    ],
  },
];

async function main() {
  console.log("Attaching images to existing shops and products in DB...\n");

  // 1. Update shops by slug
  for (const s of shopUpdates) {
    const existing = await db.shop.findUnique({
      where: { slug: s.slug },
    });
    if (!existing) {
      console.warn(`[Shop] Warning: Shop with slug "${s.slug}" not found in DB.`);
      continue;
    }
    await db.shop.update({
      where: { slug: s.slug },
      data: {
        logo: s.logo,
        banner: s.banner,
      },
    });
    console.log(`[Shop] Updated "${existing.name}" (${s.slug}):`);
    console.log(`  - logo: ${s.logo}`);
    console.log(`  - banner: ${s.banner}`);
  }

  console.log("");

  // 2. Update products by shop slug + product slug
  for (const p of productUpdates) {
    const shop = await db.shop.findUnique({
      where: { slug: p.shopSlug },
    });
    if (!shop) {
      console.warn(`[Product] Warning: Shop "${p.shopSlug}" not found.`);
      continue;
    }

    const product = await db.product.findUnique({
      where: {
        shopId_slug: {
          shopId: shop.id,
          slug: p.productSlug,
        },
      },
    });

    if (!product) {
      console.warn(`[Product] Warning: Product "${p.productSlug}" under shop "${p.shopSlug}" not found.`);
      continue;
    }

    await db.product.update({
      where: { id: product.id },
      data: {
        images: p.images,
      },
    });

    console.log(`[Product] Updated "${product.name}" (${p.shopSlug}/${p.productSlug}):`);
    for (const img of p.images) {
      console.log(`  + ${img}`);
    }
  }

  console.log("\nFinished attaching images successfully.");
}

main()
  .catch((err) => {
    console.error("Error attaching images:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
