# Tài nguyên & animation cho landing page Phố Đặc Sản

Ngày: 2026-10-16. Phạm vi: `src/app/(site)/page.tsx` + `src/app/(site)/_landing/*`. Không sửa code.
Môi trường: Next.js 15.5.27 (`node_modules/next/package.json`), tw-animate-css 1.4.0 (`node_modules/tw-animate-css/package.json`), đã `@import "tw-animate-css"` tại `src/app/globals.css:2`. `next.config.ts` trống (chưa cấu hình `images`). Font: Inter subset `latin, vietnamese` (`src/app/layout.tsx:6-9`) — đủ dấu tiếng Việt, **không cần mua thêm font**.

## 1. Hiện trạng theo từng section

| Section | Vị trí | Hiện trạng | Thiếu / đề xuất |
|---|---|---|---|
| Hero | `_landing/hero.tsx:10-13`, `:21,28,35,42` | 4 ảnh sản phẩm mini là **SVG placeholder** sinh từ chữ ("Trà Thái", "Mắm Sầm Sơn", "Kẹo dừa", "Mực khô") | 4 ảnh vuông 1:1, ≥400×400, WebP. 3/4 đã có sẵn: `products/che-tan-cuong-1.webp`, `products/mam-tom-sam-son-1.webp`, `products/muc-kho-sam-son-1.webp`. **Thiếu "Kẹo dừa Bến Tre"** → chụp/tìm mới (hoặc đổi item sang `nem-chua-thanh-hoa-1.webp`). |
| Hero | `hero.tsx:194-199` | `<img>` thô + eslint-disable | Đổi sang `next/image` (`sizes` ~ "120px") khi có ảnh thật. |
| Hero | `hero.tsx:105-111` | Avatar social proof chỉ có initials | Tuỳ chọn: 4 ảnh chân dung người bán 1:1, 96×96. Chỉ dùng ảnh người thật có đồng ý; nếu không, giữ initials (trung thực hơn). |
| Hero | `hero.tsx:126-128` | Cột phải = UI mock + blur glow, không có hình ảnh vùng miền | Tuỳ chọn: 1 ảnh/clip nền đặc trưng (đồi chè, chợ quê, phơi mực) phía sau mock — 16:9, 1600×900, AVIF/WebP ≤200KB, hoặc video loop 6–10s (xem §4). Có thể dùng lại `shops/tra-tan-cuong-xanh-banner.webp`. |
| Stats strip | `_landing/stats-strip.tsx:39-47` | Icon lucide — đủ | Không cần asset. Chỉ thêm animation đếm số / fade (§3). |
| Features grid | `_landing/features-grid.tsx:20-135` | 4 bento card, 2 card có mini UI, card 2–3 (`:56-87`) chỉ chữ | Card "Gian hàng riêng biệt" (`:56`): ảnh 4:3, 800×600 — thumbnail trang shop (screenshot thật `/shop/...` hoặc dùng `shops/*-banner.webp` + logo). Card "Sản phẩm có biến thể" (`:73`): ảnh 4:3 một sản phẩm 3 quy cách (hũ 250g / túi 500g / hộp quà) — chụp mới. |
| How it works | `_landing/how-it-works.tsx:41-73` | Icon lucide + đường nối tĩnh | Tuỳ chọn: 3 illustration/screenshot 4:3 (form đăng ký, form đăng sản phẩm, màn hình đơn mới + nút gọi). Ưu tiên **screenshot app thật** (miễn phí, đúng sản phẩm). Đường nối `:43-46` có thể "vẽ" theo scroll. |
| Pricing | `_landing/pricing.tsx` | Không có ảnh — không cần | — |
| Testimonials | `_landing/testimonials.tsx:69-73` | Avatar initials; dữ liệu đánh dấu "mẫu" (`:46-48`) | Không dùng ảnh stock giả làm người bán thật (Pexels cấm ngụ ý endorsement, xem §5). Khi có người bán thật đồng ý: ảnh 1:1 160×160 + ảnh sản phẩm/xưởng của họ. |
| FAQ | `_landing/faq.tsx` | Chỉ chữ — không cần | — |
| CTA band | `_landing/cta-band.tsx:9-17` | Nền xanh + 2 blur glow + icon Store | Tuỳ chọn: pattern SVG hoa sen 3 cánh từ `public/brand/logo-mark-white.svg` lặp mờ (opacity 0.06) — tự làm từ asset có sẵn, 0 KB thêm đáng kể. |
| OG | `page.tsx:22` | `/brand/og-image.png` 1200×630 đã có | Đủ. |

## 2. Ảnh hiện có (`public/images`, `public/images/CREDITS.md`)

- `products/` 10 ảnh (5 sản phẩm × 2), `categories/` 8 ảnh, `shops/` 3 banner + 3 logo; tất cả WebP, 20–245KB.
- Nguồn: Wikimedia Commons. Giấy phép hỗn hợp: CC0/Public Domain, CC BY 2.0/3.0, **CC BY-SA 2.0/3.0/4.0** (`CREDITS.md`).
- Lưu ý licence: CC BY / CC BY-SA **bắt buộc ghi công** (tác giả, link, licence) ở nơi hiển thị hoặc trang credits công khai; BY-SA còn yêu cầu bản chỉnh sửa (crop/nén) phát hành cùng licence (https://creativecommons.org/licenses/by-sa/4.0/). Hiện `CREDITS.md` nằm trong `public/images/` → được serve tại `/images/CREDITS.md`, nhưng nên có trang/footer link "Nguồn ảnh".
- Một số ảnh không đúng vùng miền: `mam-tom-sam-son-1.webp` thực chất là mắm tôm Hồng Kông; `che-bup-thai-nguyen-hop-qua-1.webp` là hộp trà Trung Quốc (theo tên file nguồn trong `CREDITS.md`). Tránh đưa lên hero; dùng `-2` hoặc chụp mới.
- Ảnh tái dùng tốt cho landing (CC0, không cần ghi công): `che-tan-cuong-1`, `muc-kho-sam-son-2`, `shops/tra-tan-cuong-xanh-banner`, `shops/nha-mam-sam-son-banner`, `categories/tra-ca-phe`, `categories/ruou-do-uong`.

## 3. Animation — các lựa chọn

| Lựa chọn | Chi phí bundle | RSC / "use client" | prefers-reduced-motion | Nguồn |
|---|---|---|---|---|
| **tw-animate-css** (đã cài) | 0 JS; CSS ~14.5KB raw (`node_modules/tw-animate-css/dist/tw-animate.css`), Tailwind v4 chỉ sinh class đã dùng | Thuần CSS → dùng thẳng trong Server Component | Không tự xử lý (README không nhắc); dùng variant Tailwind `motion-safe:` / `motion-reduce:` (https://tailwindcss.com/docs/hover-focus-and-other-states#prefers-reduced-motion) | `node_modules/tw-animate-css/README.md` (`animate-in fade-in slide-in-from-bottom delay-150 duration-300`) |
| **CSS scroll-driven animations** (`animation-timeline: view()`) | 0 JS | Thuần CSS → Server Component | Bọc trong `@media (prefers-reduced-motion: no-preference)` | MDN: chưa Baseline (https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline). caniuse: Chrome/Edge 115+, Safari 26+, Firefox 161+, ~87.8% toàn cầu (https://caniuse.com/mdn-css_properties_animation-timeline_view). Phải là progressive enhancement qua `@supports (animation-timeline: view())`. |
| **View Transitions** | 0 JS (API trình duyệt) | Same-document cần `document.startViewTransition()` → client; cross-document dùng `@view-transition` CSS | Tự tắt bằng media query cho `::view-transition-*` | https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API. Dùng cho chuyển trang landing → /cho, **không phải** cho hiệu ứng trong landing. |
| **Motion** (motion.dev) | `motion` component ~43KB gz; `m` + `LazyMotion` ~5KB + `domAnimation` 24KB; `useAnimate` mini 3.3KB | Cần `"use client"` (hook/component chạy client) — tách thành leaf component nhỏ | `<MotionConfig reducedMotion="user">` tắt transform/layout, giữ opacity; `useReducedMotion()` | https://motion.dev/docs/react-reduce-bundle-size, https://motion.dev/docs/react-accessibility |
| **Lottie** (`@lottiefiles/dotlottie-react`) | Thêm runtime player (render canvas) + file `.lottie`; README không nêu số KB | Component client (canvas) → `"use client"` | Tự xử lý (không thấy trong README) | https://github.com/LottieFiles/dotlottie-web/tree/main/packages/react. Chỉ đáng khi có illustration động do designer làm. |

**Khuyến nghị (ít dependency nhất):** tw-animate-css (đã có) + CSS scroll-driven có `@supports` + Tailwind `motion-safe:`. **Không thêm Motion/Lottie** cho đến khi cần tương tác JS thực sự (drag, layout animation, sequence). Nếu sau này cần: Motion `LazyMotion` + `m` trong 1–2 leaf client component.

## 4. Video

- Next.js khuyên `<video>` cho file tự host, `<iframe>` (YouTube/Vimeo) cho nền tảng ngoài; autoplay phải đi kèm `muted` và `playsInline` (iOS); đặt `width/height` hoặc `aspect-ratio` để tránh CLS; dùng `poster`, `preload="none"`, `<track>` phụ đề; fallback text (https://nextjs.org/docs/app/guides/videos).
- Format: MP4 (tương thích) + WebM (tối ưu web), nén bằng FFmpeg (cùng nguồn; codec: https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs). Thứ tự `<source>`: WebM/AV1 trước, MP4 H.264 sau.
- LCP: `<video>` là ứng viên LCP, thời điểm tính = sớm hơn giữa poster load và first frame; ngưỡng tốt ≤2.5s ở p75 (https://web.dev/articles/lcp) → **poster phải nhẹ và tối ưu như ảnh hero**.
- Ngân sách (đề xuất của nghiên cứu này, không phải từ docs): clip nền 6–10s, 1280×720, không audio, ≤1.5MB WebM / ≤2.5MB MP4; ẩn/không autoplay trên `motion-reduce` và mobile (`useReducedMotion` ví dụ "turning off video autoplay", https://motion.dev/docs/react-accessibility — hoặc `<source media>`/CSS).
- Đánh giá: video **không bắt buộc**. Ảnh tĩnh + scroll animation đạt 80% hiệu quả với rủi ro LCP thấp hơn. Nếu làm, đặt ở section "câu chuyện người làm nghề" bên dưới fold, `preload="none"`.

## 5. Nguồn ảnh & next/image

- **Unsplash**: dùng thương mại miễn phí, không bắt buộc ghi công; cấm bán ảnh chưa chỉnh sửa và cấm gom ảnh để làm dịch vụ cạnh tranh (https://unsplash.com/license).
- **Pexels** (ảnh + video): miễn phí, không bắt buộc ghi công; cấm ngụ ý người/thương hiệu trong ảnh endorse sản phẩm, cấm bán bản nguyên, cấm dùng làm trademark (https://www.pexels.com/license/) → **không dùng ảnh người Pexels làm avatar testimonial**, không dùng làm logo shop.
- **Wikimedia Commons**: phù hợp nội dung đặc sản Việt cụ thể; tuân thủ ghi công theo từng licence (§2).
- Tốt nhất: ảnh tự chụp/người bán cung cấp (sản phẩm thật, đúng vùng).
- **next/image** (https://nextjs.org/docs/app/api-reference/components/image):
  - Ảnh above-the-fold: dự án đang ở **Next 15** → dùng `priority`. Từ Next 16 `priority` bị deprecated, thay bằng `preload` / khuyên `loading="eager"` hoặc `fetchPriority="high"`.
  - Luôn khai `sizes` khi dùng `fill` hoặc layout responsive.
  - AVIF phải bật trong config: `images: { formats: ['image/avif', 'image/webp'] }` (hiện `next.config.ts` trống → chỉ WebP mặc định).
  - Import tĩnh (`import x from '@/../public/...'`) cho `placeholder="blur"` tự động.

## 6. Danh sách mua sắm asset (ưu tiên)

| # | Section | Asset | Spec | Nguồn đề xuất | Ưu tiên |
|---|---|---|---|---|---|
| 1 | Hero mini grid (`hero.tsx:21-42`) | Thay 3 placeholder bằng ảnh có sẵn | 1:1, WebP sẵn có | `public/images/products/che-tan-cuong-1`, `mam-tom-sam-son-2`, `muc-kho-sam-son-1` | P0 |
| 2 | Hero mini grid | Ảnh kẹo dừa Bến Tre | 1:1, 800×800, WebP ≤80KB | Tự chụp / Wikimedia Commons (ghi CREDITS) — hoặc đổi sang `nem-chua-thanh-hoa-1` | P0 |
| 3 | Footer/landing | Link "Nguồn ảnh" tới credits | trang/route công khai | Từ `CREDITS.md` (bắt buộc cho CC BY/BY-SA) | P0 |
| 4 | Features card 2 (`features-grid.tsx:56`) | Thumbnail gian hàng | 4:3, 800×600, WebP | Screenshot trang shop thật + `shops/*-banner.webp` | P1 |
| 5 | Features card 3 (`features-grid.tsx:73`) | Sản phẩm 3 quy cách (hũ/túi/hộp quà) | 4:3, 800×600 | Tự chụp với người bán | P1 |
| 6 | How it works (`how-it-works.tsx:48`) | 3 screenshot các bước | 4:3, 1200×900, WebP | Chụp từ app (`/kenh-ban/dang-ky`, form sản phẩm, trang đơn) | P1 |
| 7 | Hero nền | Ảnh vùng miền (đồi chè / chợ / phơi mực) | 16:9, 1600×900, AVIF+WebP ≤200KB | `shops/tra-tan-cuong-xanh-banner.webp` (CC0) hoặc Unsplash/Pexels | P2 |
| 8 | CTA band (`cta-band.tsx:11-12`) | Pattern hoa sen | SVG lặp, opacity ~6% | `public/brand/logo-mark-white.svg` | P2 |
| 9 | Testimonials | Chân dung + ảnh xưởng người bán thật | 1:1 160×160 | Người bán cung cấp có đồng ý | P3 (khi có dữ liệu thật) |
| 10 | Section mới (tuỳ chọn) | Video "người làm nghề" | 16:9, 6–10s, 720p, WebM+MP4 ≤2.5MB, poster WebP | Tự quay / Pexels Video | P3 |

Không cần: font mới (Inter đã có `vietnamese`), bộ icon mới (lucide đủ), Lottie.

## 7. Kế hoạch animation (0 dependency mới)

1. **Hero load-in** (Server Component giữ nguyên): `motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 duration-500` cho cột trái, `delay-150` cho mock bên phải (tw-animate-css README).
2. **Reveal khi cuộn** cho card ở Features/How-it-works/Testimonials: 1 utility CSS trong `globals.css`:
   ```css
   @supports (animation-timeline: view()) {
     @media (prefers-reduced-motion: no-preference) {
       .reveal { animation: reveal linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
     }
   }
   @keyframes reveal { from { opacity: 0; translate: 0 24px; } }
   ```
   Trình duyệt không hỗ trợ → nội dung hiển thị tĩnh (không ẩn).
3. **Đường nối How-it-works** (`how-it-works.tsx:43-46`): `scale-x` từ 0→1 theo `view()` cùng kỹ thuật trên.
4. **Hover**: giữ `transition-colors` hiện có, thêm `hover:-translate-y-0.5` có `motion-safe:`.
5. **Stats đếm số**: bỏ qua (cần JS client; giá trị nhỏ). Thêm khi có nhu cầu bằng một leaf client component + `useReducedMotion`.
6. **Chuyển trang** sang `/cho`: View Transitions cross-document là enhancement sau, không thuộc landing.
