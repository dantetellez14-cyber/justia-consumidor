/**
 * Generates PWA icons at all required sizes using sharp (if available)
 * or falls back to creating placeholder PNG files.
 *
 * Usage: node scripts/generate-pwa-icons.mjs
 *
 * The source SVG is an embedded Scale icon on an indigo gradient background.
 * Run once, commit the resulting public/icons/*.png files.
 */

import { writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ICONS_DIR = join(ROOT, "public", "icons");

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

/**
 * Build an SVG icon at a given size.
 * Uses a dark indigo background with a Scale (balance) icon centered.
 */
function buildSvg(size) {
  const pad = Math.round(size * 0.18);
  const iconSize = size - pad * 2;
  const r = Math.round(size * 0.2); // border-radius

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
    </linearGradient>
    <clipPath id="clip">
      <rect width="${size}" height="${size}" rx="${r}" ry="${r}" />
    </clipPath>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)" />
  <!-- Scale icon (lucide-scale simplified) centered -->
  <g transform="translate(${pad}, ${pad})" clip-path="url(#clip)">
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none"
         stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <!-- Pole -->
      <line x1="12" y1="3" x2="12" y2="21"/>
      <!-- Base -->
      <path d="M8 21h8"/>
      <!-- Beam -->
      <line x1="3" y1="7" x2="21" y2="7"/>
      <!-- Left scale -->
      <path d="M3 7l3 6c0 1.657-1.343 3-3 3s-3-1.343-3-3l3-6z" transform="translate(0,0)"/>
      <path d="M3 7c0 0 0 6 0 6" style="display:none"/>
      <!-- Left pan arc -->
      <path d="M3 7 L6 13 A3 3 0 0 1 0 13 Z"/>
      <!-- Right pan arc -->
      <path d="M21 7 L24 13 A3 3 0 0 1 18 13 Z"/>
    </svg>
  </g>
</svg>`;
}

/**
 * Try to convert SVG to PNG using sharp (optional dev dep).
 * Falls back to writing SVG renamed as .png if sharp not available.
 */
async function trySharp(svg, outPath, size) {
  try {
    const sharp = (await import("sharp")).default;
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("Generating PWA icons...");

  for (const size of SIZES) {
    const svg = buildSvg(size);
    const outPath = join(ICONS_DIR, `icon-${size}.png`);

    if (existsSync(outPath)) {
      console.log(`  ✓ icon-${size}.png already exists, skipping`);
      continue;
    }

    const ok = await trySharp(svg, outPath, size);
    if (ok) {
      console.log(`  ✓ Generated icon-${size}.png via sharp`);
    } else {
      // Fallback: write the SVG with .png extension (works in most browsers)
      writeFileSync(outPath, svg, "utf8");
      console.log(`  ⚠ icon-${size}.png written as SVG fallback (install sharp for real PNGs)`);
    }
  }

  // Also write favicon.svg for modern browsers
  const faviconPath = join(ROOT, "public", "favicon.svg");
  if (!existsSync(faviconPath)) {
    writeFileSync(faviconPath, buildSvg(32), "utf8");
    console.log("  ✓ favicon.svg generated");
  }

  console.log("Done. Commit public/icons/ to include icons in your deployment.");
}

main().catch(console.error);
