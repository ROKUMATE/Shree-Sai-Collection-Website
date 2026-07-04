"use client";

import { useActionState } from "react";
import { resetPassword } from "@/actions/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    resetPassword.bind(null, token),
    undefined
  );

  return (
    <form action={action} className="card space-y-5 p-8">
      <div>
        <label className="label" htmlFor="password">New password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="input"
        />
        <p className="mt-1 text-xs text-ink-faint">At least 6 characters</p>
      </div>
      {state?.error && <p className="text-sm text-burgundy">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
