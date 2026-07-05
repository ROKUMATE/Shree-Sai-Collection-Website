import type { OrderStatus } from "@prisma/client";
import {
  FREE_SHIPPING_ABOVE,
  ORDER_NUMBER_PREFIX,
  SHIPPING_FEE,
} from "./constants";

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatINR(amount: number) {
  return `₹${inr.format(amount)}`;
}

export function discountPct(mrp: number, price: number) {
  if (mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-");
}

export function newOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${ORDER_NUMBER_PREFIX}-${ymd}-${rand}`;
}

export function shippingFor(subtotal: number) {
  return subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
}

/** Public site URL (server-side only) — used in emails, sitemap and robots. */
export function appUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PLACED: "Order placed",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
