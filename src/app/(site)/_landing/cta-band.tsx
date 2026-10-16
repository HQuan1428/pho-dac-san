import Link from "next/link";
import { Store, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="py-16 md:py-20 border-t">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground px-6 py-12 text-center md:px-12 md:py-16 shadow-lg">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -right-12 -top-12 size-64 rounded-full bg-primary-foreground/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 size-64 rounded-full bg-primary-foreground/10 blur-2xl" />

          {/* Decorative lotus pattern */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-mark-white.svg"
              alt=""
              className="absolute -top-16 -left-16 size-64 md:size-80 opacity-10 -rotate-12"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-mark-white.svg"
              alt=""
              className="absolute -bottom-20 -right-16 size-72 md:size-96 opacity-10 rotate-12"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-mark-white.svg"
              alt=""
              className="hidden sm:block absolute -top-20 right-1/4 size-48 md:size-60 opacity-[0.08] rotate-45"
            />
          </div>

          <div className="relative mx-auto max-w-2xl space-y-4">
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary-foreground/15 text-primary-foreground shadow-xs">
              <Store className="size-6" />
            </span>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-primary-foreground">
              Sẵn sàng đưa đặc sản quê hương vươn xa?
            </h2>

            <p className="text-base text-primary-foreground/90 leading-relaxed">
              Gia nhập cộng đồng người làm nghề truyền thống trên Phố Đặc Sản ngay hôm nay.
              Thiết lập gian hàng nhanh chóng, tiếp cận khách hàng tiềm năng trên cả nước.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium shadow-sm"
                render={<Link href="/kenh-ban/dang-ky" />}
              >
                <Store data-icon="inline-start" />
                Mở gian hàng miễn phí
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                render={<Link href="/lien-he" />}
              >
                <Phone data-icon="inline-start" />
                Liên hệ hợp tác
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
