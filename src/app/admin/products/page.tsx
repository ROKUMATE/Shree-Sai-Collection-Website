import Link from "next/link";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { toggleProductActive, deleteProduct, createCategory } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-medium">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + Add product
        </Link>
      </div>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="hairline border-b text-left text-xs uppercase tracking-wider2 text-ink-faint">
              <th className="px-5 py-2.5 font-medium">Product</th>
              <th className="px-3 py-2.5 font-medium">Category</th>
              <th className="px-3 py-2.5 text-right font-medium">Price</th>
              <th className="px-3 py-2.5 text-right font-medium">Stock</th>
              <th className="px-3 py-2.5 font-medium">Visible</th>
              <th className="px-5 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="hairline border-b last:border-0 hover:bg-ivory-100">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt="" className="h-14 w-10 shrink-0 border border-ink/10 object-cover" />
                    <div className="min-w-0">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="block max-w-56 truncate font-medium hover:text-burgundy"
                      >
                        {p.name}
                      </Link>
                      {p.featured && (
                        <span className="text-[10px] uppercase tracking-wider2 text-brass">Featured</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-ink-soft">{p.category.name}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatINR(p.price)}</td>
                <td className={`px-3 py-3 text-right tabular-nums ${p.stock <= 5 ? "font-medium text-red-700" : ""}`}>
                  {p.stock}
                </td>
                <td className="px-3 py-3">
                  <form action={toggleProductActive.bind(null, p.id)}>
                    <button
                      className={`px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider2 ${
                        p.active ? "bg-green-50 text-green-800" : "bg-ivory-200 text-ink-faint"
                      }`}
                    >
                      {p.active ? "Live" : "Hidden"}
                    </button>
                  </form>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/products/${p.id}`} className="text-burgundy hover:underline">
                      Edit
                    </Link>
                    <form action={deleteProduct.bind(null, p.id)}>
                      <button className="text-red-700 hover:underline">Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="card mt-8 p-5">
        <summary className="cursor-pointer font-serif text-lg">Add a category</summary>
        <form action={createCategory} className="mt-4 flex max-w-lg flex-wrap gap-3">
          <input name="name" required placeholder="Category name" className="input flex-1" />
          <input name="tagline" placeholder="Short tagline (optional)" className="input flex-1" />
          <button className="btn-outline">Add</button>
        </form>
      </details>
    </div>
  );
}
