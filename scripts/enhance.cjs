// Simple product image enhancer: resize to 1200x1200 with white background (contain fit)
const sharp = require('sharp');
const [,, src, dst] = process.argv;
sharp(src)
  .resize(1200, 1200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .webp({ quality: 90 })
  .toFile(dst)
  .then(() => console.log('saved', dst))
  .catch(e => { console.error(e); process.exit(1); });
