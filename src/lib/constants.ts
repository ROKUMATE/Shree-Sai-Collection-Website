// Single source of truth for store identity, branding, and business rules.
// Rename the store or change a policy here — every page, email, payment popup,
// and the Tailwind theme picks it up.
//
// Keep this file dependency-free: it is imported by server code, client
// components, tailwind.config.ts and prisma/seed.ts alike.

// ---------- store identity ----------

export const STORE_NAME = "Shringar";
export const STORE_TAGLINE = "Sarees · Suits · Jewellery · Beauty";
export const STORE_TITLE = `${STORE_NAME} — Sarees, Suits, Jewellery & Beauty`;
export const STORE_DESCRIPTION =
  "Family-run boutique for sarees, dress materials, jewellery and cosmetics at honest retail prices. Cash on delivery available across India.";
export const STORE_BLURB =
  "A family-run boutique bringing sarees, dress materials, jewellery and everyday beauty to your doorstep — at honest retail prices.";

/** Prefix for human-readable order numbers, e.g. SR-20260705-A1B2C. */
export const ORDER_NUMBER_PREFIX = "SR";

// ---------- brand palette (consumed by tailwind.config.ts, emails, Razorpay popup) ----------

export const PALETTE = {
  ivory: { 50: "#fdfcfa", 100: "#faf7f2", 200: "#f3ede3", 300: "#e8dfd0" },
  ink: { DEFAULT: "#211d1a", soft: "#4a443e", faint: "#8a827a" },
  burgundy: { DEFAULT: "#6b1f2e", dark: "#521722", light: "#8a2b3d" },
  brass: { DEFAULT: "#a3762a", light: "#c29645", pale: "#f0e6d2" },
};

export const BRAND_COLOR = PALETTE.burgundy.DEFAULT;

// ---------- business rules ----------

/** Orders at or above this subtotal (₹) ship free. */
export const FREE_SHIPPING_ABOVE = 999;
/** Flat delivery fee (₹) below the free-shipping threshold. */
export const SHIPPING_FEE = 79;

export const PRODUCTS_PER_PAGE = 12;

/** How long a password-reset link stays valid. */
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Per-IP sliding-window limits for the auth endpoints. */
export const RATE_LIMITS = {
  login: { limit: 8, windowMs: 10 * 60 * 1000 },
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  forgotPassword: { limit: 3, windowMs: 15 * 60 * 1000 },
};

// ---------- external service endpoints ----------

export const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";
export const RAZORPAY_CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
