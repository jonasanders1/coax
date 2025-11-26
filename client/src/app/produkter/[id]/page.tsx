import type { Metadata } from "next";
import productsData from "@/product-details.json";
import { ProductDetailsClient } from "./ProductDetailsClient";

type Params = {
  id: string;
};

type StaticProduct = {
  id: string;
  name?: string;
  description?: string;
  images?: string[];
};

const staticProducts =
  (productsData as { products?: StaticProduct[] }).products ?? [];

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: {
    params: Promise<Params>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const toAbsoluteUrl = (path: string) =>
    path.startsWith("http")
      ? path
      : `https://coax.jonasanders1.com${path.startsWith("/") ? path : `/${path}`}`;
  const fallbackProduct = staticProducts.find(
    (product) => product.id === params.id
  );
  const title = fallbackProduct
    ? `COAX | ${fallbackProduct.name}`
    : `COAX | Produkt ${params.id}`;
  const description =
    fallbackProduct?.description?.slice(0, 155) ??
    "Oppdag detaljer om COAX sine energieffektive vannvarmere.";

  return {
    title,
    description,
    alternates: {
      canonical: `/produkter/${params.id}`,
    },
    openGraph: {
      title,
      description,
      url: toAbsoluteUrl(`/produkter/${params.id}`),
      type: "website",
      siteName: "COAX",
      images: fallbackProduct?.images?.[0]
        ? [
            {
              url: toAbsoluteUrl(fallbackProduct.images[0]),
              width: 1200,
              height: 630,
              type: "image/png",
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: fallbackProduct?.images?.[0]
        ? [toAbsoluteUrl(fallbackProduct.images[0])]
        : undefined,
    },
  };
}

const ProductDetailsPage = async ({ params }: { params: Promise<Params> }) => {
  const resolvedParams = await params;

  return (
    <ProductDetailsClient productId={resolvedParams.id} />
  );
};

export default ProductDetailsPage;

