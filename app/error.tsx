"use client";

import { useEffect } from "react";
import { PublicErrorState } from "@/components/ui/public-error-state";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public-page] Render failed", {
      digest: error.digest,
      message: error.message
    });
  }, [error]);

  return <PublicErrorState reset={reset} />;
}
