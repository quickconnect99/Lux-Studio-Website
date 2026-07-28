"use client";

import { PublicErrorState } from "@/components/ui/public-error-state";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <PublicErrorState
          title="The site is temporarily unavailable"
          description="We could not load the global site content. Please retry shortly."
          reset={reset}
        />
      </body>
    </html>
  );
}
