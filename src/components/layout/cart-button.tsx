"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartButton() {
  const count = useCart().reduce((n, i) => n + i.quantity, 0);
  return (
    <Link href="/gio-hang" aria-label={`Giỏ hàng, ${count} sản phẩm`} className="relative inline-flex size-9 items-center justify-center rounded-md hover:bg-muted">
      <ShoppingCart className="size-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground tabular-nums">
          {count}
        </span>
      )}
    </Link>
  );
}
