"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <p className="eyebrow">Account recovery</p>
        <h1 className="mt-1 font-serif text-3xl font-medium">Forgot your password?</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Enter your email and we&apos;ll send you a link to set a new one.
        </p>
      </div>
      <form action={action} className="card space-y-5 p-8">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        {state?.error && <p className="text-sm text-burgundy">{state.error}</p>}
        {state?.message && <p className="text-sm text-green-700">{state.message}</p>}
        <button disabled={pending} className="btn-primary w-full">
          {pending ? "Sending…" : "Send reset link"}
        </button>
        <p className="text-center text-sm text-ink-soft">
          Remembered it?{" "}
          <Link href="/login" className="text-burgundy underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
