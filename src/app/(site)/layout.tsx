import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PointerFx } from "@/components/common/pointer-fx";

// `modal` is the @modal parallel slot: intercepted routes (product quick view, order detail) render there.
export default function SiteLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {modal}
      <PointerFx />
    </div>
  );
}
