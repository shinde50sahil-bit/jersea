"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCategory, ProductSize, SortOption } from "@/types/product";

export type PriceRange = { min: number; max: number };

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
  priceRange: PriceRange;
  onPriceRangeChange: (range: PriceRange) => void;
  maxPrice: number;
  productCount: number;
};

const sizes: (ProductSize | "All")[] = [
  "All", "S", "M", "L", "XL", "XXL", "3XL", "4XL",
  "16", "18", "20", "22", "24", "26", "28",
];

const sortOptions: { label: string; value: SortOption; icon: string }[] = [
  { label: "Newest First", value: "Newest", icon: "✦" },
  { label: "Price: Low to High", value: "Price", icon: "↑" },
];

/* ─── tiny accordion section ─────────────────────────────────────── */
function Section({
  title,
  defaultOpen = true,
  badge,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.06] pb-4 last:border-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <span className="flex items-center gap-2 text-[0.72rem] font-black uppercase tracking-[0.22em] text-white/60">
          {title}
          {badge !== undefined && badge > 0 && (
            <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-cyan-500 px-1 text-[0.6rem] font-bold text-black">
              {badge}
            </span>
          )}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/30 text-xs"
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-1 pt-0.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── dual-thumb price slider ─────────────────────────────────────── */
function PriceSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: PriceRange;
  onChange: (r: PriceRange) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"min" | "max" | null>(null);

  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  const getValueFromEvent = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return 0;
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      const raw = min + ratio * (max - min);
      return Math.round(raw / 500) * 500;
    },
    [min, max]
  );

  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const clientX =
        "touches" in e ? e.touches[0].clientX : e.clientX;
      const v = getValueFromEvent(clientX);
      if (dragging.current === "min") {
        onChange({ min: clamp(v, min, value.max - 500), max: value.max });
      } else {
        onChange({ min: value.min, max: clamp(v, value.min + 500, max) });
      }
    };
    const up = () => { dragging.current = null; };
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, [getValueFromEvent, min, max, value, onChange]);

  return (
    <div className="px-1 pt-2 pb-4">
      <div className="mb-3 flex justify-between text-xs font-semibold text-white/70">
        <span>₹{value.min.toLocaleString("en-IN")}</span>
        <span>₹{value.max.toLocaleString("en-IN")}</span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-1.5 w-full rounded-full bg-white/10"
      >
        {/* Active range fill */}
        <div
          className="absolute h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
          style={{
            left: `${pct(value.min)}%`,
            right: `${100 - pct(value.max)}%`,
          }}
        />

        {/* Min thumb */}
        <button
          type="button"
          onMouseDown={() => { dragging.current = "min"; }}
          onTouchStart={() => { dragging.current = "min"; }}
          style={{ left: `${pct(value.min)}%` }}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-cyan-400 bg-[#0f1923] shadow-lg shadow-cyan-500/30 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-transform hover:scale-125"
        />

        {/* Max thumb */}
        <button
          type="button"
          onMouseDown={() => { dragging.current = "max"; }}
          onTouchStart={() => { dragging.current = "max"; }}
          style={{ left: `${pct(value.max)}%` }}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-cyan-400 bg-[#0f1923] shadow-lg shadow-cyan-500/30 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-transform hover:scale-125"
        />
      </div>
    </div>
  );
}

/* ─── main sidebar ────────────────────────────────────────────────── */
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
  priceRange,
  onPriceRangeChange,
  maxPrice,
  productCount,
}: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const categoryOptions: (ProductCategory | "All")[] = ["All", ...categories];

  const activeCount = [
    selectedCategory !== "All",
    selectedSize !== "All",
    sortBy !== "Newest",
    searchQuery !== "",
    priceRange.min > 0 || priceRange.max < maxPrice,
  ].filter(Boolean).length;

  const clearAll = () => {
    onCategoryChange("All");
    onSizeChange("All");
    onSortChange("Newest");
    onSearchQueryChange("");
    onPriceRangeChange({ min: 0, max: maxPrice });
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-sm font-bold text-white">Filters</h2>
          <p className="text-[0.68rem] text-white/40 mt-0.5">
            {productCount} result{productCount !== 1 ? "s" : ""}
          </p>
        </div>
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={clearAll}
              className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Clear ({activeCount})
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Active filter chips ────────────────────────── */}
      <AnimatePresence>
        {activeCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-5 pt-3"
          >
            <div className="flex flex-wrap gap-1.5 pb-3 border-b border-white/[0.06]">
              {selectedCategory !== "All" && (
                <Chip label={selectedCategory} onRemove={() => onCategoryChange("All")} />
              )}
              {selectedSize !== "All" && (
                <Chip label={`Size: ${selectedSize}`} onRemove={() => onSizeChange("All")} />
              )}
              {sortBy !== "Newest" && (
                <Chip label="Price ↑" onRemove={() => onSortChange("Newest")} />
              )}
              {searchQuery !== "" && (
                <Chip label={`"${searchQuery}"`} onRemove={() => onSearchQueryChange("")} />
              )}
              {(priceRange.min > 0 || priceRange.max < maxPrice) && (
                <Chip
                  label={`₹${priceRange.min.toLocaleString("en-IN")}–₹${priceRange.max.toLocaleString("en-IN")}`}
                  onRemove={() => onPriceRangeChange({ min: 0, max: maxPrice })}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scrollable body ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">

        {/* Search */}
        <Section title="Search">
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              id="filter-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Name, team, SKU…"
              className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-2.5 pl-9 pr-9 text-xs text-white placeholder:text-white/20 outline-none transition focus:border-cyan-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_16px_rgba(34,211,238,0.08)]"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  type="button"
                  onClick={() => onSearchQueryChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  ✕
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </Section>

        {/* Category */}
        <Section
          title="Category"
          badge={selectedCategory !== "All" ? 1 : undefined}
        >
          <div className="space-y-0.5 mt-1">
            {categoryOptions.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-cyan-500/15 text-cyan-300"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {/* Custom radio */}
                  <span
                    className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
                      active
                        ? "border-cyan-400 bg-cyan-400"
                        : "border-white/20"
                    }`}
                  >
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-black" />
                    )}
                  </span>
                  <span className="flex-1 text-left">{cat === "All" ? "All Categories" : cat}</span>
                  {active && (
                    <motion.span
                      layoutId="catCheck"
                      className="text-cyan-400 text-[0.6rem]"
                    >
                      ✓
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Price Range */}
        <Section title="Price Range" badge={priceRange.min > 0 || priceRange.max < maxPrice ? 1 : undefined}>
          {maxPrice > 0 && (
            <PriceSlider
              min={0}
              max={maxPrice}
              value={priceRange}
              onChange={onPriceRangeChange}
            />
          )}
          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {[
              { label: "Under ₹1k", min: 0, max: 1000 },
              { label: "₹1k–2k", min: 1000, max: 2000 },
              { label: "₹2k–4k", min: 2000, max: 4000 },
              { label: "₹4k+", min: 4000, max: maxPrice },
            ]
              .filter((p) => p.max <= maxPrice || p.min < maxPrice)
              .map((preset) => {
                const active =
                  priceRange.min === preset.min &&
                  priceRange.max === Math.min(preset.max, maxPrice);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      onPriceRangeChange({
                        min: preset.min,
                        max: Math.min(preset.max, maxPrice),
                      })
                    }
                    className={`rounded-lg border px-2.5 py-1 text-[0.65rem] font-semibold transition-all ${
                      active
                        ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
                        : "border-white/[0.08] bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
          </div>
        </Section>

        {/* Size */}
        <Section title="Size" badge={selectedSize !== "All" ? 1 : undefined}>
          <div className="grid grid-cols-4 gap-1.5 mt-1">
            {sizes.map((size) => {
              const active = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onSizeChange(size)}
                  className={`flex h-9 items-center justify-center rounded-lg border text-[0.68rem] font-bold transition-all duration-200 ${
                    active
                      ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                      : "border-white/[0.07] bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Sort */}
        <Section title="Sort By" badge={sortBy !== "Newest" ? 1 : undefined}>
          <div className="space-y-1.5 mt-1">
            {sortOptions.map((opt) => {
              const active = sortBy === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSortChange(opt.value)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "border-cyan-500/50 bg-cyan-500/[0.12] text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.12)]"
                      : "border-white/[0.06] bg-white/[0.02] text-white/45 hover:border-white/15 hover:text-white"
                  }`}
                >
                  <span
                    className={`text-base leading-none ${active ? "text-cyan-400" : "text-white/20"}`}
                  >
                    {opt.icon}
                  </span>
                  <span className="flex-1 text-left">{opt.label}</span>
                  {active && (
                    <motion.div
                      layoutId="sortDot"
                      className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <motion.aside
        className="hidden lg:flex sticky top-24 h-[calc(100vh-7rem)] w-[270px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b1520]/80 backdrop-blur-2xl shadow-[0_4px_40px_rgba(0,0,0,0.5)]"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/8 blur-[60px]" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-blue-600/6 blur-[50px]" />
        <div className="relative z-10 flex h-full flex-col">{sidebarContent}</div>
      </motion.aside>

      {/* ── Mobile trigger ──────────────────────────────── */}
      <div className="lg:hidden">
        <button
          type="button"
          id="mobile-filter-toggle"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="4" x2="14" y2="4" /><line x1="10" y1="4" x2="3" y2="4" />
            <line x1="21" y1="12" x2="12" y2="12" /><line x1="8" y1="12" x2="3" y2="12" />
            <line x1="21" y1="20" x2="16" y2="20" /><line x1="12" y1="20" x2="3" y2="20" />
            <line x1="14" y1="2" x2="14" y2="6" /><line x1="8" y1="10" x2="8" y2="14" />
            <line x1="16" y1="18" x2="16" y2="22" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[0.6rem] font-bold text-black">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile drawer ───────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col overflow-hidden border-r border-white/10 bg-[#0b1520] shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <span className="text-sm font-bold text-white">Filters</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
              <div className="border-t border-white/[0.06] p-4">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-full rounded-xl bg-cyan-500 py-3 text-xs font-bold uppercase tracking-widest text-black transition hover:bg-cyan-400"
                >
                  Show {productCount} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── filter chip ─────────────────────────────────────────────────── */
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center gap-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-[0.62rem] font-semibold text-cyan-300"
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="text-cyan-400/60 hover:text-cyan-200 transition-colors leading-none"
      >
        ✕
      </button>
    </motion.span>
  );
}
