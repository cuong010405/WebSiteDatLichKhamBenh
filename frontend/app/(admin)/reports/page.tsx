"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts"
import { 
  Download, 
  Calendar as CalendarIcon, 
  Users, 
  Activity, 
  Heart,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const visitData = [
  { name: 'Thứ 2', visits: 120, previous: 100 },
  { name: 'Thứ 3', visits: 150, previous: 130 },
  { name: 'Thứ 4', visits: 180, previous: 160 },
  { name: 'Thứ 5', visits: 140, previous: 150 },
  { name: 'Thứ 6', visits: 190, previous: 170 },
  { name: 'Thứ 7', visits: 210, previous: 180 },
  { name: 'Chủ nhật', visits: 160, previous: 140 },
]

const deptData = [
  { name: 'Nội khoa', value: 40, color: '#18BE66' },
  { name: 'Ngoại khoa', value: 25, color: '#16A34A' },
  { name: 'Phục hồi chức năng', value: 20, color: '#18181B' },
  { name: 'Cấp cứu tại gia', value: 15, color: '#E4E4E7' },
]

const topStaff = [
  { name: 'Sandra Bullock', role: 'Y tá trưởng', score: 98, trend: '+2.4%', avatar: 'https://i.pravatar.cc/150?u=sandra' },
  { name: 'Marcus Thorne', role: 'Bác sĩ VTLTL', score: 95, trend: '+1.8%', avatar: 'https://i.pravatar.cc/150?u=marcus' },
  { name: 'Lara Croft', role: 'Y tá điều dưỡng', score: 92, trend: '-0.5%', avatar: 'https://i.pravatar.cc/150?u=lara' },
]

const recentReports = [
  { id: 'RP-092', name: 'Hiệu suất Quý 2/2024', type: 'PDF', date: '12/06/2024', size: '2.4 MB' },
  { id: 'RP-091', name: 'Khảo sát Hài lòng BN', type: 'Excel', date: '10/06/2024', size: '1.2 MB' },
  { id: 'RP-090', name: 'Phân bổ Nhân sự Tháng 5', type: 'PDF', date: '01/06/2024', size: '3.1 MB' },
]

interface StatCardProps {
  title: string
  value: string | number
  trend?: string
  icon: React.ElementType
  delay?: number
}

function StatCard({ title, value, trend, icon: Icon, delay }: StatCardProps) {
  const isPositive = trend?.startsWith('+')
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="bg-white border-hairline rounded-3xl p-6 shadow-xs hover:border-primary/20 transition-all group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-surface-tinted/50 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-surface-tinted transition-colors" />
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-surface-secondary flex items-center justify-center text-primary shadow-sm">
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
              isPositive ? "bg-surface-tinted text-primary-strong" : "bg-orange-50 text-orange-600"
            )}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trend}
            </div>
          )}
        </div>
        <p className="eyebrow text-[10px] mb-1 relative z-10">{title}</p>
        <p className="text-3xl font-bold tight-tracking text-foreground relative z-10">{value}</p>
      </Card>
    </motion.div>
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { color: string; name: string; value: number | string }[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-hairline p-4 rounded-2xl shadow-lg">
        <p className="text-xs font-bold text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: { color: string; name: string; value: number | string }, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[11px] text-muted-foreground font-medium">{entry.name}:</span>
              <span className="text-[11px] font-bold text-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export default function ReportsPage() {
  return (
    <div className="p-10 max-w-7xl mx-auto w-full space-y-12">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow mb-2 block">Trung tâm dữ liệu lâm sàng</span>
          <h1 className="text-[42px] font-semibold tight-tracking text-foreground leading-tight">Báo cáo Vận hành</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Phân tích chuyên sâu về hiệu suất đội ngũ y tế, lưu lượng bệnh nhân và các chỉ số hài lòng trong thời gian thực.
          </p>
        </motion.div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full px-6 border-hairline bg-white h-12 text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all">
            <CalendarIcon className="w-4 h-4 text-primary" /> 12 Tháng 06, 2024 <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
          <Button className="bg-action text-white rounded-full px-8 h-12 text-sm font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-action/10">
            <Download className="w-4 h-4" /> Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Tổng lượt thăm khám" value="1,284" trend="+12.5%" icon={Activity} delay={0.1} />
        <StatCard title="Chỉ số Hài lòng (CSAT)" value="98.2%" trend="+0.4%" icon={Heart} delay={0.2} />
        <StatCard title="Thời gian Phản hồi" value="12.4m" trend="-1.8m" icon={Clock} delay={0.3} />
        <StatCard title="Bệnh nhân Đăng ký mới" value="84" trend="+8%" icon={Users} delay={0.4} />
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visit Trends Chart */}
        <Card className="lg:col-span-2 bg-white border-hairline rounded-[40px] p-10 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-center mb-12 relative z-10">
            <div>
              <h3 className="text-xl font-bold tight-tracking">Lưu lượng Thăm khám</h3>
              <p className="text-xs text-muted-foreground mt-1">So sánh số lượt khám thực tế với tuần trước</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-on-surface-tertiary uppercase tracking-wider">Tuần này</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-hairline" />
                <span className="text-[10px] font-bold text-on-surface-tertiary uppercase tracking-wider">Tuần trước</span>
              </div>
            </div>
          </div>
          
          <div className="h-[380px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18BE66" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#18BE66" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F1F4" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#A1A1AA', fontWeight: 600 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#A1A1AA', fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  name="Tuần này"
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#18BE66" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorVisits)" 
                  animationDuration={1500}
                />
                <Area 
                  name="Tuần trước"
                  type="monotone" 
                  dataKey="previous" 
                  stroke="#E4E4E7" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  fill="transparent"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Dept Breakdown Pie */}
        <Card className="bg-white border-hairline rounded-[40px] p-10 shadow-xs flex flex-col h-full">
          <div className="mb-10">
            <h3 className="text-xl font-bold tight-tracking">Cơ cấu Chuyên khoa</h3>
            <p className="text-xs text-muted-foreground mt-1">Phân bổ khối lượng công việc</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-[240px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={10}
                    dataKey="value"
                    animationDuration={1500}
                    animationBegin={200}
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold tight-tracking">100%</span>
                <span className="text-[10px] uppercase font-bold text-on-surface-tertiary tracking-widest mt-1">Tổng cộng</span>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              {deptData.map((item) => (
                <div key={item.name} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold font-mono">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Section: Staff Rank & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Top Staff Table/List */}
        <Card className="lg:col-span-6 bg-white border-hairline rounded-[40px] p-10 shadow-xs">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold tight-tracking">Nhân viên Xuất sắc</h3>
              <p className="text-xs text-muted-foreground mt-1">Dựa trên kết quả điều trị và phản hồi BN</p>
            </div>
            <Button variant="ghost" className="text-primary-strong text-xs font-bold hover:bg-surface-tinted rounded-full px-5 transition-all">
              Tất cả bảng xếp hạng
            </Button>
          </div>

          <div className="space-y-4">
            {topStaff.map((person, i) => (
              <motion.div 
                key={person.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center justify-between p-4 rounded-[24px] border border-transparent hover:border-hairline hover:bg-surface-secondary/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={person.avatar} className="w-12 h-12 rounded-2xl object-cover border border-hairline" alt={person.name} />
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-white rounded-full border border-hairline flex items-center justify-center text-[10px] font-bold shadow-sm">
                      {i + 1}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{person.name}</h4>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{person.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-on-surface-tertiary uppercase mb-0.5">Hài lòng</p>
                    <p className="text-sm font-bold text-foreground">{person.score}%</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold min-w-[70px] justify-center",
                    person.trend.startsWith('+') ? "bg-surface-tinted text-primary-strong" : "bg-orange-50 text-orange-600"
                  )}>
                    {person.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {person.trend}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Recent Downloads/Reports */}
        <Card className="lg:col-span-4 bg-surface-secondary/40 border-hairline border-dashed rounded-[40px] p-10 flex flex-col">
          <div className="mb-10">
            <h3 className="text-xl font-bold tight-tracking">Báo cáo Gần đây</h3>
            <p className="text-xs text-muted-foreground mt-1">Truy cập nhanh các tập tin đã tạo</p>
          </div>

          <div className="flex-1 space-y-4">
            {recentReports.map((report, i) => (
              <motion.div 
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-white border border-hairline rounded-3xl p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-on-surface-tertiary group-hover:bg-primary group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold truncate pr-4">{report.name}</p>
                      <span className="text-[9px] font-bold bg-surface-secondary px-1.5 py-0.5 rounded uppercase tracking-widest">{report.type}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium">
                      <span>ID: {report.id}</span>
                      <span>{report.date}</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Button variant="outline" className="mt-10 w-full rounded-full border-hairline bg-white h-12 text-sm font-bold hover:bg-white/80">
            Xem kho lưu trữ
          </Button>
        </Card>
      </div>
    </div>
  )
}
