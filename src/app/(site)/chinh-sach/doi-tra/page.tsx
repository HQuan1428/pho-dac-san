import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách đổi trả & khiếu nại — Phố Đặc Sản",
  description:
    "Quy trình tiếp nhận đổi trả sản phẩm và giải quyết khiếu nại cho khách hàng mua đặc sản trên sàn.",
};

export default function DoiTraPage() {
  return (
    <article className="space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">Đổi trả &amp; Giải quyết khiếu nại</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chính sách bảo vệ quyền lợi người tiêu dùng và hỗ trợ giải quyết tranh chấp đơn hàng đặc sản.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. Nguyên tắc chung</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Đặc thù của Phố Đặc Sản là các mặt hàng ẩm thực truyền thống, đồ khô và gia vị địa phương. Chính sách đổi trả được thiết lập nhằm bảo đảm khách hàng luôn nhận được sản phẩm đúng chất lượng và xuất xứ như đã cam kết, đồng thời tôn trọng công sức của người sản xuất.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Các trường hợp chấp nhận đổi trả / bồi thường</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Khách hàng được yêu cầu đổi trả hoặc bồi thường mà không mất thêm chi phí trong các trường hợp sau:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>Sản phẩm giao không đúng phân loại biến thể (sai khối lượng, sai quy cách đóng gói so với đơn đặt).</li>
          <li>Sản phẩm bị nứt vỡ, rách bao bì, chảy đổ hoặc biến chất do quá trình đóng gói và vận chuyển.</li>
          <li>Sản phẩm đã quá hạn sử dụng tại thời điểm khách hàng nhận hàng.</li>
          <li>Hàng hóa không đúng với xuất xứ tỉnh thành hoặc thông tin công bố của gian hàng.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. Thời hạn tiếp nhận khiếu nại</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Khách hàng vui lòng kiểm tra tình trạng hàng hóa khi nhận từ nhân viên chuyển phát và gửi phản hồi cho Người bán trong vòng <strong>48 giờ</strong> kể từ thời điểm nhận hàng. Đối với các sản phẩm có phát sinh hư hỏng, đề nghị quý khách chụp ảnh hoặc quay video ngắn mở hộp làm bằng chứng đối soát.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. Quy trình xử lý khiếu nại 3 bước</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Bước 1: Trao đổi trực tiếp với Người bán.</strong> Khách hàng liên hệ theo số điện thoại của gian hàng được ghi trên phiếu gửi hàng hoặc trong chi tiết đơn hàng để thông báo tình trạng.
          </p>
          <p>
            <strong>Bước 2: Phản ánh lên Ban quản lý Sàn (nếu cần).</strong> Trường hợp không đạt được thỏa thuận với người bán sau 24 giờ, khách hàng gửi yêu cầu hỗ trợ qua trang <em>Liên hệ</em> của Phố Đặc Sản kèm mã đơn hàng.
          </p>
          <p>
            <strong>Bước 3: Hòa giải và xử lý.</strong> Ban quản trị sẽ tiến hành xác minh chéo giữa hai bên. Nếu lỗi thuộc về người bán hoặc đơn vị vận chuyển, người bán có trách nhiệm gửi bù hàng mới hoặc hoàn tiền tương ứng cho khách hàng.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. Phương thức hoàn tiền</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Trường hợp thống nhất hoàn tiền, người bán sẽ chuyển khoản trực tiếp vào tài khoản ngân hàng của khách hàng trong vòng 1-2 ngày làm việc kể từ thời điểm xác nhận phương án xử lý.
        </p>
      </section>
    </article>
  );
}
