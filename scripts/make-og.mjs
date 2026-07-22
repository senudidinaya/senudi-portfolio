// Generates the social card and apple touch icon from the hero still.
// Run after swapping hero-bridge.jpg: node scripts/make-og.mjs
import sharp from "sharp";

await sharp("public/media/hero-bridge.jpg")
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile("public/og.jpg");

console.log("wrote public/og.jpg (1200x630)");

const appleIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="34" fill="#F4F2EA"/>
  <text x="90" y="128" font-family="Georgia, 'Times New Roman', serif" font-size="108" text-anchor="middle" fill="#166544">S.</text>
</svg>`;

await sharp(Buffer.from(appleIcon)).resize(180, 180).png().toFile("src/app/apple-icon.png");

console.log("wrote src/app/apple-icon.png (180x180)");
