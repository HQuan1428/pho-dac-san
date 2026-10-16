"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, Shield, Store, RefreshCw } from "lucide-react";

const links = [
  { href: "/policies/terms", label: "Điều khoản dịch vụ", icon: FileText },
  { href: "/policies/privacy", label: "Chính sách bảo mật", icon: Shield },
  { href: "/policies/seller", label: "Quy chế người bán", icon: Store },
  { href: "/policies/returns", label: "Đổi trả & Khiếu nại", icon: RefreshCw },
];

export function PolicyNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
