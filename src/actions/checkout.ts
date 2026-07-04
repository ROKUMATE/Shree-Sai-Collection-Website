"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { newOrderNumber, shippingFor } from "@/lib/utils";
import {
  createRazorpayOrder,
  razorpayConfigured,
  verifyRazorpaySignature,
} from "@/lib/razorpay";

// ---------- addresses ----------

export async function saveAddress(formData: FormData) {
  const session = await requireSession("/checkout");

  const data = {
    fullName: String(formData.get("fullName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    line1: String(formData.get("line1") ?? "").trim(),
    line2: String(formData.get("line2") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    pincode: String(formData.get("pincode") ?? "").trim(),
  };
  if (!data.fullName || !data.phone || !data.line1 || !data.city || !data.state || !data.pincode) {
    return;
  }

  const count = await db.address.count({ where: { userId: session.userId } });
  await db.address.create({
    data: { ...data, userId: session.userId, isDefault: count === 0 },
  });
  revalidatePath("/checkout");
  revalidatePath("/account");
}

export async function deleteAddress(addressId: string) {
  const session = await requireSession("/account");
  // keep addresses referenced by past orders — just detach them from the address book
  const used = await db.order.count({ where: { addressId } });
  if (used > 0) return;
  await db.address.deleteMany({ where: { id: addressId, userId: session.userId } });
  revalidatePath("/account");
  revalidatePath("/checkout");
}

// ---------- order placement ----------

export type PlaceOrderResult =
  | { ok: false; error: string }
  | { ok: true; orderId: string; payment: null } // COD — done
  | {
      ok: true;
      orderId: string;
      payment: {
        rzpOrderId: string;
        amount: number; // paise
        key: string;
        name: string;
        email: string | undefined;
        contact: string;
      };
    };

export async function placeOrder(
  addressId: string,
  method: "COD" | "RAZORPAY"
): Promise<PlaceOrderResult> {
  const session = await requireSession("/checkout");

  if (method === "RAZORPAY" && !razorpayConfigured()) {
    return { ok: false, error: "Online payment is not available right now. Please use Cash on Delivery." };
  }

  const address = await db.address.findFirst({
    where: { id: addressId, userId: session.userId },
  });
  if (!address) return { ok: false, error: "Please select a delivery address." };

  const cart = await db.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
  });
  if (cart.length === 0) return { ok: false, error: "Your cart is empty." };

  for (const item of cart) {
    if (!item.product.active || item.product.stock < item.quantity) {
      return {
        ok: false,
        error: `"${item.product.name}" has only ${item.product.stock} left. Please update your cart.`,
      };
    }
  }

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shippingFee = shippingFor(subtotal);
  const total = subtotal + shippingFee;

  // create order + decrement stock + clear cart atomically
  const order = await db.$transaction(async (tx) => {
    for (const item of cart) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) throw new Error(`Out of stock: ${item.product.name}`);
    }

    const created = await tx.order.create({
      data: {
        orderNumber: newOrderNumber(),
        userId: session.userId,
        addressId: address.id,
        paymentMethod: method,
        subtotal,
        shippingFee,
        total,
        items: {
          create: cart.map((i) => ({
            productId: i.productId,
            name: i.product.name,
            image: i.product.image,
            price: i.product.price,
            quantity: i.quantity,
          })),
        },
        tracking: {
          create: { status: "PLACED", note: "Order received" },
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { userId: session.userId } });
    return created;
  });

  revalidatePath("/", "layout");

  if (method === "COD") {
    return { ok: true, orderId: order.id, payment: null };
  }

  // Razorpay: create the gateway order and hand details to the client checkout
  try {
    const rzp = await createRazorpayOrder(total, order.orderNumber);
    await db.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzp.id },
    });
    const user = await db.user.findUnique({ where: { id: session.userId } });
    return {
      ok: true,
      orderId: order.id,
      payment: {
        rzpOrderId: rzp.id,
        amount: rzp.amount,
        key: process.env.RAZORPAY_KEY_ID!,
        name: user?.name ?? "",
        email: user?.email,
        contact: address.phone,
      },
    };
  } catch (e) {
    console.error(e);
    // order stays PENDING — user can retry payment from the order page
    return { ok: true, orderId: order.id, payment: null };
  }
}

/** Called by the client after Razorpay checkout succeeds. */
export async function confirmPayment(
  orderId: string,
  rzpPaymentId: string,
  rzpOrderId: string,
  signature: string
): Promise<{ ok: boolean }> {
  const session = await requireSession("/orders");

  const order = await db.order.findFirst({
    where: { id: orderId, userId: session.userId, razorpayOrderId: rzpOrderId },
  });
  if (!order) return { ok: false };

  if (!verifyRazorpaySignature(rzpOrderId, rzpPaymentId, signature)) {
    await db.order.update({
      where: { id: order.id },
      data: { paymentStatus: "FAILED" },
    });
    return { ok: false };
  }

  await db.order.update({
    where: { id: order.id },
    data: { paymentStatus: "PAID", razorpayPayId: rzpPaymentId },
  });
  revalidatePath(`/orders/${order.id}`);
  return { ok: true };
}

/** Retry payment for an order whose online payment didn't complete. */
export async function retryPayment(orderId: string): Promise<PlaceOrderResult> {
  const session = await requireSession("/orders");

  if (!razorpayConfigured()) {
    return { ok: false, error: "Online payment is not available right now." };
  }

  const order = await db.order.findFirst({
    where: {
      id: orderId,
      userId: session.userId,
      paymentMethod: "RAZORPAY",
      paymentStatus: { in: ["PENDING", "FAILED"] },
      status: { not: "CANCELLED" },
    },
    include: { address: true, user: true },
  });
  if (!order) return { ok: false, error: "This order cannot be paid online." };

  const rzp = await createRazorpayOrder(order.total, order.orderNumber);
  await db.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: rzp.id, paymentStatus: "PENDING" },
  });

  return {
    ok: true,
    orderId: order.id,
    payment: {
      rzpOrderId: rzp.id,
      amount: rzp.amount,
      key: process.env.RAZORPAY_KEY_ID!,
      name: order.user.name,
      email: order.user.email,
      contact: order.address.phone,
    },
  };
}

// ---------- customer order actions ----------

export async function cancelOrder(orderId: string) {
  const session = await requireSession("/orders");

  const order = await db.order.findFirst({
    where: {
      id: orderId,
      userId: session.userId,
      status: { in: ["PLACED", "CONFIRMED"] },
    },
    include: { items: true },
  });
  if (!order) return;

  await db.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : order.paymentStatus,
        tracking: { create: { status: "CANCELLED", note: "Cancelled by customer" } },
      },
    });
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
}

export async function placeOrderAndRedirect(orderId: string) {
  redirect(`/orders/${orderId}?placed=1`);
}
