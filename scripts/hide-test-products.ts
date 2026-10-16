import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const db = new PrismaClient();

// Slugs of official products seeded in prisma/seed.ts
const SEEDED_SLUGS = new Set([
  "mam-tom-sam-son-hu-thuy-tinh",
  "muc-kho-sam-son-loai-1",
  "nem-chua-thanh-hoa",
  "che-tan-cuong-dac-biet",
  "che-bup-thai-nguyen-hop-qua",
]);

function hasNoValidImages(images: string[]): boolean {
  if (!images || images.length === 0) return true;
  return images.every((img) => {
    // If the image points to public directory, check if it exists on disk
    const fullPath = path.join(process.cwd(), "public", img);
    return !fs.existsSync(fullPath);
  });
}

async function main() {
  console.log("Checking for leftover test products to hide...\n");

  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      status: true,
      shop: { select: { name: true, slug: true } },
    },
  });

  const toHide = products.filter((p) => {
    // Never hide products created in prisma/seed.ts
    if (SEEDED_SLUGS.has(p.slug)) return false;
    // Skip if already HIDDEN
    if (p.status === "HIDDEN") return false;
    // Target products with empty images or non-existent placeholder images
    return hasNoValidImages(p.images);
  });

  if (toHide.length === 0) {
    console.log("No test products found that need hiding.");
    return;
  }

  console.log(`Found ${toHide.length} test product(s) to hide:`);
  for (const p of toHide) {
    console.log(`  - [${p.id}] "${p.name}" (slug: ${p.slug}, current status: ${p.status})`);
    console.log(`    images: ${JSON.stringify(p.images)}`);
  }

  const result = await db.product.updateMany({
    where: {
      id: { in: toHide.map((p) => p.id) },
    },
    data: {
      status: "HIDDEN",
    },
  });

  console.log(`\nSuccessfully set status = "HIDDEN" on ${result.count} product(s).`);
}

main()
  .catch((err) => {
    console.error("Error hiding test products:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
