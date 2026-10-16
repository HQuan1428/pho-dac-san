import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Compass, ShieldCheck, Users, Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Giới thiệu — Phố Đặc Sản",
  description:
    "Tìm hiểu về sứ mệnh, câu chuyện khởi nguồn và giá trị cốt lõi của Phố Đặc Sản — Chợ đặc sản vùng miền Việt Nam.",
};

const values = [
  {
    icon: Compass,
    title: "Chuẩn vị nguyên bản",
    desc: "Tôn trọng xuất xứ thổ nhưỡng và quy trình chế biến thủ công truyền thống của từng địa phương.",
  },
  {
    icon: ShieldCheck,
    title: "Minh bạch & Tin cậy",
    desc: "Mọi sản phẩm đều xác thực nguồn gốc tỉnh thành, người bán có danh tính rõ ràng, phản hồi công khai.",
  },
  {
    icon: Heart,
    title: "Đồng hành bền vững",
    desc: "Tạo điều kiện tốt nhất để các hộ nông dân, làng nghề và hợp tác xã tiếp cận thị trường tiêu thụ ổn định.",
  },
  {
    icon: Users,
    title: "Gắn kết cộng đồng",
    desc: "Cầu nối chân tình giữa người trân quý sản vật quê nhà và người ngày đêm giữ nghề truyền thống.",
  },
];

const teamMembers = [
  {
    name: "Nguyễn Minh Đức",
    role: "Đồng sáng lập & Điều hành",
    bio: "Hơn 10 năm kinh nghiệm trong chuỗi cung ứng nông sản và thương mại điện tử địa phương.",
  },
  {
    name: "Trần Mai Anh",
    role: "Phụ trách Phát triển Cộng đồng",
    bio: "Gắn bó với các dự án bảo tồn văn hóa ẩm thực và làng nghề truyền thống khắp 34 tỉnh thành.",
  },
  {
    name: "Lê Hoàng Phúc",
    role: "Kỹ sư Sản phẩm & Công nghệ",
    bio: "Tập trung thiết kế những công cụ số giản dị, thân thiện nhất cho người làm nông sản.",
  },
];

export default function GioiThieuPage() {
  return (
    <div className="py-12 md:py-16">
      <div className="container-page">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Về chúng tôi
          </span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Tôn vinh và lan tỏa tinh hoa đặc sản Việt
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Phố Đặc Sản ra đời với mong muốn đưa những sản vật thuần túy nhất từ mọi miền đất nước đến căn bếp của từng gia đình Việt Nam.
          </p>
        </div>

        {/* 2-Column Story Section */}
        <div className="mt-12 lg:mt-16 grid gap-8 lg:grid-cols-2 items-stretch">
          <div className="space-y-4 rounded-xl border bg-card p-6 sm:p-8 flex flex-col justify-center shadow-xs">
            <h2 className="text-2xl font-semibold tracking-tight">Câu chuyện khởi nguồn</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Việt Nam với 34 tỉnh thành sau các thời kỳ phát triển sở hữu kho tàng ẩm thực vô giá: từ hũ mắm tôm đậm đà xứ Thanh, ngụm trà xanh Tân Cương thanh khiết, đến kẹo dừa Bến Tre ngọt thơm béo ngậy. Tuy nhiên, việc tìm đúng món ngon chuẩn vị luôn là thử thách giữa thị trường tràn lan hàng pha trộn.
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Mặt khác, những nghệ nhân, bà con nông dân và hợp tác xã địa phương lại gặp nhiều rào cản khi tiếp cận thương mại điện tử hiện đại với các thủ tục phức tạp và chi phí trung gian đắt đỏ.
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Phố Đặc Sản được hình thành để giải quyết nút thắt ấy: Một sàn thương mại điện tử thân thiện, nơi người bán mở gian hàng miễn phí chỉ trong vài phút, tự hào kể câu chuyện sản vật quê mình và trực tiếp gọi điện trò chuyện, chốt đơn cùng người mua.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 sm:p-8 flex flex-col justify-center shadow-xs">
            <h3 className="text-2xl font-semibold text-foreground tracking-tight">Sứ mệnh của chúng tôi</h3>
            <div className="mt-6 space-y-5 text-sm sm:text-base text-muted-foreground">
              <div className="flex gap-3">
                <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                <p>
                  <strong className="text-foreground">Bảo tồn di sản:</strong> Giúp các làng nghề truyền thống duy trì và phát triển bền vững qua nhiều thế hệ.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                <p>
                  <strong className="text-foreground">Minh bạch thị trường:</strong> Khẳng định chỉ dẫn địa lý và niềm tự hào thương hiệu của từng vùng đất.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                <p>
                  <strong className="text-foreground">Đơn giản hóa công nghệ:</strong> Biến việc bán hàng trên mạng trở nên tự nhiên và dễ dàng như ở chợ quê.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values Grid */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Giá trị cốt lõi</h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Những kim chỉ nam dẫn đường cho mọi quyết định tại Phố Đặc Sản.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="rounded-xl border bg-card p-6 shadow-xs transition-colors hover:border-foreground/20">
                  <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Grid */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Đội ngũ điều hành</h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Những người đồng hành tâm huyết vì sự phát triển của nông sản và đặc sản Việt.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {teamMembers.map((member) => (
              <div key={member.name} className="rounded-xl border bg-card p-6 text-center shadow-xs">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted font-mono text-lg font-semibold text-muted-foreground">
                  {member.name.split(" ").slice(-1)[0][0]}
                </div>
                <h3 className="mt-4 text-base font-semibold">{member.name}</h3>
                <p className="text-xs font-medium text-primary">{member.role}</p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Join CTA */}
        <div className="mt-16 sm:mt-20 rounded-2xl border bg-muted/40 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">Bạn có sản vật quê hương muốn giới thiệu?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground text-sm sm:text-base">
            Hãy cùng chúng tôi xây dựng một khu chợ trực tuyến đặc sắc, uy tín và đậm đà nghĩa tình quê hương.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" render={<Link href="/seller/register" />}>
              <Store data-icon="inline-start" />
              Mở gian hàng ngay
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/market" />}>
              Xem các món ngon
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
