import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { razorpayConfigured } from "@/lib/razorpay";
import { formatINR, shippingFor } from "@/lib/utils";
import { CheckoutForm } from "@/components/CheckoutForm";
import { AddressForm } from "@/components/AddressForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await requireSession("/checkout");

  const [items, addresses] = await Promise.all([
    db.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true },
      orderBy: { id: "asc" },
    }),
    db.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: "desc" }, { id: "desc" }],
    }),
  ]);

  if (items.length === 0) redirect("/cart");

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = shippingFor(subtotal);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-medium">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <CheckoutForm
            addresses={addresses}
            razorpayEnabled={razorpayConfigured()}
          />

          <details className="card p-5" open={addresses.length === 0}>
            <summary className="cursor-pointer font-serif text-lg">
              {addresses.length === 0 ? "Add delivery address" : "Add a new address"}
            </summary>
            <div className="mt-4">
              <AddressForm compact />
            </div>
          </details>
        </div>

        {/* summary */}
        <aside className="card h-fit p-6">
          <h2 className="font-serif text-xl font-medium">Your order</h2>
          <ul className="mt-5 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-16 w-12 shrink-0 border border-ink/10 object-cover"
                />
                <div className="flex-1">
                  <p className="leading-snug">{item.product.name}</p>
                  <p className="mt-0.5 text-ink-faint">Qty {item.quantity}</p>
                </div>
                <p className="font-medium">{formatINR(item.product.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="hairline mt-5 space-y-2.5 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Delivery</dt>
              <dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatINR(subtotal + shipping)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
