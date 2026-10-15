import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RatingStars } from "@/components/common/rating-stars";
import { RegionTag } from "@/components/common/region-tag";

const testimonials = [
  {
    quote:
      "Trước đây tôi chỉ bán cho khách du lịch đến Sầm Sơn hoặc người quen gọi gửi xe khách. Lên Phố Đặc Sản, đơn về đều đặn mỗi ngày, quy trình gọi điện xác nhận rất hợp với cách làm việc truyền thống của nhà làm mắm.",
    author: "Lê Văn Hùng",
    role: "Chủ cơ sở Nhà Mắm Sầm Sơn",
    province: "Thanh Hóa",
    initials: "LH",
    rating: 5,
  },
  {
    quote:
      "Tính năng phân quyền nhân viên giúp xưởng trà của tôi xử lý đóng gói nhanh hơn gấp ba lần. Khách đặt loại chè nõn hay chè búp đều có phân loại rõ ràng, không bao giờ lo giao nhầm đơn.",
    author: "Nguyễn Thu Trang",
    role: "Quản lý Hợp tác xã Trà Tân Cương",
    province: "Thái Nguyên",
    initials: "TT",
    rating: 5,
  },
  {
    quote:
      "Tôi rất thích việc không cần phải tích hợp ví điện tử hay thanh toán thẻ rườm rà. Gọi điện cho khách chốt số lượng và giải thích cách thưởng thức đặc sản giúp tăng tỷ lệ giao hàng thành công lên gần như tuyệt đối.",
    author: "Trần Hoàng Nam",
    role: "Chủ thương hiệu Dừa Xứ Bến",
    province: "Bến Tre",
    initials: "HN",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="border-t bg-muted/20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Được tin cậy bởi các nhà làm nghề truyền thống
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Lắng nghe chia sẻ từ những người gìn giữ và lan tỏa hương vị quê nhà trên khắp mọi miền tổ quốc.
          </p>
          <span className="mt-2 inline-block rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            (Dữ liệu mẫu trải nghiệm từ người bán)
          </span>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.author}
              className="flex flex-col justify-between rounded-lg border bg-card p-6 shadow-none"
            >
              <div>
                <div className="flex items-center justify-between">
                  <RatingStars value={item.rating} />
                  <RegionTag province={item.province} />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t pt-4">
                <Avatar className="size-10 border">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                    {item.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{item.author}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
