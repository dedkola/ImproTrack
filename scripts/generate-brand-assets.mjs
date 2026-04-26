import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const brandDir = path.join(rootDir, "public", "brand");
const require = createRequire(import.meta.url);
const sharp = require(path.join(rootDir, "node_modules/.pnpm/node_modules/sharp"));

const sources = {
  dashboard: path.join(brandDir, "dashboard-shot.png"),
  global: path.join(brandDir, "global-statistic.png"),
  ios: path.join(brandDir, "ios.jpeg"),
  stats: path.join(brandDir, "stats-shot.png"),
  logo: path.join(rootDir, "public", "logo.svg"),
};

function svgBuffer(svg) {
  return Buffer.from(svg);
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textSvg({ width, height, content }) {
  return svgBuffer(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .sans { font-family: Inter, Avenir Next, Segoe UI, Arial, sans-serif; }
        .display { font-family: Avenir Next, Segoe UI, Arial, sans-serif; }
      </style>
      ${content}
    </svg>
  `);
}

async function roundedImage(input, width, height, radius, position = "top") {
  const image = await sharp(input)
    .resize(width, height, { fit: "cover", position })
    .png()
    .toBuffer();

  const mask = svgBuffer(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="#fff" />
    </svg>
  `);

  return sharp(image)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function shotCard({
  source,
  width,
  height,
  radius,
  padding = 18,
  rotate = 0,
  position = "top",
  tint = "#ffffff",
}) {
  const shadowPad = 74;
  const outerWidth = width + padding * 2;
  const outerHeight = height + padding * 2;
  const canvasWidth = outerWidth + shadowPad * 2;
  const canvasHeight = outerHeight + shadowPad * 2;
  const shot = await roundedImage(source, width, height, radius - padding, position);

  const shell = svgBuffer(`
    <svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="30" stdDeviation="24" flood-color="#0a1628" flood-opacity="0.18"/>
          <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#0a1628" flood-opacity="0.08"/>
        </filter>
        <linearGradient id="shell" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${tint}" stop-opacity="0.98"/>
          <stop offset="1" stop-color="#f8fbff" stop-opacity="0.96"/>
        </linearGradient>
      </defs>
      <rect x="${shadowPad}" y="${shadowPad}" width="${outerWidth}" height="${outerHeight}" rx="${radius}" fill="url(#shell)" filter="url(#softShadow)" />
      <rect x="${shadowPad + 0.5}" y="${shadowPad + 0.5}" width="${outerWidth - 1}" height="${outerHeight - 1}" rx="${radius}" fill="none" stroke="rgba(10,22,40,0.10)" />
      <rect x="${shadowPad + padding - 0.5}" y="${shadowPad + padding - 0.5}" width="${width + 1}" height="${height + 1}" rx="${radius - padding}" fill="none" stroke="rgba(10,22,40,0.10)" />
    </svg>
  `);

  const card = await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([
      { input: shell, left: 0, top: 0 },
      { input: shot, left: shadowPad + padding, top: shadowPad + padding },
    ])
    .png()
    .toBuffer();

  return sharp(card)
    .rotate(rotate, {
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();
}

function badge({ label, value, accent = "#6D28D9", width = 260 }) {
  return textSvg({
    width,
    height: 118,
    content: `
      <defs>
        <filter id="badgeShadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#0a1628" flood-opacity="0.13"/>
        </filter>
      </defs>
      <rect x="4" y="4" width="${width - 8}" height="110" rx="34" fill="rgba(255,255,255,0.92)" stroke="rgba(10,22,40,0.08)" filter="url(#badgeShadow)"/>
      <circle cx="42" cy="58" r="13" fill="${accent}" opacity="0.16"/>
      <circle cx="42" cy="58" r="6" fill="${accent}"/>
      <text x="68" y="50" class="sans" font-size="17" font-weight="800" fill="#0a1628">${escapeXml(value)}</text>
      <text x="68" y="76" class="sans" font-size="13" font-weight="750" fill="#65748a" letter-spacing="1.2">${escapeXml(label.toUpperCase())}</text>
    `,
  });
}

async function phoneCard({
  source,
  width,
  height,
  radius,
  rotate = 0,
}) {
  const shadowPad = 74;
  const bezel = 14;
  const outerWidth = width + bezel * 2;
  const outerHeight = height + bezel * 2;
  const canvasWidth = outerWidth + shadowPad * 2;
  const canvasHeight = outerHeight + shadowPad * 2;
  const shot = await roundedImage(source, width, height, radius - bezel, "top");

  const shell = svgBuffer(`
    <svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="phoneShadow" x="-35%" y="-25%" width="170%" height="160%">
          <feDropShadow dx="0" dy="30" stdDeviation="24" flood-color="#0a1628" flood-opacity="0.24"/>
          <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#0a1628" flood-opacity="0.10"/>
        </filter>
        <linearGradient id="bezel" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#101d32"/>
          <stop offset="1" stop-color="#020617"/>
        </linearGradient>
      </defs>
      <rect x="${shadowPad}" y="${shadowPad}" width="${outerWidth}" height="${outerHeight}" rx="${radius}" fill="url(#bezel)" filter="url(#phoneShadow)" />
      <rect x="${shadowPad + 0.5}" y="${shadowPad + 0.5}" width="${outerWidth - 1}" height="${outerHeight - 1}" rx="${radius}" fill="none" stroke="rgba(255,255,255,0.16)" />
      <rect x="${shadowPad + outerWidth / 2 - 43}" y="${shadowPad + 10}" width="86" height="18" rx="9" fill="#020617" opacity="0.96"/>
    </svg>
  `);

  const phone = await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([
      { input: shell, left: 0, top: 0 },
      { input: shot, left: shadowPad + bezel, top: shadowPad + bezel },
    ])
    .png()
    .toBuffer();

  return sharp(phone)
    .rotate(rotate, {
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function buildTransparentCollage() {
  const width = 1800;
  const height = 1200;
  const dashboard = await shotCard({
    source: sources.dashboard,
    width: 930,
    height: 560,
    radius: 58,
    padding: 20,
    rotate: -1.8,
    tint: "#ffffff",
  });
  const global = await shotCard({
    source: sources.global,
    width: 620,
    height: 374,
    radius: 48,
    padding: 16,
    rotate: 3.5,
    position: "top",
    tint: "#f7fbff",
  });
  const stats = await shotCard({
    source: sources.stats,
    width: 610,
    height: 354,
    radius: 48,
    padding: 16,
    rotate: -4.2,
    position: "top",
    tint: "#fffaf2",
  });
  const phone = await phoneCard({
    source: sources.ios,
    width: 252,
    height: 546,
    radius: 54,
    rotate: 5.8,
  });

  const accent = textSvg({
    width,
    height,
    content: `
      <path d="M292 234 C560 128 906 152 1160 304 C1340 412 1508 418 1644 330" fill="none" stroke="#0ea5e9" stroke-width="12" stroke-linecap="round" opacity="0.24"/>
      <path d="M132 938 C390 802 754 842 1030 982 C1238 1088 1468 1070 1664 930" fill="none" stroke="#f59e0b" stroke-width="14" stroke-linecap="round" opacity="0.18"/>
      <circle cx="1438" cy="190" r="188" fill="#ede9fe" opacity="0.58"/>
      <circle cx="356" cy="824" r="170" fill="#e0f2fe" opacity="0.42"/>
      <rect x="1038" y="170" width="262" height="16" rx="8" fill="#6D28D9" opacity="0.48"/>
      <rect x="1092" y="204" width="188" height="10" rx="5" fill="#0ea5e9" opacity="0.38"/>
    `,
  });

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
    })
    .composite([
      { input: accent, left: 0, top: 0 },
      { input: stats, left: 110, top: 636 },
      { input: dashboard, left: 372, top: 196 },
      { input: global, left: 924, top: 688 },
      { input: phone, left: 1266, top: 86 },
      { input: badge({ label: "hit rate", value: "82%", accent: "#0ea5e9" }), left: 252, top: 154 },
      { input: badge({ label: "live streak", value: "14 days", accent: "#6D28D9", width: 292 }), left: 1106, top: 256 },
      { input: badge({ label: "progress view", value: "global stats", accent: "#f59e0b", width: 318 }), left: 748, top: 918 },
    ])
    .png()
    .toFile(path.join(brandDir, "home-collage.png"));
}

async function buildOpenGraph() {
  const width = 1200;
  const height = 630;
  const dashboard = await shotCard({
    source: sources.dashboard,
    width: 514,
    height: 310,
    radius: 36,
    padding: 12,
    rotate: -1.7,
  });
  const global = await shotCard({
    source: sources.global,
    width: 356,
    height: 214,
    radius: 30,
    padding: 10,
    rotate: 3.8,
    tint: "#f7fbff",
  });
  const stats = await shotCard({
    source: sources.stats,
    width: 286,
    height: 166,
    radius: 30,
    padding: 10,
    rotate: -4.2,
    tint: "#fffaf2",
  });
  const phone = await phoneCard({
    source: sources.ios,
    width: 142,
    height: 308,
    radius: 34,
    rotate: 5,
  });

  const background = textSvg({
    width,
    height,
    content: `
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#f8fbff"/>
          <stop offset="0.52" stop-color="#ffffff"/>
          <stop offset="1" stop-color="#fff7ed"/>
        </linearGradient>
        <pattern id="grid" width="38" height="38" patternUnits="userSpaceOnUse">
          <path d="M 38 0 L 0 0 0 38" fill="none" stroke="rgba(10,22,40,0.04)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <rect width="${width}" height="${height}" fill="url(#grid)" opacity="0.8"/>
      <path d="M504 -40 L1240 -40 L1240 670 L650 670 C802 496 820 320 504 -40Z" fill="#ede9fe" opacity="0.65"/>
      <path d="M644 88 C830 24 1028 58 1152 158" fill="none" stroke="#0ea5e9" stroke-width="10" stroke-linecap="round" opacity="0.26"/>
      <text x="58" y="150" class="sans" font-size="14" font-weight="850" letter-spacing="3" fill="#64748b">HABIT DASHBOARD</text>
      <text x="56" y="226" class="display" font-size="55" font-weight="850" fill="#0a1628">Build routines</text>
      <text x="56" y="286" class="display" font-size="55" font-weight="850" fill="#0a1628">you can see.</text>
      <text x="60" y="342" class="sans" font-size="20" font-weight="550" fill="#4b5b71">Daily habits, streaks, archive history,</text>
      <text x="60" y="372" class="sans" font-size="20" font-weight="550" fill="#4b5b71">and progress insights in one workspace.</text>
      <rect x="58" y="420" width="206" height="58" rx="18" fill="#0a1628"/>
      <text x="86" y="456" class="sans" font-size="16" font-weight="850" fill="#fff">Start tracking today</text>
      <rect x="58" y="514" width="122" height="58" rx="20" fill="rgba(255,255,255,0.86)" stroke="rgba(10,22,40,0.08)"/>
      <text x="82" y="542" class="sans" font-size="24" font-weight="850" fill="#0a1628">82%</text>
      <text x="82" y="562" class="sans" font-size="11" font-weight="800" fill="#64748b" letter-spacing="1">HIT RATE</text>
      <rect x="196" y="514" width="122" height="58" rx="20" fill="rgba(255,255,255,0.86)" stroke="rgba(10,22,40,0.08)"/>
      <text x="220" y="542" class="sans" font-size="24" font-weight="850" fill="#0a1628">14</text>
      <text x="220" y="562" class="sans" font-size="11" font-weight="800" fill="#64748b" letter-spacing="1">DAY RUN</text>
    `,
  });

  const logo = await sharp(sources.logo).resize(72, 72).png().toBuffer();
  const logoShell = textSvg({
    width: 382,
    height: 92,
    content: `
      <rect x="0" y="0" width="92" height="92" rx="28" fill="rgba(255,255,255,0.92)" stroke="rgba(10,22,40,0.06)"/>
      <text x="112" y="57" class="display" font-size="35" font-weight="850" fill="#0a1628">ImproTrack</text>
    `,
  });

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      { input: background, left: 0, top: 0 },
      { input: logoShell, left: 54, top: 42 },
      { input: logo, left: 64, top: 52 },
      { input: stats, left: 516, top: 382 },
      { input: dashboard, left: 492, top: 112 },
      { input: global, left: 772, top: 346 },
      { input: phone, left: 970, top: 94 },
    ])
    .png()
    .toFile(path.join(brandDir, "opengraph.png"));
}

await buildTransparentCollage();
await buildOpenGraph();

console.log("Generated public/brand/home-collage.png and public/brand/opengraph.png");
