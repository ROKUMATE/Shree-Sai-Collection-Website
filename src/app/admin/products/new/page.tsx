import { db } from "@/lib/db";
import { createProduct } from "@/actions/admin";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-serif text-3xl font-medium">Add product</h1>
      <div className="mt-8">
        <ProductForm
          categories={categories}
          action={createProduct}
          submitLabel="Create product"
        />
      </div>
    </div>
  );
}
