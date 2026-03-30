export interface CategoryStyle {
  /** Tailwind bg-linear-to-br gradient stop classes */
  gradient: string;
  /** Representative emoji for the category */
  emoji: string;
  /** A warm accent colour token used for borders / chips */
  accent: string;
}

// ── Named category map ──────────────────────────────────────
const CATEGORY_MAP: Array<{ keywords: string[]; style: CategoryStyle }> = [
  {
    keywords: ["matcha", "tea", "green", "herbal", "chai"],
    style: {
      gradient: "from-[#1b3a22] via-[#2a5530] to-[#3e7a46]",
      emoji: "\uD83C\uDF75",
      accent: "emerald",
    },
  },
  {
    keywords: ["cold", "brew", "ice", "iced", "frappe", "frapp"],
    style: {
      gradient: "from-[#0d2240] via-[#153461] to-[#1d4d85]",
      emoji: "\uD83E\uDDCA",
      accent: "sky",
    },
  },
  {
    keywords: ["smoothie", "fruit", "juice", "berry", "mango", "strawberry"],
    style: {
      gradient: "from-[#43071a] via-[#6b1129] to-[#8f1a3a]",
      emoji: "\uD83E\uDD64",
      accent: "rose",
    },
  },
  {
    keywords: ["pastry", "food", "snack", "cake", "bread", "croissant", "waffle", "muffin", "cookie"],
    style: {
      gradient: "from-[#3d1c07] via-[#5e2e10] to-[#7a4418]",
      emoji: "\uD83E\uDD50",
      accent: "orange",
    },
  },
  {
    keywords: ["latte", "cappuccino", "espresso", "mocha", "macchiato", "flat white", "americano"],
    style: {
      gradient: "from-[#2e1505] via-[#4a2209] to-[#6b340f]",
      emoji: "\u2615",
      accent: "amber",
    },
  },
];

// ── Fallback palette – cycles by seed so null-category items vary ────────────
const FALLBACK: CategoryStyle[] = [
  { gradient: "from-[#2e1505] via-[#4a2209] to-[#6b340f]", emoji: "\u2615", accent: "amber" },
  { gradient: "from-[#1b3a22] via-[#2a5530] to-[#3e7a46]", emoji: "\uD83C\uDF75", accent: "emerald" },
  { gradient: "from-[#0d2240] via-[#153461] to-[#1d4d85]", emoji: "\uD83E\uDDCA", accent: "sky" },
  { gradient: "from-[#43071a] via-[#6b1129] to-[#8f1a3a]", emoji: "\uD83E\uDD64", accent: "rose" },
  { gradient: "from-[#3d1c07] via-[#5e2e10] to-[#7a4418]", emoji: "\uD83E\uDD50", accent: "orange" },
];

/** Simple djb2-style hash so a seed string maps deterministically to a palette index. */
function hashSeed(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h) ^ seed.charCodeAt(i);
  return Math.abs(h);
}

/**
 * Return the visual style for a product.
 * @param category  Product category string (can be null)
 * @param seed      Fallback uniqueness seed – use product id or name so cards vary
 */
export function getCategoryStyle(category: string | null, seed = ""): CategoryStyle {
  const cat = (category ?? "").toLowerCase().trim();

  if (cat) {
    for (const entry of CATEGORY_MAP) {
      if (entry.keywords.some((kw) => cat.includes(kw))) return entry.style;
    }
    // Unknown category name but non-null – hash the category string
    return FALLBACK[hashSeed(cat) % FALLBACK.length];
  }

  // No category at all – cycle based on product seed (id/name)
  return FALLBACK[hashSeed(seed || "default") % FALLBACK.length];
}
