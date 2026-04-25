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
  stats: path.join(brandDir, "stats-shot.png"),
  archive: path.join(brandDir, "archive-shot.png"),
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

async function buildTransparentCollage() {
  const width = 1800;
  const height = 1200;
  const dashboard = await shotCard({
    source: sources.dashboard,
    width: 1060,
    height: 704,
    radius: 58,
    padding: 20,
    rotate: -2.2,
    tint: "#ffffff",
  });
  const stats = await shotCard({
    source: sources.stats,
    width: 650,
    height: 500,
    radius: 48,
    padding: 16,
    rotate: 5.2,
    position: "top",
    tint: "#f7fbff",
  });
  const archive = await shotCard({
    source: sources.archive,
    width: 570,
    height: 378,
    radius: 44,
    padding: 16,
    rotate: -6.5,
    tint: "#fffaf2",
  });

  const accent = textSvg({
    width,
    height,
    content: `
      <path d="M226 228 C554 118 880 140 1192 292 C1358 372 1507 400 1630 352" fill="none" stroke="#0ea5e9" stroke-width="12" stroke-linecap="round" opacity="0.26"/>
      <path d="M118 960 C418 840 802 850 1128 998 C1340 1093 1518 1074 1668 956" fill="none" stroke="#f59e0b" stroke-width="14" stroke-linecap="round" opacity="0.20"/>
      <rect x="1262" y="168" width="262" height="16" rx="8" fill="#6D28D9" opacity="0.54"/>
      <rect x="1308" y="202" width="188" height="10" rx="5" fill="#0ea5e9" opacity="0.42"/>
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
      { input: stats, left: 1088, top: 456 },
      { input: archive, left: 120, top: 696 },
      { input: dashboard, left: 304, top: 172 },
      { input: badge({ label: "hit rate", value: "82%", accent: "#0ea5e9" }), left: 242, top: 150 },
      { input: badge({ label: "live streak", value: "14 days", accent: "#6D28D9", width: 292 }), left: 1160, top: 254 },
      { input: badge({ label: "routine slots", value: "4 habits", accent: "#f59e0b", width: 286 }), left: 900, top: 908 },
    ])
    .png()
    .toFile(path.join(brandDir, "home-collage.png"));
}

async function buildOpenGraph() {
  const width = 1200;
  const height = 630;
  const dashboard = await shotCard({
    source: sources.dashboard,
    width: 590,
    height: 392,
    radius: 36,
    padding: 12,
    rotate: -2.1,
  });
  const stats = await shotCard({
    source: sources.stats,
    width: 330,
    height: 250,
    radius: 30,
    padding: 10,
    rotate: 4.5,
    tint: "#f7fbff",
  });
  const archive = await shotCard({
    source: sources.archive,
    width: 310,
    height: 206,
    radius: 30,
    padding: 10,
    rotate: -5.5,
    tint: "#fffaf2",
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
      <path d="M530 -40 L1240 -40 L1240 670 L690 670 C825 502 841 336 530 -40Z" fill="#ede9fe" opacity="0.65"/>
      <path d="M648 86 C834 24 1026 60 1152 158" fill="none" stroke="#0ea5e9" stroke-width="10" stroke-linecap="round" opacity="0.26"/>
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
      { input: stats, left: 832, top: 320 },
      { input: archive, left: 492, top: 390 },
      { input: dashboard, left: 462, top: 104 },
    ])
    .png()
    .toFile(path.join(brandDir, "opengraph.png"));
}

await buildTransparentCollage();
await buildOpenGraph();

console.log("Generated public/brand/home-collage.png and public/brand/opengraph.png");
