"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCategory, ProductSize, SortOption } from "@/types/product";

type ModernFilterProps = {
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
  "All", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "16", "18", "20", "22", "24", "26", "28"
];

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Newest First", value: "Newest" },
  { label: "Price: Low to High", value: "Price" },
];

export default function ModernFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedSize,
  onSizeChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchQueryChange,
}: ModernFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const categoryOptions = ["All", ...categories];

  const clearAll = () => {
    onCategoryChange("All");
    onSizeChange("All");
    onSortChange("Newest");
    onSearchQueryChange("");
  };

  const hasActiveFilters = 
    selectedCategory !== "All" || 
    selectedSize !== "All" || 
    sortBy !== "Newest" || 
    searchQuery !== "";

  return (
    <motion.aside
      className="sticky top-24 z-10 w-full max-w-[280px]"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        {/* Glow effect */}
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-[80px]" />
        
        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              Discovery
            </h2>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/40 hover:text-white transition-colors"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-8 overflow-hidden"
              >
                {/* Search */}
                <div className="group">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Search</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => onSearchQueryChange(e.target.value)}
                      placeholder="Type to search..."
                      className="w-full rounded-2xl border border-white/5 bg-white/[0.02] py-3 pl-4 pr-10 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-cyan-500/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </span>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
                          selectedCategory === cat
                            ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                            : "border-white/5 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Size</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => onSizeChange(size)}
                        className={`flex h-8 items-center justify-center rounded-lg border text-[10px] font-bold transition-all duration-300 ${
                          selectedSize === size
                            ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                            : "border-white/5 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Order By</p>
                  <div className="space-y-1.5">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => onSortChange(opt.value)}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold transition-all duration-300 ${
                          sortBy === opt.value
                            ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                            : "border-white/5 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {opt.label}
                        {sortBy === opt.value && (
                          <motion.div layoutId="sortDot" className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear All */}
                <AnimatePresence>
                  {hasActiveFilters && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={clearAll}
                      className="w-full rounded-2xl border border-red-500/20 bg-red-500/5 py-3 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Clear All Filters
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
