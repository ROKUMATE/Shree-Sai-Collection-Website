import Link from "next/link";
import type { OrderStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatINR, formatDate, ORDER_STATUS_LABEL } from "@/lib/utils";
import { StatusChip } from "@/components/StatusChip";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string; where: Prisma.OrderWhereInput }[] = [
  { key: "all", label: "All", where: {} },
  { key: "open", label: "Needs action", where: { status: { in: ["PLACED", "CONFIRMED", "PACKED"] } } },
  { key: "shipping", label: "In transit", where: { status: { in: ["SHIPPED", "OUT_FOR_DELIVERY"] } } },
  { key: "delivered", label: "Delivered", where: { status: "DELIVERED" } },
  { key: "cancelled", label: "Cancelled", where: { status: "CANCELLED" } },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];

  const orders = await db.order.findMany({
    where: active.where,
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-medium">Orders</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/orders" : `/admin/orders?filter=${f.key}`}
            className={`px-3.5 py-1.5 text-[13px] ${
              active.key === f.key
                ? "bg-burgundy text-ivory-50"
                : "border border-ink/20 text-ink-soft hover:border-burgundy hover:text-burgundy"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="hairline border-b text-left text-xs uppercase tracking-wider2 text-ink-faint">
              <th className="px-5 py-2.5 font-medium">Order</th>
              <th className="px-3 py-2.5 font-medium">Customer</th>
              <th className="px-3 py-2.5 font-medium">Date</th>
              <th className="px-3 py-2.5 text-right font-medium">Items</th>
              <th className="px-3 py-2.5 font-medium">Payment</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hairline border-b last:border-0 hover:bg-ivory-100">
                <td className="px-5 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-burgundy hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-3 py-3">{order.user.name}</td>
                <td className="px-3 py-3 text-ink-faint">{formatDate(order.createdAt)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{order.items.length}</td>
                <td className="px-3 py-3">
                  <span className={order.paymentStatus === "PAID" ? "text-green-700" : "text-ink-soft"}>
                    {order.paymentMethod === "COD" ? "COD" : "Online"} ·{" "}
                    {order.paymentStatus.toLowerCase()}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <StatusChip
                    status={order.status as OrderStatus}
                    label={ORDER_STATUS_LABEL[order.status]}
                  />
                </td>
                <td className="px-5 py-3 text-right font-medium tabular-nums">{formatINR(order.total)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-ink-faint">
                  No orders in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
