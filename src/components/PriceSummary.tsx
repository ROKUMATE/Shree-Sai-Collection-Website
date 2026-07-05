import { formatINR } from "@/lib/utils";

/** Subtotal / delivery / total block used in cart, checkout and order pages. */
export function PriceSummary({
  subtotal,
  shipping,
  className = "",
}: {
  subtotal: number;
  shipping: number;
  className?: string;
}) {
  return (
    <dl className={`space-y-2.5 text-sm ${className}`}>
      <div className="flex justify-between">
        <dt className="text-ink-soft">Subtotal</dt>
        <dd className="tabular-nums">{formatINR(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-ink-soft">Delivery</dt>
        <dd className="tabular-nums">
          {shipping === 0 ? <span className="text-green-700">Free</span> : formatINR(shipping)}
        </dd>
      </div>
      <div className="flex justify-between pt-2 text-base font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatINR(subtotal + shipping)}</dd>
      </div>
    </dl>
  );
}
