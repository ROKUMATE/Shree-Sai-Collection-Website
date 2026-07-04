import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDate, formatINR } from "@/lib/utils";
import { setUserRole } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const session = await getSession();

  const users = await db.user.findMany({
    include: {
      orders: { where: { status: { not: "CANCELLED" } }, select: { total: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-medium">Customers</h1>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="hairline border-b text-left text-xs uppercase tracking-wider2 text-ink-faint">
              <th className="px-5 py-2.5 font-medium">Name</th>
              <th className="px-3 py-2.5 font-medium">Email</th>
              <th className="px-3 py-2.5 font-medium">Joined</th>
              <th className="px-3 py-2.5 text-right font-medium">Orders</th>
              <th className="px-3 py-2.5 text-right font-medium">Lifetime value</th>
              <th className="px-5 py-2.5 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const lifetime = user.orders.reduce((s, o) => s + o.total, 0);
              const isSelf = user.id === session?.userId;
              return (
                <tr key={user.id} className="hairline border-b last:border-0 hover:bg-ivory-100">
                  <td className="px-5 py-3 font-medium">
                    {user.name}
                    {isSelf && <span className="ml-2 text-xs text-ink-faint">(you)</span>}
                  </td>
                  <td className="px-3 py-3 text-ink-soft">{user.email}</td>
                  <td className="px-3 py-3 text-ink-faint">{formatDate(user.createdAt)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{user.orders.length}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatINR(lifetime)}</td>
                  <td className="px-5 py-3">
                    {isSelf ? (
                      <span className="text-xs uppercase tracking-wider2 text-brass">Admin</span>
                    ) : (
                      <form
                        action={setUserRole.bind(
                          null,
                          user.id,
                          user.role === "ADMIN" ? "CUSTOMER" : "ADMIN"
                        )}
                      >
                        <button
                          className={`px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider2 ${
                            user.role === "ADMIN"
                              ? "bg-brass-pale text-brass"
                              : "bg-ivory-200 text-ink-faint hover:text-burgundy"
                          }`}
                          title={user.role === "ADMIN" ? "Demote to customer" : "Promote to admin"}
                        >
                          {user.role === "ADMIN" ? "Admin ✕" : "Make admin"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
