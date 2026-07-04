// Generates flat-lay style SVG product images into public/products/.
// Re-run with: node scripts/generate-images.mjs
// Replace any of these with real photos whenever you have them — the admin
// panel lets you paste any image URL per product.

import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "products");
mkdirSync(outDir, { recursive: true });

const W = 600;
const H = 800;

const GOLD = "#c9a227";
const GOLD_SOFT = "#d9b95c";

// ---------- shared bits ----------

const paisley = (x, y, s, fill, rot = 0) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 -20 C13 -15 16 3 9 13 C4 21 -5 21 -9 12 C-14 1 -12 -14 0 -20 Z" fill="${fill}"/>
    <path d="M0 -13 C8 -9 10 1 5 8 C2 13 -3 13 -6 7 C-9 0 -8 -9 0 -13 Z" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.4"/>
    <circle cx="0" cy="-1" r="1.6" fill="rgba(255,255,255,0.8)"/>
  </g>`;

const butti = (x, y, s, fill) => `
  <g transform="translate(${x} ${y}) scale(${s})" fill="${fill}">
    <path d="M0 -6 L4 0 L0 6 L-4 0 Z"/>
    <circle cx="0" cy="0" r="1.2" fill="rgba(255,255,255,0.7)"/>
  </g>`;

const weave = (id, tone) => `
  <pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="8" height="8" fill="none"/>
    <line x1="0" y1="0" x2="0" y2="8" stroke="${tone}" stroke-width="1"/>
  </pattern>`;

const svg = (inner, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${defs}${inner}</svg>`;

// ---------- saree: fabric flat-lay with zari border ----------

function saree({ base, dark, accent }) {
  const buttis = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 6; col++) {
      const x = 60 + col * 96 + (row % 2 ? 48 : 0);
      const y = 55 + row * 62;
      if (y < 560) buttis.push(butti(x, y, 1.15, GOLD_SOFT));
    }
  }
  const paisleys = [];
  for (let i = 0; i < 6; i++) {
    paisleys.push(paisley(70 + i * 94, 700, 1.5, GOLD, 18));
  }
  const zig = [];
  for (let x = 0; x <= W; x += 24) zig.push(`${x},${x % 48 === 0 ? 754 : 764}`);

  return svg(
    `
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect width="${W}" height="${H}" fill="url(#weave)"/>
    ${buttis.join("")}
    <rect y="600" width="${W}" height="200" fill="${dark}"/>
    <rect y="600" width="${W}" height="200" fill="url(#weave)"/>
    <rect y="604" width="${W}" height="2.5" fill="${GOLD}"/>
    <rect y="612" width="${W}" height="1.2" fill="${GOLD_SOFT}" opacity="0.8"/>
    <rect y="622" width="${W}" height="5" fill="${accent}"/>
    <rect y="634" width="${W}" height="1.2" fill="${GOLD_SOFT}" opacity="0.6"/>
    ${paisleys.join("")}
    <polyline points="${zig.join(" ")}" fill="none" stroke="${GOLD}" stroke-width="2"/>
    <rect y="788" width="${W}" height="12" fill="${GOLD}" opacity="0.9"/>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
    `,
    `<defs>
      <linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stop-color="${base}"/>
        <stop offset="1" stop-color="${dark}"/>
      </linearGradient>
      <radialGradient id="vig" cx="0.5" cy="0.42" r="0.95">
        <stop offset="0.6" stop-color="rgba(0,0,0,0)"/>
        <stop offset="1" stop-color="rgba(0,0,0,0.18)"/>
      </radialGradient>
      ${weave("weave", "rgba(255,255,255,0.05)")}
    </defs>`
  );
}

// ---------- dress material: folded fabric stack ----------

function dressMaterial({ base, dark, accent, light }) {
  const folds = [];
  const foldH = 118;
  for (let i = 0; i < 5; i++) {
    const y = 130 + i * foldH;
    folds.push(`
      <rect y="${y}" width="${W}" height="${foldH}" fill="${i % 2 ? dark : base}"/>
      <rect y="${y}" width="${W}" height="${foldH}" fill="url(#weave)"/>
      <rect y="${y + foldH - 10}" width="${W}" height="10" fill="rgba(0,0,0,0.16)"/>
      <rect y="${y + 14}" width="${W}" height="2" fill="${GOLD_SOFT}" opacity="0.55"/>
    `);
  }
  const prints = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 7; c++) {
      const x = 45 + c * 85 + (r % 2 ? 42 : 0);
      const y = 165 + r * 58;
      if (y < 700)
        prints.push(`
        <g transform="translate(${x} ${y})" opacity="0.5">
          <circle r="7" fill="none" stroke="${light}" stroke-width="1.5"/>
          <circle r="2" fill="${light}"/>
        </g>`);
    }
  }
  return svg(
    `
    <rect width="${W}" height="${H}" fill="${base}"/>
    <rect width="${W}" height="${H}" fill="url(#weave)"/>
    ${folds.join("")}
    ${prints.join("")}
    <path d="M0 0 L${W} 0 L${W} 96 Q ${W / 2} 148 0 96 Z" fill="${accent}"/>
    <path d="M0 84 Q ${W / 2} 136 ${W} 84" fill="none" stroke="${GOLD}" stroke-width="3"/>
    <path d="M0 92 Q ${W / 2} 144 ${W} 92" fill="none" stroke="${GOLD_SOFT}" stroke-width="1.4" opacity="0.8"/>
    <rect y="726" width="${W}" height="74" fill="${accent}"/>
    <rect y="730" width="${W}" height="2.4" fill="${GOLD}"/>
    ${[...Array(6)].map((_, i) => paisley(72 + i * 92, 766, 1.05, GOLD, 15)).join("")}
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
    `,
    `<defs>
      <radialGradient id="vig" cx="0.5" cy="0.45" r="0.95">
        <stop offset="0.6" stop-color="rgba(0,0,0,0)"/>
        <stop offset="1" stop-color="rgba(0,0,0,0.16)"/>
      </radialGradient>
      ${weave("weave", "rgba(255,255,255,0.05)")}
    </defs>`
  );
}

// ---------- jewellery: gold pieces on velvet ----------

function necklaceArc(cx, cy, r, n, beadR) {
  const dots = [];
  for (let i = 0; i < n; i++) {
    const t = Math.PI * (0.15 + (0.7 * i) / (n - 1));
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t) * 0.9;
    const size = beadR * (1 + 0.45 * Math.sin((Math.PI * i) / (n - 1)));
    dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="url(#gold)" stroke="#8a6a14" stroke-width="0.8"/>`);
  }
  return dots.join("");
}

function jewellery({ velvet, velvetDark, kind, gem }) {
  let piece = "";
  if (kind === "necklace") {
    piece = `
      <path d="M110 210 A 200 190 0 0 0 490 210" fill="none" stroke="url(#gold)" stroke-width="5"/>
      ${necklaceArc(300, 130, 235, 21, 7)}
      ${necklaceArc(300, 120, 190, 17, 5)}
      <g transform="translate(300 480)">
        <path d="M0 -46 C30 -30 34 8 18 32 C8 48 -8 48 -18 32 C-34 8 -30 -30 0 -46 Z" fill="url(#gold)" stroke="#8a6a14" stroke-width="1.5"/>
        <ellipse cx="0" cy="-2" rx="13" ry="20" fill="${gem}"/>
        <ellipse cx="-4" cy="-9" rx="4" ry="6" fill="rgba(255,255,255,0.55)"/>
        <circle cx="0" cy="44" r="6" fill="url(#gold)"/>
      </g>`;
  } else if (kind === "earrings") {
    const drop = (x) => `
      <g transform="translate(${x} 300)">
        <circle cx="0" cy="-90" r="10" fill="url(#gold)" stroke="#8a6a14"/>
        <path d="M0 -80 L0 -52" stroke="url(#gold)" stroke-width="3"/>
        <path d="M-52 0 A 52 52 0 0 0 52 0 Z" fill="url(#gold)" stroke="#8a6a14" stroke-width="1.4"/>
        <ellipse cx="0" cy="-14" rx="12" ry="16" fill="${gem}"/>
        ${[...Array(7)]
          .map((_, i) => {
            const x2 = -45 + i * 15;
            return `<line x1="${x2}" y1="6" x2="${x2}" y2="26" stroke="url(#gold)" stroke-width="2.4"/><circle cx="${x2}" cy="32" r="4.4" fill="url(#gold)"/>`;
          })
          .join("")}
      </g>`;
    piece = drop(170) + drop(430);
  } else {
    // bangles
    piece = [0, 1, 2]
      .map((i) => {
        const cy = 250 + i * 130;
        return `
        <ellipse cx="300" cy="${cy}" rx="185" ry="60" fill="none" stroke="url(#gold)" stroke-width="16"/>
        <ellipse cx="300" cy="${cy}" rx="185" ry="60" fill="none" stroke="#8a6a14" stroke-width="1.2" opacity="0.7"/>
        ${[...Array(9)]
          .map((_, j) => {
            const t = (Math.PI * 2 * j) / 9;
            const x = 300 + 185 * Math.cos(t);
            const y = cy + 60 * Math.sin(t);
            return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="${gem}"/>`;
          })
          .join("")}`;
      })
      .join("");
  }

  const sparkle = (x, y, s) => `
    <g transform="translate(${x} ${y}) scale(${s})" fill="rgba(255,244,214,0.85)">
      <path d="M0 -8 L1.6 -1.6 L8 0 L1.6 1.6 L0 8 L-1.6 1.6 L-8 0 L-1.6 -1.6 Z"/>
    </g>`;

  return svg(
    `
    <rect width="${W}" height="${H}" fill="url(#velvet)"/>
    <rect width="${W}" height="${H}" fill="url(#weave)"/>
    ${piece}
    ${sparkle(92, 132, 1)} ${sparkle(508, 180, 0.7)} ${sparkle(120, 620, 0.8)} ${sparkle(500, 660, 1.1)}
    <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="${GOLD}" stroke-width="1.2" opacity="0.5"/>
    `,
    `<defs>
      <radialGradient id="velvet" cx="0.5" cy="0.4" r="1">
        <stop offset="0" stop-color="${velvet}"/>
        <stop offset="1" stop-color="${velvetDark}"/>
      </radialGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#e8c96a"/>
        <stop offset="0.5" stop-color="#c9a227"/>
        <stop offset="1" stop-color="#a07f1a"/>
      </linearGradient>
      ${weave("weave", "rgba(255,255,255,0.03)")}
    </defs>`
  );
}

// ---------- cosmetics: minimal product illustration ----------

function cosmetics({ bg, body, cap, kind, accent }) {
  let piece = "";
  if (kind === "lipstick") {
    piece = `
      <g transform="translate(300 430)">
        <rect x="-34" y="0" width="68" height="190" rx="8" fill="${body}"/>
        <rect x="-34" y="0" width="68" height="190" rx="8" fill="url(#sheen)"/>
        <rect x="-26" y="-38" width="52" height="42" rx="4" fill="${cap}"/>
        <path d="M-20 -38 L-20 -120 Q -20 -132 -8 -132 L20 -96 L20 -38 Z" fill="${accent}"/>
        <rect x="-34" y="76" width="68" height="3" fill="rgba(0,0,0,0.12)"/>
        <rect x="-18" y="104" width="36" height="2.4" fill="rgba(0,0,0,0.28)"/>
        <rect x="-12" y="114" width="24" height="2.4" fill="rgba(0,0,0,0.18)"/>
      </g>`;
  } else if (kind === "bottle") {
    piece = `
      <g transform="translate(300 300)">
        <rect x="-70" y="0" width="140" height="300" rx="14" fill="${body}"/>
        <rect x="-70" y="0" width="140" height="300" rx="14" fill="url(#sheen)"/>
        <rect x="-26" y="-64" width="52" height="70" rx="6" fill="${cap}"/>
        <rect x="-8" y="-116" width="16" height="56" rx="6" fill="${cap}"/>
        <circle cx="0" cy="-116" r="14" fill="${cap}"/>
        <rect x="-46" y="86" width="92" height="110" rx="4" fill="rgba(255,255,255,0.85)"/>
        <rect x="-30" y="112" width="60" height="3" fill="${accent}"/>
        <rect x="-22" y="126" width="44" height="2.4" fill="rgba(0,0,0,0.25)"/>
        <rect x="-26" y="138" width="52" height="2.4" fill="rgba(0,0,0,0.15)"/>
      </g>`;
  } else {
    // jar
    piece = `
      <g transform="translate(300 420)">
        <rect x="-92" y="-20" width="184" height="180" rx="26" fill="${body}"/>
        <rect x="-92" y="-20" width="184" height="180" rx="26" fill="url(#sheen)"/>
        <rect x="-98" y="-74" width="196" height="58" rx="16" fill="${cap}"/>
        <rect x="-98" y="-52" width="196" height="4" fill="rgba(0,0,0,0.12)"/>
        <rect x="-52" y="26" width="104" height="82" rx="4" fill="rgba(255,255,255,0.88)"/>
        <rect x="-34" y="48" width="68" height="3" fill="${accent}"/>
        <rect x="-26" y="62" width="52" height="2.4" fill="rgba(0,0,0,0.25)"/>
        <rect x="-30" y="74" width="60" height="2.4" fill="rgba(0,0,0,0.15)"/>
      </g>`;
  }

  return svg(
    `
    <rect width="${W}" height="${H}" fill="${bg}"/>
    <circle cx="300" cy="400" r="235" fill="rgba(255,255,255,0.35)"/>
    <ellipse cx="300" cy="652" rx="150" ry="18" fill="rgba(0,0,0,0.10)"/>
    ${piece}
    <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="rgba(0,0,0,0.10)" stroke-width="1.2"/>
    `,
    `<defs>
      <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="rgba(255,255,255,0.25)"/>
        <stop offset="0.35" stop-color="rgba(255,255,255,0)"/>
        <stop offset="1" stop-color="rgba(0,0,0,0.08)"/>
      </linearGradient>
    </defs>`
  );
}

// ---------- catalogue ----------

const images = {
  // sarees — { base, dark, accent }
  "kanjivaram-crimson": saree({ base: "#8c1d2f", dark: "#5e1420", accent: "#2f4f3e" }),
  "banarasi-royal-blue": saree({ base: "#1f3a6e", dark: "#142850", accent: "#7a1f2b" }),
  "kota-doria-sage": saree({ base: "#5e7d5a", dark: "#42593f", accent: "#8c5b2f" }),
  "chiffon-dusk-rose": saree({ base: "#b06a72", dark: "#8a4e56", accent: "#4a3752" }),
  "cotton-mustard": saree({ base: "#c08a2d", dark: "#96691f", accent: "#5e1420" }),
  "georgette-emerald": saree({ base: "#1e5c46", dark: "#143f30", accent: "#8c1d2f" }),
  "silk-aubergine": saree({ base: "#4d2a4e", dark: "#371d38", accent: "#8c5b2f" }),
  "linen-ivory-gold": saree({ base: "#c9b891", dark: "#a5946e", accent: "#7a1f2b" }),

  // dress material — { base, dark, accent, light }
  "chanderi-teal-suit": dressMaterial({ base: "#20616b", dark: "#174a52", accent: "#8c1d2f", light: "#bfe3e8" }),
  "cotton-block-indigo": dressMaterial({ base: "#2b3a67", dark: "#1f2b4e", accent: "#c08a2d", light: "#c6d2f0" }),
  "crepe-blush-suit": dressMaterial({ base: "#c48d94", dark: "#a06e75", accent: "#4a3752", light: "#f4dde0" }),
  "rayon-forest-suit": dressMaterial({ base: "#3f5d43", dark: "#2d4530", accent: "#b06a2a", light: "#cfe4d1" }),
  "silk-cotton-ochre": dressMaterial({ base: "#b07b2e", dark: "#8a5f20", accent: "#5e1420", light: "#f0dcb4" }),

  // jewellery — { velvet, velvetDark, kind, gem }
  "kundan-bridal-necklace": jewellery({ velvet: "#4a1522", velvetDark: "#2b0c14", kind: "necklace", gem: "#9b1c31" }),
  "temple-gold-necklace": jewellery({ velvet: "#233042", velvetDark: "#141d2b", kind: "necklace", gem: "#1e5c46" }),
  "chandbali-earrings": jewellery({ velvet: "#3a2547", velvetDark: "#241531", kind: "earrings", gem: "#9b1c31" }),
  "pearl-drop-earrings": jewellery({ velvet: "#1e3d38", velvetDark: "#122622", kind: "earrings", gem: "#f2ece0" }),
  "antique-gold-bangles": jewellery({ velvet: "#42210f", velvetDark: "#2a1509", kind: "bangles", gem: "#9b1c31" }),

  // cosmetics — { bg, body, cap, kind, accent }
  "velvet-matte-lipstick": cosmetics({ bg: "#f3e2e0", body: "#2b2320", cap: "#1c1614", kind: "lipstick", accent: "#a52639" }),
  "rose-silk-serum": cosmetics({ bg: "#ece4da", body: "#c8a48a", cap: "#3f3630", kind: "bottle", accent: "#8a5b3e" }),
  "saffron-glow-cream": cosmetics({ bg: "#f0e7d4", body: "#e8d3a3", cap: "#8a5b2a", kind: "jar", accent: "#b0722a" }),
  "kajal-intense-black": cosmetics({ bg: "#e4e2df", body: "#23211f", cap: "#141312", kind: "lipstick", accent: "#111010" }),
  "rosewater-toner": cosmetics({ bg: "#e9dfe4", body: "#d8a7b8", cap: "#4a3540", kind: "bottle", accent: "#a55c78" }),
  "ubtan-face-pack": cosmetics({ bg: "#e9e4cf", body: "#cbb56a", cap: "#5e4b1e", kind: "jar", accent: "#7a6222" }),
};

for (const [name, content] of Object.entries(images)) {
  writeFileSync(join(outDir, `${name}.svg`), content.trim());
}

console.log(`Wrote ${Object.keys(images).length} images to public/products/`);
