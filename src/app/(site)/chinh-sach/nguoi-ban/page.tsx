import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quy chế người bán — Phố Đặc Sản",
  description:
    "Quy định đăng bán, danh mục hàng cấm và chế tài xử lý vi phạm dành cho các chủ gian hàng trên Phố Đặc Sản.",
};

export default function NguoiBanPage() {
  return (
    <article className="space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">Quy chế người bán</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quy định chi tiết về điều kiện mở shop, tiêu chuẩn sản phẩm đặc sản, danh mục hàng cấm và quy trình xử lý vi phạm.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. Điều kiện tham gia và phê duyệt gian hàng</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Mỗi tài khoản người dùng được đăng ký mở 01 gian hàng. Khi đăng ký, người bán có trách nhiệm cung cấp thông tin trung thực về tên thương hiệu, số điện thoại, địa chỉ và chọn đúng tỉnh/thành phố sản xuất đặc sản.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Gian hàng mới đăng ký sẽ ở trạng thái <strong>CHỜ DUYỆT (PENDING)</strong>. Ban quản trị sẽ đối soát và chỉ các gian hàng được phê duyệt thành <strong>HOẠT ĐỘNG (ACTIVE)</strong> mới được công khai trên sàn và khách hàng tìm thấy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Quy định đăng bán sản phẩm</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <strong>Chuẩn xuất xứ:</strong> Sản phẩm phải là nông sản chế biến, đồ khô, gia vị, trà, bánh kẹo hoặc quà biếu có nguồn gốc bản địa tại Việt Nam.
          </li>
          <li>
            <strong>Phân loại biến thể:</strong> Sản phẩm có nhiều quy cách (ví dụ 250g, 500g, 1kg) phải khai báo đầy đủ giá bán và tồn kho tương ứng cho từng biến thể.
          </li>
          <li>
            <strong>Giá niêm yết:</strong> Giá sản phẩm hiển thị trên sàn là số nguyên Đồng Việt Nam (VND), phản ánh đúng mức giá người bán bán cho khách hàng.
          </li>
          <li>
            <strong>Hình ảnh trung thực:</strong> Khuyến khích sử dụng hình ảnh thực tế chụp tại xưởng, cơ sở sản xuất hoặc hình ảnh bao bì thực của sản phẩm.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. Danh mục hàng cấm đăng bán</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Nghiêm cấm tuyệt đối đăng tải và kinh doanh các mặt hàng sau trên Phố Đặc Sản:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>Thực phẩm không rõ nguồn gốc xuất xứ, ôi thiu, nấm mốc hoặc sử dụng chất phụ gia cấm theo quy định của Bộ Y tế.</li>
          <li>Các loại động thực vật hoang dã nguy cấp, quý hiếm và sản phẩm từ chúng (ngà voi, sừng tê giác, cao hổ...).</li>
          <li>Rượu có nồng độ cồn từ 15 độ trở lên hoặc các sản phẩm có cồn bị pháp luật cấm bán qua thương mại điện tử.</li>
          <li>Hàng giả, hàng nhái nhãn hiệu, giả mạo chỉ dẫn địa lý, giả chứng nhận OCOP hoặc bản quyền sở hữu trí tuệ của tổ chức khác.</li>
          <li>Hàng hóa nhập lậu, trốn thuế hoặc không có hóa đơn chứng từ chứng minh nguồn gốc hợp pháp.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. Quy chế quản lý nhân viên gian hàng</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Chủ gian hàng có quyền mời nhân viên phụ trách quản lý đơn hàng và chỉnh sửa sản phẩm thông qua email. Chủ gian hàng chịu toàn bộ trách nhiệm trước pháp luật và Ban quản lý sàn về mọi hành vi tác nghiệp của nhân viên thuộc gian hàng mình.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. Chế tài xử lý vi phạm</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Tùy theo mức độ vi phạm, Ban quản trị sàn sẽ áp dụng các biện pháp xử lý sau:
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li><strong>Cảnh cáo &amp; nhắc nhở:</strong> Gửi thông báo yêu cầu điều chỉnh mô tả hoặc hình ảnh sản phẩm trong 24 giờ.</li>
          <li><strong>Ẩn sản phẩm vi phạm:</strong> Chuyển trạng thái sản phẩm về dạng ẩn hoặc từ chối duyệt sản phẩm mới.</li>
          <li><strong>Đình chỉ gian hàng (SUSPENDED):</strong> Khóa quyền hiển thị và bán hàng của gian hàng khi phát hiện vi phạm nghiêm trọng hoặc tái phạm.</li>
          <li><strong>Chấm dứt tài khoản &amp; chuyển hồ sơ:</strong> Khóa vĩnh viễn tài khoản và chuyển thông tin cho cơ quan quản lý thị trường, cơ quan công an trong các vụ việc có dấu hiệu lừa đảo, buôn bán hàng giả.</li>
        </ol>
      </section>
    </article>
  );
}
