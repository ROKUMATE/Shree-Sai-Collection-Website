import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Safety net for payments that complete after the customer closes the tab
// before our client-side confirmPayment ran. Configure in the Razorpay
// dashboard: Settings → Webhooks → point at /api/webhooks/razorpay with
// events payment.captured + payment.failed, using RAZORPAY_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id) return NextResponse.json({ received: true });

  const order = await db.order.findFirst({
    where: { razorpayOrderId: payment.order_id },
  });
  if (!order) return NextResponse.json({ received: true });

  if (event.event === "payment.captured" && order.paymentStatus !== "PAID") {
    await db.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID", razorpayPayId: payment.id ?? null },
    });
  } else if (event.event === "payment.failed" && order.paymentStatus === "PENDING") {
    await db.order.update({
      where: { id: order.id },
      data: { paymentStatus: "FAILED" },
    });
  }

  return NextResponse.json({ received: true });
}
