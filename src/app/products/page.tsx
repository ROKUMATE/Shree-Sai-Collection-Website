import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

type Search = {
  category?: string;
  q?: string;
  sort?: string;
  max?: string;
};

const SORTS: { key: string; label: string; orderBy: Prisma.ProductOrderByWithRelationInput }[] = [
  { key: "new", label: "Newest first", orderBy: { createdAt: "desc" } },
  { key: "price-asc", label: "Price: low to high", orderBy: { price: "asc" } },
  { key: "price-desc", label: "Price: high to low", orderBy: { price: "desc" } },
];

const PRICE_CAPS = [500, 1000, 2000, 5000];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const sort = SORTS.find((s) => s.key === params.sort) ?? SORTS[0];
  const max = params.max ? Number(params.max) : undefined;

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(params.category ? { category: { slug: params.category } } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            { description: { contains: params.q, mode: "insensitive" } },
            { fabric: { contains: params.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(max ? { price: { lte: max } } : {}),
  };

  const [products, categories] = await Promise.all([
    db.product.findMany({ where, include: { category: true }, orderBy: sort.orderBy }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const activeCategory = categories.find((c) => c.slug === params.category);

  const linkWith = (overrides: Partial<Search>) => {
    const merged = { ...params, ...overrides };
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) qs.set(k, String(v));
    const s = qs.toString();
    return `/products${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="eyebrow">{params.q ? `Search: “${params.q}”` : "Our collection"}</p>
        <h1 className="mt-1 font-serif text-3xl font-medium">
          {activeCategory?.name ?? "All products"}
        </h1>
        {activeCategory?.tagline && (
          <p className="mt-1 text-sm text-ink-soft">{activeCategory.tagline}</p>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
        {/* filters */}
        <aside className="space-y-8 text-sm">
          <div>
            <p className="eyebrow mb-3">Category</p>
            <ul className="space-y-2">
              <li>
                <Link
                  href={linkWith({ category: undefined })}
                  className={!params.category ? "font-medium text-burgundy" : "text-ink-soft hover:text-burgundy"}
                >
                  All
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={linkWith({ category: c.slug })}
                    className={params.category === c.slug ? "font-medium text-burgundy" : "text-ink-soft hover:text-burgundy"}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-3">Price</p>
            <ul className="space-y-2">
              <li>
                <Link
                  href={linkWith({ max: undefined })}
                  className={!max ? "font-medium text-burgundy" : "text-ink-soft hover:text-burgundy"}
                >
                  Any price
                </Link>
              </li>
              {PRICE_CAPS.map((cap) => (
                <li key={cap}>
                  <Link
                    href={linkWith({ max: String(cap) })}
                    className={max === cap ? "font-medium text-burgundy" : "text-ink-soft hover:text-burgundy"}
                  >
                    Under ₹{cap.toLocaleString("en-IN")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* results */}
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-ink-faint">
              {products.length} {products.length === 1 ? "item" : "items"}
            </p>
            <div className="flex gap-4">
              {SORTS.map((s) => (
                <Link
                  key={s.key}
                  href={linkWith({ sort: s.key })}
                  className={
                    sort.key === s.key
                      ? "border-b border-burgundy font-medium text-burgundy"
                      : "text-ink-soft hover:text-burgundy"
                  }
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="card px-6 py-16 text-center">
              <p className="font-serif text-xl">Nothing found</p>
              <p className="mt-2 text-sm text-ink-soft">
                Try a different search or category.
              </p>
              <Link href="/products" className="btn-outline mt-6">
                View everything
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
