import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const workspace = process.cwd();
const chunksDirectory = path.join(workspace, ".next", "static", "chunks");
const mediaDirectory = path.join(workspace, "public", "media");
const imageDirectory = path.join(workspace, "public", "images");
const maximumTotalJavaScriptBytes = 1_650_000;
const maximumSingleJavaScriptBytes = 320_000;
const maximumTotalGzipJavaScriptBytes = 525_000;
const maximumTotalBrotliJavaScriptBytes = 460_000;
const maximumSingleGzipJavaScriptBytes = 90_000;
const maximumSingleBrotliJavaScriptBytes = 80_000;
const maximumTotalCssBytes = 100_000;
// next/font emits separate subset files for the configured families and
// weights. Keep enough headroom above the current 284 KB baseline to avoid a
// permanently failing budget while still catching another large family.
const maximumTotalFontBytes = 320_000;
const maximumSingleVideoBytes = 8 * 1024 * 1024;
const maximumSingleRepositoryImageBytes = 1024 * 1024;

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(target) : [target];
    })
  );
  return nested.flat();
}

const javaScriptFiles = (await listFiles(chunksDirectory)).filter((file) =>
  file.endsWith(".js")
);
const javaScriptSizes = await Promise.all(
  javaScriptFiles.map(async (file) => {
    const contents = await readFile(file);
    return {
      file,
      bytes: contents.length,
      gzipBytes: gzipSync(contents, { level: 9 }).length,
      brotliBytes: brotliCompressSync(contents, {
        // Quality 9 is a closer production transfer proxy than the much slower
        // offline-max setting while remaining deterministic across CI runs.
        params: { [constants.BROTLI_PARAM_QUALITY]: 9 }
      }).length
    };
  })
);
const totalJavaScriptBytes = javaScriptSizes.reduce(
  (total, item) => total + item.bytes,
  0
);
const largestJavaScript = javaScriptSizes.sort(
  (left, right) => right.bytes - left.bytes
)[0];
const totalGzipJavaScriptBytes = javaScriptSizes.reduce(
  (total, item) => total + item.gzipBytes,
  0
);
const totalBrotliJavaScriptBytes = javaScriptSizes.reduce(
  (total, item) => total + item.brotliBytes,
  0
);
const largestGzipJavaScript = [...javaScriptSizes].sort(
  (left, right) => right.gzipBytes - left.gzipBytes
)[0];
const largestBrotliJavaScript = [...javaScriptSizes].sort(
  (left, right) => right.brotliBytes - left.brotliBytes
)[0];
const staticFiles = await listFiles(path.join(workspace, ".next", "static"));
const cssSizes = await Promise.all(
  staticFiles
    .filter((file) => file.endsWith(".css"))
    .map(async (file) => ({ file, bytes: (await stat(file)).size }))
);
const fontSizes = await Promise.all(
  staticFiles
    .filter((file) => file.endsWith(".woff2"))
    .map(async (file) => ({ file, bytes: (await stat(file)).size }))
);
const totalCssBytes = cssSizes.reduce((total, item) => total + item.bytes, 0);
const totalFontBytes = fontSizes.reduce((total, item) => total + item.bytes, 0);
const videoSizes = await Promise.all(
  (await listFiles(mediaDirectory))
    .filter((file) => /\.(?:mp4|webm|mov)$/i.test(file))
    .map(async (file) => ({
      file,
      bytes: (await stat(file)).size
    }))
);
const oversizedVideos = videoSizes.filter(
  (item) => item.bytes > maximumSingleVideoBytes
);
const rasterImageFiles = (await listFiles(imageDirectory)).filter((file) =>
  /\.(?:avif|gif|jpe?g|png|webp)$/i.test(file)
);
const imageChecks = await Promise.all(
  rasterImageFiles.map(async (file) => {
    const contents = await readFile(file);
    const extension = path.extname(file).toLowerCase();
    const validSignature =
      ((extension === ".jpg" || extension === ".jpeg") &&
        contents[0] === 0xff &&
        contents[1] === 0xd8 &&
        contents[2] === 0xff) ||
      (extension === ".png" &&
        contents
          .subarray(0, 8)
          .equals(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
          )) ||
      (extension === ".gif" &&
        contents.subarray(0, 4).toString("ascii") === "GIF8") ||
      (extension === ".webp" &&
        contents.subarray(0, 4).toString("ascii") === "RIFF" &&
        contents.subarray(8, 12).toString("ascii") === "WEBP") ||
      (extension === ".avif" &&
        contents.subarray(4, 8).toString("ascii") === "ftyp");

    return {
      file,
      bytes: contents.length,
      validSignature
    };
  })
);
const invalidRasterImages = imageChecks.filter((item) => !item.validSignature);
const oversizedRepositoryImages = imageChecks.filter(
  (item) => item.bytes > maximumSingleRepositoryImageBytes
);
const failures = [];

if (totalJavaScriptBytes > maximumTotalJavaScriptBytes) {
  failures.push(
    `JavaScript chunks total ${totalJavaScriptBytes} bytes (budget ${maximumTotalJavaScriptBytes}).`
  );
}
if (largestJavaScript?.bytes > maximumSingleJavaScriptBytes) {
  failures.push(
    `Largest JavaScript chunk ${path.basename(largestJavaScript.file)} is ${largestJavaScript.bytes} bytes (budget ${maximumSingleJavaScriptBytes}).`
  );
}
if (totalGzipJavaScriptBytes > maximumTotalGzipJavaScriptBytes) {
  failures.push(
    `Gzip JavaScript total ${totalGzipJavaScriptBytes} bytes (budget ${maximumTotalGzipJavaScriptBytes}).`
  );
}
if (totalBrotliJavaScriptBytes > maximumTotalBrotliJavaScriptBytes) {
  failures.push(
    `Brotli JavaScript total ${totalBrotliJavaScriptBytes} bytes (budget ${maximumTotalBrotliJavaScriptBytes}).`
  );
}
if (largestGzipJavaScript?.gzipBytes > maximumSingleGzipJavaScriptBytes) {
  failures.push(
    `Largest gzip JavaScript chunk ${path.basename(largestGzipJavaScript.file)} is ${largestGzipJavaScript.gzipBytes} bytes (budget ${maximumSingleGzipJavaScriptBytes}).`
  );
}
if (largestBrotliJavaScript?.brotliBytes > maximumSingleBrotliJavaScriptBytes) {
  failures.push(
    `Largest Brotli JavaScript chunk ${path.basename(largestBrotliJavaScript.file)} is ${largestBrotliJavaScript.brotliBytes} bytes (budget ${maximumSingleBrotliJavaScriptBytes}).`
  );
}
if (totalCssBytes > maximumTotalCssBytes) {
  failures.push(
    `CSS total ${totalCssBytes} bytes (budget ${maximumTotalCssBytes}).`
  );
}
if (totalFontBytes > maximumTotalFontBytes) {
  failures.push(
    `Font total ${totalFontBytes} bytes (budget ${maximumTotalFontBytes}).`
  );
}
if (oversizedVideos.length > 0) {
  failures.push(
    `Video budget exceeded: ${oversizedVideos
      .map((item) => `${path.basename(item.file)} (${item.bytes} bytes)`)
      .join(", ")}.`
  );
}
if (invalidRasterImages.length > 0) {
  failures.push(
    `Invalid raster image signatures: ${invalidRasterImages
      .map((item) => path.relative(workspace, item.file))
      .join(", ")}.`
  );
}
if (oversizedRepositoryImages.length > 0) {
  failures.push(
    `Repository image budget exceeded: ${oversizedRepositoryImages
      .map(
        (item) => `${path.relative(workspace, item.file)} (${item.bytes} bytes)`
      )
      .join(", ")}.`
  );
}

console.log(
  `Bundle budget: ${javaScriptFiles.length} JS chunks, ${totalJavaScriptBytes} bytes total, largest ${largestJavaScript?.bytes ?? 0} bytes.`
);
console.log(
  `Compressed JavaScript: gzip ${totalGzipJavaScriptBytes} bytes total / ${largestGzipJavaScript?.gzipBytes ?? 0} largest; Brotli ${totalBrotliJavaScriptBytes} bytes total / ${largestBrotliJavaScript?.brotliBytes ?? 0} largest.`
);
console.log(
  `Styles and fonts: ${totalCssBytes} CSS bytes, ${fontSizes.length} WOFF2 files / ${totalFontBytes} bytes.`
);
console.log(
  `Media budget: ${videoSizes.length} videos, largest ${
    videoSizes.sort((left, right) => right.bytes - left.bytes)[0]?.bytes ?? 0
  } bytes.`
);
console.log(
  `Image validation: ${imageChecks.length} raster images, largest ${
    imageChecks.sort((left, right) => right.bytes - left.bytes)[0]?.bytes ?? 0
  } bytes.`
);

if (failures.length > 0) {
  failures.forEach((failure) => console.error(failure));
  process.exit(1);
}
