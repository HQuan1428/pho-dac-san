import {
  Store,
  Layers,
  PhoneCall,
  Users,
  Ticket,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Store,
    title: "Gian hàng riêng biệt",
    description:
      "Sở hữu trang cửa hàng riêng mang đậm bản sắc vùng miền với logo, banner, mô tả câu chuyện thương hiệu và địa chỉ xuất xứ rõ ràng.",
  },
  {
    icon: Layers,
    title: "Sản phẩm có biến thể",
    description:
      "Tùy biến đa dạng phân loại theo khối lượng, đóng gói (hũ 250g, gói 500g, hộp quà...), cập nhật giá bán và tồn kho cho từng biến thể.",
  },
  {
    icon: PhoneCall,
    title: "Nhận đơn & gọi chốt",
    description:
      "Thông báo đơn hàng mới tức thì qua hệ thống & email. Người bán chủ động gọi điện tư vấn và chốt lịch giao với khách, hạn chế rủi ro boom hàng.",
  },
  {
    icon: Users,
    title: "Phân quyền nhân viên",
    description:
      "Mời nhân sự hỗ trợ xử lý đơn hàng và cập nhật kho sản phẩm qua email. Nhân viên không can thiệp vào cài đặt cốt lõi hay mã giảm giá.",
  },
  {
    icon: Ticket,
    title: "Mã giảm giá linh hoạt",
    description:
      "Thiết lập voucher giảm giá theo phần trăm hoặc số tiền cố định, giới hạn lượt dùng và điều kiện đơn hàng tối thiểu để thu hút khách mới.",
  },
  {
    icon: TrendingUp,
    title: "Thống kê doanh số",
    description:
      "Nắm bắt chỉ số đơn hàng, lượt theo dõi và tiến độ hoàn thành đơn. Dễ dàng nhận diện các món đặc sản được khách hàng ưa chuộng nhất.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Mọi công cụ bạn cần để kinh doanh đặc sản số
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Thiết kế tối ưu cho thói quen mua bán đặc sản tại Việt Nam: không thủ tục rườm rà,
            đặt trọng tâm vào chất lượng, uy tín và kết nối chân thành với khách hàng.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-lg border bg-card p-6 transition-colors hover:border-foreground/30 hover:bg-muted/10"
              >
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
