import { UserCheck, PackagePlus, PhoneCall } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Đăng ký & được duyệt",
    icon: UserCheck,
    description:
      "Tạo tài khoản và điền thông tin gian hàng, đính kèm nguồn gốc tỉnh thành. Ban quản trị sẽ xác thực và phê duyệt trong vòng 24 giờ làm việc.",
  },
  {
    step: "02",
    title: "Đăng sản phẩm",
    icon: PackagePlus,
    description:
      "Tải ảnh sản phẩm thực tế, nhập mô tả xuất xứ, thiết lập các biến thể đóng gói (khối lượng, hộp quà) và giá bán tương ứng.",
  },
  {
    step: "03",
    title: "Nhận đơn, gọi điện chốt",
    icon: PhoneCall,
    description:
      "Khi có đơn mới, hệ thống gửi thông báo ngay lập tức. Bạn gọi điện xác nhận chi tiết đơn hàng, thời gian giao hàng và tiến hành gửi hàng cho khách.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t bg-muted/20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Bắt đầu kinh doanh chỉ với 3 bước đơn giản
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Quy trình tinh gọn, nhanh chóng, giúp người sản xuất địa phương tập trung toàn bộ vào chất lượng đặc sản.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative flex flex-col rounded-xl border bg-card p-6 shadow-none"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-primary">
                    BƯỚC {item.step}
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-md bg-muted text-foreground">
                    <Icon className="size-4" />
                  </div>
                </div>

                <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/40 font-mono text-xl">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
