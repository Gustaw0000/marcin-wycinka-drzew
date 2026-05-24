const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'public', 'og-image.svg');
const OUT_PNG = path.join(__dirname, '..', 'public', 'og-image.png');
const OUT_JPG = path.join(__dirname, '..', 'public', 'og-image.jpg');

(async () => {
  const svg = fs.readFileSync(SRC);

  await sharp(svg, { density: 300 })
    .resize(1200, 630, { fit: 'cover' })
    .png({ compressionLevel: 9, palette: false })
    .toFile(OUT_PNG);

  await sharp(svg, { density: 300 })
    .resize(1200, 630, { fit: 'cover' })
    .flatten({ background: '#1f2a23' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(OUT_JPG);

  const pngSize = fs.statSync(OUT_PNG).size;
  const jpgSize = fs.statSync(OUT_JPG).size;
  console.log(`og-image.png: ${(pngSize / 1024).toFixed(1)} KB`);
  console.log(`og-image.jpg: ${(jpgSize / 1024).toFixed(1)} KB`);
})().catch(err => { console.error(err); process.exit(1); });
