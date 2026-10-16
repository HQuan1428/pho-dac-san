import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageSquareQuote } from "lucide-react";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Liên hệ — Phố Đặc Sản",
  description:
    "Gửi ý kiến đóng góp, phản hồi hoặc yêu cầu tư vấn mở gian hàng đặc sản tới Ban quản lý Phố Đặc Sản.",
};

const contactInfo = [
  {
    icon: Phone,
    title: "Tổng đài hỗ trợ",
    detail: "1900 8866 (1.000đ/phút)",
    sub: "Hỗ trợ khách hàng và người bán",
  },
  {
    icon: Mail,
    title: "Thư điện tử",
    detail: "hotro@phodacsan.vn",
    sub: "Tiếp nhận phản ánh & hợp tác",
  },
  {
    icon: MapPin,
    title: "Văn phòng điều hành",
    detail: "Tòa nhà Công Nghệ Xanh, Cầu Giấy, Hà Nội",
    sub: "Trụ sở Ban quản lý Sàn TMĐT",
  },
  {
    icon: Clock,
    title: "Thời gian làm việc",
    detail: "Thứ Hai – Thứ Bảy: 08:00 – 18:00",
    sub: "Nghỉ Chủ Nhật và các ngày Lễ, Tết",
  },
];

export default function LienHePage() {
  return (
    <div className="py-12 md:py-16">
      <div className="container-page">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Hỗ trợ &amp; Kết nối
          </span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Liên hệ với Ban quản trị
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Bạn cần tư vấn mở gian hàng, giải đáp khiếu nại hoặc hợp tác phát triển đặc sản địa phương? Hãy để lại lời nhắn, chúng tôi sẽ liên hệ lại ngay.
          </p>
        </div>

        {/* 2-Column layout: Info Left (5 cols), Form Right (7 cols) */}
        <div className="mt-12 grid gap-8 lg:grid-cols-12 items-start">
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-xl border bg-muted/20 p-6 space-y-6 shadow-xs">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquareQuote className="size-5 text-primary" />
                Thông tin liên lạc trực tiếp
              </h2>

              <div className="space-y-5">
                {contactInfo.map((info) => {
                  const Icon = info.icon;
                  return (
                    <div key={info.title} className="flex items-start gap-3.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-card border text-primary shadow-xs">
                        <Icon className="size-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-muted-foreground">{info.title}</p>
                        <p className="text-sm font-semibold text-foreground">{info.detail}</p>
                        <p className="text-xs text-muted-foreground">{info.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground space-y-2 shadow-xs">
              <p className="font-semibold text-foreground">Bạn muốn mở gian hàng ngay?</p>
              <p className="leading-relaxed">
                Không cần đợi phản hồi liên hệ, bạn có thể tự đăng ký mở gian hàng trực tuyến chỉ với 3 phút khai báo thông tin ban đầu.
              </p>
              <Link
                href="/seller/register"
                className="inline-block text-xs font-medium text-primary hover:underline pt-1"
              >
                Đăng ký mở gian hàng ngay →
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
