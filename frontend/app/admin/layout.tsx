"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

import { LoadingService } from "@/lib/loading-context";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isStaffOrAdmin = user && (user.role === "admin" || user.role === "vltl" || user.role === "chuyen_gia" || user.role === "dieu_duong");

  React.useEffect(() => {
    if (loading) {
      LoadingService.Show("ĐANG XÁC THỰC QUYỀN TRUY CẬP...");
    } else {
      LoadingService.Hide();
      if (!isStaffOrAdmin) {
        router.replace("/");
      }
    }
  }, [user, loading, router, isStaffOrAdmin]);

  if (loading || !isStaffOrAdmin) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
