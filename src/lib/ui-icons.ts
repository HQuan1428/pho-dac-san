import { ArrowDownWideNarrow, ArrowUpNarrowWide, Clock, Flame, Star, type LucideIcon } from "lucide-react";

// Search/market sort options. Values are the existing `sap-xep` query values.
export const SORT_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "moi-nhat", label: "Mới nhất", icon: Clock },
  { value: "ban-chay", label: "Bán chạy", icon: Flame },
  { value: "danh-gia", label: "Đánh giá cao", icon: Star },
  { value: "gia-tang", label: "Giá tăng dần", icon: ArrowUpNarrowWide },
  { value: "gia-giam", label: "Giá giảm dần", icon: ArrowDownWideNarrow },
];

// Region tone by Region.slug (seeded "mien-bac" / "mien-trung" / "mien-nam"). Use as `bg-x/10 text-x`.
export function regionTone(slug: string): { bg: string; text: string; dot: string } {
  if (slug.includes("bac")) return { bg: "bg-sky/10", text: "text-sky", dot: "bg-sky" };
  if (slug.includes("trung")) return { bg: "bg-turmeric/15", text: "text-turmeric", dot: "bg-turmeric" };
  return { bg: "bg-lotus/10", text: "text-lotus", dot: "bg-lotus" };
}
