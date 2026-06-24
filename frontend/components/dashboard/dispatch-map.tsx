"use client"

import { motion } from "framer-motion"
import { Navigation, Users, Plus, Minus, Maximize2 } from "lucide-react"

export function DispatchMap() {
  return (
    <section className="lg:col-span-2">
      <div className="bg-white border border-hairline rounded-[32px] p-8 overflow-hidden relative h-full flex flex-col shadow-xs group/card">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <span className="eyebrow text-[11px] mb-1 block">Hoạt động điều phối</span>
            <h2 className="text-xl font-semibold tight-tracking">Bản đồ Trực tuyến</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-tinted px-4 py-2 rounded-full border border-primary/10 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] font-bold text-primary-strong uppercase tracking-wider">8 Chuyên gia đang trực</span>
            </div>
            <button suppressHydrationWarning className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center text-on-surface-tertiary hover:bg-surface-secondary hover:text-foreground transition-all shadow-sm">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 w-full bg-[#F8FAFC] rounded-[28px] relative overflow-hidden border border-hairline group-hover/card:border-primary/20 transition-all min-h-[350px]">
          {/* Mock Map Illustration - Detailed SVG for Premium Feel */}
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 800 600" fill="none">
            {/* Grid Pattern Background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="800" height="600" fill="url(#grid)" />

            {/* Major Streets */}
            <path d="M0 150 H800 M0 450 H800 M300 0 V600 M600 0 V600" stroke="#CBD5E1" strokeWidth="48" strokeLinecap="round" />
            <path d="M0 150 H800 M0 450 H800 M300 0 V600 M600 0 V600" stroke="white" strokeWidth="2" strokeDasharray="12 12" />
            
            {/* Buildings/Blocks */}
            <rect x="40" y="40" width="220" height="70" rx="12" fill="#E2E8F0" />
            <rect x="340" y="40" width="220" height="70" rx="12" fill="#E2E8F0" />
            
            <rect x="40" y="190" width="220" height="220" rx="16" fill="#E2E8F0" opacity="0.6" />
            <rect x="340" y="190" width="220" height="220" rx="16" fill="#E2E8F0" />
            <rect x="640" y="190" width="120" height="220" rx="16" fill="#E2E8F0" opacity="0.8" />
            
            <rect x="40" y="490" width="220" height="70" rx="12" fill="#E2E8F0" />
            <rect x="340" y="490" width="220" height="70" rx="12" fill="#E2E8F0" opacity="0.5" />
          </svg>
          
          {/* Traffic Simulation Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 600" fill="none">
            <motion.path 
              d="M300 150 H600 V450" 
              stroke="#18BE66" 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeDasharray="1 15"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -100 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              opacity="0.6"
            />
          </svg>
          
          {/* Animated Staff Markers */}
          {[
            { top: '22%', left: '35%', name: 'Sandra Bullock', role: 'Y tá trưởng', status: 'Thăm khám: Bệnh nhân #092' },
            { top: '48%', left: '72%', name: 'Marcus Thorne', role: 'Bác sĩ VLTL', status: 'Đang di chuyển: Quận 7' },
            { top: '65%', left: '28%', name: 'Lara Croft', role: 'Điều dưỡng', status: 'Thăm khám: Bệnh nhân #104' },
            { top: '78%', left: '62%', name: 'Peter Parker', role: 'Chuyên gia', status: 'Nghỉ giải lao' },
          ].map((pos, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.15, type: "spring", damping: 15 }}
              className="absolute z-10 cursor-pointer"
              style={pos}
            >
              <div className="relative group/pin">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg border border-hairline group-hover/pin:scale-110 transition-transform">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full">
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-40"></div>
                  </div>
                </div>
                
                {/* Detailed Popup on Hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-action text-white p-4 rounded-2xl whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-all pointer-events-none shadow-2xl translate-y-2 group-hover/pin:translate-y-0 min-w-[200px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{pos.name}</p>
                      <p className="text-[10px] opacity-60 font-medium uppercase tracking-wider">{pos.role}</p>
                    </div>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <p className="text-[10px] font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {pos.status}
                  </p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-action"></div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Bottom Left Status Bar */}
          <div className="absolute bottom-6 left-6 flex gap-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="bg-white/90 backdrop-blur-xl border border-hairline p-4 rounded-[24px] shadow-2xl flex items-center gap-4 border-b-2 border-b-primary/20"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
                <Navigation className="w-5 h-5" />
              </div>
              <div className="pr-2">
                <p className="text-[9px] font-bold text-primary-strong uppercase mb-0.5 tracking-[0.1em]">Tình trạng mạng lưới</p>
                <p className="text-xs font-bold text-foreground">Kết nối ổn định • Tuyến đường thông suốt</p>
              </div>
            </motion.div>
          </div>

          {/* Floating Controls */}
          <div className="absolute top-6 right-6 flex flex-col gap-2 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur-md border border-hairline p-1.5 rounded-2xl shadow-xl flex flex-col gap-1">
              <button suppressHydrationWarning className="w-9 h-9 rounded-xl hover:bg-surface-secondary flex items-center justify-center text-muted-foreground transition-colors group">
                <Plus className="w-4 h-4 group-hover:text-primary transition-colors" />
              </button>
              <div className="h-px bg-hairline mx-2" />
              <button suppressHydrationWarning className="w-9 h-9 rounded-xl hover:bg-surface-secondary flex items-center justify-center text-muted-foreground transition-colors group">
                <Minus className="w-4 h-4 group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
