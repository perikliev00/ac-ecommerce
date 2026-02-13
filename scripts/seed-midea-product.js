/**
 * One-time seed: add Midea MA2-24NXD0-I product (from klimatici-nesebar.com style page).
 * Run: node scripts/seed-midea-product.js
 */
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://perikliev00_db_user:VJGqHu1rVlFoECBK@nesebar-clima.fijdo8g.mongodb.net/?appName=nesebar-clima';

const productData = {
  currentOffer: '% Промо',
  category: 'inverter',
  price: 1102,
  description: `Инверторен настенен климатик Midea MA2-24NXD0-I от серия Prime 2018 с висок енергиен клас за охлаждане A++ и отопление A++. Системата работи с новия екологичен хладилен агент R32, който предпазва околната среда и подобрява техническите характеристики на климатика.

Технически характеристики:
- Мощност охлаждане: 7,00 kW (2,65 - 8,25)
- Мощност отопление: 7,33 kW (2,91 - 8,53)
- Консумация охлаждане / отопление: 2,43 kW (0,94 - 3,50) / 2,42 kW (1,00 - 3,07)
- SEER охлаждане: 6,1 W/W
- SCOP отопление: 4,0 / 5,1
- Енергиен клас охлаждане: A++
- Енергиен клас отопление: A++`,
  moshtnost: 24000,
  class: '',
  img: '1770855843087-ChatGPT_Image_Feb_12__2026__02_23_54_AM.png',
  brand: 'Midea',
  model: 'MA2-24NXD0-I',
  availability: 'in_stock',
  energyClass: 'A++',
  wifi: false,
  roomSize: null,
  recommended: false,
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  const existing = await Product.findOne({ brand: 'Midea', model: 'MA2-24NXD0-I' });
  if (existing) {
    console.log('Product Midea MA2-24NXD0-I already exists (id: %s).', existing._id);
    await mongoose.disconnect();
    return;
  }
  const product = new Product(productData);
  await product.save();
  console.log('Product created: %s %s (id: %s)', product.brand, product.model, product._id);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
