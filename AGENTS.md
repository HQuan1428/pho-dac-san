# Agent guide — Phố Đặc Sản

Read `SPEC.md` first. Everything user-facing is in Vietnamese.

## Stack
Next.js 15 App Router (server components by default), TypeScript, Tailwind v4,
shadcn/ui on Base UI (`src/components/ui`), Prisma 6 + Postgres, Auth.js v5, zod.
Package manager: pnpm.

## Run
```bash
docker compose up -d        # Postgres :5442, Mailpit :1025 (web UI http://localhost:8025)
pnpm db:migrate             # apply migrations
pnpm db:seed                # dev accounts are listed in prisma/seed.ts
pnpm dev
pnpm typecheck && pnpm lint # must pass before you finish
```

## Conventions
- **Design**: follow `/design-token` (`src/app/design-token/page.tsx`). Use semantic tokens
  only (`bg-primary`, `text-muted-foreground`, `border`), never raw colors. Neutral-first,
  one brand color, borders over shadows, `rounded-lg` cards. Mobile first.
- **Layout density (desktop matters)**: wrap page content in the `container-page` utility
  (1280px max, responsive gutters); never `max-w-6xl`/`max-w-2xl` page wrappers except for
  reading-width prose (`max-w-prose`) and auth forms. Product grids: 2 cols mobile, 3 md,
  4 lg, 5 xl (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`, gap 16–24px).
  No `min-h-screen`/huge vertical padding sections; section spacing `py-12 md:py-16`.
  Above-the-fold content must start within 64–96px under the header. Sidebars 240–280px.
- **Components**: reuse `src/components/ui/*` and `src/components/common/*`
  (Price, ProductCard, ShopCard, OrderStatusBadge, RatingStars, RegionTag, QuantityInput,
  EmptyState, PageHeader, StatCard, FormField). Do not edit these shared files; if you need
  a variant, build it inside your own feature folder.
- Base UI uses the `render` prop instead of `asChild`: `<Button render={<Link href="/x" />}>`.
- **Data**: import `db` from `@/lib/db`. Read data in server components; mutate with server
  actions (`"use server"`) validated by zod. Return `{ error }` objects for form errors.
- **Access**: every page and every server action that needs auth calls a guard from
  `@/server/access` (`requireUser`, `requireAdmin`, `requireShop`, `requireShop({ ownerOnly: true })`).
  Always scope queries by the shop/user returned from the guard; never trust ids from the client.
- Money is integer VND; format with `formatVnd` / `<Price>`.
- Slugs via `slugify` from `@/lib/slug`. Email via `sendMail` from `@/lib/mail`.
- Cart is client-side: `cart` and `useCart` from `@/lib/cart`.
- Do not change `prisma/schema.prisma`. If you truly need a schema change, stop and explain why.
- Routes use English paths (see the route map in your task).
- Keep it simple: no new dependencies unless the task allows it.
