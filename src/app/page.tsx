import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    db.product.findMany({
      where: { featured: true, active: true },
      include: { category: true },
      take: 8,
    }),
    db.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    // each category tile shows its best product image (featured first, then oldest)
    db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        products: {
          where: { active: true },
          orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
          take: 1,
          select: { image: true },
        },
      },
    }),
  ]);

  // hero collage: two featured pieces from different categories for contrast
  const heroPrimary = featured[0];
  const heroSecondary =
    featured.find((p) => p.categoryId !== heroPrimary?.categoryId) ?? featured[1];

  return (
    <div>
      {/* hero */}
      <section className="bg-ivory-200/70">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="eyebrow">Family-run boutique · Honest retail prices</p>
            <h1 className="mt-4 font-serif text-4xl font-medium leading-[1.15] md:text-5xl">
              Draped in tradition,
              <br />
              <em className="text-burgundy">priced for every day.</em>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
              Sarees, dress materials, jewellery and beauty — the pieces we would
              pick for our own family, delivered to your doorstep with cash on
              delivery across India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products?category=sarees" className="btn-primary">
                Shop sarees
              </Link>
              <Link href="/products" className="btn-outline">
                Browse everything
              </Link>
            </div>
          </div>
          {heroPrimary && heroSecondary && (
            <div className="hidden grid-cols-2 gap-4 md:grid">
              {/* eslint-disable @next/next/no-img-element */}
              <img
                src={heroPrimary.image}
                alt={heroPrimary.name}
                className="mt-8 w-full border border-ink/10 object-cover"
              />
              <img
                src={heroSecondary.image}
                alt={heroSecondary.name}
                className="mb-8 w-full border border-ink/10 object-cover"
              />
              {/* eslint-enable @next/next/no-img-element */}
            </div>
          )}
        </div>
      </section>

      {/* categories */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Collections</p>
            <h2 className="mt-1 font-serif text-2xl font-medium md:text-3xl">Shop by category</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories
            .filter((cat) => cat.products.length > 0)
            .map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative block overflow-hidden border border-ink/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.products[0].image}
                  alt={cat.name}
                  className="aspect-3/4 w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-4 pb-4 pt-12">
                  <p className="font-serif text-lg text-ivory-50">{cat.name}</p>
                  {cat.tagline && (
                    <p className="mt-0.5 text-xs text-ivory-200/90">{cat.tagline}</p>
                  )}
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* featured */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Hand-picked</p>
            <h2 className="mt-1 font-serif text-2xl font-medium md:text-3xl">Featured pieces</h2>
          </div>
          <Link href="/products" className="text-sm text-burgundy hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* value props */}
      <section className="mt-14 border-y border-ink/10 bg-ivory-200/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-center sm:grid-cols-2 md:grid-cols-4">
          {[
            ["Honest pricing", "Retail prices, no inflated MRP games"],
            ["Cash on delivery", "Pay at the door, all over India"],
            ["Tracked delivery", "Follow every order to your doorstep"],
            ["7-day exchange", "Easy exchange on unused items"],
          ].map(([title, sub]) => (
            <div key={title}>
              <p className="font-serif text-base font-medium">{title}</p>
              <p className="mt-1 text-[13px] text-ink-soft">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* new arrivals */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8">
          <p className="eyebrow">Just in</p>
          <h2 className="mt-1 font-serif text-2xl font-medium md:text-3xl">New arrivals</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {latest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
