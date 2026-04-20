import {
  SplitHeadline,
  type SplitHeadlineProps
} from "@/components/ui/split-headline";
import { Reveal } from "@/components/ui/reveal";

type PageHeaderProps = Required<Pick<SplitHeadlineProps, "eyebrow" | "lead" | "trail">> &
  Pick<SplitHeadlineProps, "copy">;

export function PageHeader({ eyebrow, lead, trail, copy }: PageHeaderProps) {
  return (
    <section className="section-shell pb-10 pt-14 sm:pt-20">
      <div className="panel-2xl px-6 py-10 sm:px-10 sm:py-14">
        <Reveal variant="bold">
          <SplitHeadline
            eyebrow={eyebrow}
            lead={lead}
            trail={trail}
            copy={copy}
          />
        </Reveal>
      </div>
    </section>
  );
}
