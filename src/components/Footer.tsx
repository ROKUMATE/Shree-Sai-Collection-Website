import Link from "next/link";

export function Footer() {
  return (
    <footer className="hairline mt-20 bg-ivory-200/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-serif text-xl font-semibold">Shringar</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            A family-run boutique bringing sarees, dress materials, jewellery
            and everyday beauty to your doorstep — at honest retail prices.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-4">Shop</p>
          <ul className="space-y-2.5 text-sm text-ink-soft">
            <li><Link href="/products?category=sarees" className="hover:text-burgundy">Sarees</Link></li>
            <li><Link href="/products?category=dress-material" className="hover:text-burgundy">Dress Material</Link></li>
            <li><Link href="/products?category=jewellery" className="hover:text-burgundy">Jewellery</Link></li>
            <li><Link href="/products?category=cosmetics" className="hover:text-burgundy">Cosmetics</Link></li>
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
        © {new Date().getFullYear()} Shringar. All prices in INR, inclusive of taxes.
      </div>
    </footer>
  );
}
