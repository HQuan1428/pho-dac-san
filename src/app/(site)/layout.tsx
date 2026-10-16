import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { PointerFx } from "@/components/common/pointer-fx";

// `modal` is the @modal parallel slot: intercepted routes (product quick view, order detail) render there.
export default function SiteLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <SiteFooter />
      <MobileTabBar />
      {modal}
      <PointerFx />
    </div>
  );
}
