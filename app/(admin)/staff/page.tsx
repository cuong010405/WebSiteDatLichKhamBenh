"use client"

import { 
  MoreHorizontal, 
  MapPin, 
  Clock, 
  UserPlus, 
  Download, 
  Search, 
  Filter, 
  Star, 
  MessageSquare, 
  Phone,
  LayoutGrid,
  List,
  Sparkles,
  ShieldCheck
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { staff } from "@/lib/mock-data"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Staff } from "@/lib/types"

function StaffCard({ person }: { person: Staff }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4 }}
    >
      <div className="group border border-hairline rounded-[36px] p-8 bg-white hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden shadow-xs hover:shadow-2xl hover:shadow-black/[0.04]">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-surface-tinted/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-22 h-20 rounded-[30px] border-4 border-white shadow-xl ring-1 ring-hairline group-hover:ring-primary/20 transition-all duration-500">
                <AvatarImage src={person.avatar} alt={person.name} className="object-cover" />
                <AvatarFallback className="bg-surface-secondary text-primary-strong text-2xl font-black uppercase">{person.name[0]}</AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-7 h-7 border-4 border-white rounded-full shadow-lg transition-colors duration-500",
                person.available ? "bg-primary" : "bg-orange-500"
              )}>
                 <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-30" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-2xl text-foreground group-hover:text-primary transition-colors duration-300 leading-none uppercase tracking-tight truncate">{person.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="bg-surface-tinted text-primary-strong text-[9px] font-black px-3 py-1 rounded-xl uppercase tracking-widest border border-primary/10">
                  {person.role.split('•')[0]}
                </span>
                <div className="w-1 h-1 rounded-full bg-hairline" />
                <span className="text-[9px] font-black text-on-surface-tertiary uppercase tracking-widest">
                  {person.department}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-on-surface-tertiary hover:bg-surface-secondary hover:text-foreground rounded-2xl h-12 w-12 transition-all shadow-none">
            <MoreHorizontal className="w-7 h-7" />
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 relative z-10">
           <div className="bg-surface-secondary/40 p-5 rounded-[24px] border border-hairline/40 transition-all group-hover:bg-white group-hover:shadow-sm">
              <p className="text-[9px] font-black text-on-surface-tertiary uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Star className="w-3.5 h-3.5 fill-primary text-primary" /> Xếp hạng
              </p>
              <p className="text-lg font-black text-foreground tracking-tighter">4.9<span className="text-[10px] text-on-surface-tertiary ml-1 opacity-50">/5.0</span></p>
           </div>
           <div className="bg-surface-secondary/40 p-5 rounded-[24px] border border-hairline/40 transition-all group-hover:bg-white group-hover:shadow-sm">
              <p className="text-[9px] font-black text-on-surface-tertiary uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Clock className="w-3.5 h-3.5 text-primary" /> Hiệu suất
              </p>
              <p className="text-lg font-black text-foreground tracking-tighter">120+<span className="text-[10px] text-on-surface-tertiary ml-1 opacity-50">CA TRỰC</span></p>
           </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-hairline/50 pt-8 relative z-10">
          <div className="flex items-center gap-3.5 text-[13px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
            <div className={cn(
              "w-11 h-11 rounded-[18px] flex items-center justify-center shadow-md transition-all group-hover:scale-110",
              person.available ? "bg-surface-tinted text-primary" : "bg-orange-50 text-orange-600"
            )}>
               {person.available ? <MapPin className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.1em] mb-0.5">Vị trí hiện tại</span>
               <span className="truncate max-w-[140px] font-black tracking-tight">{person.location}</span>
            </div>
          </div>
          <div className="flex gap-2.5">
             <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-hairline bg-white hover:bg-primary hover:text-white hover:shadow-xl transition-all shadow-sm">
                <MessageSquare className="w-5 h-5" />
             </Button>
             <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-hairline bg-white hover:bg-primary hover:text-white hover:shadow-xl transition-all shadow-sm">
                <Phone className="w-5 h-5" />
             </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AddStaffForm() {
  return (
    <div className="bg-white rounded-[48px] p-10 sticky top-32 border border-hairline shadow-2xl shadow-black/[0.04] overflow-hidden">
      {/* Dynamic Background decoration */}
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-surface-tinted/40 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-50/40 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 mb-10">
         <div className="w-14 h-14 bg-action rounded-[22px] flex items-center justify-center text-white mb-8 shadow-2xl shadow-action/30 transform -rotate-3 transition-transform hover:rotate-0">
            <UserPlus className="w-7 h-7" />
         </div>
         <h2 className="text-3xl font-black tight-tracking uppercase leading-none">Đăng ký <br />Chuyên gia</h2>
         <p className="text-base text-muted-foreground mt-3 font-medium leading-relaxed">Thiết lập tài khoản công vụ cho nhân sự mới gia nhập hệ thống.</p>
      </div>
      
      <form className="space-y-7 relative z-10" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-tertiary ml-1">Họ và tên đầy đủ</label>
          <Input placeholder="VD: Nguyễn Văn A" className="w-full bg-surface-secondary/20 border-hairline focus:bg-white focus:ring-8 focus:ring-primary/5 rounded-[20px] h-14 shadow-none font-black text-base placeholder:font-medium transition-all" />
        </div>
        
        <div className="grid grid-cols-1 gap-7">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-tertiary ml-1">Chức vụ chuyên môn</label>
            <Select>
              <SelectTrigger className="w-full bg-surface-secondary/20 border-hairline focus:bg-white rounded-[20px] h-14 shadow-none font-black text-sm transition-all">
                <SelectValue placeholder="Chọn chức vụ" />
              </SelectTrigger>
              <SelectContent className="rounded-[24px] border-hairline shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2">
                <SelectItem value="doctor" className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted">Bác sĩ Chuyên khoa</SelectItem>
                <SelectItem value="nurse" className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted">Y tá Điều dưỡng</SelectItem>
                <SelectItem value="pt" className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted">Chuyên gia VLTL</SelectItem>
                <SelectItem value="dietitian" className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted">Chuyên gia Dinh dưỡng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-tertiary ml-1">Phòng ban quản lý</label>
            <Select>
              <SelectTrigger className="w-full bg-surface-secondary/20 border-hairline focus:bg-white rounded-[20px] h-14 shadow-none font-black text-sm transition-all">
                <SelectValue placeholder="Chọn phòng ban" />
              </SelectTrigger>
              <SelectContent className="rounded-[24px] border-hairline shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2">
                <SelectItem value="internal" className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted">Nội khoa</SelectItem>
                <SelectItem value="external" className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted">Ngoại khoa</SelectItem>
                <SelectItem value="rehab" className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted">Phục hồi chức năng</SelectItem>
                <SelectItem value="emergency" className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted">Cấp cứu tại gia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-tertiary ml-1">Số điện thoại liên lạc</label>
          <Input type="tel" placeholder="090 123 4567" className="w-full bg-surface-secondary/20 border-hairline focus:bg-white rounded-[20px] h-14 shadow-none font-black text-base placeholder:font-medium transition-all" />
        </div>

        <div className="pt-6">
          <Button type="submit" className="w-full bg-action text-white rounded-full py-9 h-14 text-base font-black uppercase tracking-[0.2em] hover:opacity-95 shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all border-b-4 border-white/10 active:border-b-0 active:translate-y-1 group relative overflow-hidden">
            <span className="relative z-10 flex items-center justify-center gap-3">
               Tạo hồ sơ <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </span>
          </Button>
        </div>
      </form>

      <div className="mt-10 p-6 bg-surface-tinted/40 border border-primary/10 rounded-[32px] relative overflow-hidden group/tip transition-colors hover:bg-surface-tinted">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-12 h-12 bg-white rounded-[18px] flex items-center justify-center text-primary shadow-lg border border-primary/5 transform transition-all group-hover/tip:rotate-12 group-hover/tip:scale-110">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-primary-strong uppercase tracking-[0.25em]">Tuân thủ bảo mật</p>
            <p className="text-xs font-bold text-foreground leading-tight mt-1.5 opacity-80">Thông tin cá nhân được mã hóa chuẩn y tế AES-256.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StaffPage() {
  return (
    <div className="p-10 max-w-7xl mx-auto w-full space-y-16 pb-32">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-6">
             <div className="flex items-center gap-2 bg-surface-tinted px-3.5 py-2 rounded-full border border-primary/10 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="eyebrow text-[10px] font-black uppercase tracking-widest">Nguồn lực nhân sự</span>
             </div>
             <div className="w-px h-5 bg-hairline" />
             <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">64 Thành viên</span>
          </div>
          <h1 className="text-6xl font-black tight-tracking text-foreground leading-[1] uppercase">Quản lý <br />Chuyên gia</h1>
          <p className="text-xl text-muted-foreground mt-5 max-w-2xl font-medium leading-relaxed antialiased">
            Điều phối và nâng cao hiệu suất làm việc cho đội ngũ y tế lưu động. Nền tảng đo lường năng lực và phản hồi khách quan từ bệnh nhân.
          </p>
        </motion.div>
        <div className="shrink-0">
          <Button variant="outline" className="bg-white text-foreground border-hairline rounded-[24px] px-10 h-16 text-xs font-black uppercase tracking-[0.2em] hover:bg-surface-secondary transition-all shadow-xl shadow-black/[0.02] flex items-center gap-3 active:scale-95 group">
            <Download className="w-5.5 h-5.5 text-primary group-hover:-translate-y-1 transition-transform" /> Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 space-y-12">
          {/* Enhanced Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
             <div className="relative flex-1 w-full group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
                <Input 
                  placeholder="Tìm theo định danh, chức vụ hoặc vị trí..." 
                  className="pl-16 h-18 rounded-[24px] bg-white border-hairline focus:ring-12 focus:ring-primary/5 transition-all text-lg font-black shadow-xl shadow-black/[0.03] placeholder:text-on-surface-tertiary placeholder:font-medium placeholder:text-base border-b-2 border-b-hairline"
                />
             </div>
             <div className="flex bg-surface-secondary/60 p-2 rounded-[22px] border border-hairline shadow-inner shrink-0">
                <button className="p-3.5 rounded-2xl bg-white shadow-md text-primary transition-all scale-105">
                   <LayoutGrid className="w-6 h-6" />
                </button>
                <button className="p-3.5 rounded-2xl text-on-surface-tertiary hover:bg-white/50 transition-all">
                   <List className="w-6 h-6" />
                </button>
             </div>
             <Button variant="outline" className="h-18 px-8 rounded-[24px] border-hairline bg-white font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-black/[0.03] hover:bg-surface-secondary active:scale-95 shrink-0">
                <Filter className="w-5 h-5 text-primary" /> Lọc
             </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {staff.map((person) => (
              <StaffCard key={person.id} person={person} />
            ))}
          </div>

          <div className="pt-14 flex justify-center">
             <Button variant="outline" className="rounded-full px-14 h-14 border-hairline text-[11px] font-black uppercase tracking-[0.25em] hover:bg-surface-secondary transition-all shadow-xl shadow-black/[0.01]">
                Mở rộng danh sách nhân viên
             </Button>
          </div>
        </div>

        <div className="xl:col-span-4">
          <AddStaffForm />
        </div>
      </div>
    </div>
  )
}
