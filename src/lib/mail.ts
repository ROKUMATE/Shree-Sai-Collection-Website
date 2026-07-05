import nodemailer from "nodemailer";
import { appUrl, formatINR, ORDER_STATUS_LABEL } from "./utils";
import { BRAND_COLOR, PALETTE, STORE_NAME, STORE_TAGLINE } from "./constants";
import type { Order, OrderItem, OrderStatus } from "@prisma/client";

// Email is optional: when SMTP_HOST is unset every send becomes a logged no-op,
// so the store runs fine without a mail provider.
const configured = Boolean(process.env.SMTP_HOST);

const transport = configured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" }
        : undefined,
    })
  : null;

export function mailConfigured() {
  return configured;
}

async function send(to: string, subject: string, bodyHtml: string) {
  if (!transport) {
    console.log(`[mail skipped — SMTP not configured] to=${to} subject="${subject}"`);
    return;
  }
  await transport.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    html: wrap(bodyHtml),
  });
}

// Minimal branded shell that renders fine in every mail client.
function wrap(inner: string) {
  return `<!doctype html>
<body style="margin:0;background:${PALETTE.ivory[100]};padding:24px;font-family:Georgia,serif;color:${PALETTE.ink.DEFAULT};">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid ${PALETTE.ivory[300]};">
    <div style="background:${BRAND_COLOR};color:${PALETTE.ivory[100]};padding:14px 24px;font-size:20px;letter-spacing:0.04em;">
      ${STORE_NAME}
    </div>
    <div style="padding:24px;font-family:-apple-system,Segoe UI,Arial,sans-serif;font-size:14px;line-height:1.6;">
      ${inner}
    </div>
    <div style="padding:14px 24px;border-top:1px solid ${PALETTE.ivory[300]};font-family:Arial,sans-serif;font-size:11px;color:${PALETTE.ink.faint};">
      ${STORE_TAGLINE} — this email was sent by your ${STORE_NAME} order system.
    </div>
  </div>
</body>`;
}

// ---------- templates ----------

type OrderWithItems = Order & { items: OrderItem[] };

function itemRows(items: OrderItem[]) {
  return items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 0;">${i.name} × ${i.quantity}</td>
          <td style="padding:6px 0;text-align:right;">${formatINR(i.price * i.quantity)}</td>
        </tr>`
    )
    .join("");
}

export async function sendOrderPlacedEmail(to: string, order: OrderWithItems) {
  await send(
    to,
    `Order ${order.orderNumber} confirmed`,
    `<p>Thank you! Your order <strong>${order.orderNumber}</strong> has been placed.</p>
     <table style="width:100%;border-collapse:collapse;">${itemRows(order.items)}
       <tr><td style="padding:10px 0;border-top:1px solid ${PALETTE.ivory[300]};"><strong>Total</strong></td>
           <td style="padding:10px 0;border-top:1px solid ${PALETTE.ivory[300]};text-align:right;"><strong>${formatINR(order.total)}</strong></td></tr>
     </table>
     <p>Payment: ${order.paymentMethod === "COD" ? "Cash on delivery" : "Online (Razorpay)"}</p>
     <p><a href="${appUrl()}/orders/${order.id}" style="color:${BRAND_COLOR};">Track your order →</a></p>`
  );
}

export async function sendOrderStatusEmail(
  to: string,
  order: Order,
  status: OrderStatus,
  location?: string | null,
  note?: string | null
) {
  await send(
    to,
    `Order ${order.orderNumber}: ${ORDER_STATUS_LABEL[status]}`,
    `<p>Your order <strong>${order.orderNumber}</strong> is now:
       <strong>${ORDER_STATUS_LABEL[status]}</strong></p>
     ${location ? `<p>Location: ${location}</p>` : ""}
     ${note ? `<p>${note}</p>` : ""}
     <p><a href="${appUrl()}/orders/${order.id}" style="color:${BRAND_COLOR};">See full tracking →</a></p>`
  );
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await send(
    to,
    `Reset your ${STORE_NAME} password`,
    `<p>We received a request to reset your password.</p>
     <p><a href="${resetUrl}" style="display:inline-block;background:${BRAND_COLOR};color:${PALETTE.ivory[100]};padding:10px 22px;text-decoration:none;">Set a new password</a></p>
     <p>This link is valid for 1 hour. If you didn't request this, you can safely ignore this email.</p>`
  );
}
