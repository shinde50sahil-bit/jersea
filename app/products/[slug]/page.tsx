import ProductDetailsPage from "@/components/ProductDetailsPage";

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  return <ProductDetailsPage slug={decodeURIComponent(params.slug)} />;
}
