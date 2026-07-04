import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatINR, formatDateTime, ORDER_STATUS_LABEL, ORDER_STATUS_FLOW } from "@/lib/utils";
import { StatusChip } from "@/components/StatusChip";
import { OrderTimeline } from "@/components/OrderTimeline";
import { updateOrderStatus, markOrderPaid } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      items: true,
      tracking: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  const nextStatuses: string[] = [
    ...ORDER_STATUS_FLOW.slice(ORDER_STATUS_FLOW.indexOf(order.status) + 1),
    ...(order.status !== "CANCELLED" && order.status !== "DELIVERED" ? ["CANCELLED"] : []),
  ];

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-burgundy hover:underline">
        ← All orders
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink-faint">
            {formatDateTime(order.createdAt)} · {order.user.name} ({order.user.email})
          </p>
        </div>
        <StatusChip status={order.status} label={ORDER_STATUS_LABEL[order.status]} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* items */}
          <section className="card p-5">
            <h2 className="font-serif text-lg font-medium">Items</h2>
            <ul className="mt-4 space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className="h-16 w-12 shrink-0 border border-ink/10 object-cover" />
                  <div className="flex-1">
                    <p>{item.name}</p>
                    <p className="text-xs text-ink-faint">
                      {formatINR(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium tabular-nums">{formatINR(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="hairline mt-4 space-y-1.5 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="tabular-nums">{formatINR(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Delivery</dt>
                <dd className="tabular-nums">
                  {order.shippingFee === 0 ? "Free" : formatINR(order.shippingFee)}
                </dd>
              </div>
              <div className="flex justify-between pt-1 font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatINR(order.total)}</dd>
              </div>
            </dl>
          </section>

          {/* tracking history */}
          <section className="card p-5">
            <h2 className="mb-5 font-serif text-lg font-medium">Tracking history</h2>
            <OrderTimeline status={order.status} events={order.tracking} />
          </section>
        </div>

        <div className="space-y-8">
          {/* status update */}
          {nextStatuses.length > 0 && (
            <section className="card p-5">
              <h2 className="font-serif text-lg font-medium">Update status</h2>
              <form action={updateOrderStatus.bind(null, order.id)} className="mt-4 space-y-4">
                <div>
                  <label className="label" htmlFor="status">New status</label>
                  <select id="status" name="status" className="input">
                    {nextStatuses.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_LABEL[s as keyof typeof ORDER_STATUS_LABEL]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="location">Location (optional)</label>
                  <input
                    id="location"
                    name="location"
                    placeholder="e.g. Jaipur sorting facility"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="note">Note (optional)</label>
                  <input
                    id="note"
                    name="note"
                    placeholder="e.g. Handed to Delhivery, AWB 12345"
                    className="input"
                  />
                </div>
                <button className="btn-primary w-full">Update & notify timeline</button>
              </form>
            </section>
          )}

          {/* payment */}
          <section className="card p-5">
            <h2 className="font-serif text-lg font-medium">Payment</h2>
            <p className="mt-3 text-sm text-ink-soft">
              {order.paymentMethod === "COD" ? "Cash on delivery" : "Razorpay (online)"}
            </p>
            <p className="mt-1 text-sm">
              Status:{" "}
              <span className={order.paymentStatus === "PAID" ? "font-medium text-green-700" : "font-medium text-brass"}>
                {order.paymentStatus.toLowerCase()}
              </span>
            </p>
            {order.razorpayPayId && (
              <p className="mt-1 break-all text-xs text-ink-faint">Payment ID: {order.razorpayPayId}</p>
            )}
            {order.paymentStatus !== "PAID" && order.status !== "CANCELLED" && (
              <form action={markOrderPaid.bind(null, order.id)} className="mt-4">
                <button className="btn-outline w-full">Mark as paid</button>
              </form>
            )}
          </section>

          {/* customer */}
          <section className="card p-5">
            <h2 className="font-serif text-lg font-medium">Ship to</h2>
            <address className="mt-3 text-sm not-italic leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">{order.address.fullName}</span>
              <br />
              {order.address.line1}
              {order.address.line2 && (
                <>
                  <br />
                  {order.address.line2}
                </>
              )}
              <br />
              {order.address.city}, {order.address.state} — {order.address.pincode}
              <br />☎ {order.address.phone}
            </address>
          </section>
        </div>
      </div>
    </div>
  );
}
