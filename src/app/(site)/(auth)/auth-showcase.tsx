import { HeartHandshake, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { AuthProductTile } from "./auth-product-tile";

const showcaseProducts = [
  {
    name: "Chè búp Tân Cương",
    province: "Thái Nguyên",
    src: "/images/products/che-tan-cuong-1.webp",
    alt: "Chè Tân Cương Thái Nguyên",
  },
  {
    name: "Nem chua truyền thống",
    province: "Thanh Hóa",
    src: "/images/products/nem-chua-thanh-hoa-1.webp",
    alt: "Nem chua Thanh Hóa",
  },
  {
    name: "Mực khô câu đảo",
    province: "Sầm Sơn",
    src: "/images/products/muc-kho-sam-son-1.webp",
    alt: "Mực khô Sầm Sơn",
  },
  {
    name: "Mắm tôm hũ thủy tinh",
    province: "Thanh Hóa",
    src: "/images/products/mam-tom-sam-son-1.webp",
    alt: "Mắm tôm Sầm Sơn",
  },
];

export function AuthShowcase() {
  return (
    <div className="flex h-full flex-col justify-between gap-4">
      {/* Brand header & product collage */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            <Sparkles className="size-3" />
            <span>Phố Đặc Sản · Tinh hoa quà quê</span>
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground lg:text-xl">
            Hương vị quê nhà, gửi trọn tin yêu
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Kết nối trực tiếp đến các làng nghề và nhà vườn uy tín trên 34 tỉnh thành cả nước.
          </p>
        </div>

        {/* Product image collage */}
        <div className="grid grid-cols-2 gap-2.5">
          {showcaseProducts.map((p) => (
            <AuthProductTile
              key={p.name}
              src={p.src}
              alt={p.alt}
              province={p.province}
              name={p.name}
            />
          ))}
        </div>
      </div>

      {/* Brand value props (3 benefits with icons) */}
      <div className="space-y-2.5 rounded-xl border border-border/70 bg-card/60 p-3.5 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ShieldCheck className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">100% Đặc sản chuẩn gốc</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Kiểm duyệt xuất xứ rõ ràng từ các hộ sản xuất, hợp tác xã uy tín.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Truck className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">Vận chuyển tươi nguyên</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Đóng gói bảo quản đúng chuẩn từng loại nông sản và hải sản khô.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <HeartHandshake className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">Đồng hành cùng nhà nông</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Mua hàng trực tiếp không qua trung gian, bảo vệ giá trị nông sản Việt.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="rounded-xl border border-border/70 bg-card/90 p-3.5 shadow-2xs">
        <div className="flex items-center gap-1 text-amber-500 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="size-3 fill-current" />
          ))}
        </div>
        <p className="text-xs italic leading-relaxed text-muted-foreground">
          &ldquo;Gia đình tôi rất chuộng chè Tân Cương và hải sản Thanh Hóa. Đặt hàng qua Phố Đặc Sản được đóng gói cẩn thận, vị chuẩn quê như mua tận xưởng.&rdquo;
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
            LT
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">Lan Thương</p>
            <p className="text-[10px] text-muted-foreground">Khách hàng thân thiết · Quận 1, TP. Hồ Chí Minh</p>
          </div>
        </div>
      </div>
    </div>
  );
}
