"use client"

import { Plus, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Stats } from "@/components/dashboard/stats"
import { StaffDirectory } from "@/components/dashboard/staff-directory"
import { TodayVisits } from "@/components/dashboard/today-visits"
import { DispatchMap } from "@/components/dashboard/dispatch-map"
import { ActivityLog } from "@/components/dashboard/activity-log"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { user } = useAuth()
  const displayName = user?.fullName || "Admin"
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute -top-[10%] left-[5%] w-[50%] h-[50%] bg-surface-tinted/40 rounded-full blur-[120px]" 
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[100px]" 
        />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015] grayscale" style={{ backgroundImage: 'radial-gradient(#18BE66 1.5px, transparent 0)', backgroundSize: '48px 48px' }} />
      </div>

      <div className="p-10 max-w-7xl mx-auto space-y-28 pb-32">
        
        {/* Hero Section */}
        <section id="hero-section">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 bg-surface-tinted px-3 py-1 rounded-full border border-primary/10 shadow-sm">
                   <Sparkles className="w-3.5 h-3.5 text-primary-strong animate-pulse" />
                   <span className="eyebrow text-[10px]">Trung tâm điều phối thông minh</span>
                </div>
                <div className="w-px h-4 bg-hairline" />
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Thời gian thực</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tight-tracking text-foreground leading-[1.05] mb-6">
                Chào buổi sáng, <br />
                <span className="text-primary-strong bg-linear-to-r from-primary-strong to-primary bg-clip-text text-transparent">{displayName}.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
                Nền tảng quản lý lưu động tích hợp AI. Theo dõi hoạt động của 58 nhân viên và 142 ca trực đang diễn ra trong mạng lưới.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center gap-4 shrink-0"
            >
              <Button variant="outline" className="rounded-full px-8 h-14 font-bold text-sm bg-white/70 backdrop-blur-md border-hairline hover:bg-white transition-all shadow-sm flex items-center gap-3 group">
                <Play className="w-4 h-4 fill-foreground group-hover:fill-primary transition-colors" />
                Xem Demo
              </Button>
              <Button className="bg-action text-white rounded-full px-10 h-14 font-bold text-sm flex items-center gap-3 hover:opacity-90 transition-all shadow-2xl shadow-action/20 group border-b-4 border-white/10 active:border-b-0 active:translate-y-1">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Phân công ca trực
              </Button>
            </motion.div>
          </div>

          <Stats />
        </section>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
           <StaffDirectory />
           <TodayVisits />
           <DispatchMap />
           <ActivityLog />
        </div>

        {/* Footer */}
        <footer className="pt-20 border-t border-hairline flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 transform -rotate-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-black tight-tracking text-foreground uppercase tracking-tight">MintCare</span>
              <p className="text-[10px] font-bold text-on-surface-tertiary uppercase tracking-[0.3em] mt-1">Nền tảng vận hành lõi &copy; 2024</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-6">
            <div className="space-y-4">
               <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Hệ thống</p>
               <nav className="flex flex-col gap-3">
                 <a href="#" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Trạng thái</a>
                 <a href="#" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Bảo mật</a>
               </nav>
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Hỗ trợ</p>
               <nav className="flex flex-col gap-3">
                 <a href="#" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Tài liệu</a>
                 <a href="#" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Liên hệ</a>
               </nav>
            </div>
            <div className="space-y-4 col-span-2 md:col-span-1">
               <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Pháp lý</p>
               <nav className="flex flex-col gap-3">
                 <a href="#" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Quyền riêng tư</a>
                 <a href="#" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Điều khoản</a>
               </nav>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
