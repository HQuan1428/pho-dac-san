# Rename Vietnamese URL Route Segments to English Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename all Vietnamese URL route segments to English across Next.js App Router folders and all codebase references, keeping UI text in Vietnamese and dynamic segments intact.

**Architecture:** Next.js 15 App Router directory moves via `git mv`, followed by atomic codebase updates of all path strings, links, redirects, revalidatePath calls, auth configs, emails, and anchor IDs, verified by strict regex grep, TypeScript compiler, ESLint, and Next.js build.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4, Prisma 6, Auth.js v5.

**Spec:** Direct requirements in USER_REQUEST:
- Route mapping:
  - `/cho` -> `/market`
  - `/tim-kiem` -> `/search`
  - `/gio-hang` -> `/cart`
  - `/dat-hang` -> `/checkout`, `/dat-hang/thanh-cong` -> `/checkout/success`
  - `/san-pham/[shopSlug]/[productSlug]` -> `/products/[shopSlug]/[productSlug]`
  - `/gian-hang/[slug]` -> `/shops/[slug]`
  - `/tai-khoan` -> `/account`, `/tai-khoan/don-hang` -> `/account/orders`, `/tai-khoan/don-hang/[code]` -> `/account/orders/[code]`, `/tai-khoan/yeu-thich` -> `/account/wishlist`, `/tai-khoan/dia-chi` -> `/account/addresses`, `/tai-khoan/theo-doi` -> `/account/following`
  - `/thong-bao` -> `/notifications`
  - `/dang-nhap` -> `/login`, `/dang-ky` -> `/register`
  - `/quen-mat-khau` -> `/forgot-password`, `/dat-lai-mat-khau` -> `/reset-password`, `/xac-thuc-email` -> `/verify-email`
  - `/gioi-thieu` -> `/about`, `/lien-he` -> `/contact`, `/nguon-anh` -> `/image-credits`
  - `/chinh-sach/nguoi-ban` -> `/policies/seller`, `/chinh-sach/dieu-khoan` -> `/policies/terms`, `/chinh-sach/bao-mat` -> `/policies/privacy`, `/chinh-sach/doi-tra` -> `/policies/returns`
  - `/kenh-ban` -> `/seller`, `/kenh-ban/dang-ky` -> `/seller/register`, `/kenh-ban/moi-nhan-vien` -> `/seller/invite`
  - `/kenh-ban/don-hang` -> `/seller/orders`, `/kenh-ban/don-hang/[code]` -> `/seller/orders/[code]`, `/kenh-ban/san-pham` -> `/seller/products`, `/kenh-ban/san-pham/[id]` -> `/seller/products/[id]`, `/kenh-ban/san-pham/moi` -> `/seller/products/new`, `/kenh-ban/cai-dat` -> `/seller/settings`, `/kenh-ban/khuyen-mai` -> `/seller/vouchers`, `/kenh-ban/nhan-vien` -> `/seller/staff`
  - `/admin/gian-hang` -> `/admin/shops`, `/admin/nguoi-dung` -> `/admin/users`, `/admin/danh-muc` -> `/admin/categories`, `/admin/vung-mien` -> `/admin/regions`, `/admin/lien-he` -> `/admin/contacts`
  - Anchor `/#bang-gia` -> `/#pricing` and section id `bang-gia` -> `pricing`
- UI text stays in Vietnamese.
- Dynamic segments remain: `[shopSlug]`, `[productSlug]`, `[slug]`, `[code]`, `[id]`.
- Route groups `(site)`, `(auth)`, `(portal)`, `_landing`, `_components`, `api`, `design-token` stay.
- No redirects from old URLs.

## Global Constraints
- Do not touch `public/`.
- Do not edit `docs/brand/` or `docs/research/`.
- Update `AGENTS.md` where routes are mentioned.
- Do not rename DB fields, enums, or UI strings.
- Be careful with substrings: `/cho` must not touch `/chon...` or `/cho-`, `/dang-ky` exists both at `/dang-ky` and `/kenh-ban/dang-ky`, `/san-pham` exists under `/kenh-ban` too.

## Review Focus
1. Accidental substring replacement: Replacing `/cho` in Vietnamese text or paths like `/images/...` or words like `chon` / `cho-duyet`.
2. Auth callbackUrl and query parameters: Ensuring callback URLs, query parameters (e.g. `?callbackUrl=...`, `?token=...`), and `pages.signIn` point to `/login` and `/seller`.
3. Relative path navigation and revalidatePath: Ensuring `revalidatePath` calls in server actions match the new English route paths.
4. Email HTML templates: Ensuring links generated in verification, reset password, and seller invite emails point to `/verify-email`, `/reset-password`, and `/seller/invite`.
5. Anchor links and section IDs: Ensuring `/#bang-gia` and `<section id="bang-gia">` are consistently updated to `/#pricing` and `<section id="pricing">`.

---

### Task 1: Rename Route Folders via `git mv`

**Files:**
- Move: `src/app/(site)/cho` -> `src/app/(site)/market`
- Move: `src/app/(site)/tim-kiem` -> `src/app/(site)/search`
- Move: `src/app/(site)/gio-hang` -> `src/app/(site)/cart`
- Move: `src/app/(site)/dat-hang` -> `src/app/(site)/checkout` (including `thanh-cong` -> `success`)
- Move: `src/app/(site)/san-pham` -> `src/app/(site)/products`
- Move: `src/app/(site)/gian-hang` -> `src/app/(site)/shops`
- Move: `src/app/(site)/tai-khoan` -> `src/app/(site)/account` (including `don-hang` -> `orders`, `yeu-thich` -> `wishlist`, `dia-chi` -> `addresses`, `theo-doi` -> `following`)
- Move: `src/app/(site)/thong-bao` -> `src/app/(site)/notifications`
- Move: `src/app/(site)/(auth)/dang-nhap` -> `src/app/(site)/(auth)/login`
- Move: `src/app/(site)/(auth)/dang-ky` -> `src/app/(site)/(auth)/register`
- Move: `src/app/(site)/(auth)/quen-mat-khau` -> `src/app/(site)/(auth)/forgot-password`
- Move: `src/app/(site)/(auth)/dat-lai-mat-khau` -> `src/app/(site)/(auth)/reset-password`
- Move: `src/app/(site)/(auth)/xac-thuc-email` -> `src/app/(site)/(auth)/verify-email`
- Move: `src/app/(site)/gioi-thieu` -> `src/app/(site)/about`
- Move: `src/app/(site)/lien-he` -> `src/app/(site)/contact`
- Move: `src/app/(site)/nguon-anh` -> `src/app/(site)/image-credits`
- Move: `src/app/(site)/chinh-sach` -> `src/app/(site)/policies` (including `nguoi-ban` -> `seller`, `dieu-khoan` -> `terms`, `bao-mat` -> `privacy`, `doi-tra` -> `returns`)
- Move: `src/app/kenh-ban` -> `src/app/seller` (including `moi-nhan-vien` -> `invite`, `dang-ky` -> `register`, and `(portal)` subfolders: `don-hang` -> `orders`, `san-pham` -> `products`, `cai-dat` -> `settings`, `khuyen-mai` -> `vouchers`, `nhan-vien` -> `staff`, and `products/moi` -> `products/new`)
- Move: `src/app/admin/gian-hang` -> `src/app/admin/shops`
- Move: `src/app/admin/nguoi-dung` -> `src/app/admin/users`
- Move: `src/app/admin/danh-muc` -> `src/app/admin/categories`
- Move: `src/app/admin/vung-mien` -> `src/app/admin/regions`
- Move: `src/app/admin/lien-he` -> `src/app/admin/contacts`

- [ ] **Step 1: Execute `git mv` commands for all route directories**
- [ ] **Step 2: Verify git status confirms clean renames**

---

### Task 2: Update Server Guards, Auth Configuration, and Email Utilities

**Files:**
- Modify: `src/auth.ts`
- Modify: `src/server/access.ts`
- Modify: `src/server/auth-tokens.ts`
- Modify: `src/server/seller/invite.ts`
- Modify: `src/server/seller/staff.ts`
- Modify: `src/server/seller/orders.ts`
- Modify: `src/server/seller/products.ts`
- Modify: `src/server/seller/registration.ts`
- Modify: `src/server/seller/settings.ts`
- Modify: `src/server/seller/vouchers.ts`
- Modify: `src/server/store/catalog.ts`
- Modify: `src/server/store/checkout.ts`

- [ ] **Step 1: Update Auth.js signIn page and access guards in `src/auth.ts` and `src/server/access.ts`**
- [ ] **Step 2: Update email link generation in `src/server/auth-tokens.ts` and `src/server/seller/staff.ts`**
- [ ] **Step 3: Update `revalidatePath` and redirect targets across all `src/server/seller/*` actions**
- [ ] **Step 4: Update paths in `src/server/store/*`**
- [ ] **Step 5: Run TypeScript check on server files**

---

### Task 3: Update Common and Layout Components and Anchors

**Files:**
- Modify: `src/components/layout/site-header.tsx`
- Modify: `src/components/layout/site-footer.tsx`
- Modify: `src/components/layout/cart-button.tsx`
- Modify: `src/app/(site)/_landing/pricing.tsx`
- Modify: `src/app/(site)/_landing/cta-band.tsx`
- Modify: `src/app/(site)/_landing/hero.tsx`
- Modify: `src/components/seller/settings-form.tsx`
- Modify: `src/components/seller/seller-app-shell.tsx`
- Modify: `src/components/seller/seller-nav.tsx`
- Modify: `src/components/seller/product-form.tsx`
- Modify: `src/components/store/cart-view.tsx`
- Modify: `src/components/store/category-tile.tsx`
- Modify: `src/components/store/checkout-view.tsx`
- Modify: `src/components/store/product-purchase-box.tsx`
- Modify: `src/components/store/region-browser.tsx`
- Modify: `src/components/store/search-filters.tsx`

- [ ] **Step 1: Update `site-header.tsx`, `site-footer.tsx`, and `cart-button.tsx`**
- [ ] **Step 2: Update anchor `bang-gia` -> `pricing` in `pricing.tsx`, `site-footer.tsx`, and `settings-form.tsx`**
- [ ] **Step 3: Update store components (`cart-view`, `checkout-view`, `category-tile`, `product-purchase-box`, `region-browser`, `search-filters`)**
- [ ] **Step 4: Update seller components (`seller-app-shell`, `seller-nav`, `product-form`)**
- [ ] **Step 5: Verify components compile without type errors**

---

### Task 4: Update App Route Pages and Route Actions

**Files:**
- Modify: All renamed page and action files in `src/app/(site)/` (`market`, `search`, `cart`, `checkout`, `products`, `shops`, `account`, `notifications`, `auth`, `about`, `contact`, `image-credits`, `policies`)
- Modify: All renamed page and action files in `src/app/seller/`
- Modify: All renamed page and action files in `src/app/admin/`
- Modify: `AGENTS.md` (route guide note)

- [ ] **Step 1: Update path references in `src/app/admin/` (`admin-app-shell`, `admin-nav`, `page`, actions)**
- [ ] **Step 2: Update path references in `src/app/seller/` (portal pages and actions)**
- [ ] **Step 3: Update path references in `src/app/(site)/account/` (nav, actions, pages)**
- [ ] **Step 4: Update path references in `src/app/(site)/auth/` (login, register, reset, verify)**
- [ ] **Step 5: Update path references in remaining `src/app/(site)/` pages (`checkout`, `policies`, `market`, `shops`, `products`, etc.)**
- [ ] **Step 6: Update `AGENTS.md`**

---

### Task 5: Verification and Final Polish

**Files:**
- Verify across: `src/`, `prisma/`, `scripts/`, `docs/`, `SPEC.md`, `AGENTS.md`

- [ ] **Step 1: Run the required grep command and verify 0 hits (or only explained non-path hits)**
- [ ] **Step 2: Run `pnpm typecheck` and ensure clean pass**
- [ ] **Step 3: Run `pnpm lint` and ensure clean pass**
- [ ] **Step 4: Run `pnpm build` and verify all routes render in English**
- [ ] **Step 5: Create git commit `refactor(routes): rename Vietnamese URL segments to English`**
