"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ImageDeliveryMode = "optimized" | "direct" | "fallback";

type ResilientImageProps = ImageProps & {
  /**
   * Optional final source when both the optimized and direct versions fail.
   * The fallback is always loaded directly so an unavailable optimizer cannot
   * block it as well.
   */
  fallbackSrc?: ImageProps["src"];
};

function getImageSourceKey(source: ImageProps["src"]) {
  if (typeof source === "string") {
    return source;
  }

  if ("src" in source) {
    return source.src;
  }

  return source.default.src;
}

function getInitialDeliveryMode(unoptimized: boolean | undefined) {
  return unoptimized ? "direct" : "optimized";
}

/**
 * Uses the Next.js image optimizer first, then retries the original source
 * directly if the optimizer rejects or cannot transform it.
 *
 * Vercel can return an error from `/_next/image` while the underlying Supabase
 * object remains healthy. Retrying with `unoptimized` changes the browser URL
 * from the optimizer endpoint to the original asset without changing layout,
 * alt text, priority, or responsive sizing. A true source failure can then
 * fall through to `fallbackSrc`.
 */
export function ResilientImage({
  src,
  alt,
  fallbackSrc,
  unoptimized,
  onError,
  ...props
}: ResilientImageProps) {
  const sourceKey = getImageSourceKey(src);
  const fallbackKey = fallbackSrc ? getImageSourceKey(fallbackSrc) : null;
  const [delivery, setDelivery] = useState<{
    sourceKey: string;
    mode: ImageDeliveryMode;
  }>(() => ({
    sourceKey,
    mode: getInitialDeliveryMode(unoptimized)
  }));

  const mode =
    delivery.sourceKey === sourceKey
      ? delivery.mode
      : getInitialDeliveryMode(unoptimized);
  const currentSource =
    mode === "fallback" && fallbackSrc !== undefined ? fallbackSrc : src;
  const shouldLoadDirectly = mode !== "optimized" || Boolean(unoptimized);

  return (
    <Image
      {...props}
      src={currentSource}
      alt={alt}
      unoptimized={shouldLoadDirectly}
      data-image-delivery={mode}
      onError={(event) => {
        if (mode === "optimized") {
          setDelivery({ sourceKey, mode: "direct" });
          return;
        }

        if (
          mode === "direct" &&
          fallbackSrc !== undefined &&
          fallbackKey !== sourceKey
        ) {
          setDelivery({ sourceKey, mode: "fallback" });
          return;
        }

        onError?.(event);
      }}
    />
  );
}
