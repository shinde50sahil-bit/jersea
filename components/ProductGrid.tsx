"use client";

import { motion } from "framer-motion";
import { Product, ProductSize } from "@/types/product";
import ProductCard from "@/components/ProductCard";

type ProductGridProps = {
  products: Product[];
  addingProductId: string | null;
  onAddToCart: (productId: string, size: ProductSize) => Promise<void>;
};

const easeFlow = [0.25, 0.1, 0.25, 1];

export default function ProductGrid({
  products,
  addingProductId,
  onAddToCart
}: ProductGridProps) {
  const animationKey = products.map((product) => product.id).join("-");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-wide text-white">
          Marketplace
        </h2>
        <p className="text-sm text-jersea-muted">{products.length} products</p>
      </div>

      <motion.div
        key={animationKey}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.09,
              delayChildren: 0.08,
              ease: easeFlow
            }
          }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:gap-4"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            adding={addingProductId === product.id}
          />
        ))}
      </motion.div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-jersea-surface p-8 text-center text-jersea-muted">
          No jerseys match your filters right now.
        </div>
      ) : null}
    </div>
  );
}
