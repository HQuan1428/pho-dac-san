"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { HeartOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard, type ProductCardData } from "@/components/common/product-card";
import { removeFromWishlistAction } from "./actions";

export type WishlistProductItem = {
  productId: string;
  cardData: ProductCardData;
};

export function WishlistGrid({ items }: { items: WishlistProductItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <WishlistItemCard key={item.productId} item={item} />
      ))}
    </div>
  );
}

function WishlistItemCard({ item }: { item: WishlistProductItem }) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
      const res = await removeFromWishlistAction(item.productId);
      if (res.success) {
        toast.success("Đã xóa khỏi danh sách yêu thích");
      }
    });
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-lg border bg-card p-3">
      <ProductCard product={item.cardData} />
      <div className="mt-3 border-t pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isPending}
          className="w-full text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <HeartOff className="size-3.5" />
          )}
          Bỏ thích
        </Button>
      </div>
    </div>
  );
}
