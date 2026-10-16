import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  variant = "color",
}: {
  className?: string;
  variant?: "color" | "white";
}) {
  const src =
    variant === "white"
      ? "/brand/logo-mark-white.svg"
      : "/brand/logo-mark.svg";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={cn("size-7", className)}
    />
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-bold tracking-tight">
      <BrandMark />
      Phố Đặc Sản
    </Link>
  );
}
