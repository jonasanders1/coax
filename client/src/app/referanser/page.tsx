import type { Metadata } from "next";
import ReferencesClient from "./ReferencesClient";

export const metadata: Metadata = {
  title: "COAX | Erfaringer fra fornøyde kunder",
  description:
    "Les historier fra hytter, boliger og næringsbygg som har valgt COAX sine tankløse vannvarmere for effektivt varmtvann.",
  alternates: {
    canonical: "/referanser",
  },
};

export default function ReferencesPage() {
  return <ReferencesClient />;
}

