import Link from "next/link";
import { db } from "@/lib/db";
import { formatINR, formatDate, ORDER_STATUS_LABEL } from "@/lib/utils";
import { StatusChip } from "@/components/StatusChip";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    revenueAgg,
    ordersToday,
    pendingOrders,
    totalCustomers,
    lowStock,
    recentOrders,
  ] = await Promise.all([
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, paymentStatus: "PAID" },
    }),
    db.order.count({ where: { createdAt: { gte: startOfToday } } }),
    db.order.count({
      where: { status: { in: ["PLACED", "CONFIRMED", "PACKED"] } },
    }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.product.findMany({
      where: { active: true, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 6,
    }),
    db.order.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const tiles = [
    { label: "Collected revenue", value: formatINR(revenueAgg._sum.total ?? 0), sub: "paid orders" },
    { label: "Orders today", value: String(ordersToday), sub: "since midnight" },
    { label: "Awaiting action", value: String(pendingOrders), sub: "placed / confirmed / packed" },
    { label: "Customers", value: String(totalCustomers), sub: "registered accounts" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-medium">Dashboard</h1>

      {/* KPI tiles */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="card p-5">
            <p className="text-[11px] uppercase tracking-wider2 text-ink-faint">{tile.label}</p>
            <p className="mt-2 font-serif text-2xl font-semibold tabular-nums">{tile.value}</p>
            <p className="mt-1 text-xs text-ink-faint">{tile.sub}</p>
          </div>
        ))}
      </div>

      {/* recent orders */}
      <section className="card mt-8 overflow-x-auto">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="font-serif text-xl font-medium">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-burgundy hover:underline">
            All orders →
          </Link>
        </div>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="hairline border-b text-left text-xs uppercase tracking-wider2 text-ink-faint">
              <th className="px-5 py-2.5 font-medium">Order</th>
              <th className="px-3 py-2.5 font-medium">Customer</th>
              <th className="px-3 py-2.5 font-medium">Date</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="hairline border-b last:border-0 hover:bg-ivory-100">
                <td className="px-5 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-burgundy hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-3 py-3">{order.user.name}</td>
                <td className="px-3 py-3 text-ink-faint">{formatDate(order.createdAt)}</td>
                <td className="px-3 py-3">
                  <StatusChip status={order.status} />
                </td>
                <td className="px-5 py-3 text-right font-medium tabular-nums">
                  {formatINR(order.total)}
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-faint">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* low stock */}
      <section className="card mt-8 p-5">
        <h2 className="font-serif text-xl font-medium">Low stock (≤ 5 left)</h2>
        {lowStock.length === 0 ? (
          <p className="mt-3 text-sm text-ink-faint">All products are well stocked.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center gap-3 border border-ink/10 p-3 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" className="h-12 w-9 border border-ink/10 object-cover" />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="block truncate hover:text-burgundy"
                  >
                    {p.name}
                  </Link>
                  <p className={`text-xs ${p.stock === 0 ? "text-red-700" : "text-brass"}`}>
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
