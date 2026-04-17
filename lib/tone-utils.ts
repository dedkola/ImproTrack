import type { HabitTone } from "@/lib/habits";

// ---- Color math helpers ----------------------------------------------------

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.round(Math.max(0, Math.min(255, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h, s, l };
}

export function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darkenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return hslToHex(h, s, Math.max(0, l - amount));
}

function lightenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return hslToHex(h, Math.max(0, s - 0.1), Math.min(1, l + amount));
}

// ---- Validate & clamp hex --------------------------------------------------

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function isValidHex(hex: string): boolean {
  return HEX_RE.test(hex);
}

/** Clamp a hex color to S>20%, L 25-75% so it's visible on white UI */
export function clampHex(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const cs = Math.max(0.2, s);
  const cl = Math.max(0.25, Math.min(0.75, l));
  if (cs === s && cl === l) return hex;
  return hslToHex(h, cs, cl);
}

// ---- Build full HabitTone from hex -----------------------------------------

const WHITE_SURFACE = "from-white via-white to-white";

export function buildToneFromHex(hex: string): HabitTone {
  const normalized = hex.toLowerCase();
  return {
    surface: WHITE_SURFACE,
    accent: "",
    fill: "",
    softFill: "",
    badge: "",
    hex: normalized,
  };
}

// ---- Derived color sets for rendering --------------------------------------

export function getMatrixToneFromHex(hex: string): {
  cellTint: string;
  fill: string;
  glow: string;
  partial: string;
} {
  return {
    cellTint: withAlpha(hex, 0.12),
    fill: hex,
    glow: withAlpha(hex, 0.28),
    partial: withAlpha(hex, 0.16),
  };
}

export function getCardGradientStyleFromHex(hex: string): React.CSSProperties {
  const { r, g, b } = hexToRgb(hex);
  const { l } = rgbToHsl(r, g, b);
  const lead = l > 0.7 ? darkenHex(hex, 0.12) : lightenHex(hex, 0.18);
  const middle = l > 0.7 ? hex : lightenHex(hex, 0.28);
  const leadAlpha = l > 0.7 ? 0.32 : 0.26;
  const middleAlpha = l > 0.7 ? 0.18 : 0.16;

  return {
    backgroundColor: withAlpha(hex, l > 0.7 ? 0.08 : 0.05),
    backgroundImage: `linear-gradient(to bottom right, ${withAlpha(lead, leadAlpha)}, ${withAlpha(middle, middleAlpha)}, rgba(255, 255, 255, 0.98))`,
  };
}

export function getChartColorsFromHex(hex: string): {
  fill: string;
  stroke: string;
} {
  return { fill: hex, stroke: hex };
}

// ---- Rendering prop helpers ------------------------------------------------
// Return className for presets or style for custom hex. Components spread these.

export function fillStyle(tone: HabitTone): React.CSSProperties | undefined {
  if (tone.hex) return { backgroundColor: tone.hex };
  return undefined;
}

export function fillClass(tone: HabitTone): string {
  if (tone.hex) return "";
  return tone.fill;
}

export function accentStyle(tone: HabitTone): React.CSSProperties | undefined {
  if (tone.hex) return { color: darkenHex(tone.hex, 0.2) };
  return undefined;
}

export function accentClass(tone: HabitTone): string {
  if (tone.hex) return "";
  return tone.accent;
}

export function softFillStyle(
  tone: HabitTone,
): React.CSSProperties | undefined {
  if (tone.hex) {
    return {
      backgroundColor: withAlpha(tone.hex, 0.12),
      color: darkenHex(tone.hex, 0.2),
    };
  }
  return undefined;
}

export function softFillClass(tone: HabitTone): string {
  if (tone.hex) return "";
  return tone.softFill;
}

export function badgeStyle(tone: HabitTone): React.CSSProperties | undefined {
  if (tone.hex) {
    return {
      boxShadow: `inset 0 0 0 2px ${withAlpha(tone.hex, 0.2)}`,
    };
  }
  return undefined;
}

export function badgeClass(tone: HabitTone): string {
  if (tone.hex) return "";
  return tone.badge;
}

// ---- Random color generator ------------------------------------------------

export function randomHabitColor(): string {
  const h = Math.random();
  const s = 0.55 + Math.random() * 0.2; // 55-75%
  const l = 0.42 + Math.random() * 0.13; // 42-55%
  return hslToHex(h, s, l);
}
