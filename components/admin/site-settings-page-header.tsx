"use client";

import { InlineText } from "@/components/admin/site-settings-inline-text";

export function SiteSettingsPageHeader({
  eyebrow,
  lead,
  trail,
  copy,
  onEyebrowChange,
  onLeadChange,
  onTrailChange,
  onCopyChange
}: {
  eyebrow: string;
  lead: string;
  trail: string;
  copy: string;
  onEyebrowChange?: (value: string) => void;
  onLeadChange?: (value: string) => void;
  onTrailChange?: (value: string) => void;
  onCopyChange?: (value: string) => void;
}) {
  return (
    <section className="px-6 py-10 sm:px-10 sm:py-14">
      <div className="panel-2xl p-8 sm:p-10">
        {onEyebrowChange ? (
          <InlineText
            value={eyebrow}
            placeholder="Page label"
            ariaLabel="Page label"
            onChange={onEyebrowChange}
            className="w-fit px-2 py-1 text-[0.65rem] uppercase tracking-eyebrow text-muted"
          />
        ) : (
          <p className="text-[0.65rem] uppercase tracking-eyebrow text-muted">
            {eyebrow}
          </p>
        )}
        <div className="mt-5 font-[family-name:var(--font-display)] text-[clamp(3rem,7vw,6rem)] uppercase leading-[0.88] tracking-[-0.04em]">
          {onLeadChange ? (
            <InlineText
              value={lead}
              placeholder="Headline"
              ariaLabel="Page headline lead"
              onChange={onLeadChange}
              className="px-2"
            />
          ) : (
            <div>{lead}</div>
          )}
          {onTrailChange ? (
            <InlineText
              value={trail}
              placeholder="Headline accent"
              ariaLabel="Page headline trail"
              onChange={onTrailChange}
              className="ml-8 mt-1 px-2 text-accent-text"
            />
          ) : (
            <div className="pl-8 text-accent-text">{trail}</div>
          )}
        </div>
        {onCopyChange ? (
          <InlineText
            value={copy}
            placeholder="Page introduction"
            ariaLabel="Page introduction"
            multiline
            onChange={onCopyChange}
            className="mt-6 max-w-2xl p-2 text-base leading-8 text-muted"
          />
        ) : (
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
            {copy}
          </p>
        )}
      </div>
    </section>
  );
}
