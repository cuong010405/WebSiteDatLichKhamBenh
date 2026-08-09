"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AdminRoleGuardProps {
  children: React.ReactNode;
}

export function AdminRoleGuard({ children }: AdminRoleGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-white" />;
  }

  // Only "admin" role can view Admin-only management pages
  if (user && user.role !== "admin") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-red-500/10 border border-red-100">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <span className="eyebrow text-xs font-black text-red-500 uppercase tracking-widest mb-2">403 Forbidden</span>
        <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tight mb-3">
          Không có quyền truy cập
        </h1>
        <p className="text-slate-500 font-medium max-w-md text-sm leading-relaxed mb-8">
          Trang này dành riêng cho Quản trị viên hệ thống. Tài khoản vai trò{" "}
          <strong className="text-slate-800 uppercase">{user.role === "vltl" ? "Vật lý trị liệu" : user.role === "chuyen_gia" ? "Chuyên gia" : user.role === "dieu_duong" ? "Điều dưỡng" : user.role}</strong>{" "}
          không có thẩm quyền thao tác chức năng này.
        </p>
        <Link href="/admin">
          <Button className="bg-primary hover:bg-primary-strong text-white font-bold rounded-2xl px-6 h-12 text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Quay lại Trang Tổng quan
          </Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
