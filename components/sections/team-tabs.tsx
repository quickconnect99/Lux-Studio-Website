import { ResilientImage as Image } from "@/components/ui/resilient-image";
import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

type TeamTabsProps = {
  members: TeamMember[];
};

export function isPlaceholderTeamImage(source: string) {
  return /^\/images\/demo-car-\d+\.(?:avif|jpe?g|png|webp)$/i.test(
    source.trim()
  );
}

export function TeamTabs({ members }: TeamTabsProps) {
  const visibleMembers = members.filter(
    (member) => member.image.trim() && !isPlaceholderTeamImage(member.image)
  );

  if (visibleMembers.length === 0) return null;

  return (
    <section className="section-shell section-space-tight pt-0">
      <div className="border-y border-line py-8 sm:py-10">
        <div className="mb-8 max-w-3xl">
          <p className="eyebrow mb-4">Team</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none sm:text-6xl">
            People
            <span className="block pl-8 text-accent-text sm:pl-12">
              Behind The Work
            </span>
          </h2>
        </div>

        <div className="space-y-10 sm:space-y-14">
          {visibleMembers.map((member, index) => {
            const isReversed = index % 2 === 1;

            return (
              <article
                key={`${member.name}-${index}`}
                className={cn(
                  "grid gap-6 border-t border-line pt-8 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1fr)] lg:items-center lg:gap-10",
                  isReversed &&
                    "lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]"
                )}
              >
                <div
                  className={cn(
                    "film-frame relative aspect-[4/5] overflow-hidden bg-panel-dark",
                    isReversed && "lg:order-2"
                  )}
                >
                  <Image
                    src={member.image}
                    alt={`${member.name}, ${member.title}`}
                    fill
                    sizes="(min-width: 1024px) 36vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div
                  className={cn(
                    "min-w-0 max-w-2xl space-y-5",
                    isReversed && "lg:justify-self-end"
                  )}
                >
                  <p className="metadata-number">
                    {member.position} / {member.title}
                  </p>
                  <h3 className="break-words font-[family-name:var(--font-display)] text-4xl uppercase leading-[0.9] sm:text-6xl">
                    {member.name}
                  </h3>
                  <p className="text-base leading-8 text-muted sm:text-lg">
                    {member.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
