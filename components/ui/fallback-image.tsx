"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type FallbackImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc: string;
};

export function FallbackImage({
  src,
  fallbackSrc,
  alt,
  onError,
  unoptimized,
  ...props
}: FallbackImageProps) {
  const [sourceState, setSourceState] = useState({
    requestedSrc: src,
    currentSrc: src
  });
  if (sourceState.requestedSrc !== src) {
    setSourceState({ requestedSrc: src, currentSrc: src });
  }
  const currentSrc =
    sourceState.requestedSrc === src ? sourceState.currentSrc : src;
  const configuredStorageHost = (() => {
    try {
      return process.env.NEXT_PUBLIC_SUPABASE_URL
        ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
        : null;
    } catch {
      return null;
    }
  })();
  const shouldSkipOptimization = (() => {
    if (unoptimized !== undefined) {
      return unoptimized;
    }

    if (currentSrc.startsWith("/")) {
      return false;
    }

    try {
      return new URL(currentSrc).hostname !== configuredStorageHost;
    } catch {
      return true;
    }
  })();

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized={shouldSkipOptimization}
      onError={(event) => {
        onError?.(event);

        if (currentSrc !== fallbackSrc) {
          setSourceState({
            requestedSrc: src,
            currentSrc: fallbackSrc
          });
        }
      }}
    />
  );
}
