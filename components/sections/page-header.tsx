import {
  SplitHeadline,
  type SplitHeadlineProps
} from "@/components/ui/split-headline";
import { Reveal } from "@/components/ui/reveal";

type PageHeaderProps = Required<
  Pick<SplitHeadlineProps, "eyebrow" | "lead" | "trail">
> &
  Pick<SplitHeadlineProps, "copy"> & {
    copyLabel?: string;
  };

export function PageHeader({
  eyebrow,
  lead,
  trail,
  copy,
  copyLabel
}: PageHeaderProps) {
  return (
    <section className="section-shell pb-7 pt-7 sm:pb-10 sm:pt-20">
      <div className="panel-2xl px-5 py-8 sm:px-10 sm:py-14">
        <Reveal variant="bold">
          <SplitHeadline
            eyebrow={eyebrow}
            lead={lead}
            trail={trail}
            copy={copyLabel ? undefined : copy}
          />
          {copyLabel && copy ? (
            <div className="mt-5 max-w-2xl space-y-3">
              <p className="text-xs uppercase tracking-eyebrow text-muted">
                {copyLabel}
              </p>
              <p className="description-copy text-muted">{copy}</p>
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
