import { BackendProduct, Product } from "@/types/product";

export function normalizeProduct(product: BackendProduct): Product {
  return {
    id: product.id,
    slug: product.slug || product.id,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null,
    image: product.imageUrl,
    gallery: product.gallery || [],
    shortDescription: product.shortDescription,
    description: product.description,
    addedAt: product.createdAt,
    sizes: product.sizes,
    stock: product.stock,
    sku: product.sku,
    isFeatured: product.isFeatured
  };
}
