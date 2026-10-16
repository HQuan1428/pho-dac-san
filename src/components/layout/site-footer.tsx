import Link from "next/link";
import { Logo } from "./logo";

const columns = [
  { title: "Khám phá", links: [["Chợ đặc sản", "/market"], ["Tìm kiếm", "/search"], ["Giới thiệu", "/about"]] },
  { title: "Người bán", links: [["Mở gian hàng", "/seller/register"], ["Bảng giá", "/#pricing"], ["Chính sách người bán", "/policies/seller"]] },
  { title: "Hỗ trợ", links: [["Liên hệ", "/contact"], ["Đổi trả & khiếu nại", "/policies/returns"], ["Điều khoản", "/policies/terms"], ["Bảo mật", "/policies/privacy"], ["Nguồn ảnh", "/image-credits"]] },
];

// Brand marks are drawn inline because lucide-react no longer ships them.
const socials = [
  { label: "Facebook", href: "https://facebook.com", d: "M14 8h3V4h-3a5 5 0 0 0-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9a1 1 0 0 1 1-1z" },
  { label: "YouTube", href: "https://youtube.com", d: "M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8zM10 15V9l5.2 3z" },
  { label: "TikTok", href: "https://tiktok.com", d: "M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 1 0 5 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.3-1.6z" },
  { label: "Zalo", href: "https://zalo.me", d: "M12 3C6.5 3 2 6.9 2 11.6c0 2.6 1.4 5 3.7 6.6L5 21l3.3-1.7c1.2.4 2.4.5 3.7.5 5.5 0 10-3.9 10-8.6S17.5 3 12 3zm-3.5 10.8H5.6l2.6-3.3H5.8V9.4h3l-2.5 3.3h2.2zm2.4 0H9.8V9.4h1.1zm4.3 0h-1.1l-1.6-2.4v2.4h-1.1V9.4h1l1.7 2.4V9.4h1.1zm3.7-1.1h-2.1V9.4h-1.1v4.4h3.2z" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container-page grid gap-8 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">Chợ đặc sản vùng miền nhiều gian hàng. Người bán mở shop miễn phí, khách đặt hàng, shop gọi điện chốt đơn.</p>
          <div className="flex gap-2">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="inline-flex size-8 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground">
                <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden><path d={s.d} /></svg>
              </a>
            ))}
          </div>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-medium">{c.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {c.links.map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-foreground">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <p className="container-page py-4 text-xs text-muted-foreground">© {new Date().getFullYear()} Phố Đặc Sản. Bảo lưu mọi quyền.</p>
      </div>
    </footer>
  );
}
