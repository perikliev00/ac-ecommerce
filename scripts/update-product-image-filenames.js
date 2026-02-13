/**
 * Update all existing products in the DB to use SEO image filenames.
 * Run once after generating images: node scripts/update-product-image-filenames.js
 * So card images point to the generated files (e.g. midea-msopbu-12hrfn8-qre3gw-12000-btu.webp).
 */
const mongoose = require('mongoose');
const Product = require('../models/Product');
const productImageSlug = require('../lib/productImageSlug');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://perikliev00_db_user:VJGqHu1rVlFoECBK@nesebar-clima.fijdo8g.mongodb.net/?appName=nesebar-clima';

async function main() {
  await mongoose.connect(MONGO_URI);
  const docs = await Product.find({});
  let updated = 0;
  for (const doc of docs) {
    const newImg = productImageSlug(doc.brand, doc.model, doc.moshtnost) + '.webp';
    if (doc.img !== newImg) {
      await Product.updateOne({ _id: doc._id }, { $set: { img: newImg } });
      console.log('Updated: %s %s → %s', doc.brand, doc.model, newImg);
      updated++;
    }
  }
  console.log('Done. Updated %d product(s).', updated);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
