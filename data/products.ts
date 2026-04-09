import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "JER-1001",
    slug: "argentina-1994-revival-kit",
    name: "Argentina 1994 Revival Kit",
    category: "Football",
    price: 3299,
    image:
      "https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Retro football energy with a sharp match-day silhouette.",
    addedAt: "2026-01-25",
    sizes: ["S", "M", "L", "XL"],
    stock: 18
  },
  {
    id: "JER-1002",
    slug: "ac-milan-night-shift-jersey",
    name: "AC Milan Night Shift Jersey",
    category: "Football",
    price: 2899,
    image:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80",
    shortDescription: "A darker street-ready football jersey with club-inspired contrast.",
    addedAt: "2026-02-05",
    sizes: ["M", "L", "XL"],
    stock: 14
  },
  {
    id: "JER-1003",
    slug: "monaco-grid-f1-teamwear",
    name: "Monaco Grid F1 Teamwear",
    category: "F1",
    price: 3799,
    image:
      "https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Pit-lane inspired teamwear built for bold weekend fits.",
    addedAt: "2026-02-02",
    sizes: ["S", "M", "L"],
    stock: 10
  },
  {
    id: "JER-1004",
    slug: "velocity-gp-pitlane-edition",
    name: "Velocity GP Pitlane Edition",
    category: "F1",
    price: 3599,
    image:
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Racing graphics and relaxed proportions for everyday wear.",
    addedAt: "2026-01-18",
    sizes: ["M", "L", "XL"],
    stock: 12
  },
  {
    id: "JER-1005",
    slug: "india-odi-skyline-jersey",
    name: "India ODI Skyline Jersey",
    category: "Cricket",
    price: 2699,
    image:
      "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Clean cricket styling with a bright one-day match palette.",
    addedAt: "2026-02-09",
    sizes: ["S", "M", "L", "XL"],
    stock: 16
  },
  {
    id: "JER-1006",
    slug: "melbourne-smash-club-kit",
    name: "Melbourne Smash Club Kit",
    category: "Cricket",
    price: 2499,
    image:
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Club-ready cricket jersey with lightweight training energy.",
    addedAt: "2026-01-30",
    sizes: ["S", "M", "L"],
    stock: 9
  }
];
