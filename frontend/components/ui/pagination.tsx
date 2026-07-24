"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  const page = Math.max(1, Math.min(currentPage, Math.max(1, totalPages)));
  const total = Math.max(1, totalPages);

  return (
    <div className={`flex items-center justify-center gap-3 py-3 ${className}`}>
      <Button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-2xl border-slate-200 bg-white shadow-xs hover:bg-slate-50 transition-all disabled:opacity-30 disabled:shadow-none cursor-pointer"
        title="Trang trước"
      >
        <ChevronLeft className="w-5 h-5 text-slate-500" />
      </Button>

      <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-5 h-10 rounded-2xl shadow-xs">
        <span className="text-sm font-black text-emerald-600">
          {page}
        </span>
        <span className="text-xs font-bold text-slate-300">
          /
        </span>
        <span className="text-xs font-bold text-slate-700 font-mono">
          {total}
        </span>
      </div>

      <Button
        type="button"
        onClick={() => onPageChange(Math.min(total, page + 1))}
        disabled={page >= total}
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-2xl border-slate-200 bg-white shadow-xs hover:bg-slate-50 transition-all disabled:opacity-30 disabled:shadow-none cursor-pointer"
        title="Trang sau"
      >
        <ChevronRight className="w-5 h-5 text-emerald-600" />
      </Button>
    </div>
  );
}
