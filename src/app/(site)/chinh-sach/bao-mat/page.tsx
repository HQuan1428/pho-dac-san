import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách bảo mật — Phố Đặc Sản",
  description:
    "Cam kết bảo vệ dữ liệu cá nhân theo Nghị định số 13/2023/NĐ-CP của Chính phủ về Bảo vệ dữ liệu cá nhân.",
};

export default function BaoMatPage() {
  return (
    <article className="space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">Chính sách bảo mật</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tuân thủ Nghị định số 13/2023/NĐ-CP của Chính phủ về Bảo vệ dữ liệu cá nhân.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. Mục đích và phạm vi thu thập dữ liệu</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Phố Đặc Sản cam kết tôn trọng quyền riêng tư của Khách hàng và Người bán. Chúng tôi chỉ thu thập các trường dữ liệu cần thiết phục vụ cho việc vận hành sàn thương mại điện tử, bao gồm:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li><strong>Dữ liệu định danh:</strong> Họ tên, địa chỉ email, số điện thoại.</li>
          <li><strong>Dữ liệu giao nhận:</strong> Tỉnh/thành phố, địa chỉ giao nhận chi tiết, ghi chú đơn hàng.</li>
          <li><strong>Dữ liệu kỹ thuật &amp; bảo mật:</strong> Địa chỉ IP, nhật ký truy cập nhằm kiểm soát chống gian lận đặt đơn và đảm bảo an toàn mạng.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Mục đích xử lý dữ liệu cá nhân</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Dữ liệu thu thập được sử dụng cho các mục đích hợp pháp sau:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>Cung cấp thông tin đơn hàng cho Người bán để liên hệ gọi điện xác nhận và gửi hàng.</li>
          <li>Gửi thông báo điện tử về trạng thái đơn hàng, xác thực tài khoản và khôi phục mật khẩu.</li>
          <li>Hỗ trợ giải quyết tranh chấp, khiếu nại giữa các bên tham gia giao dịch.</li>
          <li>Thực hiện các nghĩa vụ báo cáo theo quy định của pháp luật thương mại điện tử.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. Biện pháp kỹ thuật và an toàn thông tin</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Hệ thống triển khai các tiêu chuẩn kỹ thuật nghiêm ngặt để bảo vệ an toàn thông tin cá nhân:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>Toàn bộ mật khẩu người dùng đều được mã hóa một chiều an toàn bằng thuật toán bcrypt trước khi lưu trữ vào cơ sở dữ liệu.</li>
          <li>Mã thông báo xác thực qua email (token xác minh, đặt lại mật khẩu) được băm bằng SHA-256 và giới hạn thời gian hiệu lực.</li>
          <li>Áp dụng giao thức mã hóa đường truyền HTTPS/TLS cho toàn bộ phiên làm việc của người dùng.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. Quyền của chủ thể dữ liệu</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Theo Nghị định 13/2023/NĐ-CP, người dùng có các quyền: được biết, đồng ý, truy cập, chỉnh sửa, xóa dữ liệu cá nhân của mình hoặc rút lại sự đồng ý bằng cách liên hệ với Ban quản trị qua trang Liên hệ.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. Chia sẻ thông tin với bên thứ ba</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Phố Đặc Sản không kinh doanh, bán hoặc cho thuê dữ liệu cá nhân của người dùng cho bất kỳ bên thứ ba nào. Dữ liệu chỉ được chuyển giao cho Người bán trong phạm vi thực hiện đơn hàng cụ thể, hoặc cho cơ quan nhà nước có thẩm quyền khi có văn bản yêu cầu chính thức theo quy định của pháp luật.
        </p>
      </section>
    </article>
  );
}
