import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/common/price";

const plans = [
  {
    name: "FREE",
    price: 0,
    unit: "/tháng",
    description: "Phù hợp cho hộ sản xuất gia đình mới bắt đầu bán lẻ trực tuyến.",
    features: [
      "Tối đa 20 sản phẩm",
      "1 tài khoản nhân viên",
      "Quản lý đơn hàng & ghi chú cuộc gọi",
      "Trang gian hàng theo tỉnh thành",
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
      "Tối đa 200 sản phẩm",
      "3 tài khoản nhân viên",
      "Tạo & phát hành mã giảm giá (voucher)",
      "Báo cáo & thống kê doanh số nâng cao",
      "Huy hiệu gian hàng đặc sản uy tín",
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
      "Không giới hạn sản phẩm & nhân viên",
      "Ưu tiên hiển thị trang chủ & tìm kiếm",
      "Hỗ trợ kỹ thuật & chăm sóc riêng 1:1",
      "Hỗ trợ biên tập câu chuyện làng nghề",
      "Báo cáo phân tích hành vi khách hàng",
    ],
    highlight: false,
    cta: "Liên hệ tư vấn",
  },
];

export function Pricing() {
  return (
    <section id="bang-gia" className="scroll-mt-16 border-t py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
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
            <Sparkles className="size-4 text-primary" />
            <span className="font-medium text-primary">Đang miễn phí trong giai đoạn ra mắt</span>
            <span className="text-muted-foreground">— Trải nghiệm toàn bộ tính năng cao cấp không tốn phí.</span>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col justify-between ${
                plan.highlight
                  ? "relative border-primary shadow-md ring-1 ring-primary"
                  : "bg-card"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  {plan.badge && (
                    <Badge className="bg-primary text-primary-foreground">
                      {plan.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-1.5">{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <Price amount={plan.price} className="text-3xl font-bold" />
                  <span className="text-sm text-muted-foreground">{plan.unit}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="space-y-3 pt-4 border-t">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tính năng bao gồm:
                  </p>
                  <ul className="space-y-2.5 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="size-4 shrink-0 text-primary mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="pt-6">
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
