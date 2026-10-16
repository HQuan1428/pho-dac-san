import { MapPin } from "lucide-react";
import { regionTone } from "@/lib/ui-icons";
import { cn } from "@/lib/utils";

const PROVINCE_TO_REGION: Record<string, string> = {
  // Miền Bắc
  "Hà Nội": "mien-bac",
  "ha-noi": "mien-bac",
  "Hải Phòng": "mien-bac",
  "hai-phong": "mien-bac",
  "Cao Bằng": "mien-bac",
  "cao-bang": "mien-bac",
  "Điện Biên": "mien-bac",
  "dien-bien": "mien-bac",
  "Lai Châu": "mien-bac",
  "lai-chau": "mien-bac",
  "Lạng Sơn": "mien-bac",
  "lang-son": "mien-bac",
  "Quảng Ninh": "mien-bac",
  "quang-ninh": "mien-bac",
  "Sơn La": "mien-bac",
  "son-la": "mien-bac",
  "Tuyên Quang": "mien-bac",
  "tuyen-quang": "mien-bac",
  "Lào Cai": "mien-bac",
  "lao-cai": "mien-bac",
  "Thái Nguyên": "mien-bac",
  "thai-nguyen": "mien-bac",
  "Phú Thọ": "mien-bac",
  "phu-tho": "mien-bac",
  "Bắc Ninh": "mien-bac",
  "bac-ninh": "mien-bac",
  "Hưng Yên": "mien-bac",
  "hung-yen": "mien-bac",
  "Ninh Bình": "mien-bac",
  "ninh-binh": "mien-bac",

  // Miền Trung
  "Thanh Hóa": "mien-trung",
  "thanh-hoa": "mien-trung",
  "Nghệ An": "mien-trung",
  "nghe-an": "mien-trung",
  "Hà Tĩnh": "mien-trung",
  "ha-tinh": "mien-trung",
  "Quảng Trị": "mien-trung",
  "quang-tri": "mien-trung",
  "Huế": "mien-trung",
  "hue": "mien-trung",
  "Đà Nẵng": "mien-trung",
  "da-nang": "mien-trung",
  "Quảng Ngãi": "mien-trung",
  "quang-ngai": "mien-trung",
  "Gia Lai": "mien-trung",
  "gia-lai": "mien-trung",
  "Khánh Hòa": "mien-trung",
  "khanh-hoa": "mien-trung",
  "Lâm Đồng": "mien-trung",
  "lam-dong": "mien-trung",
  "Đắk Lắk": "mien-trung",
  "dak-lak": "mien-trung",

  // Miền Nam
  "TP. Hồ Chí Minh": "mien-nam",
  "tp-ho-chi-minh": "mien-nam",
  "Hồ Chí Minh": "mien-nam",
  "Đồng Nai": "mien-nam",
  "dong-nai": "mien-nam",
  "Tây Ninh": "mien-nam",
  "tay-ninh": "mien-nam",
  "Cần Thơ": "mien-nam",
  "can-tho": "mien-nam",
  "Vĩnh Long": "mien-nam",
  "vinh-long": "mien-nam",
  "Đồng Tháp": "mien-nam",
  "dong-thap": "mien-nam",
  "Cà Mau": "mien-nam",
  "ca-mau": "mien-nam",
  "An Giang": "mien-nam",
  "an-giang": "mien-nam",
};

export function getRegionSlugForProvince(province: string): string {
  if (PROVINCE_TO_REGION[province]) return PROVINCE_TO_REGION[province];
  const lower = province.toLowerCase();
  if (lower.includes("bac")) return "mien-bac";
  if (lower.includes("trung")) return "mien-trung";
  if (lower.includes("nam")) return "mien-nam";
  return "mien-nam";
}

export function RegionTag({
  province,
  regionSlug,
  variant = "text",
  className,
}: {
  province: string;
  regionSlug?: string;
  variant?: "text" | "badge";
  className?: string;
}) {
  const slug = regionSlug || getRegionSlugForProvince(province);
  const tone = regionTone(slug);

  if (variant === "badge") {
    return (
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
          tone.bg,
          tone.text,
          className
        )}
      >
        <MapPin className="size-3 shrink-0" aria-hidden="true" />
        <span>{province}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 text-xs font-medium",
        tone.text,
        className
      )}
    >
      <MapPin className="size-3 shrink-0" aria-hidden="true" />
      <span>{province}</span>
    </span>
  );
}

