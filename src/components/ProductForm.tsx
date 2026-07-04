"use client";

import { useActionState, useState } from "react";
import type { ProductFormState } from "@/actions/admin";

type CategoryOption = { id: string; name: string };

type ProductValues = {
  name: string;
  categoryId: string;
  price: number;
  mrp: number;
  stock: number;
  fabric: string | null;
  description: string;
  image: string;
  featured: boolean;
  active: boolean;
};

export function ProductForm({
  categories,
  action,
  initial,
  submitLabel,
}: {
  categories: CategoryOption[];
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  initial?: ProductValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [imageUrl, setImageUrl] = useState(initial?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = (await res.json()) as { url?: string; error?: string };
      if (res.ok && json.url) setImageUrl(json.url);
      else setUploadError(json.error ?? "Upload failed. Please try again.");
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <form action={formAction} className="grid max-w-4xl gap-8 lg:grid-cols-[1fr_260px]">
      <div className="space-y-5">
        <div>
          <label className="label" htmlFor="name">Product name</label>
          <input id="name" name="name" required defaultValue={initial?.name} className="input" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="categoryId">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={initial?.categoryId ?? categories[0]?.id}
              className="input"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="fabric">Material / details line (optional)</label>
            <input
              id="fabric"
              name="fabric"
              defaultValue={initial?.fabric ?? ""}
              placeholder="e.g. Pure Kanjivaram silk, zari border"
              className="input"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="price">Selling price (₹)</label>
            <input id="price" name="price" type="number" min="1" required defaultValue={initial?.price} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="mrp">MRP (₹)</label>
            <input id="mrp" name="mrp" type="number" min="0" defaultValue={initial?.mrp} className="input" />
            <p className="mt-1 text-xs text-ink-faint">Shown struck-through</p>
          </div>
          <div>
            <label className="label" htmlFor="stock">Stock</label>
            <input id="stock" name="stock" type="number" min="0" required defaultValue={initial?.stock ?? 0} className="input" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            defaultValue={initial?.description}
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="image">Product image</label>
          <div className="flex gap-3">
            <input
              id="image"
              name="image"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/products/my-image.svg or https://…"
              className="input flex-1"
            />
            <label className={`btn-outline shrink-0 cursor-pointer ${uploading ? "opacity-50" : ""}`}>
              {uploading ? "Uploading…" : "Upload photo"}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.avif,.svg"
                onChange={onFileSelected}
                disabled={uploading}
                className="sr-only"
                data-testid="file-input"
              />
            </label>
          </div>
          {uploadError && <p className="mt-1 text-xs text-burgundy">{uploadError}</p>}
          <p className="mt-1 text-xs text-ink-faint">
            Upload a photo (JPG/PNG/WebP, max 5 MB), paste an image URL, or use a built-in swatch from /products/.
          </p>
        </div>

        <div className="flex gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} />
            Visible in store
          </label>
        </div>

        {state?.error && <p className="text-sm text-burgundy">{state.error}</p>}

        <button disabled={pending} className="btn-primary">
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>

      {/* live preview */}
      <aside>
        <p className="label">Image preview</p>
        <div className="card aspect-3/4 overflow-hidden bg-ivory-200">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-faint">
              No image yet
            </div>
          )}
        </div>
      </aside>
    </form>
  );
}
