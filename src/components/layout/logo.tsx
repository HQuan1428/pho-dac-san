import Link from "next/link";
import { Store } from "lucide-react";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Store className="size-4" />
      </span>
      Phố Đặc Sản
    </Link>
  );
}
