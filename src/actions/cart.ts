"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function addToCart(productId: string, quantity = 1) {
  const session = await requireSession("/cart");

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || !product.active || product.stock < 1) return;

  await db.cartItem.upsert({
    where: { userId_productId: { userId: session.userId, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId: session.userId, productId, quantity },
  });

  revalidatePath("/", "layout");
}

export async function setCartQuantity(cartItemId: string, quantity: number) {
  const session = await requireSession("/cart");

  if (quantity < 1) {
    await db.cartItem.deleteMany({ where: { id: cartItemId, userId: session.userId } });
  } else {
    const item = await db.cartItem.findFirst({
      where: { id: cartItemId, userId: session.userId },
      include: { product: true },
    });
    if (!item) return;
    await db.cartItem.update({
      where: { id: item.id },
      data: { quantity: Math.min(quantity, item.product.stock) },
    });
  }
  revalidatePath("/", "layout");
}

export async function removeFromCart(cartItemId: string) {
  const session = await requireSession("/cart");
  await db.cartItem.deleteMany({ where: { id: cartItemId, userId: session.userId } });
  revalidatePath("/", "layout");
}

export async function toggleWishlist(productId: string, path: string) {
  const session = await requireSession(path);

  const existing = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.userId, productId } },
  });
  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await db.wishlistItem.create({ data: { userId: session.userId, productId } });
  }
  revalidatePath(path);
  revalidatePath("/wishlist");
}

export async function addReview(productId: string, slug: string, formData: FormData) {
  const session = await requireSession(`/products/${slug}`);

  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") ?? 5)));
  const comment = String(formData.get("comment") ?? "").trim();

  await db.review.upsert({
    where: { userId_productId: { userId: session.userId, productId } },
    update: { rating, comment: comment || null },
    create: { userId: session.userId, productId, rating, comment: comment || null },
  });
  revalidatePath(`/products/${slug}`);
}
