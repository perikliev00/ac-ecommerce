/**
 * Generate an SEO-friendly image filename from product name (brand + model + power).
 * Used so each product image has a unique, descriptive file name for search engines.
 * @param {string} brand - Product brand (e.g. "Mitsubishi Electric")
 * @param {string} model - Model name (e.g. "MSZ-HR25VF")
 * @param {number} [moshtnost] - Power in BTU (e.g. 9000)
 * @returns {string} Slug suitable for filename, e.g. "mitsubishi-electric-msz-hr25vf-9000-btu"
 */
function productImageSlug(brand, model, moshtnost) {
  const parts = [brand, model].filter(Boolean).join(' ');
  let slug = parts
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (moshtnost != null && Number(moshtnost) > 0) {
    slug = slug ? `${slug}-${moshtnost}-btu` : `${moshtnost}-btu`;
  }
  return slug || 'product';
}

module.exports = productImageSlug;
