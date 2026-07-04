// Development seed: admin + demo customer, categories, and a starter catalogue.
// Run with: npm run db:seed   (safe to re-run — it upserts)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const categories = [
  { name: "Sarees", slug: "sarees", tagline: "Handpicked weaves for every occasion" },
  { name: "Dress Material", slug: "dress-material", tagline: "Unstitched suits & fabrics" },
  { name: "Jewellery", slug: "jewellery", tagline: "Traditional pieces that hold their shine" },
  { name: "Cosmetics", slug: "cosmetics", tagline: "Everyday beauty essentials" },
];

type SeedProduct = {
  name: string;
  slug: string;
  category: string;
  price: number;
  mrp: number;
  stock: number;
  fabric?: string;
  featured?: boolean;
  description: string;
};

const products: SeedProduct[] = [
  // ---- Sarees ----
  {
    name: "Kanjivaram Silk Saree — Crimson & Gold",
    slug: "kanjivaram-crimson",
    category: "sarees",
    price: 4499, mrp: 6999, stock: 12, featured: true,
    fabric: "Pure Kanjivaram silk, contrast zari border",
    description:
      "A rich crimson Kanjivaram with traditional gold buttis and a deep contrast border. Woven on handlooms, this drape holds its fall beautifully through long functions — a wedding-season staple. Blouse piece included.",
  },
  {
    name: "Banarasi Saree — Royal Blue",
    slug: "banarasi-royal-blue",
    category: "sarees",
    price: 3799, mrp: 5499, stock: 9, featured: true,
    fabric: "Banarasi art silk, zari jangla work",
    description:
      "Classic Banarasi weave in a deep royal blue with all-over zari buttis and an ornate pallu. Light enough for evening functions, grand enough for the mandap. Blouse piece included.",
  },
  {
    name: "Kota Doria Saree — Sage Green",
    slug: "kota-doria-sage",
    category: "sarees",
    price: 1899, mrp: 2799, stock: 18,
    fabric: "Kota doria cotton-silk, khat weave",
    description:
      "Feather-light Kota doria in a calm sage green with fine gold checks. The airiest saree in the store — ideal for daytime events and office wear through summer.",
  },
  {
    name: "Chiffon Saree — Dusk Rose",
    slug: "chiffon-dusk-rose",
    category: "sarees",
    price: 1499, mrp: 2299, stock: 22,
    fabric: "Georgette-chiffon, satin border",
    description:
      "Soft dusk-rose chiffon with a slim woven border. Drapes close and flatters every frame; pairs well with both pearls and oxidised silver.",
  },
  {
    name: "Handloom Cotton Saree — Mustard",
    slug: "cotton-mustard",
    category: "sarees",
    price: 1199, mrp: 1799, stock: 25,
    fabric: "Handloom mul cotton, temple border",
    description:
      "Everyday handloom cotton in warm mustard with a maroon temple border. Breathable, low-maintenance, and gets softer with every wash.",
  },
  {
    name: "Georgette Saree — Emerald",
    slug: "georgette-emerald",
    category: "sarees",
    price: 1699, mrp: 2599, stock: 15,
    fabric: "Pure georgette, sequin highlights",
    description:
      "Jewel-tone emerald georgette with scattered gold accents that catch the light as you move. A dependable pick for receptions and festive evenings.",
  },
  {
    name: "Soft Silk Saree — Aubergine",
    slug: "silk-aubergine",
    category: "sarees",
    price: 2899, mrp: 4299, stock: 10, featured: true,
    fabric: "Soft mysore-style silk, gold buttis",
    description:
      "Deep aubergine soft silk that needs no ironing fuss — drape and go. Understated gold buttis and a tissue-gold border keep it elegant, not loud.",
  },
  {
    name: "Linen Saree — Ivory Gold",
    slug: "linen-ivory-gold",
    category: "sarees",
    price: 2199, mrp: 3199, stock: 14,
    fabric: "Linen-zari blend",
    description:
      "Minimal ivory linen with a whisper of gold at the border. The saree equivalent of a crisp white shirt — quietly premium, endlessly wearable.",
  },

  // ---- Dress material ----
  {
    name: "Chanderi Suit Set — Teal",
    slug: "chanderi-teal-suit",
    category: "dress-material",
    price: 2299, mrp: 3399, stock: 16, featured: true,
    fabric: "Chanderi silk-cotton top, santoon bottom, chiffon dupatta",
    description:
      "Unstitched three-piece set: sheer-glow Chanderi top in teal, matching bottom, and a contrast maroon dupatta with gold edging. Tailor it your way.",
  },
  {
    name: "Block-Print Cotton Suit — Indigo",
    slug: "cotton-block-indigo",
    category: "dress-material",
    price: 1399, mrp: 1999, stock: 20,
    fabric: "Sanganeri block-print cotton, 2.5m + 2.5m + 2.25m dupatta",
    description:
      "Hand block-printed indigo cotton with a mustard border dupatta. Breathable everyday wear with that unmistakable Sanganeri character.",
  },
  {
    name: "Crepe Suit Set — Blush",
    slug: "crepe-blush-suit",
    category: "dress-material",
    price: 1599, mrp: 2399, stock: 18,
    fabric: "Wrinkle-free crepe, printed dupatta",
    description:
      "Soft blush crepe that resists wrinkles through a full workday. Subtle tonal print with a plum dupatta — office-friendly and travel-friendly.",
  },
  {
    name: "Rayon Suit Set — Forest",
    slug: "rayon-forest-suit",
    category: "dress-material",
    price: 1149, mrp: 1699, stock: 24,
    fabric: "Premium rayon, gold-print highlights",
    description:
      "Deep forest-green rayon with fine gold block accents and a rust dupatta. Falls well, breathes well, and takes embroidery beautifully if you want to customise.",
  },
  {
    name: "Silk-Cotton Suit — Ochre",
    slug: "silk-cotton-ochre",
    category: "dress-material",
    price: 1899, mrp: 2799, stock: 12,
    fabric: "South silk-cotton, zari border dupatta",
    description:
      "Festive ochre silk-cotton with a maroon zari-border dupatta. Rich enough for functions, sturdy enough to become your favourite tailored suit.",
  },

  // ---- Jewellery ----
  {
    name: "Kundan Bridal Necklace Set",
    slug: "kundan-bridal-necklace",
    category: "jewellery",
    price: 3499, mrp: 5299, stock: 6, featured: true,
    fabric: "Gold-plated brass, kundan stones, pearl drops",
    description:
      "Statement kundan set with matching earrings — layered stone work with a ruby-red centre drop. Skin-safe plating; comes in a velvet gift box.",
  },
  {
    name: "Temple Necklace — Antique Gold",
    slug: "temple-gold-necklace",
    category: "jewellery",
    price: 2199, mrp: 3299, stock: 8,
    fabric: "Antique gold finish, emerald-green accents",
    description:
      "South-temple style necklace with coin and bead detailing. Pairs perfectly with silk sarees; matching jhumkas included.",
  },
  {
    name: "Chandbali Earrings — Ruby",
    slug: "chandbali-earrings",
    category: "jewellery",
    price: 899, mrp: 1399, stock: 20, featured: true,
    fabric: "Gold-plated, ruby-tone stones, hanging beads",
    description:
      "Classic crescent chandbalis with ruby-tone centres and delicate bead fringe. Light on the ear despite the grand look.",
  },
  {
    name: "Pearl Drop Earrings",
    slug: "pearl-drop-earrings",
    category: "jewellery",
    price: 649, mrp: 999, stock: 26,
    fabric: "Shell pearls, gold-plated hooks",
    description:
      "Everyday pearl drops that go from kurta to saree without trying. Nickel-free hooks, gift-boxed.",
  },
  {
    name: "Antique Gold Bangles — Set of 6",
    slug: "antique-gold-bangles",
    category: "jewellery",
    price: 1299, mrp: 1899, stock: 15,
    fabric: "Brass with antique gold finish, stone studding",
    description:
      "Six slim bangles with alternating stone-studded and plain textures. Sold as a set; sizes 2.4, 2.6 and 2.8 available.",
  },

  // ---- Cosmetics ----
  {
    name: "Velvet Matte Lipstick — Rani Pink",
    slug: "velvet-matte-lipstick",
    category: "cosmetics",
    price: 449, mrp: 599, stock: 40, featured: true,
    fabric: "Long-stay matte, enriched with shea butter",
    description:
      "One-swipe payoff in a true rani pink that flatters Indian skin tones. Stays through chai and conversations; never cakes or bleeds.",
  },
  {
    name: "Rose Silk Face Serum",
    slug: "rose-silk-serum",
    category: "cosmetics",
    price: 699, mrp: 899, stock: 30,
    fabric: "Rosehip + hyaluronic acid, 30ml",
    description:
      "Lightweight glow serum with rosehip oil and hyaluronic acid. Two drops under moisturiser gives that lit-from-within finish.",
  },
  {
    name: "Saffron Glow Day Cream",
    slug: "saffron-glow-cream",
    category: "cosmetics",
    price: 549, mrp: 749, stock: 34,
    fabric: "Kesar + niacinamide, SPF 15, 50g",
    description:
      "Daily brightening cream with real saffron and niacinamide. Non-greasy, sits well under makeup, mild SPF for everyday errands.",
  },
  {
    name: "Kajal — Intense Black",
    slug: "kajal-intense-black",
    category: "cosmetics",
    price: 249, mrp: 349, stock: 50,
    fabric: "Smudge-proof, 12-hour wear",
    description:
      "Deep black kajal that glides on smooth and stays put through humid days. Dermatologically tested, safe for waterline.",
  },
  {
    name: "Rosewater Facial Toner",
    slug: "rosewater-toner",
    category: "cosmetics",
    price: 299, mrp: 399, stock: 45,
    fabric: "Steam-distilled rose water, 100ml",
    description:
      "Pure steam-distilled gulab jal in a mist bottle. Tones, refreshes, and doubles as a makeup fixer — keep one in the fridge.",
  },
  {
    name: "Ubtan Face Pack",
    slug: "ubtan-face-pack",
    category: "cosmetics",
    price: 349, mrp: 499, stock: 38,
    fabric: "Turmeric, sandalwood & gram flour, 100g",
    description:
      "The traditional bridal ubtan in a ready-to-use jar. Weekly use brings back that haldi-ceremony glow without the mess.",
  },
];

async function main() {
  // users
  const [admin] = await Promise.all([
    db.user.upsert({
      where: { email: "admin@shringar.local" },
      update: {},
      create: {
        name: "Store Admin",
        email: "admin@shringar.local",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
        phone: "9876543210",
      },
    }),
    db.user.upsert({
      where: { email: "priya@example.com" },
      update: {},
      create: {
        name: "Priya Sharma",
        email: "priya@example.com",
        password: await bcrypt.hash("priya123", 10),
        role: "CUSTOMER",
        phone: "9812345670",
      },
    }),
  ]);

  // categories
  const catBySlug: Record<string, string> = {};
  for (const c of categories) {
    const cat = await db.category.upsert({ where: { slug: c.slug }, update: { tagline: c.tagline }, create: c });
    catBySlug[c.slug] = cat.id;
  }

  // products
  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        mrp: p.mrp,
        stock: p.stock,
        fabric: p.fabric,
        featured: p.featured ?? false,
        image: `/products/${p.slug}.svg`,
        categoryId: catBySlug[p.category],
      },
    });
  }

  console.log(`Seeded ${products.length} products, ${categories.length} categories.`);
  console.log("Admin login:    admin@shringar.local / admin123");
  console.log("Customer login: priya@example.com / priya123");
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
