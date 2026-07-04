import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await requireSession("/wishlist");

  const items = await db.wishlistItem.findMany({
    where: { userId: session.userId },
    include: { product: { include: { category: true } } },
    orderBy: { id: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-medium">Your wishlist</h1>

      {items.length === 0 ? (
        <div className="mt-16 max-w-md text-center sm:mx-auto">
          <p className="text-sm text-ink-soft">
            Nothing saved yet. Tap “Save to wishlist” on any product to keep it here.
          </p>
          <Link href="/products" className="btn-primary mt-6">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}
