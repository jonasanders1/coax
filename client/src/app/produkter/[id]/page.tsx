import type { Metadata } from "next";
import { ProductDetailsClient } from "./ProductDetailsClient";
import { getProductById } from "@/lib/products";
import { siteUrl } from "@/config/site";

type Params = {
  id: string;
};

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const params = await props.params;
  
  // Fetch product from Firebase for accurate metadata
  let product = null;
  try {
    product = await getProductById(params.id);
  } catch (error) {
    console.warn(`Could not fetch product ${params.id} for metadata:`, error);
  }
  
  const title = product?.model
    ? `COAX | ${product.model}`
    : `COAX | Produkt ${params.id}`;
  const description =
    product?.description?.slice(0, 155) ??
    "Oppdag detaljer om COAX sine energieffektive vannvarmere.";

  const keywords = product?.model
    ? [
        `COAX ${product.model}`,
        "direkte vannvarmer",
        "tankløs vannvarmer",
        "elektrisk vannvarmer",
        product.model,
      ].filter(Boolean)
    : ["COAX produkt", "direkte vannvarmer", "tankløs vannvarmer"];

  // Get the first product image - Firebase images are already full URLs
  // The getProductById function processes images and returns full Firebase Storage URLs
  const productImage = product?.images?.[0];
  
  // Firebase Storage URLs are already absolute, so use directly if available
  // Otherwise fall back to default OG image
  const imageUrl = productImage && (productImage.startsWith("http://") || productImage.startsWith("https://"))
    ? productImage
    : `${siteUrl}/ogImage.png`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${siteUrl}/produkter/${params.id}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/produkter/${params.id}`,
      type: "website",
      siteName: "COAX",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

const ProductDetailsPage = async ({ params }: { params: Promise<Params> }) => {
  const resolvedParams = await params;

  return <ProductDetailsClient productId={resolvedParams.id} />;
};

export default ProductDetailsPage;
