import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatINR, discountPct, formatDate, FREE_SHIPPING_ABOVE } from "@/lib/utils";
import { AddToCartButton } from "@/components/AddToCartButton";
import { WishlistButton } from "@/components/WishlistButton";
import { Stars } from "@/components/Stars";
import { ProductCard } from "@/components/ProductCard";
import { addReview } from "@/actions/cart";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!product || !product.active) notFound();

  const [related, inWishlist] = await Promise.all([
    db.product.findMany({
      where: { categoryId: product.categoryId, active: true, id: { not: product.id } },
      include: { category: true },
      take: 4,
    }),
    session
      ? db.wishlistItem
          .findUnique({
            where: { userId_productId: { userId: session.userId, productId: product.id } },
          })
          .then(Boolean)
      : false,
  ]);

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;
  const off = discountPct(product.mrp, product.price);
  const myReview = session
    ? product.reviews.find((r) => r.userId === session.userId)
    : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* breadcrumb */}
      <nav className="mb-6 text-xs text-ink-faint">
        <Link href="/" className="hover:text-burgundy">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-burgundy">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-soft">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* image */}
        <div className="card overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.name} className="aspect-3/4 w-full object-cover" />
        </div>

        {/* details */}
        <div>
          <p className="eyebrow">{product.category.name}</p>
          <h1 className="mt-2 font-serif text-3xl font-medium leading-tight">{product.name}</h1>

          {product.reviews.length > 0 && (
            <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
              <Stars rating={avgRating} />
              {avgRating.toFixed(1)} · {product.reviews.length}{" "}
              {product.reviews.length === 1 ? "review" : "reviews"}
            </p>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">{formatINR(product.price)}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-ink-faint line-through">{formatINR(product.mrp)}</span>
                <span className="text-sm font-medium text-burgundy">{off}% off</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-faint">Inclusive of all taxes</p>

          {product.fabric && (
            <p className="mt-5 border-l-2 border-brass pl-3 text-sm text-ink-soft">
              {product.fabric}
            </p>
          )}

          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-8 max-w-md space-y-4">
            <AddToCartButton productId={product.id} stock={product.stock} showQuantity />
            <WishlistButton
              productId={product.id}
              inWishlist={Boolean(inWishlist)}
              path={`/products/${product.slug}`}
            />
          </div>

          <ul className="hairline mt-8 space-y-2.5 pt-6 text-sm text-ink-soft">
            <li>✓ Free delivery on orders above {formatINR(FREE_SHIPPING_ABOVE)}</li>
            <li>✓ Cash on delivery available</li>
            <li>✓ 7-day easy exchange on unused items</li>
            <li>✓ Tracked shipping to your doorstep</li>
          </ul>
        </div>
      </div>

      {/* reviews */}
      <section className="mt-16 max-w-2xl">
        <h2 className="font-serif text-2xl font-medium">Reviews</h2>

        {product.reviews.length === 0 && (
          <p className="mt-3 text-sm text-ink-faint">No reviews yet — be the first.</p>
        )}

        <div className="mt-6 space-y-6">
          {product.reviews.map((r) => (
            <div key={r.id} className="hairline pt-5 first:border-0 first:pt-0">
              <div className="flex items-center gap-3">
                <Stars rating={r.rating} />
                <span className="text-sm font-medium">{r.user.name}</span>
                <span className="text-xs text-ink-faint">{formatDate(r.createdAt)}</span>
              </div>
              {r.comment && <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>}
            </div>
          ))}
        </div>

        {session ? (
          <form
            action={addReview.bind(null, product.id, product.slug)}
            className="card mt-8 space-y-4 p-5"
          >
            <p className="font-serif text-lg">{myReview ? "Update your review" : "Write a review"}</p>
            <div>
              <label className="label" htmlFor="rating">Rating</label>
              <select
                id="rating"
                name="rating"
                defaultValue={myReview?.rating ?? 5}
                className="input max-w-32"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="comment">Comment (optional)</label>
              <textarea
                id="comment"
                name="comment"
                rows={3}
                defaultValue={myReview?.comment ?? ""}
                className="input"
                placeholder="How was the fabric, the colour, the fit?"
              />
            </div>
            <button className="btn-primary">Submit review</button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-ink-soft">
            <Link href={`/login?next=/products/${product.slug}`} className="text-burgundy underline">
              Sign in
            </Link>{" "}
            to write a review.
          </p>
        )}
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-serif text-2xl font-medium">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
