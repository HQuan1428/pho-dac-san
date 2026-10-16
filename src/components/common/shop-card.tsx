import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RegionTag } from "./region-tag";

export type ShopCardData = {
  href: string;
  name: string;
  logo?: string;
  province: string;
  productCount: number;
  followerCount: number;
  verified?: boolean;
};

export function ShopCard({ shop }: { shop: ShopCardData }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 h-full">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="size-11 shrink-0">
          {shop.logo && <AvatarImage src={shop.logo} alt={shop.name} />}
          <AvatarFallback>{shop.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <Link href={shop.href} className="flex items-center gap-1 font-medium hover:underline">
            <span className="truncate">{shop.name}</span>
            {shop.verified && <BadgeCheck className="size-4 shrink-0 text-success" />}
          </Link>
          <div className="mt-0.5">
            <RegionTag province={shop.province} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{shop.productCount} sản phẩm</span>
        <span>·</span>
        <span>{shop.followerCount} theo dõi</span>
      </div>
      <Button variant="outline" size="sm" className="w-full mt-auto">Theo dõi</Button>
    </div>
  );
}
