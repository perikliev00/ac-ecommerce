/**
 * Generate one unique image per product: SEO filename + slight visual variation.
 * Run after seed: node scripts/generate-product-images.js
 * Uses source images from public/assets/images (by brand) and writes
 * slug-named .webp files so each product has a visually unique image for originality/SEO.
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { products, productImageSlug, normalizeProduct } = require('./seed-products-from-pages.js');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'assets', 'images');

const SOURCE_BY_BRAND = {
  // Use multiple base images where available to get visual variety per brand.
  Midea: ['midea photo.png', 'midea2 photo.webp'],
  Daikin: ['daikin image.webp', 'daikin 2.webp'],
  Gree: ['gree photo.webp'],
  'Mitsubishi Electric': ['mitsubishi.webp'],
  'Mitsubishi Heavy': ['mitsubishi 2.webp', 'mitsubishi.webp'],
  'Fuji Electric': ['fuji-image.png'],
  Toshiba: ['toshiba image.webp'],
  Treo: ['treo image.jpg'],
  Aermec: ['podov image.webp'],
};
const DEFAULT_SOURCES = ['mitsubishi.webp', 'podov image.webp'];

function getSourceImage(brand, index) {
  const entry = SOURCE_BY_BRAND[brand] || DEFAULT_SOURCES;
  const list = Array.isArray(entry) ? entry : [entry];
  if (list.length === 0) return 'mitsubishi.webp';
  const i = Math.abs(index) % list.length;
  return list[i];
}

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

  const normalized = products.map((p) => normalizeProduct(p));
  let done = 0;
  let skipped = 0;

  for (let i = 0; i < normalized.length; i++) {
    const p = normalized[i];
    const slug = productImageSlug(p.brand, p.model, p.moshtnost);
    const outFilename = slug + '.webp';
    const outPath = path.join(IMAGES_DIR, outFilename);

    const sourceFile = getSourceImage(p.brand, i);
    const sourcePath = path.join(IMAGES_DIR, sourceFile);

    if (!fs.existsSync(sourcePath)) {
      console.warn('Skip (no source): %s → %s', sourceFile, outFilename);
      skipped++;
      continue;
    }

    try {
      await generateUniqueImage(sourcePath, outPath, i);
      console.log('[%d] %s %s → %s', i + 1, p.brand, p.model, outFilename);
      done++;
    } catch (err) {
      console.error('Error %s %s:', p.brand, p.model, err.message);
    }
  }

  console.log('Done. Generated: %d, Skipped: %d', done, skipped);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
