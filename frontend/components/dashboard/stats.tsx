"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { API_URL, authFetch } from "@/lib/api"

const defaultStats = [
  { 
    label: "Tổng số lượt khám", 
    value: "—", 
    trend: "+8%", 
    sub: "so với hôm qua",
    data: [120, 132, 125, 145, 138, 150, 142],
    color: "#18BE66"
  },
  { 
    label: "Nhân viên y tế", 
    value: "—", 
    trend: "đang hoạt động", 
    sub: "Đang điều phối ngoài thực địa",
    data: [50, 52, 55, 54, 58, 60, 58],
    color: "#18BE66"
  },
  { 
    label: "Bệnh nhân đang điều trị", 
    value: "—", 
    sub: "Trong hệ thống",
    data: [95, 96, 98, 97, 98.4, 98.2, 98.4],
    color: "#18BE66"
  },
  { 
    label: "Hiệu suất phục vụ", 
    value: "—", 
    sub: "Tỷ lệ hoàn tất ca khám",
    data: [80, 85, 90, 88, 92, 95, 100],
    color: "#18BE66"
  },
]

export function Stats() {
  const [stats, setStats] = React.useState(defaultStats)
  const [loaded, setLoaded] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  // Đợi DOM mount xong mới render chart để tránh width/height = -1
  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const fetchStats = () => {
      authFetch(`${API_URL}/reports`)
        .then((res) => {
          if (!res.ok) throw new Error("API error")
          return res.json()
        })
        .then((data) => {
          setStats([
            { 
              label: "Tổng số lượt khám", 
              value: String(data.totalVisits ?? "—"), 
              trend: "+8%", 
              sub: "so với hôm qua",
              data: data.patientInflow?.map((d: any) => d.value) || defaultStats[0].data,
              color: "#18BE66"
            },
            { 
              label: "Nhân viên y tế", 
              value: String(data.totalStaff ?? "—"), 
              trend: "đang hoạt động", 
              sub: `${data.availableStaff ?? 4} đang sẵn sàng`,
              data: data.staffHours?.map((d: any) => d.value / 5) || defaultStats[1].data,
              color: "#18BE66"
            },
            { 
              label: "Bệnh nhân đang điều trị", 
              value: String(data.totalPatients ?? "—"), 
              sub: "Trong hệ thống",
              data: data.patientInflow?.map((d: any) => d.value / 2) || defaultStats[2].data,
              color: "#18BE66"
            },
            { 
              label: "Hiệu suất phục vụ", 
              value: `${data.completionRate ?? data.bedOccupancy ?? 100}%`, 
              sub: "Tỷ lệ hoàn tất ca khám",
              data: [80, 85, 90, 88, 92, 95, data.completionRate ?? 100],
              color: "#18BE66"
            },
          ])
          setLoaded(true)
        })
        .catch(() => {})
    }

    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    window.addEventListener("focus", fetchStats)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", fetchStats)
    }
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
        >
          <Card className="stat-card bg-white border-hairline rounded-[24px] p-6 hover:border-primary/30 transition-all shadow-xs group overflow-hidden relative h-full">
            <div className="relative z-10 h-full flex flex-col">
              <span className="eyebrow text-[11px] mb-3 block">{stat.label}</span>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-3xl font-bold tight-tracking transition-all duration-500 ${!loaded ? "opacity-30" : "opacity-100"}`}>
                  {stat.value}
                </span>
                {stat.trend && (
                  <span className={stat.trend.includes('%') ? "text-primary-strong text-xs font-bold" : "text-muted-foreground text-[10px] font-bold uppercase tracking-wider"}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-tertiary font-medium mt-auto">{stat.sub}</p>
            </div>

            {/* Sparkline Overlay - chỉ render sau khi DOM đã mount */}
            {mounted && (
              <div className="absolute bottom-0 left-0 right-0 h-10 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={40}>
                  <LineChart data={stat.data.map((v) => ({ value: v }))}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={stat.color} 
                      strokeWidth={2} 
                      dot={false}
                      animationDuration={1500}
                      animationBegin={300 + i * 100}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
