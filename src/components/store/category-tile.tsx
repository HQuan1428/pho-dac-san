import Link from "next/link";
import { getCategoryImageUrl } from "./category-image";

export type CategoryTileData = {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
};

export function CategoryTile({ category }: { category: CategoryTileData }) {
  const imageUrl = getCategoryImageUrl(category.slug);

  return (
    <Link
      href={`/search?danh-muc=${category.slug}`}
      className="group flex flex-col items-center rounded-lg border bg-card p-2.5 text-center transition hover:border-primary hover:bg-primary/5 hover:shadow-xs shrink-0 w-24 sm:w-28 xl:w-auto"
    >
      {imageUrl ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={category.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex size-10 items-center justify-center rounded-full bg-muted font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition text-xs">
          {category.name.slice(0, 1)}
        </div>
      )}
      <span className="mt-2 text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary transition">
        {category.name}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {category._count.products} món
      </span>
    </Link>
  );
}
