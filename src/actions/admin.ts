"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

// ---------- products ----------

export type ProductFormState = { error?: string } | undefined;

function parseProductForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    categoryId: String(formData.get("categoryId") ?? ""),
    price: Math.max(0, Math.round(Number(formData.get("price") ?? 0))),
    mrp: Math.max(0, Math.round(Number(formData.get("mrp") ?? 0))),
    stock: Math.max(0, Math.round(Number(formData.get("stock") ?? 0))),
    fabric: String(formData.get("fabric") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim(),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  };
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const data = parseProductForm(formData);

  if (!data.name || !data.categoryId || !data.description || !data.image || data.price <= 0) {
    return { error: "Name, category, description, image and a price above 0 are required." };
  }
  if (data.mrp < data.price) data.mrp = data.price;

  let slug = slugify(data.name);
  const clash = await db.product.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  await db.product.create({ data: { ...data, slug } });
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function updateProduct(
  productId: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const data = parseProductForm(formData);

  if (!data.name || !data.categoryId || !data.description || !data.image || data.price <= 0) {
    return { error: "Name, category, description, image and a price above 0 are required." };
  }
  if (data.mrp < data.price) data.mrp = data.price;

  await db.product.update({ where: { id: productId }, data });
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function toggleProductActive(productId: string) {
  await requireAdmin();
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return;
  await db.product.update({
    where: { id: productId },
    data: { active: !product.active },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  // products that were ordered stay (order history references them) — deactivate instead
  const ordered = await db.orderItem.count({ where: { productId } });
  if (ordered > 0) {
    await db.product.update({ where: { id: productId }, data: { active: false } });
  } else {
    await db.product.delete({ where: { id: productId } });
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
}

// ---------- categories ----------

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim() || null;
  if (!name) return;

  const slug = slugify(name);
  await db.category.upsert({
    where: { slug },
    update: { tagline },
    create: { name, slug, tagline },
  });
  revalidatePath("/admin/products");
}

// ---------- orders ----------

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await requireAdmin();

  const status = String(formData.get("status") ?? "") as OrderStatus;
  const location = String(formData.get("location") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;

  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.status === status) return;

  await db.$transaction(async (tx) => {
    // restock if an admin cancels
    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
    await tx.order.update({
      where: { id: orderId },
      data: {
        status,
        // COD is collected at the door
        ...(status === "DELIVERED" && order.paymentMethod === "COD"
          ? { paymentStatus: "PAID" as const }
          : {}),
        ...(status === "CANCELLED" && order.paymentStatus === "PAID"
          ? { paymentStatus: "REFUNDED" as const }
          : {}),
        tracking: { create: { status, location, note } },
      },
    });
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
}

export async function markOrderPaid(orderId: string) {
  await requireAdmin();
  await db.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID" },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

// ---------- customers ----------

export async function setUserRole(userId: string, role: "CUSTOMER" | "ADMIN") {
  const session = await requireAdmin();
  if (userId === session.userId) return; // don't demote yourself
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/customers");
}
