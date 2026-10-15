# Phố Đặc Sản — product spec (MVP)

Multi-vendor marketplace for Vietnamese regional specialties (đặc sản vùng miền).
Vietnam only, Vietnamese UI, prices in integer VND. No online payment: customers
place orders, the shop calls the customer to confirm.

## Roles
- **Guest**: browse, search, cart, guest checkout (name, phone, address).
- **Customer** (`User.role = USER`): everything a guest can + order history, reviews
  (only on items of COMPLETED orders), wishlist, follow shops, address book.
- **Seller / owner**: any user can open one shop (`Shop.ownerId`). Shop is `PENDING`
  until an admin approves it; only `ACTIVE` shops and their `ACTIVE` products are public.
- **Shop staff** (`ShopMember`): invited by email. Fixed permissions: manage orders and
  edit products. Cannot change shop settings, staff, or vouchers.
- **Admin** (`User.role = ADMIN`): approve/reject/suspend shops, lock users, manage
  categories/regions/provinces, assign plans, platform dashboard.

## Auth
Email + password (Auth.js credentials, JWT session). Email verification and
password reset via emailed tokens (`AuthToken`, store only a SHA-256 hash).
Locked users cannot sign in.

## Orders
- One cart (localStorage) can hold items from many shops; checkout splits it into one
  `Order` per shop, sharing a `checkoutId`.
- Status flow: NEW → CONFIRMED → SHIPPING → COMPLETED; CANCELLED from NEW/CONFIRMED/SHIPPING
  requires a reason. Every change and every call note is an `OrderEvent`.
- New order: in-app `Notification` + email to the shop owner and staff; confirmation
  email to the customer if an email was given.
- Anti-spam: max 5 orders per phone and 10 per IP per hour; Vietnamese phone validation
  (`/^(0|\+84)(3|5|7|8|9)\d{8}$/`); shops can flag a phone as "bom hàng"
  (`CustomerFlag`) and see the flag on later orders.
- Vouchers are per shop (percent or fixed, min order, max discount, date range, usage limit).

## Plans
FREE / PRO / BUSINESS are shown on the landing page and assigned by admins.
Limits are displayed only, not enforced.

## Out of scope
Online payment, OTP/SMS, Zalo/Telegram notifications, cookie banner, i18n.
