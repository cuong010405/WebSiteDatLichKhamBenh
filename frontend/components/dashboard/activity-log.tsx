"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { CheckCircle2, Star, ArrowRight, ShieldCheck, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { API_URL } from "@/lib/api"

const iconMap: Record<string, any> = {
  completed: { icon: CheckCircle2, color: "text-primary", bgColor: "bg-surface-tinted" },
  assigned: { icon: ShieldCheck, color: "text-blue-500", bgColor: "bg-blue-50" },
  review: { icon: Star, color: "text-orange-500", bgColor: "bg-orange-50" },
}

const fallbackLogs = [
  { 
    status: "completed", 
    title: "Ca trực hoàn tất", 
    desc: "Sandra B. đã hoàn tất thăm khám tại Quận Queens", 
    time: "14:22 PM", 
  },
  { 
    status: "assigned", 
    title: "Đã phân công tự động", 
    desc: "Hệ thống đã điều phối Marcus T. cho ca phục hồi tại gia tiếp theo", 
    time: "13:50 PM", 
  },
  { 
    status: "review", 
    title: "Đánh giá 5 sao mới", 
    desc: "Bệnh nhân Oscar W. rất hài lòng với dịch vụ chăm sóc vết thương", 
    time: "12:05 PM", 
  },
]

export function ActivityLog() {
  const [logs, setLogs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`${API_URL}/logs`)
      .then((res) => {
        if (!res.ok) throw new Error("API error")
        return res.json()
      })
      .then((data) => {
        setLogs(data.slice(0, 5))
        setLoading(false)
      })
      .catch((err) => {
        console.warn("Không kết nối được API, dùng dữ liệu mẫu:", err)
        setLogs(fallbackLogs)
        setLoading(false)
      })
  }, [])

  return (
    <section className="lg:col-span-1">
      <div className="bg-white border border-hairline rounded-[32px] p-8 h-full shadow-xs flex flex-col group/card">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="eyebrow text-[11px] mb-1 block">Hoạt động hệ thống</span>
            <h2 className="text-xl font-semibold tight-tracking">Nhật ký mới nhất</h2>
          </div>
          <button className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center text-on-surface-tertiary hover:bg-surface-secondary hover:text-foreground transition-all">
            <Clock className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-10 flex-1 relative before:absolute before:left-[19.5px] before:top-4 before:bottom-4 before:w-px before:bg-linear-to-b before:from-primary/30 before:via-hairline before:to-transparent">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-6 animate-pulse">
                  <div className="w-10 h-10 rounded-[14px] bg-surface-secondary shrink-0" />
                  <div className="flex-1 space-y-2 pt-0.5">
                    <div className="h-4 bg-surface-secondary rounded-full w-3/4" />
                    <div className="h-3 bg-surface-secondary rounded-full w-full" />
                  </div>
                </div>
              ))
            : logs.map((log, i) => {
                const meta = iconMap[log.status] || iconMap.completed
                const Icon = meta.icon
                return (
                  <motion.div 
                    key={log.id || i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
                    className="flex gap-6 relative z-10 group cursor-pointer"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm border border-white transition-all group-hover:scale-110 group-hover:shadow-md",
                      meta.bgColor,
                      meta.color
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="pt-0.5 flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{log.title}</p>
                        <span className="text-[9px] text-on-surface-tertiary font-bold font-mono tracking-widest uppercase shrink-0 mt-1">{log.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors">{log.desc}</p>
                    </div>
                  </motion.div>
                )
              })
          }
        </div>

        <div className="mt-10 pt-8 border-t border-hairline border-dashed">
          <Button variant="outline" className="w-full h-12 rounded-full text-xs font-bold border-hairline bg-white hover:bg-surface-secondary transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
            Xem toàn bộ nhật ký <ArrowRight className="w-4 h-4 text-primary" />
          </Button>
        </div>
      </div>
    </section>
  )
}
