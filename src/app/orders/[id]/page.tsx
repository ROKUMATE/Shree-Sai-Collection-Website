import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatINR, formatDate } from "@/lib/utils";
import { OrderTimeline } from "@/components/OrderTimeline";
import { StatusChip } from "@/components/StatusChip";
import { RetryPaymentButton } from "@/components/RetryPaymentButton";
import { AddressLines } from "@/components/AddressLines";
import { PriceSummary } from "@/components/PriceSummary";
import { cancelOrder } from "@/actions/checkout";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string; payment?: string }>;
}) {
  const [{ id }, query, session] = await Promise.all([
    params,
    searchParams,
    requireSession("/orders"),
  ]);

  const order = await db.order.findFirst({
    where: { id, userId: session.userId },
    include: {
      items: true,
      address: true,
      tracking: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  const canCancel = order.status === "PLACED" || order.status === "CONFIRMED";
  const needsPayment =
    order.paymentMethod === "RAZORPAY" &&
    (order.paymentStatus === "PENDING" || order.paymentStatus === "FAILED") &&
    order.status !== "CANCELLED";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {query.placed && (
        <div className="mb-8 border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <p className="font-medium">Thank you! Your order has been placed.</p>
          {query.payment === "pending" && (
            <p className="mt-1">
              Your payment wasn&apos;t completed — you can finish it below, or the order
              will be treated as unpaid.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Order</p>
          <h1 className="mt-1 font-serif text-2xl font-medium">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink-faint">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <StatusChip status={order.status} />
      </div>

      {/* tracking */}
      <section className="card mt-8 p-6">
        <h2 className="mb-6 font-serif text-xl font-medium">Delivery status</h2>
        <OrderTimeline status={order.status} events={order.tracking} />
      </section>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* items */}
        <section className="card p-6">
          <h2 className="font-serif text-xl font-medium">Items</h2>
          <ul className="mt-4 space-y-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-3 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-14 shrink-0 border border-ink/10 object-cover"
                />
                <div className="flex-1">
                  <p className="leading-snug">{item.name}</p>
                  <p className="mt-1 text-ink-faint">
                    {formatINR(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium">{formatINR(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <PriceSummary
            subtotal={order.subtotal}
            shipping={order.shippingFee}
            className="hairline mt-5 pt-4"
          />
        </section>

        {/* address + payment */}
        <div className="space-y-8">
          <section className="card p-6">
            <h2 className="mb-3 font-serif text-xl font-medium">Delivering to</h2>
            <AddressLines address={order.address} />
          </section>

          <section className="card p-6">
            <h2 className="font-serif text-xl font-medium">Payment</h2>
            <p className="mt-3 text-sm text-ink-soft">
              {order.paymentMethod === "COD" ? "Cash on delivery" : "Paid online (Razorpay)"}
            </p>
            <p className="mt-1 text-sm">
              Status:{" "}
              <span
                className={
                  order.paymentStatus === "PAID"
                    ? "font-medium text-green-700"
                    : order.paymentStatus === "FAILED"
                      ? "font-medium text-red-700"
                      : "font-medium text-brass"
                }
              >
                {order.paymentStatus.charAt(0) + order.paymentStatus.slice(1).toLowerCase()}
              </span>
            </p>
            {needsPayment && (
              <div className="mt-4">
                <RetryPaymentButton orderId={order.id} />
              </div>
            )}
          </section>

          {canCancel && (
            <form action={cancelOrder.bind(null, order.id)}>
              <button className="text-sm text-red-700 underline hover:text-red-900">
                Cancel this order
              </button>
            </form>
          )}
        </div>
      </div>

      <Link href="/orders" className="mt-10 inline-block text-sm text-burgundy hover:underline">
        ← Back to all orders
      </Link>
    </div>
  );
}
