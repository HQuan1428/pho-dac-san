import type { CSSProperties } from "react";
import { UserCheck, PackagePlus, PhoneCall } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Đăng ký & được duyệt",
    icon: UserCheck,
    accent: "primary",
    circleClass: "border-primary text-primary",
    iconTileClass: "bg-primary/10 text-primary",
    description:
      "Tạo tài khoản và điền thông tin gian hàng, đính kèm nguồn gốc tỉnh thành. Ban quản trị sẽ xác thực và phê duyệt trong vòng 24 giờ làm việc.",
  },
  {
    step: "02",
    title: "Đăng sản phẩm",
    icon: PackagePlus,
    accent: "turmeric",
    circleClass: "border-turmeric text-turmeric",
    iconTileClass: "bg-turmeric/10 text-turmeric",
    description:
      "Tải ảnh sản phẩm thực tế, nhập mô tả xuất xứ, thiết lập các biến thể đóng gói (khối lượng, hộp quà) và giá bán tương ứng.",
  },
  {
    step: "03",
    title: "Nhận đơn, gọi điện chốt",
    icon: PhoneCall,
    accent: "lotus",
    circleClass: "border-lotus text-lotus",
    iconTileClass: "bg-lotus/10 text-lotus",
    description:
      "Khi có đơn mới, hệ thống gửi thông báo ngay lập tức. Bạn gọi điện xác nhận chi tiết đơn hàng, thời gian giao hàng và tiến hành gửi hàng cho khách.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-primary/5 py-16 md:py-24">
      <div className="container-page">
        <div className="reveal mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Bắt đầu kinh doanh chỉ với 3 bước đơn giản
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Quy trình tinh gọn, nhanh chóng, giúp người sản xuất địa phương tập trung toàn bộ vào chất lượng đặc sản.
          </p>
        </div>

        {/* Horizontal 3-step grid with desktop connecting line */}
        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          {/* Connecting line on desktop */}
          <div
            className="reveal-x hidden md:block absolute top-11 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary via-turmeric to-lotus z-0"
            aria-hidden="true"
          />

          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                data-spotlight
                style={{ "--spot": `var(--${item.accent})` } as CSSProperties}
                className="reveal motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 relative z-10 flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition-colors hover:border-foreground/20"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex size-10 items-center justify-center rounded-full border-2 bg-background font-mono text-sm font-bold shadow-xs ${item.circleClass}`}
                    >
                      {item.step}
                    </div>
                    <div
                      className={`flex size-9 items-center justify-center rounded-md ${item.iconTileClass}`}
                    >
                      <Icon className="size-4" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

