"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/actions/cart";

export function AddToCartButton({
  productId,
  stock,
  showQuantity = false,
}: {
  productId: string;
  stock: number;
  showQuantity?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (stock === 0) {
    return (
      <button disabled className="btn-outline w-full">
        Sold out
      </button>
    );
  }

  const add = (thenCheckout: boolean) =>
    startTransition(async () => {
      await addToCart(productId, quantity);
      if (thenCheckout) {
        router.push("/cart");
      } else {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    });

  return (
    <div className="space-y-3">
      {showQuantity && (
        <div className="flex items-center gap-4">
          <span className="text-[13px] font-medium text-ink-soft">Quantity</span>
          <div className="flex items-center border border-ink/20">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3.5 py-1.5 text-lg leading-none hover:bg-ivory-200"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              className="px-3.5 py-1.5 text-lg leading-none hover:bg-ivory-200"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          {stock <= 5 && (
            <span className="text-xs text-burgundy">Only {stock} left</span>
          )}
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={() => add(false)} disabled={pending} className="btn-primary flex-1">
          {pending ? "Adding…" : added ? "Added ✓" : "Add to cart"}
        </button>
        {showQuantity && (
          <button onClick={() => add(true)} disabled={pending} className="btn-outline flex-1">
            Buy now
          </button>
        )}
      </div>
    </div>
  );
}
