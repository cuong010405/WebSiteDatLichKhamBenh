"use client"

import * as React from "react"
import { Plus, Play, Sparkles, Map, Users, Clock, CheckCircle2, AlertCircle, Navigation, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Stats } from "@/components/dashboard/stats"
import { StaffDirectory } from "@/components/dashboard/staff-directory"
import { TodayVisits } from "@/components/dashboard/today-visits"
import { ActivityLog } from "@/components/dashboard/activity-log"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { API_URL, authFetch } from "@/lib/api"

function DispatchSummaryCard() {
  const [staffList, setStaffList] = React.useState<any[]>([]);
  const [pendingVisits, setPendingVisits] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch(`${API_URL}/staff`).then(r => r.json()).then(d => { if (Array.isArray(d)) setStaffList(d.filter((s: any) => s.id !== "PENDING")); }).catch(() => {});
    authFetch(`${API_URL}/visits?dispatch=true`).then(r => r.json()).then(d => { if (Array.isArray(d)) setPendingVisits(d); }).catch(() => {});
    const iv = setInterval(() => {
      fetch(`${API_URL}/staff`).then(r => r.json()).then(d => { if (Array.isArray(d)) setStaffList(d.filter((s: any) => s.id !== "PENDING")); }).catch(() => {});
      authFetch(`${API_URL}/visits?dispatch=true`).then(r => r.json()).then(d => { if (Array.isArray(d)) setPendingVisits(d); }).catch(() => {});
    }, 15000);
    return () => clearInterval(iv);
  }, []);

  const readyCount = staffList.filter(s => s.available !== false && !s.status?.toLowerCase().includes("bận")).length;
  const busyCount = staffList.filter(s => s.available === false || s.status?.toLowerCase().includes("bận")).length;

  const features = [
    { icon: Navigation, label: "Định vị GPS thời gian thực", desc: "Xem vị trí chính xác từng nhân viên theo địa chỉ thực tế", color: "text-emerald-500", bg: "bg-emerald-50" },
    { icon: Map, label: "Bản đồ CartoDB Voyager", desc: "Phong cách Apple/Grab Maps hiện đại, chuyển đổi Chế độ Tối", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Zap, label: "FlyTo nhân viên tức thì", desc: "Nhấp chọn nhân viên → bản đồ bay tới vị trí trong 1.5 giây", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: CheckCircle2, label: "Chỉ đường Google Maps", desc: "Mỗi ghim có nút mở Google Maps chỉ đường trực tiếp", color: "text-violet-500", bg: "bg-violet-50" },
  ];

  return (
    <section className="lg:col-span-2">
      <div className="bg-white border border-hairline rounded-[32px] p-6 md:p-8 overflow-hidden relative h-full flex flex-col shadow-xs">
        
        {/* Nền gradient trang trí */}
        <div className="absolute inset-0 -z-0 pointer-events-none overflow-hidden rounded-[32px]">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-100/60 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-100/50 rounded-full blur-2xl" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#18BE66 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Trung tâm điều phối GPS</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Bản đồ Định vị<br />Lưu động MintCare</h2>
              <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-[260px]">Hệ thống bản đồ GPS thời gian thực — truy cập nhanh từ nút trên Thanh điều hướng</p>
            </div>

            {/* Nút gợi ý mở bản đồ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-2 shrink-0"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <Map className="w-7 h-7 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Nhấn nút</p>
                <p className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">🗺 Bản đồ GPS</p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">trên Header ↑</p>
              </div>
            </motion.div>
          </div>

          {/* Thống kê nhanh */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-emerald-700">{readyCount}</div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Sẵn sàng</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-amber-700">{busyCount}</div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Đang bận</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-blue-50 border border-blue-100 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-blue-700">
                {pendingVisits.filter((v: any) => {
                  const s = (v.status || "").toLowerCase().trim();
                  return !s.includes("hủy") && !s.includes("hoàn tất") && !s.includes("cancel") && !s.includes("complete");
                }).length}
              </div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wide">Lịch hẹn</p>
              </div>
            </motion.div>
          </div>

          {/* Danh sách tính năng GPS */}
          <div className="flex-1 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tính năng hệ thống GPS</p>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.2 }}
                className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-colors"
              >
                <div className={`w-8 h-8 ${f.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <f.icon className={`w-4 h-4 ${f.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{f.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer gợi ý */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
              <Map className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-700">Nhấn <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">🗺 Bản đồ GPS</span> trên thanh Header ở trên</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">Truy cập từ bất kỳ trang nào trong hệ thống</p>
            </div>
            <span className="shrink-0 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 animate-pulse">LIVE</span>
          </div>
        </div>
      </div>
    </section>
  );
}


export default function Home() {
  const { user } = useAuth()
  const displayName = user?.fullName || "Admin"
  const [totalStaff, setTotalStaff] = React.useState<number | string>("...")
  const [totalVisits, setTotalVisits] = React.useState<number | string>("...")

  React.useEffect(() => {
    const fetchReports = () => {
      authFetch(`${API_URL}/reports`)
        .then((res) => {
          if (!res.ok) throw new Error("Fail");
          return res.json();
        })
        .then((data) => {
          if (data) {
            setTotalStaff(data.totalStaff ?? "7");
            setTotalVisits(data.totalVisits ?? "3");
          }
        })
        .catch(() => {
          setTotalStaff(7);
          setTotalVisits(3);
        });
    }

    fetchReports();
    const interval = setInterval(fetchReports, 10000);
    window.addEventListener("focus", fetchReports);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", fetchReports);
    };
  }, []);

  const isStaff = user?.role === "vltl" || user?.role === "chuyen_gia" || user?.role === "dieu_duong";
  const roleTitle = user?.role === "vltl" ? "Vật lý trị liệu" : user?.role === "dieu_duong" ? "Điều dưỡng" : user?.role === "chuyen_gia" ? "Chuyên gia" : "Quản trị viên";

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
                   <span className="eyebrow text-[10px]">
                     {isStaff ? `Kênh làm việc ${roleTitle}` : "Trung tâm điều phối thông minh"}
                   </span>
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
                {isStaff
                  ? `Bảng điều khiển dành cho ${roleTitle}. Quản lý danh sách ca trực được giao và chăm sóc bệnh nhân phụ trách.`
                  : `Nền tảng quản lý lưu động tích hợp AI. Theo dõi hoạt động của ${totalStaff} nhân viên và ${totalVisits} ca trực đang diễn ra trong mạng lưới.`
                }
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center gap-4 shrink-0"
            >
              <Button 
                onClick={() => window.location.href = "/admin/schedule"}
                className="bg-action text-white rounded-full px-10 h-14 font-bold text-sm flex items-center gap-3 hover:opacity-90 transition-all shadow-2xl shadow-action/20 group border-b-4 border-white/10 active:border-b-0 active:translate-y-1 cursor-pointer"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                {isStaff ? "Xem lịch được phân công" : "Phân công ca trực"}
              </Button>
            </motion.div>
          </div>

          <Stats />
        </section>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
           <StaffDirectory />
           <TodayVisits />
           <DispatchSummaryCard />
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
