import type { Metadata } from "next";
import AdminClientWrapper from "./AdminClientWrapper";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminClientWrapper />;
}

