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
      className="group flex flex-col items-center rounded-xl border bg-card p-3 text-center transition hover:border-primary hover:bg-primary/5 hover:shadow-xs shrink-0 w-24 sm:w-28 xl:w-auto"
    >
      {imageUrl ? (
        <div className="relative size-14 sm:size-16 overflow-hidden rounded-full bg-muted ring-1 ring-border group-hover:ring-2 group-hover:ring-primary/50 transition">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={category.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex size-14 sm:size-16 items-center justify-center rounded-full bg-muted font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition text-sm">
          {category.name.slice(0, 1)}
        </div>
      )}
      <span className="mt-2.5 text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary transition">
        {category.name}
      </span>
      <span className="text-[10px] text-muted-foreground mt-0.5">
        {category._count.products} món
      </span>
    </Link>
  );
}
