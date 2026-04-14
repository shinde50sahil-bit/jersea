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

const sortOptions: Array<{
  label: string;
  value: SortOption;
}> = [
  {
    label: "Newest First",
    value: "Newest"
  },
  {
    label: "Price: Low to High",
    value: "Price"
  }
];

const easeFlow = [0.25, 0.1, 0.25, 1];

function FilterChip({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "border-cyan-400 bg-cyan-400/15 text-cyan-300 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-400/40 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedSize,
  onSizeChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchQueryChange
}: FilterSidebarProps) {
  const categoryOptions: Array<ProductCategory | "All"> = ["All", ...categories];

  return (
    <motion.aside
      className="mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:sticky lg:top-24 lg:mb-0 lg:h-fit"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: easeFlow }}
    >
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
          Smart Discovery
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Shop Filters</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Search and narrow down jerseys with a filter panel designed for the
          Jersea storefront.
        </p>
      </div>

      <div className="space-y-6 px-5 py-5">
        <div>
          <label
            htmlFor="product-search"
            className="mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            Search
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              ⌕
            </span>
            <input
              id="product-search"
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search by name, team, category..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:bg-white/[0.06]"
            />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Category
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((category) => (
              <FilterChip
                key={category}
                label={category}
                active={selectedCategory === category}
                onClick={() => onCategoryChange(category)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Size
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <FilterChip
                key={size}
                label={size}
                active={selectedSize === size}
                onClick={() => onSizeChange(size)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Sort By
          </p>
          <div className="space-y-2">
            {sortOptions.map((option) => {
              const active = sortBy === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSortChange(option.value)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-cyan-400/60 bg-cyan-400/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  <span
                    className={`h-4 w-4 rounded-full border ${
                      active
                        ? "border-cyan-300 shadow-[inset_0_0_0_4px_#67e8f9]"
                        : "border-slate-500"
                    }`}
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
