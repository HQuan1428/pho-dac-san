import { type Metadata } from "next";
import { AuthShowcase } from "./auth-showcase";

export const metadata: Metadata = {
  title: "Tài khoản - Phố Đặc Sản",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page min-h-[calc(100dvh-4rem)] py-4 lg:py-6">
      <div className="grid min-h-[calc(100dvh-4rem-2rem)] lg:min-h-[calc(100dvh-4rem-3rem)] items-stretch gap-6 lg:grid-cols-2 lg:gap-10">
        {/* Left column: form (max-w-sm, vertically centered) */}
        <div className="flex flex-col items-center justify-center py-2 sm:py-4">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        {/* Right panel: brand showcase (hidden on mobile, bg-muted on desktop) */}
        <div className="hidden rounded-2xl border border-border/70 bg-muted/70 p-5 lg:flex lg:flex-col lg:justify-between xl:p-6 shadow-2xs">
          <AuthShowcase />
        </div>
      </div>
    </div>
  );
}
