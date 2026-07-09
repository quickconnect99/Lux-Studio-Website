"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type TeamMember = {
  name: string;
  title: string;
  position: string;
  description: string;
  image: string;
};

type TeamTabsProps = {
  members: TeamMember[];
};

export function TeamTabs({ members }: TeamTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMember = members[activeIndex];

  if (!activeMember) return null;

  return (
    <section className="section-shell section-space-tight pt-0">
      <div className="border-y border-line py-8 sm:py-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow mb-4">Team</p>
            <h2 className="font-[family:var(--font-display)] text-4xl uppercase leading-none sm:text-6xl">
              People
              <span className="block pl-8 text-accent sm:pl-12">
                Behind The Work
              </span>
            </h2>
          </div>

          <div
            className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-panel-secondary p-1"
            role="tablist"
            aria-label="Team members"
          >
            {members.map((member, index) => (
              <button
                key={member.name}
                type="button"
                role="tab"
                aria-selected={activeIndex === index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-xs uppercase tracking-ui transition-colors",
                  activeIndex === index
                    ? "bg-foreground text-background"
                    : "text-muted hover:text-foreground"
                )}
              >
                {member.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="film-frame relative aspect-[4/5] overflow-hidden bg-panel-dark">
            <Image
              src={activeMember.image}
              alt={`${activeMember.name} portrait`}
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="max-w-2xl space-y-5">
            <p className="metadata-number">
              {activeMember.position} / {activeMember.title}
            </p>
            <h3 className="font-[family:var(--font-display)] text-[2.8rem] uppercase leading-[0.9] sm:text-6xl">
              {activeMember.name}
            </h3>
            <p className="text-base leading-8 text-muted sm:text-lg">
              {activeMember.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
