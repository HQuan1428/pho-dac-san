import type { Metadata } from "next";
import { Hero } from "./_landing/hero";
import { StatsStrip } from "./_landing/stats-strip";
import { FeaturesGrid } from "./_landing/features-grid";
import { HowItWorks } from "./_landing/how-it-works";
import { Pricing } from "./_landing/pricing";
import { Testimonials } from "./_landing/testimonials";
import { Faq } from "./_landing/faq";
import { CtaBand } from "./_landing/cta-band";

export const metadata: Metadata = {
  title: "Phố Đặc Sản — Nền tảng mở gian hàng đặc sản vùng miền Việt Nam",
  description:
    "Mở gian hàng đặc sản trực tuyến trong 5 phút. Kết nối người làm nghề truyền thống tại 34 tỉnh thành với khách hàng toàn quốc. Đăng bán dễ dàng, nhận đơn trực tiếp.",
  openGraph: {
    title: "Phố Đặc Sản — Mở gian hàng đặc sản trong 5 phút",
    description:
      "Nền tảng thương mại điện tử chuyên biệt cho đặc sản 34 tỉnh thành Việt Nam. Không phí khởi tạo, tự chủ nhận đơn và gọi điện chốt khách.",
    type: "website",
    locale: "vi_VN",
    siteName: "Phố Đặc Sản",
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <StatsStrip />
      <FeaturesGrid />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Faq />
      <CtaBand />
    </div>
  );
}
