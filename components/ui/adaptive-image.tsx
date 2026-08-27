import Image, { type ImageProps } from "next/image";
import { ResilientImage } from "@/components/ui/resilient-image";
import { isRemoteMediaSource } from "@/lib/media-url";

type AdaptiveImageProps = ImageProps & {
  fallbackSrc?: ImageProps["src"];
};

function getSourceKey(source: ImageProps["src"]) {
  if (typeof source === "string") {
    return source;
  }

  return "src" in source ? source.src : source.default.src;
}

/**
 * Renders default/repository images as a plain server-rendered `next/image`
 * and only reaches for the client-side retry machinery in `ResilientImage`
 * when the source is a genuinely external URL that can actually fail
 * independently of the build (e.g. a Supabase Storage object).
 *
 * Safe to use from a Server Component: this component itself has no
 * `"use client"` directive, so the local-image branch never pulls in the
 * client bundle. Only the remote branch mounts a client island.
 */
export function AdaptiveImage({
  src,
  alt,
  fallbackSrc,
  ...props
}: AdaptiveImageProps) {
  if (isRemoteMediaSource(getSourceKey(src))) {
    return (
      <ResilientImage
        src={src}
        alt={alt}
        fallbackSrc={fallbackSrc}
        {...props}
      />
    );
  }

  return <Image src={src} alt={alt} {...props} />;
}
