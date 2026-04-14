"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Product, ProductSize } from "@/types/product";
import { resolveImageUrl } from "@/utils/images";

type ProductCardProps = {
  product: Product;
  onAddToCart: (productId: string, size: ProductSize) => Promise<void>;
  adding: boolean;
};

const easeFlow = [0.25, 0.1, 0.25, 1];

export default function ProductCard({
  product,
  onAddToCart,
  adding
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize>(
    product.sizes[0] || "M"
  );
  const [imageSrc, setImageSrc] = useState(resolveImageUrl(product.image));
  const productHref = `/products/${product.slug || product.id}`;
  const galleryPreview = useMemo(
    () =>
      Array.from(
        new Set([product.image, ...(product.gallery || [])].filter(Boolean))
      ).slice(0, 4),
    [product.gallery, product.image]
  );
  useEffect(() => {
    setSelectedSize(product.sizes[0] || "M");
    setImageSrc(resolveImageUrl(product.image));
  }, [product.id, product.image, product.sizes]);

  const hasDiscount =
    Number(product.compareAtPrice || 0) > Number(product.price || 0);
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.compareAtPrice) - Number(product.price)) /
          Number(product.compareAtPrice)) *
          100
      )
    : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-jersea-surface transition-colors duration-300 hover:border-jersea-neonBlue/60">
      <Link href={productHref} className="block">
        <div className="relative aspect-[4/4.55] overflow-hidden">
          <img
            src={imageSrc}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
            onError={() => setImageSrc("/jersey_logo.png")}
          />
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            {product.isFeatured ? (
              <span className="rounded-full bg-jersea-neonBlue px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-black">
                Featured
              </span>
            ) : null}
            {discountPercent ? (
              <span className="rounded-full bg-jersea-pink px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-black">
                {discountPercent}% Off
              </span>
            ) : null}
          </div>
          <span className="absolute bottom-2.5 right-2.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
            Stock {product.stock}
          </span>
        </div>

        <div className="px-3.5 pb-1 pt-3.5">
          <p className="mb-1 text-[0.7rem] uppercase tracking-[0.14em] text-jersea-muted">
            {product.category}
          </p>
          <h3 className="mb-1.5 line-clamp-2 text-[1.05rem] font-semibold leading-snug text-white transition group-hover:text-jersea-neonBlue">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-[0.92rem] text-jersea-muted">
            {product.shortDescription}
          </p>
          <div className="mb-2 mt-3 flex flex-wrap items-center gap-2">
            <p className="text-[1.35rem] font-bold text-jersea-volt">
              INR {product.price.toLocaleString("en-IN")}
            </p>
            {hasDiscount ? (
              <p className="text-xs text-jersea-muted line-through">
                INR {Number(product.compareAtPrice).toLocaleString("en-IN")}
              </p>
            ) : null}
          </div>
          {galleryPreview.length > 1 ? (
            <div className="mt-2.5 flex gap-1.5">
              {galleryPreview.map((imageSrc, index) => (
                <div
                  key={`${product.id}-gallery-${index}`}
                  className="h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-black/30"
                >
                  <img
                    src={resolveImageUrl(imageSrc)}
                    alt={`${product.name} preview ${index + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[0.64rem] uppercase tracking-[0.14em] text-jersea-muted">
            {product.sku ? (
              <span className="rounded-full border border-white/10 px-2 py-1">
                {product.sku}
              </span>
            ) : null}
            <span className="rounded-full border border-white/10 px-2 py-1">
              {product.sizes.length} sizes
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5 pt-1">
        <div className="mb-3">
          <p className="mb-2 text-[0.68rem] uppercase tracking-[0.14em] text-jersea-muted">
            Select Size
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`rounded-lg border px-2 py-1.5 text-[0.82rem] transition-all ${
                  selectedSize === size
                    ? "border-jersea-neonBlue bg-jersea-neonBlue/15 text-jersea-neonBlue"
                    : "border-white/12 text-slate-300 hover:border-jersea-pink/70 hover:text-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <Link
            href={productHref}
            className="flex-1 rounded-xl border border-white/10 px-3 py-2.5 text-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-jersea-neonBlue/60 hover:text-jersea-neonBlue"
          >
            View
          </Link>
          <motion.button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void onAddToCart(product.id, selectedSize);
            }}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: easeFlow }}
            disabled={adding || product.stock === 0}
            className="flex-1 rounded-xl bg-jersea-neonBlue px-3 py-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-black shadow-neon transition-colors duration-300 hover:bg-jersea-volt hover:shadow-neon-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {product.stock === 0 ? "Sold Out" : adding ? "Adding..." : "Add"}
          </motion.button>
        </div>
      </div>
    </article>
  );
}
