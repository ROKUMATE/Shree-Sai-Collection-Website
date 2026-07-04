import type { OrderStatus } from "@prisma/client";

const STYLES: Record<OrderStatus, string> = {
  PLACED: "bg-ivory-200 text-ink-soft",
  CONFIRMED: "bg-brass-pale text-brass",
  PACKED: "bg-brass-pale text-brass",
  SHIPPED: "bg-blue-50 text-blue-800",
  OUT_FOR_DELIVERY: "bg-blue-50 text-blue-800",
  DELIVERED: "bg-green-50 text-green-800",
  CANCELLED: "bg-red-50 text-red-800",
};

export function StatusChip({ status, label }: { status: OrderStatus; label: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider2 ${STYLES[status]}`}
    >
      {label}
    </span>
  );
}
