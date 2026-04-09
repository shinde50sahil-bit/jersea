const bcrypt = require("bcryptjs");
const { connectDatabase } = require("./config/database");
const { env } = require("./config/env");
const { sequelize, User, Product } = require("./models");
const { generateUniqueSlug } = require("./services/product.service");

const sampleProducts = [
  {
    name: "Argentina 1994 Revival Kit",
    shortDescription: "Classic football jersey with a vintage Argentina-inspired look.",
    description:
      "Premium retro football jersey with breathable fabric, stitched crest styling, and a match-day fit designed for everyday wear.",
    category: "Football",
    price: 3299,
    compareAtPrice: 3999,
    imageUrl:
      "https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=900&q=80",
    gallery: [],
    sizes: ["S", "M", "L", "XL"],
    stock: 25,
    sku: "ARG-1994-RETRO",
    isFeatured: true
  },
  {
    name: "Milan Redline Heritage Shirt",
    shortDescription: "Bold football jersey with vintage stripes and streetwear energy.",
    description:
      "A football-inspired shirt with retro striping, soft breathable fabric, and a flattering cut for match day or daily wear.",
    category: "Football",
    price: 2999,
    compareAtPrice: 3699,
    imageUrl:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80",
    gallery: [],
    sizes: ["S", "M", "L", "XL"],
    stock: 22,
    sku: "MIL-REDLINE-01",
    isFeatured: false
  },
  {
    name: "Sao Paulo Street Match Jersey",
    shortDescription: "Football jersey built for fans who like bold color and cleaner detailing.",
    description:
      "A lightweight football jersey with a modern city-inspired palette, moisture-friendly fabric, and a comfortable fit for all-day wear.",
    category: "Football",
    price: 3199,
    compareAtPrice: 3899,
    imageUrl:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80",
    gallery: [],
    sizes: ["M", "L", "XL", "XXL"],
    stock: 16,
    sku: "SAO-STREET-02",
    isFeatured: true
  },
  {
    name: "Royal Derby Fan Edition",
    shortDescription: "Classic football fan jersey with polished contrast accents.",
    description:
      "Designed for supporters who want a clean football look, this jersey blends comfort fabric, structured seams, and standout trim.",
    category: "Football",
    price: 2899,
    compareAtPrice: 3499,
    imageUrl:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80",
    gallery: [],
    sizes: ["S", "M", "L", "XL"],
    stock: 19,
    sku: "ROY-DERBY-03",
    isFeatured: false
  },
  {
    name: "Velocity GP Pitlane Edition",
    shortDescription: "F1 teamwear-inspired jersey for race weekends and streetwear looks.",
    description:
      "A motorsport-inspired jersey with bold panel lines, lightweight stretch fabric, and a comfortable fit for fans who want a sharp paddock look.",
    category: "F1",
    price: 3599,
    compareAtPrice: 4299,
    imageUrl:
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80",
    gallery: [],
    sizes: ["M", "L", "XL"],
    stock: 18,
    sku: "F1-PITLANE-01",
    isFeatured: true
  },
  {
    name: "Monaco Grid Teamwear Jersey",
    shortDescription: "Motorsport jersey with race-grid lines and a sharp paddock feel.",
    description:
      "A premium F1-inspired jersey with dynamic linework, breathable material, and a fit made for race weekends and street styling.",
    category: "F1",
    price: 3799,
    compareAtPrice: 4499,
    imageUrl:
      "https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=900&q=80",
    gallery: [],
    sizes: ["S", "M", "L", "XL"],
    stock: 14,
    sku: "MON-GRID-02",
    isFeatured: true
  },
  {
    name: "Apex Garage Night Jersey",
    shortDescription: "Dark F1-style team jersey with sleek garage graphics.",
    description:
      "A motorsport teamwear jersey with a darker palette, subtle performance graphics, and easy everyday comfort.",
    category: "F1",
    price: 3499,
    compareAtPrice: 4199,
    imageUrl:
      "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=900&q=80",
    gallery: [],
    sizes: ["M", "L", "XL", "XXL"],
    stock: 20,
    sku: "APX-GARAGE-03",
    isFeatured: false
  },
  {
    name: "Sprint Weekend Track Jersey",
    shortDescription: "F1-inspired jersey with fast panel detailing and bright contrast hits.",
    description:
      "A race-ready look designed with bold side panels, quick-dry fabric, and clean sponsor-style graphic placement.",
    category: "F1",
    price: 3399,
    compareAtPrice: 3999,
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    gallery: [],
    sizes: ["S", "M", "L", "XL"],
    stock: 24,
    sku: "SPR-WKND-04",
    isFeatured: false
  },
  {
    name: "India ODI Skyline Jersey",
    shortDescription: "Modern cricket jersey with a clean skyline-inspired pattern.",
    description:
      "A cricket jersey built for comfort with quick-dry fabric, bright detailing, and a versatile fit that works for casual wear or practice sessions.",
    category: "Cricket",
    price: 2699,
    compareAtPrice: 3199,
    imageUrl:
      "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=900&q=80",
    gallery: [],
    sizes: ["S", "M", "L", "XL"],
    stock: 30,
    sku: "IND-ODI-SKY",
    isFeatured: false
  },
  {
    name: "Mumbai Powerplay Cricket Jersey",
    shortDescription: "Cricket jersey with a modern gradient built for fanwear and practice sessions.",
    description:
      "This cricket jersey combines lightweight quick-dry material, a sharp gradient body, and easy movement through the shoulders.",
    category: "Cricket",
    price: 2599,
    compareAtPrice: 3099,
    imageUrl:
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=900&q=80",
    gallery: [],
    sizes: ["S", "M", "L", "XL"],
    stock: 28,
    sku: "MUM-POWER-02",
    isFeatured: false
  },
  {
    name: "Test Match White Elite Jersey",
    shortDescription: "A cleaner cricket jersey inspired by classic long-format style.",
    description:
      "A refined cricket top with crisp detailing, breathable construction, and a polished silhouette that nods to test-match tradition.",
    category: "Cricket",
    price: 2799,
    compareAtPrice: 3299,
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
    gallery: [],
    sizes: ["M", "L", "XL"],
    stock: 15,
    sku: "TEST-WHITE-03",
    isFeatured: true
  },
  {
    name: "Boundary Smash Club Jersey",
    shortDescription: "Cricket jersey with playful energy and everyday comfort.",
    description:
      "A colorful cricket fan jersey featuring soft performance fabric, comfortable structure, and a lively design for weekend games.",
    category: "Cricket",
    price: 2499,
    compareAtPrice: 2999,
    imageUrl:
      "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=900&q=80",
    gallery: [],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 26,
    sku: "BOUND-SMASH-04",
    isFeatured: false
  }
];

async function seed() {
  await connectDatabase();
  await sequelize.sync();

  const adminPasswordHash = await bcrypt.hash(env.seedAdminPassword, 12);

  const [admin, created] = await User.findOrCreate({
    where: { email: env.seedAdminEmail.toLowerCase() },
    defaults: {
      fullName: env.seedAdminName,
      email: env.seedAdminEmail.toLowerCase(),
      passwordHash: adminPasswordHash,
      role: "admin"
    }
  });

  if (!created) {
    await admin.update({
      fullName: env.seedAdminName,
      passwordHash: adminPasswordHash,
      role: "admin"
    });
  }

  for (const item of sampleProducts) {
    const existing = await Product.findOne({
      where: { sku: item.sku }
    });

    if (!existing) {
      const slug = await generateUniqueSlug(item.name);
      await Product.create({
        ...item,
        slug
      });
    }
  }

  console.log("Seed completed successfully");
  console.log(`Admin email: ${env.seedAdminEmail}`);
  console.log(`Admin password: ${env.seedAdminPassword}`);

  await sequelize.close();
}

seed().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
