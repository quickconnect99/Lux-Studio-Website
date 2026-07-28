"use client";

import Image from "next/image";
import { Check, Plus } from "lucide-react";
import {
  buildFrameItems,
  serializeFrameItem,
  type FrameItem
} from "@/lib/project-images";

export type AvailableProjectFrame = FrameItem & {
  href: string;
  projectTitle: string;
};

export function getFrameKey(frame: FrameItem) {
  return `${frame.image}::${frame.href ?? ""}`;
}

export function hydrateFrameItems(
  entries: string[],
  availableFrames: AvailableProjectFrame[]
) {
  return buildFrameItems({
    selectedFrames: entries,
    fallbackImages: [],
    galleryImages: []
  }).map((frame) => {
    const source =
      availableFrames.find(
        (available) =>
          available.image === frame.image &&
          (!frame.href || available.href === frame.href)
      ) ?? availableFrames.find((available) => available.image === frame.image);

    return {
      ...source,
      ...frame,
      href: frame.href ?? source?.href,
      alt: source?.alt,
      projectTitle: source?.projectTitle
    };
  });
}

export function reorderFrameItems(images: string[], currentItems: FrameItem[]) {
  const remaining = [...currentItems];

  return images.map((image) => {
    const matchIndex = remaining.findIndex((item) => item.image === image);
    const match =
      matchIndex >= 0 ? remaining.splice(matchIndex, 1)[0] : { image };
    return serializeFrameItem(match);
  });
}

export function ProjectFrameLibrary({
  frames,
  selectedItems,
  onToggle,
  emptyCopy
}: {
  frames: AvailableProjectFrame[];
  selectedItems: FrameItem[];
  onToggle: (frame: AvailableProjectFrame) => void;
  emptyCopy: string;
}) {
  if (frames.length === 0) {
    return (
      <p className="mt-5 rounded-[1.25rem] border border-line bg-panel-secondary p-4 text-xs leading-6 text-muted">
        {emptyCopy}
      </p>
    );
  }

  return (
    <div className="mt-7 border-t border-line pt-6">
      <p className="text-[0.62rem] uppercase tracking-eyebrow text-muted">
        Published project image library
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {frames.map((frame) => {
          const selected = selectedItems.some(
            (item) =>
              getFrameKey(item) === getFrameKey(frame) ||
              (!item.href && item.image === frame.image)
          );

          return (
            <button
              key={getFrameKey(frame)}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(frame)}
              className={`group relative overflow-hidden rounded-[1.25rem] border text-left transition-colors ${
                selected
                  ? "bg-accent/10 border-accent"
                  : "border-line bg-panel-secondary hover:border-accent"
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-panel-dark">
                <Image
                  src={frame.image}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 260px, (min-width: 640px) 40vw, 80vw"
                  unoptimized
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span
                  className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur ${
                    selected
                      ? "border-accent bg-accent text-accent-contrast"
                      : "border-white/30 bg-black/35 text-white"
                  }`}
                >
                  {selected ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </span>
              </div>
              <span className="block px-4 py-3 text-[0.62rem] uppercase tracking-meta text-muted">
                {frame.projectTitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
