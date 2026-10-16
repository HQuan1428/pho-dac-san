import Link from "next/link";
import { Check, Minus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/common/price";

type PlanFeature = {
  text: string;
  included: boolean;
};

type Plan = {
  name: string;
  price: number;
  unit: string;
  description: string;
  badge?: string;
  features: PlanFeature[];
  highlight: boolean;
  cta: string;
};

const plans: Plan[] = [
  {
    name: "FREE",
    price: 0,
    unit: "/tháng",
    description: "Phù hợp cho hộ sản xuất gia đình mới bắt đầu bán lẻ trực tuyến.",
    features: [
      { text: "Tối đa 20 sản phẩm", included: true },
      { text: "1 tài khoản nhân viên", included: true },
      { text: "Quản lý đơn hàng & ghi chú cuộc gọi", included: true },
      { text: "Tạo & phát hành mã giảm giá", included: false },
      { text: "Báo cáo thống kê cơ bản", included: true },
      { text: "Huy hiệu gian hàng uy tín", included: false },
    ],
    highlight: false,
    cta: "Bắt đầu miễn phí",
  },
  {
    name: "PRO",
    price: 199000,
    unit: "/tháng",
    badge: "Phổ biến nhất",
    description: "Dành cho xưởng nghề, hợp tác xã muốn mở rộng quy mô kinh doanh.",
    features: [
      { text: "Tối đa 200 sản phẩm", included: true },
      { text: "3 tài khoản nhân viên", included: true },
      { text: "Quản lý đơn hàng & ghi chú cuộc gọi", included: true },
      { text: "Tạo & phát hành mã giảm giá", included: true },
      { text: "Báo cáo doanh số nâng cao", included: true },
      { text: "Huy hiệu gian hàng Pro uy tín", included: true },
    ],
    highlight: true,
    cta: "Chọn gói Pro",
  },
  {
    name: "BUSINESS",
    price: 499000,
    unit: "/tháng",
    description: "Dành cho doanh nghiệp đặc sản lớn, chuỗi phân phối đa vùng miền.",
    features: [
      { text: "Không giới hạn sản phẩm", included: true },
      { text: "Không giới hạn nhân viên", included: true },
      { text: "Quản lý đơn hàng & ghi chú cuộc gọi", included: true },
      { text: "Mã giảm giá không giới hạn", included: true },
      { text: "Báo cáo phân tích chuyên sâu", included: true },
      { text: "Ưu tiên hiển thị & hỗ trợ 1:1", included: true },
    ],
    highlight: false,
    cta: "Liên hệ tư vấn",
  },
];

export function Pricing() {
  return (
    <section id="bang-gia" className="scroll-mt-16 border-t py-16 md:py-24">
      <div className="container-page">
        <div className="reveal mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3">
            Bảng giá minh bạch
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Chi phí rõ ràng, không phí ẩn
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Lựa chọn gói dịch vụ phù hợp với quy mô cơ sở sản xuất của bạn.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm text-foreground">
            <Sparkles className="size-4 text-primary shrink-0" />
            <span className="font-medium text-primary">Đang miễn phí trong giai đoạn ra mắt</span>
            <span className="hidden sm:inline text-muted-foreground">— Trải nghiệm toàn bộ tính năng không tốn phí.</span>
          </div>
        </div>

        {/* 3 cards in one row at lg, PRO highlighted, feature comparison list aligned */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3 items-stretch">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`reveal flex flex-col justify-between transition-all ${
                plan.highlight
                  ? "relative border-2 border-primary shadow-lg ring-1 ring-primary bg-card lg:-translate-y-2"
                  : "bg-card shadow-sm"
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex h-7 items-center justify-between">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  {plan.badge ? (
                    <Badge className="bg-primary text-primary-foreground font-medium">
                      {plan.badge}
                    </Badge>
                  ) : (
                    <div className="h-5" />
                  )}
                </div>
                <CardDescription className="mt-2 min-h-[40px] text-xs leading-relaxed">
                  {plan.description}
                </CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <Price amount={plan.price} className="text-3xl font-bold tracking-tight" />
                  <span className="text-sm text-muted-foreground">{plan.unit}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-4">
                <div className="border-t pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Tính năng bao gồm:
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex h-7 items-center gap-2.5 text-sm">
                        {feature.included ? (
                          <Check className="size-4 shrink-0 text-primary" />
                        ) : (
                          <Minus className="size-4 shrink-0 text-muted-foreground/40" />
                        )}
                        <span
                          className={
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground/60 line-through"
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  render={<Link href="/kenh-ban/dang-ky" />}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          * Giới hạn gói dịch vụ hiện được hiển thị tham khảo, nền tảng chưa tự động thu phí hay khóa tính năng của người bán.
        </p>
      </div>
    </section>
  );
}
