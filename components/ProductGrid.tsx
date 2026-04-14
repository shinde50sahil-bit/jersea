"use client";

import { Product, ProductSize } from "@/types/product";
import ProductCard from "@/components/ProductCard";

type ProductGridProps = {
  products: Product[];
  addingProductId: string | null;
  onAddToCart: (productId: string, size: ProductSize) => Promise<void>;
};

export default function ProductGrid({
  products,
  addingProductId,
  onAddToCart
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-wide text-white">
            Marketplace
          </h2>
          <p className="text-sm text-jersea-muted">0 products</p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-jersea-surface p-8 text-center text-jersea-muted">
          No jerseys match your filters right now.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-wide text-white">
          Marketplace
        </h2>
        <p className="text-sm text-jersea-muted">{products.length} products</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product, index) => (
          <div key={`${product.id}-${index}`} className="min-w-0">
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              adding={addingProductId === product.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
