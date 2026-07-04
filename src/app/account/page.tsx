import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { updateProfile } from "@/actions/auth";
import { deleteAddress } from "@/actions/checkout";
import { AddressForm } from "@/components/AddressForm";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireSession("/account");

  const [user, addresses] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId } }),
    db.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: "desc" }, { id: "desc" }],
    }),
  ]);
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="eyebrow">Your account</p>
      <h1 className="mt-1 font-serif text-3xl font-medium">Hello, {user.name.split(" ")[0]}</h1>

      <div className="mt-10 space-y-10">
        {/* profile */}
        <section className="card p-6">
          <h2 className="font-serif text-xl font-medium">Profile</h2>
          <form action={updateProfile} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="name">Full name</label>
                <input id="name" name="name" defaultValue={user.name} required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ""} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input value={user.email} disabled className="input bg-ivory-200 text-ink-faint" />
            </div>
            <button className="btn-outline">Save changes</button>
          </form>
        </section>

        {/* addresses */}
        <section className="card p-6">
          <h2 className="font-serif text-xl font-medium">Saved addresses</h2>
          {addresses.length === 0 ? (
            <p className="mt-3 text-sm text-ink-faint">No addresses saved yet.</p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {addresses.map((a) => (
                <div key={a.id} className="border border-ink/10 p-4 text-sm">
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
                  <form action={deleteAddress.bind(null, a.id)} className="mt-3">
                    <button className="text-xs text-red-700 underline hover:text-red-900">
                      Remove
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
          <details className="mt-5">
            <summary className="cursor-pointer text-sm text-burgundy">Add a new address</summary>
            <div className="mt-4">
              <AddressForm compact />
            </div>
          </details>
        </section>

        {/* password */}
        <section className="card p-6">
          <h2 className="font-serif text-xl font-medium">Change password</h2>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  );
}
