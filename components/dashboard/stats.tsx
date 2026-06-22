"use client"

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { LineChart, Line, ResponsiveContainer } from "recharts"

const stats = [
  { 
    label: "Tổng số lượt khám", 
    value: "142", 
    trend: "+8%", 
    sub: "so với hôm qua",
    data: [120, 132, 125, 145, 138, 150, 142],
    color: "#18BE66"
  },
  { 
    label: "Y tá đang trực", 
    value: "58", 
    trend: "trên 64", 
    sub: "Đang hoạt động điều phối",
    data: [50, 52, 55, 54, 58, 60, 58],
    color: "#18BE66"
  },
  { 
    label: "Sự hài lòng bệnh nhân", 
    value: "98.4%", 
    sub: "Từ 840 đánh giá",
    data: [95, 96, 98, 97, 98.4, 98.2, 98.4],
    color: "#18BE66"
  },
  { 
    label: "Cảnh báo chờ xử lý", 
    value: "3", 
    sub: "Yêu cầu chú ý",
    data: [5, 4, 3, 4, 2, 3, 3],
    color: "#F97316"
  },
]

export function Stats() {
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
                <span className="text-3xl font-bold tight-tracking">{stat.value}</span>
                {stat.trend && (
                  <span className={stat.trend.includes('%') ? "text-primary-strong text-xs font-bold" : "text-muted-foreground text-[10px] font-bold uppercase tracking-wider"}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-tertiary font-medium mt-auto">{stat.sub}</p>
            </div>

            {/* Sparkline Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-10 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
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
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
