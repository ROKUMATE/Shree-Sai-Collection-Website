import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updateProduct } from "@/actions/admin";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl font-medium">Edit product</h1>
      <p className="mt-1 text-sm text-ink-faint">/{product.slug}</p>
      <div className="mt-8">
        <ProductForm
          categories={categories}
          action={updateProduct.bind(null, product.id)}
          initial={{
            name: product.name,
            categoryId: product.categoryId,
            price: product.price,
            mrp: product.mrp,
            stock: product.stock,
            fabric: product.fabric,
            description: product.description,
            image: product.image,
            featured: product.featured,
            active: product.active,
          }}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
