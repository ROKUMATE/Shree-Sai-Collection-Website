"use client";

import { useTransition } from "react";
import { toggleWishlist } from "@/actions/cart";

export function WishlistButton({
  productId,
  inWishlist,
  path,
}: {
  productId: string;
  inWishlist: boolean;
  path: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleWishlist(productId, path))}
      className={`flex items-center gap-2 text-sm transition-colors ${
        inWishlist ? "text-burgundy" : "text-ink-faint hover:text-burgundy"
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={inWishlist ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path
          d="M12 21s-7.5-4.7-9.7-9C.8 8.6 2.4 5 6 5c2.2 0 3.5 1.2 6 3.7C14.5 6.2 15.8 5 18 5c3.6 0 5.2 3.6 3.7 7-2.2 4.3-9.7 9-9.7 9z"
          strokeLinejoin="round"
        />
      </svg>
      {inWishlist ? "Saved to wishlist" : "Save to wishlist"}
    </button>
  );
}
