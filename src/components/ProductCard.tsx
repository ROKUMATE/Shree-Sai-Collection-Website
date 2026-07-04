import Link from "next/link";
import { formatINR, discountPct } from "@/lib/utils";

type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    image: string;
    price: number;
    mrp: number;
    stock: number;
    fabric?: string | null;
    category?: { name: string };
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const off = discountPct(product.mrp, product.price);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="card group block overflow-hidden transition-colors hover:border-burgundy/40"
    >
      <div className="relative aspect-3/4 overflow-hidden bg-ivory-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.stock === 0 && (
          <span className="absolute left-0 top-3 bg-ink px-3 py-1 text-[10px] uppercase tracking-wider2 text-ivory-50">
            Sold out
          </span>
        )}
        {product.stock > 0 && off >= 25 && (
          <span className="absolute left-0 top-3 bg-burgundy px-3 py-1 text-[10px] uppercase tracking-wider2 text-ivory-50">
            {off}% off
          </span>
        )}
      </div>
      <div className="px-4 py-3.5">
        {product.category && <p className="eyebrow">{product.category.name}</p>}
        <h3 className="mt-1 truncate font-serif text-[15px] leading-snug text-ink group-hover:text-burgundy">
          {product.name}
        </h3>
        {product.fabric && (
          <p className="mt-0.5 truncate text-xs text-ink-faint">{product.fabric}</p>
        )}
        <p className="mt-2 text-sm">
          <span className="font-semibold">{formatINR(product.price)}</span>
          {product.mrp > product.price && (
            <span className="ml-2 text-ink-faint line-through">{formatINR(product.mrp)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
