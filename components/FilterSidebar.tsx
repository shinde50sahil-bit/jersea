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
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

const sizes: (ProductSize | "All")[] = [
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
  "28",
];

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Newest First", value: "Newest" },
  { label: "Price: Low to High", value: "Price" },
];

const chipBase = "rounded-full px-3 py-1 text-sm font-medium transition-colors";

export default function FilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedSize,
  onSizeChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchQueryChange,
}: FilterSidebarProps) {
  const categoryOptions = ["All", ...categories];
  const ease = [0.25, 0.1, 0.25, 1];

  return (
    <motion.aside
      className="sticky top-24 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Shop Filters</h2>
          <p className="mt-1 text-sm text-gray-400">
            Refine your jersey search with style.
          </p>
        </div>

        {/* Search */}
        <div>
          <label htmlFor="product-search" className="sr-only">Search</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">⌕</span>
            <input
              id="product-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search by name, team, category..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-cyan-400/70 focus:bg-white/10 outline-none transition"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-300">Category</p>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`${chipBase} ${selectedCategory === cat ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-300">Size</p>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onSizeChange(size)}
                className={`${chipBase} ${selectedSize === size ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-300">Sort By</p>
          <div className="space-y-2">
            {sortOptions.map((opt) => {
              const active = sortBy === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSortChange(opt.value)}
                  className={`flex w-full items-center justify-between rounded-full px-4 py-2 text-left transition ${active ? "bg-cyan-400/20 text-white border border-cyan-400" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`h-3 w-3 rounded-full border ${active ? "border-cyan-300" : "border-gray-600"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
