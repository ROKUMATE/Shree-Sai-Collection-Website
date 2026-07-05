import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "@/actions/auth";
import { FREE_SHIPPING_ABOVE, STORE_NAME, STORE_TAGLINE } from "@/lib/constants";
import { formatINR } from "@/lib/utils";

export async function Navbar() {
  const session = await getSession();
  const [cartCount, categories] = await Promise.all([
    session ? db.cartItem.count({ where: { userId: session.userId } }) : 0,
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const categoryLinks = [
    ...categories.map((c) => ({ label: c.name, href: `/products?category=${c.slug}` })),
    { label: "All Products", href: "/products" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-ivory-50/95 backdrop-blur">
      <div className="bg-burgundy px-4 py-1.5 text-center text-[11px] uppercase tracking-wider2 text-ivory-100">
        Free shipping above {formatINR(FREE_SHIPPING_ABOVE)} · Cash on delivery available
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="shrink-0">
          <span className="font-serif text-2xl font-semibold tracking-tight">
            {STORE_NAME}
          </span>
          <span className="mt-0.5 hidden text-[10px] uppercase tracking-wider2 text-ink-faint sm:block">
            {STORE_TAGLINE}
          </span>
        </Link>

        <form action="/products" className="hidden flex-1 max-w-sm md:block">
          <input
            type="search"
            name="q"
            placeholder="Search sarees, jewellery, lipsticks…"
            className="input border-ink/15 bg-ivory-200/60 py-2"
          />
        </form>

        <nav className="flex items-center gap-5 text-sm">
          {session ? (
            <>
              {session.role === "ADMIN" && (
                <Link href="/admin" className="hidden text-burgundy hover:underline sm:block">
                  Admin
                </Link>
              )}
              <Link href="/account" className="hidden hover:text-burgundy sm:block">
                Hi, {session.name.split(" ")[0]}
              </Link>
              <Link href="/orders" className="hover:text-burgundy">
                Orders
              </Link>
              <form action={logout}>
                <button className="text-ink-faint hover:text-burgundy">Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-burgundy">
                Sign in
              </Link>
              <Link href="/register" className="hidden hover:text-burgundy sm:block">
                Create account
              </Link>
            </>
          )}
          <Link href="/wishlist" aria-label="Wishlist" className="hover:text-burgundy">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M12 21s-7.5-4.7-9.7-9C.8 8.6 2.4 5 6 5c2.2 0 3.5 1.2 6 3.7C14.5 6.2 15.8 5 18 5c3.6 0 5.2 3.6 3.7 7-2.2 4.3-9.7 9-9.7 9z" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative hover:text-burgundy">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M4 6h2l2.4 10.4a1 1 0 0 0 1 .6h7.9a1 1 0 0 0 1-.7L20.5 9H7" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-semibold text-ivory-50">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>

      <nav className="hairline overflow-x-auto">
        <div className="mx-auto flex max-w-6xl gap-7 px-4">
          {categoryLinks.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="whitespace-nowrap border-b-2 border-transparent py-2.5 text-[13px] uppercase tracking-wider2 text-ink-soft hover:border-burgundy hover:text-burgundy"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
