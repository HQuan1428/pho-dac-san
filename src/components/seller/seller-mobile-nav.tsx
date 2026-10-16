"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { BrandMark } from "@/components/layout/logo";
import type { ShopRole } from "@/server/access";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SellerNavContent } from "./seller-nav";

interface SellerMobileNavProps {
  shop: {
    id: string;
    name: string;
    slug: string;
    status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
    plan: "FREE" | "PRO" | "BUSINESS";
  };
  role: ShopRole;
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function SellerMobileNav({ shop, role, user }: SellerMobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-14 items-center justify-between border-b bg-card px-4 md:hidden">
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon-sm" aria-label="Mở menu quản lý" />
            }
          >
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu quản lý gian hàng</SheetTitle>
            </SheetHeader>
            <SellerNavContent
              shop={shop}
              role={role}
              user={user}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 font-semibold">
          <BrandMark className="size-6" />
          <span className="truncate text-sm">{shop.name}</span>
        </div>
      </div>
    </div>
  );
}
