"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  Calendar,
  Activity,
  FileText,
  Settings,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
  CalendarCheck,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Tổng quan", href: "/admin", icon: LayoutGrid },
  { label: "Chuyên gia", href: "/admin/staff", icon: Users },
  { label: "Dịch vụ", href: "/admin/services", icon: Stethoscope },
  { label: "Lịch trực", href: "/admin/schedule", icon: Calendar },
  { label: "Bệnh nhân", href: "/admin/patients", icon: Activity },
  { label: "Thanh toán", href: "/admin/pay", icon: CalendarCheck },
  { label: "Báo cáo", href: "/admin/reports", icon: FileText },
  { label: "Tài khoản", href: "/admin/accounts", icon: ShieldCheck },
  { label: "Đặt lịch (Khách)", href: "/", icon: CalendarCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-hairline fixed h-full bg-white flex flex-col z-50 shadow-xs">
      <div className="p-8 pb-10">
        <div className="flex items-center gap-4 mb-12 group cursor-pointer">
          <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 transform -rotate-3 transition-all group-hover:rotate-0 group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6.5 h-6.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-black tight-tracking text-foreground uppercase tracking-tighter">
              MintCare
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              <p className="text-[9px] font-black text-primary uppercase tracking-widest">
                v2.4.0
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-4 px-4 py-3.5 rounded-[20px] font-bold text-[11px] uppercase tracking-[0.15em] transition-all",
                  isActive
                    ? "bg-primary text-white shadow-xl shadow-primary/20 translate-x-1"
                    : "text-on-surface-tertiary hover:bg-surface-secondary hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "w-4.5 h-4.5 transition-all",
                    isActive
                      ? "text-white scale-110"
                      : "group-hover:text-primary group-hover:scale-110",
                  )}
                />
                <span
                  className={cn(
                    isActive && "translate-x-0.5 transition-transform",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 pt-0">
        {/* Security Status Card */}
        <div className="bg-surface-tinted/50 rounded-[28px] p-5 mb-8 border border-primary/10 relative overflow-hidden group/card cursor-pointer hover:bg-surface-tinted transition-colors">
          <div className="absolute -top-2 -right-2 p-2 opacity-10 group-hover/card:opacity-20 transition-all duration-500 transform group-hover/card:rotate-12 group-hover/card:scale-125">
            <ShieldCheck className="w-14 h-14 text-primary" />
          </div>
          <p className="text-[9px] font-black text-primary-strong uppercase tracking-[0.2em] mb-1.5">
            Bảo mật hệ thống
          </p>
          <p className="text-[11px] font-bold text-foreground leading-tight">
            Xác thực sinh trắc học đang hoạt động
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-[9px] font-black text-primary-strong uppercase hover:translate-x-1 transition-transform">
            Chi tiết bảo mật <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div className="space-y-1">
          <Link
            href="#"
            className="flex items-center gap-4 px-4 py-3.5 text-on-surface-tertiary hover:bg-surface-secondary hover:text-foreground rounded-[20px] font-bold text-[11px] uppercase tracking-[0.15em] transition-all"
          >
            <HelpCircle className="w-4.5 h-4.5" />
            Trợ giúp
          </Link>
        </div>
      </div>
    </aside>
  );
}
