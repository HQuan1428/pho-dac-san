import Link from "next/link";
import { Store, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="border-t py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-12 text-center md:px-12 md:py-16">
          <div className="mx-auto max-w-2xl space-y-4">
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store className="size-6" />
            </span>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Sẵn sàng đưa đặc sản quê hương vươn xa?
            </h2>

            <p className="text-base text-muted-foreground">
              Gia nhập cộng đồng người làm nghề truyền thống trên Phố Đặc Sản ngay hôm nay.
              Thiết lập gian hàng nhanh chóng, tiếp cận khách hàng tiềm năng trên cả nước.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button size="lg" render={<Link href="/kenh-ban/dang-ky" />}>
                <Store data-icon="inline-start" />
                Mở gian hàng miễn phí
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/lien-he" />}>
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
