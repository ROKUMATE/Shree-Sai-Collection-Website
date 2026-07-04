"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { changePassword } from "@/actions/auth";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // state object with no error means the action completed successfully
    if (state && !state.error) {
      setSaved(true);
      formRef.current?.reset();
      const t = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-5 max-w-sm space-y-4">
      <div>
        <label className="label" htmlFor="current">Current password</label>
        <input id="current" name="current" type="password" required autoComplete="current-password" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="new">New password</label>
        <input id="new" name="new" type="password" required minLength={6} autoComplete="new-password" className="input" />
      </div>
      {state?.error && <p className="text-sm text-burgundy">{state.error}</p>}
      {saved && <p className="text-sm text-green-700">Password updated.</p>}
      <button disabled={pending} className="btn-outline">
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
