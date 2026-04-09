"use client";

import { motion } from "framer-motion";
import { ProductCategory, ProductSize, SortOption } from "@/types/product";

type FilterSidebarProps = {
  categories: ProductCategory[];
  selectedCategory: ProductCategory | "All";
  onCategoryChange: (value: ProductCategory | "All") => void;
  selectedSize: ProductSize | "All";
  onSizeChange: (value: ProductSize | "All") => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
};

const sizes: Array<ProductSize | "All"> = [
  "All",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28"
];
const sortOptions: SortOption[] = ["Newest", "Price"];
const easeFlow = [0.25, 0.1, 0.25, 1];

function optionClass(isActive: boolean): string {
  return `rounded-xl border px-3 py-2 text-sm transition-all duration-300 ${
    isActive
      ? "border-jersea-neonBlue bg-jersea-neonBlue/15 text-jersea-neonBlue"
      : "border-white/12 bg-white/[0.02] text-slate-300 hover:border-jersea-pink/60 hover:text-white"
  }`;
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedSize,
  onSizeChange,
  sortBy,
  onSortChange
}: FilterSidebarProps) {
  const categoryOptions: Array<ProductCategory | "All"> = ["All", ...categories];

  return (
    <motion.aside
      className="mb-6 rounded-2xl border border-white/10 bg-jersea-surface/80 p-5 backdrop-blur-lg lg:sticky lg:top-24 lg:mb-0 lg:h-fit"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: easeFlow }}
    >
      <h2 className="mb-1 text-lg font-semibold text-white">Filters</h2>
      <p className="mb-5 text-xs uppercase tracking-[0.16em] text-jersea-muted">
        Flipkart Style Discovery
      </p>

      <div className="mb-6">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-jersea-muted">
          Categories
        </p>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {categoryOptions.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={optionClass(selectedCategory === category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-jersea-muted">
          Sizes
        </p>
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-3">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onSizeChange(size)}
              className={optionClass(selectedSize === size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-jersea-muted">
          Sort By
        </p>
        <div className="grid grid-cols-2 gap-2">
          {sortOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSortChange(option)}
              className={optionClass(sortBy === option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
