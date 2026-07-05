import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatINR, shippingFor } from "@/lib/utils";
import { FREE_SHIPPING_ABOVE } from "@/lib/constants";
import { setCartQuantity, removeFromCart } from "@/actions/cart";
import { PriceSummary } from "@/components/PriceSummary";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const session = await requireSession("/cart");

  const items = await db.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
    orderBy: { id: "asc" },
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-medium">Your cart is empty</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Fill it with something beautiful.
        </p>
        <Link href="/products" className="btn-primary mt-8">
          Start shopping
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = shippingFor(subtotal);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-medium">Shopping cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card flex gap-4 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.product.image}
                alt={item.product.name}
                className="h-32 w-24 shrink-0 border border-ink/10 object-cover"
              />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-serif text-[15px] leading-snug hover:text-burgundy"
                    >
                      {item.product.name}
                    </Link>
                    {item.product.fabric && (
                      <p className="mt-0.5 text-xs text-ink-faint">{item.product.fabric}</p>
                    )}
                  </div>
                  <p className="font-semibold">{formatINR(item.product.price * item.quantity)}</p>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center border border-ink/20">
                    <form action={setCartQuantity.bind(null, item.id, item.quantity - 1)}>
                      <button className="px-3 py-1 text-lg leading-none hover:bg-ivory-200" aria-label="Decrease">
                        −
                      </button>
                    </form>
                    <span className="w-9 text-center text-sm">{item.quantity}</span>
                    <form action={setCartQuantity.bind(null, item.id, item.quantity + 1)}>
                      <button
                        disabled={item.quantity >= item.product.stock}
                        className="px-3 py-1 text-lg leading-none hover:bg-ivory-200 disabled:opacity-40"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </form>
                  </div>
                  {item.quantity >= item.product.stock && (
                    <span className="text-xs text-burgundy">Max stock reached</span>
                  )}
                  <form action={removeFromCart.bind(null, item.id)}>
                    <button className="text-sm text-ink-faint underline hover:text-burgundy">
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* summary */}
        <aside className="card h-fit p-6">
          <h2 className="mb-5 font-serif text-xl font-medium">Order summary</h2>
          <PriceSummary subtotal={subtotal} shipping={shipping} />
          {shipping > 0 && (
            <p className="mt-2 text-xs text-ink-faint">
              Add {formatINR(FREE_SHIPPING_ABOVE - subtotal)} more for free delivery.
            </p>
          )}
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Proceed to checkout
          </Link>
          <Link href="/products" className="mt-3 block text-center text-sm text-ink-soft hover:text-burgundy">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
