export function dedupeImageUrls(images: string[]) {
  const seen = new Set<string>();

  return images
    .map((image) => image.trim())
    .filter((image) => {
      if (!image || seen.has(image)) {
        return false;
      }

      seen.add(image);
      return true;
    });
}

export function normalizeProjectGallery({
  coverImage,
  galleryImages,
  galleryCaptions
}: {
  coverImage: string;
  galleryImages: string[];
  galleryCaptions: string[];
}) {
  const seen = new Set<string>();
  const normalizedCover = coverImage.trim();

  if (normalizedCover) {
    seen.add(normalizedCover);
  }

  const images: string[] = [];
  const captions: string[] = [];

  galleryImages.forEach((image, index) => {
    const normalizedImage = image.trim();

    if (!normalizedImage || seen.has(normalizedImage)) {
      return;
    }

    seen.add(normalizedImage);
    images.push(normalizedImage);
    captions.push((galleryCaptions[index] ?? "").trim());
  });

  return { images, captions };
}
