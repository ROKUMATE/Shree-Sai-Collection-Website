"use client";

// Small helper around the Razorpay checkout popup.
// The script is loaded lazily the first time a payment is started.

import { confirmPayment } from "@/actions/checkout";
import { BRAND_COLOR, RAZORPAY_CHECKOUT_SCRIPT, STORE_NAME } from "@/lib/constants";

export type PaymentDetails = {
  rzpOrderId: string;
  amount: number; // paise
  key: string;
  name: string;
  email: string | undefined;
  contact: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

async function loadScript(): Promise<boolean> {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Opens the Razorpay popup and verifies the payment server-side.
 * Resolves to true when payment completed, false when dismissed/failed.
 */
export async function openRazorpay(
  orderId: string,
  payment: PaymentDetails
): Promise<boolean> {
  const loaded = await loadScript();
  if (!loaded || !window.Razorpay) return false;

  return new Promise((resolve) => {
    const rzp = new window.Razorpay!({
      key: payment.key,
      amount: payment.amount,
      currency: "INR",
      name: STORE_NAME,
      description: "Order payment",
      order_id: payment.rzpOrderId,
      prefill: {
        name: payment.name,
        email: payment.email,
        contact: payment.contact,
      },
      theme: { color: BRAND_COLOR },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        const result = await confirmPayment(
          orderId,
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
        resolve(result.ok);
      },
      modal: { ondismiss: () => resolve(false) },
    });
    rzp.open();
  });
}
