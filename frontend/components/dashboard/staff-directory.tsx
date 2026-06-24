"use client"

import * as React from "react"
import { ArrowRight, ChevronRight, MapPin, Clock, Star, Heart, TrendingUp } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { staff as mockStaff } from "@/lib/mock-data"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { API_URL } from "@/lib/api"

export function StaffDirectory() {
  const [staff, setStaff] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`${API_URL}/staff`)
      .then((res) => {
        if (!res.ok) throw new Error("API error")
        return res.json()
      })
      .then((data) => {
        setStaff(data)
        setLoading(false)
      })
      .catch((err) => {
        console.warn("Không kết nối được API, dùng dữ liệu mẫu:", err)
        setStaff(mockStaff as any[])
        setLoading(false)
      })
  }, [])

  return (
    <section className="lg:col-span-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tight-tracking text-foreground">Chuyên gia đang trực</h2>
          <p className="text-sm text-muted-foreground mt-1">Đội ngũ y tế lưu động đang hoạt động ngoài thực địa.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-surface-secondary px-3 py-1.5 rounded-full border border-hairline">
            <TrendingUp className="w-3.5 h-3.5 text-primary-strong" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {loading ? "..." : `${staff.filter((s) => s.available).length} đang sẵn sàng`}
            </span>
          </div>
          <a href="/staff" className="group text-primary-strong text-[10px] font-bold uppercase tracking-[0.15em] hover:text-primary flex items-center gap-2 transition-all">
            Danh bạ <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-hairline rounded-[32px] p-7 bg-white shadow-xs animate-pulse">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[28px] bg-surface-secondary" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-surface-secondary rounded-full w-3/4" />
                    <div className="h-3 bg-surface-secondary rounded-full w-1/2" />
                    <div className="h-3 bg-surface-secondary rounded-full w-1/3" />
                  </div>
                </div>
                <div className="mt-10 pt-7 border-t border-hairline border-dashed flex items-center justify-between">
                  <div className="h-10 w-10 bg-surface-secondary rounded-2xl" />
                  <div className="h-11 w-28 bg-surface-secondary rounded-2xl" />
                </div>
              </div>
            ))
          : staff.map((person, i) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
              >
                <div className="group border border-hairline rounded-[32px] p-7 hover:border-primary/30 relative overflow-hidden bg-white transition-all shadow-xs hover:shadow-xl">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-surface-tinted/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="w-20 h-20 rounded-[28px] border-4 border-white shadow-md ring-1 ring-hairline group-hover:ring-primary/20 transition-all">
                          <AvatarImage src={person.avatar} alt={person.name} className="object-cover" />
                          <AvatarFallback className="bg-surface-secondary text-primary-strong text-xl font-bold">{person.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full shadow-md transition-colors duration-500",
                          person.available ? "bg-primary" : "bg-orange-500"
                        )}>
                          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-30" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-xl leading-tight group-hover:text-primary transition-colors duration-300">{person.name}</h3>
                        <p className="text-xs text-on-surface-tertiary mt-1.5 font-bold uppercase tracking-wider">{String(person.role).split('•')[0]}</p>
                        
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary-strong">
                            <Star className="w-3.5 h-3.5 fill-primary text-primary" /> 4.9
                          </div>
                          <div className="w-1 h-1 rounded-full bg-hairline" />
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                            <Heart className="w-3.5 h-3.5 text-red-400" /> 120+
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {person.isNew && (
                      <span className="bg-primary text-white font-mono text-[9px] px-2.5 py-1 rounded-full font-black shadow-sm relative z-10 tracking-widest">MỚI</span>
                    )}
                  </div>

                  <div className="mt-10 pt-7 border-t border-hairline border-dashed flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground font-semibold">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                        person.available ? "bg-surface-tinted text-primary" : "bg-orange-50 text-orange-600"
                      )}>
                        {person.available ? <MapPin className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <span className="truncate max-w-[140px]">{person.location}</span>
                    </div>
                    <Button className="h-11 rounded-2xl px-6 text-xs font-bold bg-action text-white hover:opacity-90 flex items-center gap-2 group/btn transition-all shadow-lg shadow-action/5">
                      {person.available ? "Phân công" : "Chi tiết"} 
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
        }
      </div>
    </section>
  )
}
