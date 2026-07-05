# Shringar — E-commerce Store · Project Context

> **Read this first.** Everything important about this project lives here: what it is,
> how it's built, how to run it, credentials, and how to deploy it to production.
> Keep this file updated when anything structural changes.

## What this is

A full-featured, production-grade e-commerce website for a family retail business selling
**sarees, dress materials, jewellery and cosmetics** at retail prices. Store brand is
currently **"Shringar"** (easy to rename — see [Renaming the store](#renaming-the-store)).

Everything works end-to-end and is verified by an automated browser test:
customer accounts, catalogue browsing/search/filters, cart, wishlist, reviews,
checkout with **Razorpay (UPI/cards/netbanking) + Cash on Delivery**, order history,
a **delivery tracking timeline** (customer sees every status update with location + note),
and a complete **admin panel** (dashboard KPIs, product CRUD, category management,
order/status management, customer management, role promotion).

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router, standalone output) + React 19 + TypeScript | One deployable app for storefront + admin + API |
| Styling | Tailwind CSS 3.4, custom design system | See [Design system](#design-system) |
| Database | **PostgreSQL 17** via Prisma 6 | Production-grade; runs in Docker locally and in prod |
| Auth | Custom JWT sessions (`jose`) in httpOnly cookies, bcryptjs hashing | No third-party auth dependency |
| Payments | Razorpay (server-created orders + HMAC signature verification) + COD | Indian market: UPI/cards/netbanking |
| Deploy | Docker multi-stage image + docker-compose + Caddy (auto-HTTPS) | One-command deploy on any VPS (AWS/GCP/DigitalOcean/Lightsail/Hetzner) |

**Money is stored as whole rupees (Int)** everywhere. Razorpay amounts are converted to paise
only at the API boundary (`src/lib/razorpay.ts`).

## Running locally (development)

```bash
docker compose -f docker-compose.dev.yml up -d   # start Postgres (or: npm run db:up)
npm install
npx prisma migrate dev                            # apply migrations
npm run db:seed                                   # products + demo users
npm run dev                                       # http://localhost:3000
```

Or production mode locally: `npm run build && npm start`.

### Local logins (from seed)

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@shringar.local` | `admin123` |
| Customer | `priya@example.com` | `priya123` |

Admin panel: **http://localhost:3000/admin**

### Environment (`.env`, not committed)

- `DATABASE_URL` — Postgres connection string (dev compose: `postgresql://shringar:shringar_dev@localhost:5432/shringar`)
- `JWT_SECRET` — session signing secret (generate: `openssl rand -hex 32`)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from Razorpay dashboard.
  **Test keys are currently set in local `.env`.** If left empty, the site
  automatically falls back to COD-only checkout (still fully functional).
  ⚠️ The first set of test keys was accidentally pushed to GitHub (2026-07-04, since
  scrubbed + force-pushed) — **rotate them in the Razorpay dashboard**.
- `RAZORPAY_WEBHOOK_SECRET` — set the same value in Razorpay → Settings → Webhooks
  (URL `https://YOUR_DOMAIN/api/webhooks/razorpay`, events `payment.captured` + `payment.failed`).
- `APP_URL` — public site URL, used for links inside emails.
- `SMTP_HOST/PORT/SECURE/USER/PASS/FROM` — optional; when unset, all emails become logged
  no-ops and the store runs fine without them. Password reset requires SMTP to be configured.
- `UPLOAD_DIR` — where admin-uploaded photos are stored (default `./uploads`; a Docker
  volume in production).
- No `NEXT_PUBLIC_*` vars needed — the Razorpay key id reaches the browser via server action results.

## Deploying to production (VPS on AWS / GCP / DigitalOcean / anywhere)

The repo contains a complete containerized stack: **app + PostgreSQL + Caddy** (automatic
Let's Encrypt HTTPS). Caddy config is `Caddyfile`; stack is `docker-compose.yml`.

1. Get a small VPS (1–2 GB RAM is enough to start). Install Docker (`curl -fsSL https://get.docker.com | sh`).
2. Buy your domain and point an **A record** at the server's IP.
3. Copy the project to the server (git clone or rsync).
4. `cp .env.production.example .env` and fill in **every** value
   (domain, strong DB password, JWT secret, admin email/password, Razorpay **live** keys).
5. `docker compose up -d --build`

That's it. On first start the app container:
- applies all Prisma migrations (`docker-entrypoint.sh`),
- creates the 4 base categories and your admin user from `ADMIN_EMAIL`/`ADMIN_PASSWORD` (`scripts/bootstrap.mjs`, idempotent),
- Caddy fetches HTTPS certificates for your domain automatically.

Then log into `/admin` and add real products/photos. Product images are pasted as URLs
in the admin form (any hosted image, or files dropped into `public/products/`).

**Updates:** `git pull && docker compose up -d --build`
**DB backup:** `docker compose exec db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql`
**Health check:** `GET /api/health` (Docker healthcheck uses it too).
Using a managed load balancer / PaaS instead? Delete the `caddy` service and publish app port 3000.

## Architecture

```
prisma/schema.prisma        # DB models (see below)
prisma/seed.ts              # dev seed: 24 products, 4 categories, 2 users
scripts/generate-images.mjs # regenerates the SVG product swatches (npm run images)
scripts/bootstrap.mjs       # prod-start: categories + admin from env (idempotent)
src/
  middleware.ts             # route protection: /account /orders /checkout /cart /wishlist /admin(+role)
  lib/
    constants.ts            # ⭐ SINGLE SOURCE OF TRUTH: store name/tagline, brand palette
                            #   (Tailwind theme reads it too), shipping rules, page size,
                            #   rate limits, order prefix, Razorpay endpoints.
                            #   Rename the store / change a policy HERE only.
    db.ts                   # Prisma singleton
    auth.ts                 # JWT session create/read/destroy, requireSession/requireAdmin
    razorpay.ts             # order create (REST) + HMAC signature verify
    mail.ts                 # nodemailer wrapper (no-op without SMTP) + email templates
    rate-limit.ts           # in-memory sliding-window limiter (per-IP)
    uploads.ts              # upload dir, allowed types, safe-name rules
    utils.ts                # formatINR, appUrl, order numbers, status labels, shippingFor
  actions/                  # ALL mutations are server actions ("use server")
    auth.ts                 # register/login/logout/profile/password + password reset
    cart.ts                 # cart CRUD, wishlist toggle, reviews
    checkout.ts             # addresses, placeOrder (COD+Razorpay), confirm/retry payment, cancel
    admin.ts                # product/category CRUD, order status+tracking (emails customer), roles
  app/                      # pages (App Router); admin under /admin (guarded in layout too)
    api/health              # liveness + DB check (Docker healthcheck)
    api/webhooks/razorpay   # signature-verified payment webhook (captured/failed), idempotent
    api/admin/upload        # POST multipart image (admin-only, 5MB, jpg/png/webp/avif/svg)
    api/uploads/[name]      # serves uploaded images (immutable cache, SVG-safe CSP)
    forgot-password, reset-password/[token]  # email-based password reset (needs SMTP)
    sitemap.ts, robots.ts   # SEO: generated from DB + APP_URL; admin/api disallowed
    error.tsx               # branded error boundary with retry
  components/               # Navbar, ProductCard, CheckoutForm, OrderTimeline, ProductForm,
                            # StatusChip, AddressLines, PriceSummary (shared blocks), ...
prisma/categories.json      # category list shared by dev seed AND prod bootstrap
```

### Database models (Prisma)

`User` (role CUSTOMER/ADMIN) → `Address[]`, `CartItem[]`, `WishlistItem[]`, `Order[]`, `Review[]`
`Category` → `Product[]` — products have price/mrp (₹), stock, image URL, featured/active flags
`Order` — immutable **snapshots** of name/image/price in `OrderItem` (editing a product never
rewrites history); `status` enum: PLACED → CONFIRMED → PACKED → SHIPPED → OUT_FOR_DELIVERY →
DELIVERED (+ CANCELLED); `TrackingEvent[]` log (status, location, note, timestamp) renders the
customer-facing timeline.

### Key behaviours (decisions already made — don't accidentally undo)

- **Stock** is decremented atomically inside the order transaction (guards against overselling);
  restored on cancellation (by customer while PLACED/CONFIRMED, or by admin anytime).
- **COD** orders auto-flip payment to PAID when marked DELIVERED.
- **Razorpay flow:** order row is created first (paymentStatus PENDING) → gateway order →
  popup → `confirmPayment` verifies the HMAC signature server-side. If the popup is
  abandoned, the order survives and shows a **"Complete payment"** retry button on its page.
- **Cancelling a PAID order** marks payment REFUNDED (do actual refunds in the Razorpay dashboard).
- Products that were ever ordered are **soft-deleted** (deactivated) to preserve order history.
- Cart requires a signed-in user (no guest carts, by design for simplicity).
- Free shipping ≥ ₹999, else flat ₹79 — constants in `src/lib/utils.ts`.
- Login redirects admins to `/admin`, customers to where they came from.
- **Auth rate limits** (per IP, in-memory — move to Redis only if you ever run replicas):
  login 8/10min, register 5/hour, forgot-password 3/15min.
- **Password reset**: single active token per user, sha256-hashed in DB, 1-hour expiry,
  single-use; responses never reveal whether an email exists.
- **Emails** (order placed, status updates, password reset) are fire-and-forget and never
  block or fail a request; without SMTP they just log.
- **Uploads** are admin-only, extension + size validated, served with `nosniff` and a
  restrictive CSP (uploaded SVGs can't run scripts). Files live in the `uploads` Docker
  volume so they survive rebuilds.

## Design system

The UI is deliberately a warm, editorial boutique look — **not** a generic template.
Defined in `tailwind.config.ts` + `src/app/globals.css`:

- Colors: `ivory` (warm off-white backgrounds), `ink` (near-black text + soft/faint),
  `burgundy` (primary actions, #6b1f2e), `brass` (gold accents, #a3762a).
- Type: **Fraunces** (serif — headings, prices) + **Inter** (body) via `next/font`.
- Idiom: hairline borders instead of drop shadows, uppercase letter-spaced eyebrow labels
  (`.eyebrow`), square corners, 3:4 editorial product images.
- Utility classes: `.btn-primary`, `.btn-outline`, `.input`, `.label`, `.card`, `.eyebrow`, `.hairline`.

**Product images** are generated SVG "fabric swatches" (woven saree flat-lays with zari
borders, jewellery on velvet, minimal cosmetic illustrations) in `public/products/` —
regenerate with `npm run images`, palettes are configured per-product inside
`scripts/generate-images.mjs`. Replace with real photography whenever ready (admin form
accepts any image URL).

## Renaming the store

Edit `src/lib/constants.ts` — `STORE_NAME`, `STORE_TAGLINE`, `STORE_DESCRIPTION`,
`STORE_BLURB`, `ORDER_NUMBER_PREFIX`. Every page, email, the Razorpay popup, page
titles and the seed pick it up automatically. Categories live in the admin panel /
`prisma/categories.json`. The only cosmetic leftovers are Docker container names in
the compose files.

## Verification status (last run: 2026-07-05, after constants refactor + pagination/SEO)

- `npm run build` — clean, 27 routes (incl. sitemap.xml, robots.txt).
- Products pagination verified (12/page, filter changes reset to page 1).
- Navbar/footer/home category links & tiles are DB-driven — admin-added categories
  appear automatically; category tiles use each category's best product image.
- Playwright E2E regression: register → add to cart → buy-now → save address → COD checkout →
  order timeline → admin login → dashboard → ship order with location/note → create product →
  customer sees SHIPPED + tracking event → customer blocked from `/admin`. **All 10 steps passed.**
- Backend feature suite — **all 8 checks passed**: webhook rejects bad signatures / marks orders
  PAID on `payment.captured`; upload API rejects unauthenticated + path traversal; admin photo
  upload stores and serves a real file; password-reset link works once and only once; login
  rate limit kicks in after repeated failures.
- Razorpay test keys verified against the live API (order created successfully).
- Docker production image build + boot verified (migrations + bootstrap + healthcheck).

## Known gaps / sensible next steps

- **Rotate the Razorpay test keys** (leaked in the initial git push; old commit may be cached on GitHub).
- Configure SMTP in production to activate order emails + password reset (any provider works).
- Invoice PDF generation; GST fields if the business becomes GST-registered.
- Pagination on admin tables (storefront is done; admin is fine up to a few hundred rows).
- Coupons / discount codes; delivery-partner API integration (Shiprocket/Delhivery) if
  manual tracking updates become tedious.
- Move rate limiting to Redis if the app ever runs more than one container replica.
- Consider S3/Cloudinary for images if the catalogue grows beyond a single-VPS volume.
