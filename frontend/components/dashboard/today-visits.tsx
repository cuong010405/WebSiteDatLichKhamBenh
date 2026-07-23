"use client"

import * as React from "react"
import Link from "next/link"
import { Calendar, Clock, ChevronRight, Activity, Thermometer, Heart, Pill, ClipboardList, User, RefreshCw } from "lucide-react"
import { visits as mockVisits } from "@/lib/mock-data"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { API_URL } from "@/lib/api"

const iconMap: Record<string, any> = {
  "Kiểm tra sức khỏe": Thermometer,
  "Vật lý trị liệu": Heart,
  "Truyền dịch y tế": Pill,
  "Tư vấn dinh dưỡng": ClipboardList,
};

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  "Đang thực hiện": { label: "Đang thực hiện", dot: "bg-emerald-400", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  "Đã xác nhận":    { label: "Đã xác nhận",    dot: "bg-blue-400",    bg: "bg-blue-50 border-blue-200",     text: "text-blue-700" },
  "Chờ duyệt":      { label: "Chờ duyệt",       dot: "bg-amber-400 animate-pulse",   bg: "bg-amber-50 border-amber-200",   text: "text-amber-700" },
  "Đã hoàn tất":    { label: "Đã hoàn tất",     dot: "bg-slate-400",  bg: "bg-slate-50 border-slate-200",   text: "text-slate-600" },
  "Đã hủy":         { label: "Đã hủy",           dot: "bg-red-400",    bg: "bg-red-50 border-red-200",       text: "text-red-600" },
};

export function TodayVisits() {
  const [visits, setVisits] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  const loadVisits = React.useCallback(() => {
    setLoading(true)
    fetch(`${API_URL}/visits`)
      .then((res) => {
        if (!res.ok) throw new Error("API response error");
        return res.json();
      })
      .then((data) => {
        const formatted = data
          .filter((b: any) => b.status !== "Đã hủy")
          .map((b: any) => ({
            ...b,
            icon: iconMap[b.type] || Activity,
          }));
        // Admin thấy TẤT CẢ ngoại trừ ca đã hủy
        setVisits(formatted);
      })
      .catch((err) => {
        console.warn("Không kết nối được API, sử dụng dữ liệu mẫu:", err);
        const formattedMock = mockVisits
          .filter((v: any) => v.status !== "Đã hủy")
          .map((v: any) => ({
            ...v,
            icon: iconMap[v.type] || Activity,
          }));
        setVisits(formattedMock);
      })
      .finally(() => setLoading(false));
  }, [])

  React.useEffect(() => {
    loadVisits()
    const interval = window.setInterval(loadVisits, 15000)
    return () => window.clearInterval(interval)
  }, [loadVisits]);

  const pendingCount = visits.filter(v => v.status === "Chờ duyệt").length

  return (
    <section className="lg:col-span-1">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tight-tracking text-foreground">Lịch khám hôm nay</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {visits.length} ca trực
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {pendingCount} chờ duyệt
              </span>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={loadVisits}
          className="text-on-surface-tertiary hover:text-foreground h-10 w-10 rounded-full border border-hairline"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      <div className="bg-white border border-hairline rounded-[32px] overflow-hidden shadow-xs">
        <div className="divide-y divide-hairline">
          {visits.length === 0 && !loading ? (
            <div className="py-12 text-center">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-400">Không có lịch khám nào</p>
            </div>
          ) : (
            visits.slice(0, 3).map((visit, i) => {
              const Icon = visit.icon
              const isOngoing = visit.status === "Đang thực hiện"
              const isPending = visit.status === "Chờ duyệt"
              const sCfg = statusConfig[visit.status] ?? statusConfig["Đã hoàn tất"]
              const isUserBooking = !!visit.userId
              return (
                <motion.div
                  key={visit.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.08 }}
                  className={cn(
                    "p-5 hover:bg-surface-secondary/50 cursor-pointer group transition-all relative overflow-hidden",
                    isPending && "bg-amber-50/30"
                  )}
                >
                  {isOngoing && (
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary/80 shadow-[0_0_15px_rgba(24,190,102,0.3)]" />
                  )}
                  {isPending && (
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-400/80" />
                  )}

                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm border border-transparent shrink-0 mt-0.5",
                        isOngoing ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : isPending ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-surface-tinted text-primary border-primary/10"
                      )}>
                        {Icon && <Icon className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{visit.type}</h4>
                        {/* Patient name */}
                        <p className="text-xs text-muted-foreground mt-0.5 font-semibold flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-hairline shrink-0" />
                          {visit.patientName || "Chưa gán bệnh nhân"}
                        </p>
                        {/* User who booked - only if booked via app */}
                        {isUserBooking && (
                          <p className="text-[10px] font-bold text-indigo-500 mt-0.5 flex items-center gap-1 truncate">
                            <User className="w-3 h-3 shrink-0" />
                            {visit.userName || "Người dùng app"}
                          </p>
                        )}
                        {/* Date */}
                        {visit.date && (
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3 shrink-0" />
                            {visit.date}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end mb-2">
                        <Clock className="w-3 h-3 text-on-surface-tertiary" />
                        <span className="text-[10px] font-bold font-mono text-on-surface-tertiary tracking-tight">{visit.time.split(' - ')[0]}</span>
                      </div>
                      {/* Status badge */}
                      <span className={cn(
                        "text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border whitespace-nowrap flex items-center gap-1",
                        sCfg.bg, sCfg.text
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", sCfg.dot)} />
                        {sCfg.label}
                      </span>
                      {/* Source badge */}
                      {isUserBooking && (
                        <span className="mt-1 block text-[7px] font-black text-indigo-400 uppercase tracking-widest text-right">
                          📱 Đặt qua app
                        </span>
                      )}
                    </div>
                  </div>

                  {isOngoing && (
                    <div className="mt-4 h-1 w-full bg-surface-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 2.5, delay: 1, ease: "easeOut" }}
                        className="h-full bg-primary relative"
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-r from-transparent to-white/30 animate-shimmer" />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )
            })
          )}
        </div>
        <div className="p-5 bg-surface-secondary/20 border-t border-hairline">
          <Link href="/admin/schedule" className="block w-full">
            <Button variant="outline" className="w-full text-xs font-bold text-primary-strong h-12 hover:bg-white rounded-[20px] transition-all border-hairline shadow-sm flex items-center justify-center gap-2 group cursor-pointer">
              Xem lịch trình đầy đủ <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
