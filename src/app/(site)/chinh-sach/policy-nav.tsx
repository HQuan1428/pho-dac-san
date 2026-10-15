"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, Shield, Store, RefreshCw } from "lucide-react";

const links = [
  { href: "/chinh-sach/dieu-khoan", label: "Điều khoản dịch vụ", icon: FileText },
  { href: "/chinh-sach/bao-mat", label: "Chính sách bảo mật", icon: Shield },
  { href: "/chinh-sach/nguoi-ban", label: "Quy chế người bán", icon: Store },
  { href: "/chinh-sach/doi-tra", label: "Đổi trả & Khiếu nại", icon: RefreshCw },
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
