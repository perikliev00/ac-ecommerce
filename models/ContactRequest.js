const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    subject: { type: String, trim: true, default: '' },
    ready: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactRequest', contactRequestSchema);

