"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { retryPayment } from "@/actions/checkout";
import { openRazorpay } from "@/components/RazorpayCheckout";

export function RetryPaymentButton({ orderId }: { orderId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const pay = () =>
    startTransition(async () => {
      setError(null);
      const result = await retryPayment(orderId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.payment) {
        const paid = await openRazorpay(result.orderId, result.payment);
        if (paid) router.refresh();
        else setError("Payment was not completed. You can try again.");
      }
    });

  return (
    <div>
      <button onClick={pay} disabled={pending} className="btn-primary">
        {pending ? "Opening payment…" : "Complete payment"}
      </button>
      {error && <p className="mt-2 text-sm text-burgundy">{error}</p>}
    </div>
  );
}
