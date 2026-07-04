"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { register } from "@/actions/auth";

function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);
  const next = useSearchParams().get("next") ?? "/";

  return (
    <form action={action} className="card space-y-5 p-8">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="name">Full name</label>
        <input id="name" name="name" required autoComplete="name" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone (optional)</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
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
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-burgundy underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <p className="eyebrow">Join us</p>
        <h1 className="mt-1 font-serif text-3xl font-medium">Create your account</h1>
      </div>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
