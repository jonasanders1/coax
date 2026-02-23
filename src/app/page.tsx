import type { Metadata } from "next";
import HomeClient from "@/features/home/components/HomeClient";
import { siteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "COAX | Tankløs vannvarmer – spar strøm, plass og miljø",
  description:
    "Spar opptil 50% på strømregningen med COAX tankløse vannvarmere. Energieffektiv oppvarming uten lagringstank – varmtvann på sekundet for bolig, hytte og næring.",
  keywords: [
    "COAX",
    "tankløs vannvarmer",
    "direkte vannvarmer",
    "energieffektiv vannvarmer",
    "varmtvannsbereder uten tank",
    "elektrisk vannvarmer",
    "COAX vannvarmere",
    "spar strøm vannvarmer",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "COAX | Tankløs vannvarmer – spar strøm, plass og miljø",
    description:
      "Spar opptil 50% på strømregningen med COAX tankløse vannvarmere. Varmtvann på sekundet – helt uten tank.",
    url: siteUrl,
    type: "website",
    siteName: "COAX",
    images: [
      {
        url: `${siteUrl}/ogImage.png`,
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "COAX | Tankløs vannvarmer",
    description:
      "Spar opptil 50% på strømregningen med COAX tankløse vannvarmere. Varmtvann på sekundet.",
    images: [`${siteUrl}/ogImage.png`],
  },
};

export default async function Page(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const openChatOnLoad = searchParams.openChat === "true";

  return <HomeClient openChatOnLoad={openChatOnLoad} />;
}
