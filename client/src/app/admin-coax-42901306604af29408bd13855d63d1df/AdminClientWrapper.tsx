"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load admin client to reduce initial bundle size
const AdminClient = dynamic(() => import("./AdminClient"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-muted-foreground">Laster admin panel...</div>
    </div>
  ),
});

export default function AdminClientWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Laster admin panel...</div>
        </div>
      }
    >
      <AdminClient />
    </Suspense>
  );
}

