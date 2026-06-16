import fs from "node:fs/promises";

import path from "node:path";
import sharp from "sharp";

const INPUT_IMAGE = "./assets/images/icon.png";
const OUT_DIR = "./assets/images/android";

const SIZE = 1024;

const ICON_SIZE = 720; // padding around the icon
const BG_COLOR = "#020617";

await fs.mkdir(OUT_DIR, { recursive: true });

// Ensures that the file is indeed a readable image.
try {
  await sharp(INPUT_IMAGE).metadata();
} catch (error) {
  console.error(`Erro ao ler a imagem: ${INPUT_IMAGE}`);
  console.error(error);

  process.exit(1);
}

async function makeCenteredPng(outputName, transform = (img) => img) {
  const rendered = await transform(
    sharp(INPUT_IMAGE).resize(ICON_SIZE, ICON_SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    }),
  )
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: rendered, gravity: "center" }])
    .png()
    .toFile(path.join(OUT_DIR, outputName));
}

// Foreground: normal icon with transparency
await makeCenteredPng("android-icon-foreground.png");

// Monochrome: for Android 13+ (monochrome icon)
await makeCenteredPng("android-icon-monochrome.png", (img) =>
  img.tint("#ffffff"),
);

// Background: solid background
await sharp({
  create: {
    width: SIZE,
    height: SIZE,
    channels: 4,
    background: BG_COLOR,
  },
})
  .png()
  .toFile(path.join(OUT_DIR, "android-icon-background.png"));

console.log(`Ícones Android gerados em: ${OUT_DIR}`);
