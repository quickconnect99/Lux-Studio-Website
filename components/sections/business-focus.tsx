import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import type { ProjectBusiness } from "@/lib/types";

type BusinessFocusCard = {
  business: ProjectBusiness;
  title: string;
  eyebrow: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
};

type BusinessFocusProps = {
  cards: BusinessFocusCard[];
};

export function BusinessFocus({ cards }: BusinessFocusProps) {
  return (
    <section className="section-shell section-space-tight pt-0">
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <Reveal className="space-y-5">
          <p className="eyebrow">Business focus</p>
          <h2 className="font-[family:var(--font-display)] text-4xl uppercase leading-none sm:text-5xl">
            Choose
            <span className="block pl-8 text-accent sm:pl-12">Your Sector</span>
          </h2>
          <p className="max-w-md text-sm leading-7 text-muted sm:text-base">
            Move directly into the work overview with automotive or hospitality
            projects already filtered, so the first click lands in the right
            context.
          </p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card, index) => (
            <Reveal
              key={card.business}
              delay={0.08 + index * 0.05}
              direction={index % 2 === 0 ? "up" : "right"}
            >
              <Link
                href={card.href}
                className="group block overflow-hidden rounded-[2rem] border border-line bg-panel-secondary shadow-card"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={card.imageSrc}
                    alt={card.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="via-black/18 absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="text-white/72 text-[0.62rem] uppercase tracking-[0.28em]">
                      {card.business}
                    </p>
                    <h3 className="font-[family:var(--font-display)] mt-4 text-3xl uppercase leading-none sm:text-4xl">
                      {card.title}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-7 text-white/80">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-line p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <p className="text-[0.72rem] uppercase tracking-[0.16em] text-muted">
                    {card.eyebrow}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-ui text-foreground transition-colors duration-150 group-hover:text-accent">
                    Open {card.business} Work
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
