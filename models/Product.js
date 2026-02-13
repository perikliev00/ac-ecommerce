const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    currentOffer: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['inverter', 'hyperinverter', 'floor'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    moshtnost: {
      type: Number,
      default: 0,
    },
    /** Filter: Висок / Междинен / Начален клас. Values: visok, mezhdinen, nachalen */
    class: {
      type: String,
      default: '',
    },
    img: {
      type: String,
      default: 'kmta-400x267.jpg.webp',
    },
    brand: { type: String, default: '' },
    model: { type: String, default: '' },
    /** Filter: В наличност / С поръчка */
    availability: {
      type: String,
      enum: ['in_stock', 'by_order', ''],
      default: '',
    },
    /** Energy class e.g. A++, A+ */
    energyClass: { type: String, default: '' },
    /** Wi-Fi capable */
    wifi: { type: Boolean, default: false },
    /** Room size in m² (for filter) */
    roomSize: { type: Number, default: null },
    /** Show in "Препоръчани климатици" section on homepage */
    recommended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Returns the shape expected by product-cards.ejs.
x */
productSchema.methods.toCard = function () {
  const EUR_TO_BGN = 1.95583;
  const formatEur = (n) =>
    n == null || Number.isNaN(n)
      ? '—'
      : Number(n).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatBgn = (n) =>
    n == null || Number.isNaN(n)
      ? '—'
      : Number(n).toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' лв.';

  const priceNum = this.price != null && !Number.isNaN(this.price) ? Number(this.price) : 0;
  const priceLv = priceNum * EUR_TO_BGN;
  const ribbons = this.currentOffer
    ? [{ style: 'red', label: this.currentOffer }]
    : [];

  /* Display title: model name (brand + model) for PDP/cards; fallback to description or specs */
  const title =
    [this.brand, this.model].filter(Boolean).join(' ') ||
    this.description ||
    [this.moshtnost ? `${this.moshtnost} BTU` : '', this.class ? `Клас ${this.class}` : ''].filter(Boolean).join(' ') ||
    '—';

  return {
    id: this._id,
    ribbons,
    img: this.img || 'kmta-400x267.jpg.webp',
    imgClass: '',
    brand: this.brand || '',
    model: this.model || '',
    title,
    price: formatEur(priceNum),
    priceLv: formatBgn(priceLv),
    category: this.category,
  };
};

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
