import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 py-10">
      <aside className="hidden w-44 shrink-0 md:block">
        <p className="eyebrow mb-4">Store admin</p>
        <nav className="space-y-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block border-l-2 border-transparent py-1.5 pl-3 text-ink-soft hover:border-burgundy hover:text-burgundy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hairline mt-6 pt-4">
          <Link href="/" className="pl-3 text-sm text-ink-faint hover:text-burgundy">
            ← Back to store
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* mobile nav */}
        <nav className="mb-6 flex gap-4 overflow-x-auto text-sm md:hidden">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap text-burgundy underline">
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
