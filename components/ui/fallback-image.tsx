"use client";

import type { ImageProps } from "next/image";
import { ResilientImage } from "@/components/ui/resilient-image";

type FallbackImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc: string;
};

export function FallbackImage({
  src,
  fallbackSrc,
  ...props
}: FallbackImageProps) {
  return <ResilientImage {...props} src={src} fallbackSrc={fallbackSrc} />;
}
