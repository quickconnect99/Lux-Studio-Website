"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function PublicErrorState({
  title = "Something went wrong",
  description = "The page could not be loaded. Please try again in a moment.",
  reset
}: {
  title?: string;
  description?: string;
  reset: () => void;
}) {
  return (
    <main className="section-shell flex min-h-[70dvh] items-center py-16">
      <div className="panel-2xl mx-auto w-full max-w-2xl p-6 text-center sm:p-10">
        <span className="border-error/25 bg-error/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border text-error">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="eyebrow mt-6 justify-center">Temporary interruption</p>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl uppercase leading-none text-foreground sm:text-6xl">
          {title}
        </h1>
        <p className="description-copy mx-auto mt-5 max-w-xl text-muted">
          {description}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="action-button">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <Link href="/" className="control-pill">
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
