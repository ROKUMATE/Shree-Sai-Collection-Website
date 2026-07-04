import { saveAddress } from "@/actions/checkout";

export function AddressForm({ compact = false }: { compact?: boolean }) {
  return (
    <form action={saveAddress} className={compact ? "space-y-4" : "card space-y-4 p-5"}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="addr-phone">Phone</label>
          <input id="addr-phone" name="phone" type="tel" required className="input" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="line1">Address line 1</label>
        <input id="line1" name="line1" required placeholder="House no., street" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="line2">Address line 2 (optional)</label>
        <input id="line2" name="line2" placeholder="Landmark, area" className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="city">City</label>
          <input id="city" name="city" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="state">State</label>
          <input id="state" name="state" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="pincode">PIN code</label>
          <input id="pincode" name="pincode" required pattern="[0-9]{6}" title="6-digit PIN code" className="input" />
        </div>
      </div>
      <button className="btn-outline">Save address</button>
    </form>
  );
}
