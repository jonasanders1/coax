import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

export const SITE_URL = "https://coax.jonasanders1.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/ogImage.png`;
const DEFAULT_OG_IMAGE_WIDTH = "1200";
const DEFAULT_OG_IMAGE_HEIGHT = "630";
const DEFAULT_OG_IMAGE_TYPE = "image/png";

export const getAbsoluteUrl = (pathOrUrl?: string | null) => {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const normalized =
    pathOrUrl.startsWith("/") || pathOrUrl.startsWith("#")
      ? pathOrUrl
      : `/${pathOrUrl}`;
  return `${SITE_URL}${normalized}`;
};

type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

const DEFAULT_TITLE = "COAX – Effektive tankløse vannvarmere";
const DEFAULT_DESCRIPTION =
  "Opplev kompakte, energieffektive vannvarmere fra COAX – umiddelbar varmtvann uten tank. Ideelt for bolig, hytte og industri.";

type SeoProps = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  type?: "website" | "product" | "article" | "profile" | "video.movie";
  noIndex?: boolean;
  lang?: string;
  structuredData?: StructuredData;
};

const Seo = ({
  title,
  description,
  canonicalPath,
  image,
  type = "website",
  noIndex = false,
  lang = "nb",
  structuredData,
}: SeoProps) => {
  const location = useLocation();
  const finalTitle = title || DEFAULT_TITLE;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const canonicalUrl = getAbsoluteUrl(canonicalPath || location.pathname);
  const ogImage = getAbsoluteUrl(image) || DEFAULT_OG_IMAGE;
  const robotsContent = noIndex ? "noindex, nofollow" : "index, follow";
  const structuredDataJson =
    structuredData && JSON.stringify(structuredData);

  return (
    <Helmet htmlAttributes={{ lang }}>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="robots" content={robotsContent} />
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

      <meta property="og:site_name" content="COAX" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      {ogImage ? <meta property="og:image:alt" content={finalTitle} /> : null}
      {ogImage === DEFAULT_OG_IMAGE ? (
        <>
          <meta property="og:image:width" content={DEFAULT_OG_IMAGE_WIDTH} />
          <meta property="og:image:height" content={DEFAULT_OG_IMAGE_HEIGHT} />
          <meta property="og:image:type" content={DEFAULT_OG_IMAGE_TYPE} />
        </>
      ) : null}

      <meta
        name="twitter:card"
        content={ogImage ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

      {structuredDataJson ? (
        <script type="application/ld+json">{structuredDataJson}</script>
      ) : null}
    </Helmet>
  );
};

export default Seo;

