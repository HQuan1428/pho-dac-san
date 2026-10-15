import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Mở gian hàng trên Phố Đặc Sản có mất phí không?",
    answer:
      "Hiện tại trong giai đoạn ra mắt, tất cả nhà sản xuất và chủ hộ kinh doanh đều được mở gian hàng hoàn toàn miễn phí. Bạn không phải trả bất kỳ khoản phí thiết lập ban đầu hay hoa hồng duy trì hàng tháng nào.",
  },
  {
    question: "Tôi là nông dân / hộ làm nghề không rành máy tính thì có bán được không?",
    answer:
      "Hoàn toàn được. Giao diện quản trị của Phố Đặc Sản được tối giản tối đa, có thể thao tác thuận tiện ngay trên điện thoại thông minh. Khi có người đặt hàng, bạn chỉ cần mở đơn và bấm số gọi trực tiếp cho khách.",
  },
  {
    question: "Quy trình xác nhận và giao nhận đơn hàng diễn ra như thế nào?",
    answer:
      "Khi khách hàng gửi yêu cầu mua hàng trên sàn, hệ thống sẽ gửi thông báo và email chi tiết đơn. Chủ shop hoặc nhân viên sẽ gọi điện cho khách để xác nhận số lượng, tiền ship và thời gian giao, sau đó tự chủ đóng gói gửi qua các đơn vị bưu điện quen thuộc.",
  },
  {
    question: "Điều kiện để gian hàng và sản phẩm được ban quản trị phê duyệt là gì?",
    answer:
      "Sản phẩm phải có nguồn gốc xuất xứ rõ ràng tại 34 tỉnh thành Việt Nam, bảo đảm an toàn vệ sinh thực phẩm theo quy định hiện hành và không thuộc danh mục hàng cấm. Ban quản trị sẽ đối soát thông tin trong 24 giờ làm việc.",
  },
  {
    question: "Tiền hàng được thanh toán như thế nào, có bị nền tảng giữ tiền không?",
    answer:
      "Phố Đặc Sản không can thiệp vào dòng tiền hay giữ vốn của người bán. Bạn thu tiền trực tiếp từ khách hàng thông qua hình thức nhận tiền mặt khi giao hàng (COD) hoặc chuyển khoản theo thỏa thuận khi gọi điện chốt đơn.",
  },
  {
    question: "Tôi có thể mời thêm người thân hoặc nhân viên vào phụ bán không?",
    answer:
      "Được. Tính năng Quản lý nhân viên cho phép bạn gửi thư mời qua email. Nhân viên có thể truy cập để xem danh sách đơn, gọi chốt đơn và cập nhật tình trạng sản phẩm mà không được phép thay đổi tài khoản hay cài đặt của shop.",
  },
];

export function Faq() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Câu hỏi thường gặp
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Giải đáp những thắc mắc phổ biến nhất của các chủ gian hàng khi tham gia Phố Đặc Sản.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-lg border bg-card p-4 transition duration-150 open:bg-card/90"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground select-none [&::-webkit-details-marker]:hidden">
                <span className="text-base font-medium">{faq.question}</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="mt-3 border-t pt-3 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
