import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatINR, formatDate, ORDER_STATUS_LABEL } from "@/lib/utils";
import { StatusChip } from "@/components/StatusChip";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await requireSession("/orders");

  const orders = await db.order.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-medium">No orders yet</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Your orders and their delivery status will appear here.
        </p>
        <Link href="/products" className="btn-primary mt-8">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-medium">Your orders</h1>

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="card block p-5 transition-colors hover:border-burgundy/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{order.orderNumber}</p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  Placed {formatDate(order.createdAt)} ·{" "}
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusChip status={order.status} />
                <span className="font-semibold">{formatINR(order.total)}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {order.items.slice(0, 5).map((item) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.id}
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-12 border border-ink/10 object-cover"
                />
              ))}
              {order.items.length > 5 && (
                <span className="flex h-16 w-12 items-center justify-center border border-ink/10 bg-ivory-200 text-xs text-ink-soft">
                  +{order.items.length - 5}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
