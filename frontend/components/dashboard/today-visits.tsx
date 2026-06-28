"use client"

import * as React from "react"
import { Calendar, Clock, ChevronRight, Activity, Thermometer, Heart, Pill, ClipboardList } from "lucide-react"
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

export function TodayVisits() {
  const [visits, setVisits] = React.useState<any[]>([])

  React.useEffect(() => {
    fetch(`${API_URL}/visits`)
      .then((res) => {
        if (!res.ok) throw new Error("API response error");
        return res.json();
      })
      .then((data) => {
        const formatted = data.map((b: any) => ({
          ...b,
          icon: iconMap[b.type] || Activity,
        }));
        // Lọc bỏ trạng thái Chờ duyệt
        setVisits(formatted.filter((v: any) => v.status !== "Chờ duyệt"));
      })
      .catch((err) => {
        console.warn("Không kết nối được API, sử dụng dữ liệu mẫu:", err);
        // Fallback sang mock data nếu API lỗi hoặc server chưa chạy
        const formattedMock = mockVisits.map((v: any) => ({
          ...v,
          icon: iconMap[v.type] || Activity,
        }));
        setVisits(formattedMock);
      });
  }, []);

  return (
    <section className="lg:col-span-1">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tight-tracking text-foreground">Lịch khám hôm nay</h2>
          <p className="text-sm text-muted-foreground mt-1">Tổng cộng {visits.length} ca trực hoạt động.</p>
        </div>
        <Button variant="ghost" size="icon" className="text-on-surface-tertiary hover:text-foreground h-10 w-10 rounded-full border border-hairline">
          <Calendar className="w-5 h-5" />
        </Button>
      </div>

      <div className="bg-white border border-hairline rounded-[32px] overflow-hidden shadow-xs">
        <div className="divide-y divide-hairline">
          {visits.map((visit, i) => {
            const Icon = visit.icon
            const isOngoing = visit.status === "Đang thực hiện"
            return (
              <motion.div
                key={visit.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                className="p-6 hover:bg-surface-secondary/50 cursor-pointer group transition-all relative overflow-hidden"
              >
                {isOngoing && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary/80 shadow-[0_0_15px_rgba(24,190,102,0.3)]" />
                )}
                
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border border-transparent",
                      isOngoing ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-surface-tinted text-primary border-primary/10"
                    )}>
                      {Icon && <Icon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{visit.type}</h4>
                      <p className="text-xs text-muted-foreground mt-1 font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-hairline" />
                        {visit.patientName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end mb-2">
                      <Clock className="w-3.5 h-3.5 text-on-surface-tertiary" />
                      <span className="text-[10px] font-bold font-mono text-on-surface-tertiary uppercase tracking-tight">{visit.time.split(' - ')[0]}</span>
                    </div>
                    <span className={cn(
                      "text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border transition-all whitespace-nowrap",
                      isOngoing 
                        ? "bg-primary text-white border-primary shadow-sm shadow-primary/20" 
                        : "bg-surface-secondary text-muted-foreground border-hairline group-hover:border-primary/20 group-hover:bg-white"
                    )}>
                      {visit.status}
                    </span>
                  </div>
                </div>
                
                {isOngoing && (
                  <div className="mt-5 h-1 w-full bg-surface-secondary rounded-full overflow-hidden">
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
          })}
        </div>
        <div className="p-6 bg-surface-secondary/20 border-t border-hairline">
          <Button variant="outline" className="w-full text-xs font-bold text-primary-strong h-12 hover:bg-white rounded-[20px] transition-all border-hairline shadow-sm flex items-center justify-center gap-2 group">
            Xem lịch trình đầy đủ <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}
