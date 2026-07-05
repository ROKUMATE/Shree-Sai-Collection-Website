"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-2 font-serif text-3xl font-medium">We hit a snag</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Sorry about that — please try again. If it keeps happening, come back in a
        few minutes.
      </p>
      <button onClick={reset} className="btn-primary mt-8">
        Try again
      </button>
    </div>
  );
}
