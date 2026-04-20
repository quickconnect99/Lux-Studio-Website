import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";

export default function NotFound() {
  return (
    <section className="section-shell flex min-h-[70vh] items-center py-20">
      <div className="glass-panel w-full rounded-[2.5rem] p-8 sm:p-12">
        <p className="eyebrow">404</p>
        <h1 className="font-[family:var(--font-display)] mt-6 text-5xl uppercase leading-none sm:text-7xl">
          Frame
          <span className="block pl-8 text-accent sm:pl-14">Missing</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-muted">
          The requested page is not in the portfolio flow. Return to the curated
          work index or jump back to the home page.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <LinkButton href="/work">Browse Work</LinkButton>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-line bg-panel-secondary px-5 py-3 text-xs uppercase tracking-[0.3em] text-foreground hover:border-accent hover:text-accent"
          >
            Go Home
          </Link>
        </div>
      </div>
    </section>
  );
}
