import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const workspace = process.cwd();
const chunksDirectory = path.join(workspace, ".next", "static", "chunks");
const mediaDirectory = path.join(workspace, "public", "media");
const imageDirectory = path.join(workspace, "public", "images");
const maximumTotalJavaScriptBytes = 1_650_000;
const maximumSingleJavaScriptBytes = 320_000;
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
  javaScriptFiles.map(async (file) => ({
    file,
    bytes: (await stat(file)).size
  }))
);
const totalJavaScriptBytes = javaScriptSizes.reduce(
  (total, item) => total + item.bytes,
  0
);
const largestJavaScript = javaScriptSizes.sort(
  (left, right) => right.bytes - left.bytes
)[0];
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
