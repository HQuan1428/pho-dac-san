/**
 * Maps known category slugs to static image paths in public/images/categories/.
 * Files in public/images/categories:
 * - banh-keo.webp
 * - do-kho-hai-san-kho.webp
 * - gao-ngu-coc.webp
 * - gia-vi-nuoc-cham.webp
 * - qua-bieu.webp
 * - ruou-do-uong.webp
 * - tra-ca-phe.webp
 * - trai-cay-rau-cu.webp
 */

const KNOWN_CATEGORY_SLUGS = new Set([
  "banh-keo",
  "do-kho-hai-san-kho",
  "gao-ngu-coc",
  "gia-vi-nuoc-cham",
  "qua-bieu",
  "ruou-do-uong",
  "tra-ca-phe",
  "trai-cay-rau-cu",
]);

export function getCategoryImageUrl(slug: string): string | null {
  if (KNOWN_CATEGORY_SLUGS.has(slug)) {
    return `/images/categories/${slug}.webp`;
  }
  return null;
}

export const getCategoryImage = getCategoryImageUrl;
