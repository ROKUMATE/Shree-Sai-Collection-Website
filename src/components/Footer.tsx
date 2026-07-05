import Link from "next/link";
import { db } from "@/lib/db";
import { STORE_BLURB, STORE_NAME } from "@/lib/constants";

export async function Footer() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <footer className="hairline mt-20 bg-ivory-200/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-serif text-xl font-semibold">{STORE_NAME}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{STORE_BLURB}</p>
        </div>

        <div>
          <p className="eyebrow mb-4">Shop</p>
          <ul className="space-y-2.5 text-sm text-ink-soft">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/products?category=${c.slug}`} className="hover:text-burgundy">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Help</p>
          <ul className="space-y-2.5 text-sm text-ink-soft">
            <li><Link href="/orders" className="hover:text-burgundy">Track your order</Link></li>
            <li><Link href="/account" className="hover:text-burgundy">Your account</Link></li>
            <li>COD & UPI accepted</li>
            <li>7-day easy exchange</li>
          </ul>
        </div>
      </div>
      <div className="hairline py-4 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} {STORE_NAME}. All prices in INR, inclusive of taxes.
      </div>
    </footer>
  );
}
