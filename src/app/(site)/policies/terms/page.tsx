import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ — Phố Đặc Sản",
  description:
    "Quy chế hoạt động và điều khoản sử dụng sàn thương mại điện tử Phố Đặc Sản theo Nghị định 52/2013/NĐ-CP và Nghị định 85/2021/NĐ-CP.",
};

export default function DieuKhoanPage() {
  return (
    <article className="space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">Điều khoản dịch vụ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Căn cứ Nghị định số 52/2013/NĐ-CP và Nghị định số 85/2021/NĐ-CP về Thương mại điện tử của Chính phủ nước CHXHCN Việt Nam.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. Nguyên tắc chung</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Website thương mại điện tử <strong>Phố Đặc Sản</strong> (sau đây gọi tắt là &ldquo;Nền tảng&rdquo; hoặc &ldquo;Sàn&rdquo;) là môi trường kết nối trực tuyến giữa thương nhân, hộ kinh doanh, hợp tác xã sản xuất đặc sản địa phương (Người bán) và người tiêu dùng (Khách hàng) trên toàn lãnh thổ Việt Nam.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Mọi tổ chức, cá nhân tham gia giao dịch trên Phố Đặc Sản đều phải tuân thủ nguyên tắc tự nguyện, bình đẳng, tôn trọng quyền và lợi ích hợp pháp của các bên, không trái với quy định của pháp luật Việt Nam.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Quy định về tài khoản và giao dịch</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Khách hàng có thể trải nghiệm mua sắm dưới hình thức tài khoản thành viên hoặc đặt hàng không cần tài khoản (khách vãng lai). Khi tạo đơn hàng, Khách hàng có trách nhiệm cung cấp chính xác họ tên, số điện thoại liên lạc hợp lệ tại Việt Nam và địa chỉ nhận hàng chi tiết.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong>Cơ chế chốt đơn:</strong> Phố Đặc Sản áp dụng mô hình đặt đơn trực tuyến và Người bán chủ động liên hệ điện thoại trực tiếp để xác nhận đơn hàng, chi phí vận chuyển và thời gian giao hàng dự kiến trước khi xuất kho.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. Quyền và nghĩa vụ của Ban quản lý Sàn</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Xây dựng, duy trì hệ thống kỹ thuật vận hành ổn định, bảo mật thông tin tài khoản và dữ liệu giao dịch của người dùng.
          </li>
          <li>
            Thẩm định hồ sơ, kiểm duyệt tính hợp lệ và thông tin xuất xứ tỉnh thành của các gian hàng trước khi cho phép hoạt động công khai.
          </li>
          <li>
            Đình chỉ hoặc khóa vĩnh viễn tài khoản gian hàng, tài khoản người mua nếu phát hiện hành vi gian lận, cố tình &ldquo;bom hàng&rdquo;, đăng tải sản phẩm cấm hoặc vi phạm pháp luật.
          </li>
          <li>
            Cung cấp thông tin và phối hợp với cơ quan quản lý nhà nước có thẩm quyền khi có yêu cầu điều tra các hành vi vi phạm pháp luật thương mại điện tử.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. Biện pháp phòng chống gian lận &amp; Spam</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Nhằm bảo vệ Người bán khỏi hiện tượng đặt đơn ảo và phá hoại, hệ thống áp dụng hạn mức kỹ thuật: tối đa 5 đơn hàng trên mỗi số điện thoại và tối đa 10 đơn hàng trên mỗi địa chỉ IP trong khoảng thời gian 1 giờ. Người bán có quyền đánh dấu phản ánh các số điện thoại có dấu hiệu bom hàng để cảnh báo nội bộ.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. Điều khoản thi hành</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Phố Đặc Sản có quyền cập nhật, bổ sung các điều khoản này phù hợp với sự phát triển của hệ thống và các văn bản pháp luật hiện hành. Những thay đổi sẽ được công bố công khai trên website kèm ngày áp dụng chính thức.
        </p>
      </section>
    </article>
  );
}
