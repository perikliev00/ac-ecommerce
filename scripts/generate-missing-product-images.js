/**
 * Generate image files for products that are in the DB but were not in the main seed
 * (e.g. MA2-24NXD0-I, RSG18KMTE, MA3-12HRDN8-QRD0GW). Uses the exact img filenames
 * that update-product-image-filenames.js set in the DB.
 * Run: node scripts/generate-missing-product-images.js
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'assets', 'images');

const MISSING = [
  { outFile: 'midea-ma2-24nxd0-i-24000-btu.webp', source: 'midea photo.png', index: 0 },
  { outFile: 'fuji-electric-fuji-electric-rsg18kmte-18000-btu-18000-btu.webp', source: 'fuji-image.png', index: 1 },
  { outFile: 'midea-midea-prime-2-ma3-12hrdn8-qrd0gw-12000-btu-a-12000-btu.webp', source: 'midea photo.png', index: 2 },
];

async function generateUniqueImage(sourcePath, outPath, index) {
  const rotation = (index % 7) * 0.35 - 1;
  const brightness = 0.97 + (index % 9) * 0.012;
  const saturation = 0.98 + (index % 5) * 0.008;
  await sharp(sourcePath)
    .rotate(rotation, { background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .modulate({ brightness, saturation })
    .webp({ quality: 90 })
    .toFile(outPath);
}

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('Images dir not found:', IMAGES_DIR);
    process.exit(1);
  }
  for (const { outFile, source, index } of MISSING) {
    const sourcePath = path.join(IMAGES_DIR, source);
    const outPath = path.join(IMAGES_DIR, outFile);
    if (!fs.existsSync(sourcePath)) {
      console.warn('Skip (no source): %s', source);
      continue;
    }
    try {
      await generateUniqueImage(sourcePath, outPath, index);
      console.log('Created: %s', outFile);
    } catch (err) {
      console.error('Error %s:', outFile, err.message);
    }
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
