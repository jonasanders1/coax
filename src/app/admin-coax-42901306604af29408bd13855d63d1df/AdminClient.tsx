"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/admin/hooks/useAdminAuth";
import AdminLogin from "@/features/admin/components/AdminLogin";
import AdminDashboard from "@/features/admin/components/AdminDashboard";
import { Loader2 } from "lucide-react";

export default function AdminClient() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}

