"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { placeOrder } from "@/actions/checkout";
import { openRazorpay } from "@/components/RazorpayCheckout";

type AddressLite = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export function CheckoutForm({
  addresses,
  razorpayEnabled,
}: {
  addresses: AddressLite[];
  razorpayEnabled: boolean;
}) {
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [addressId, setAddressId] = useState(defaultAddress?.id ?? "");

  // auto-select when the address list changes — e.g. right after adding the first address
  useEffect(() => {
    if (!addresses.some((a) => a.id === addressId)) {
      setAddressId(defaultAddress?.id ?? "");
    }
  }, [addresses, addressId, defaultAddress?.id]);
  const [method, setMethod] = useState<"COD" | "RAZORPAY">(
    razorpayEnabled ? "RAZORPAY" : "COD"
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = () =>
    startTransition(async () => {
      setError(null);
      if (!addressId) {
        setError("Please select or add a delivery address.");
        return;
      }

      const result = await placeOrder(addressId, method);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (result.payment) {
        const paid = await openRazorpay(result.orderId, result.payment);
        // paid or not, the order exists — unpaid ones can be retried from the order page
        router.push(`/orders/${result.orderId}?placed=1${paid ? "" : "&payment=pending"}`);
      } else {
        router.push(`/orders/${result.orderId}?placed=1`);
      }
    });

  return (
    <div className="space-y-8">
      {/* address selection */}
      <section>
        <h2 className="mb-4 font-serif text-xl font-medium">Delivery address</h2>
        {addresses.length === 0 ? (
          <p className="text-sm text-ink-soft">Add an address below to continue.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <label
                key={a.id}
                className={`card block cursor-pointer p-4 text-sm transition-colors ${
                  addressId === a.id ? "border-burgundy ring-1 ring-burgundy/30" : "hover:border-ink/30"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={addressId === a.id}
                  onChange={() => setAddressId(a.id)}
                  className="sr-only"
                />
                <p className="font-medium">
                  {a.fullName}
                  {a.isDefault && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider2 text-brass">Default</span>
                  )}
                </p>
                <p className="mt-1 text-ink-soft">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                </p>
                <p className="text-ink-soft">
                  {a.city}, {a.state} — {a.pincode}
                </p>
                <p className="mt-1 text-ink-faint">☎ {a.phone}</p>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* payment method */}
      <section>
        <h2 className="mb-4 font-serif text-xl font-medium">Payment</h2>
        <div className="space-y-3">
          {razorpayEnabled && (
            <label
              className={`card flex cursor-pointer items-center gap-3 p-4 text-sm ${
                method === "RAZORPAY" ? "border-burgundy ring-1 ring-burgundy/30" : "hover:border-ink/30"
              }`}
            >
              <input
                type="radio"
                name="method"
                checked={method === "RAZORPAY"}
                onChange={() => setMethod("RAZORPAY")}
              />
              <span>
                <span className="font-medium">Pay online</span>
                <span className="mt-0.5 block text-ink-faint">
                  UPI, cards, netbanking & wallets — secured by Razorpay
                </span>
              </span>
            </label>
          )}
          <label
            className={`card flex cursor-pointer items-center gap-3 p-4 text-sm ${
              method === "COD" ? "border-burgundy ring-1 ring-burgundy/30" : "hover:border-ink/30"
            }`}
          >
            <input
              type="radio"
              name="method"
              checked={method === "COD"}
              onChange={() => setMethod("COD")}
            />
            <span>
              <span className="font-medium">Cash on delivery</span>
              <span className="mt-0.5 block text-ink-faint">Pay in cash or UPI when your order arrives</span>
            </span>
          </label>
        </div>
      </section>

      {error && <p className="text-sm text-burgundy">{error}</p>}

      <button onClick={submit} disabled={pending || !addressId} className="btn-primary w-full">
        {pending
          ? "Placing order…"
          : method === "RAZORPAY"
            ? "Place order & pay"
            : "Place order"}
      </button>
    </div>
  );
}
