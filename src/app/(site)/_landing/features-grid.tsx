import { PhoneCall, Store, Layers, TrendingUp } from "lucide-react";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { Price } from "@/components/common/price";

export function FeaturesGrid() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-page">
        <div className="reveal mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Mọi công cụ bạn cần để kinh doanh đặc sản số
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Thiết kế tối ưu cho thói quen mua bán đặc sản tại Việt Nam: không thủ tục rườm rà,
            đặt trọng tâm vào chất lượng, uy tín và kết nối chân thành với khách hàng.
          </p>
        </div>

        {/* 3x2 Bento Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Bento Item 1: Col-span-2 with Mini UI (Nhận đơn & gọi chốt) */}
          <div className="reveal flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
            <div>
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <PhoneCall className="size-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Nhận đơn &amp; gọi điện chốt đơn trực tiếp</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Thông báo đơn hàng mới tức thì qua hệ thống và email. Người bán chủ động bấm gọi trực tiếp cho khách để xác nhận số lượng, tiền ship và thời gian nhận hàng, hạn chế tối đa nguy cơ hoàn đơn.
              </p>
            </div>

            {/* Mini UI Visual: Incoming order call sheet */}
            <div className="mt-6 rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-foreground">ORD-2026-0189</span>
                <OrderStatusBadge status="NEW" />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs">
                <div>
                  <p className="font-medium text-foreground">2x Chè Tân Cương búp non (500g)</p>
                  <p className="text-muted-foreground">Khách: Lê Hoài Nam · Cầu Giấy, Hà Nội</p>
                </div>
                <div className="flex items-center gap-3">
                  <Price amount={640000} className="font-semibold text-foreground" />
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm">
                    <PhoneCall className="size-3.5" />
                    Gọi 0912 345 ***
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Col-span-1 (Gian hàng riêng biệt) */}
          <div className="reveal flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm lg:col-span-1">
            <div>
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Store className="size-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Gian hàng riêng biệt</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Sở hữu trang cửa hàng riêng mang đậm bản sắc vùng miền với logo, banner, câu chuyện thương hiệu và địa chỉ xuất xứ 34 tỉnh thành rõ ràng.
              </p>
            </div>
            <div className="mt-6 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Chỉ dẫn xuất xứ rõ ràng</p>
              <p className="mt-0.5">Khách hàng tra cứu nhanh nguồn gốc cơ sở chế biến truyền thống.</p>
            </div>
          </div>

          {/* Bento Item 3: Col-span-1 (Sản phẩm đa biến thể) */}
          <div className="reveal flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm lg:col-span-1">
            <div>
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Layers className="size-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Sản phẩm có biến thể</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Tùy biến phân loại theo khối lượng, đóng gói (hũ 250g, túi 500g, hộp quà biếu), tự động cập nhật giá bán và kiểm soát tồn kho riêng cho từng biến thể.
              </p>
            </div>
            <div className="mt-6 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Linh hoạt quy cách</p>
              <p className="mt-0.5">Định giá riêng cho mua lẻ hũ nhỏ hoặc mua combo thùng sỉ.</p>
            </div>
          </div>

          {/* Bento Item 4: Col-span-2 with Mini UI (Thống kê doanh số & Voucher) */}
          <div className="reveal flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
            <div>
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <TrendingUp className="size-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Thống kê doanh số &amp; Mã giảm giá</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Theo dõi biến động doanh thu, tỷ lệ hoàn tất đơn và các món bán chạy nhất theo thời gian thực. Phát hành mã giảm giá để tri ân khách hàng và thúc đẩy đơn hàng lặp lại.
              </p>
            </div>

            {/* Mini UI Visual: Revenue stats + Coupon card */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col justify-between rounded-lg border bg-muted/40 p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Doanh thu tháng này</span>
                  <span className="font-medium text-success">+18.5%</span>
                </div>
                <div className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  48.500.000 đ
                </div>
                <div className="mt-2 flex h-6 items-end gap-1">
                  {[35, 50, 45, 65, 60, 80, 95, 85, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-primary/30"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">DACSAN20K</span>
                  <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    Đang hoạt động
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-foreground">Giảm 20.000đ cho đơn từ 250k</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Đã dùng 64/100</span>
                  <span>HSD: 30 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
