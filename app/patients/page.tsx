"use client"

import * as React from "react"
import { 
  Plus, 
  MoreVertical, 
  ClipboardList, 
  Stethoscope, 
  History, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  ArrowUpRight,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { patients, staff } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Patient } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

function AddPatientDialog() {
  return (
    <Dialog>
      <DialogTrigger render={
        <Button className="bg-primary text-white rounded-full px-8 py-3 font-bold text-sm flex items-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20 h-14">
          <Plus className="w-5 h-5" /> Thêm bệnh nhân
        </Button>
      } />
      <DialogContent className="sm:max-w-[550px] rounded-[32px] border-hairline shadow-2xl p-8">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-surface-tinted flex items-center justify-center text-primary mb-6 shadow-sm">
            <User className="w-6 h-6" />
          </div>
          <DialogTitle className="text-3xl font-black tight-tracking text-foreground uppercase">Hồ sơ bệnh nhân</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2 text-base font-medium leading-relaxed">
            Khởi tạo mã định danh và nhập thông tin lâm sàng ban đầu cho quy trình chăm sóc tại gia.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-8 py-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary">Họ và tên bệnh nhân</Label>
              <Input id="name" placeholder="Nguyễn Văn A" className="rounded-2xl border-hairline h-12 bg-surface-secondary/30 focus:bg-white transition-all shadow-none font-bold" />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="dob" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary">Ngày tháng năm sinh</Label>
              <Input id="dob" type="date" className="rounded-2xl border-hairline h-12 bg-surface-secondary/30 focus:bg-white transition-all shadow-none font-bold uppercase" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label htmlFor="gender" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary">Giới tính</Label>
              <Input id="gender" placeholder="Nam / Nữ / Khác" className="rounded-2xl border-hairline h-12 bg-surface-secondary/30 focus:bg-white transition-all shadow-none font-bold" />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary">Số điện thoại liên lạc</Label>
              <Input id="phone" type="tel" placeholder="090..." className="rounded-2xl border-hairline h-12 bg-surface-secondary/30 focus:bg-white transition-all shadow-none font-bold" />
            </div>
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="summary" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary">Tiền sử & Chẩn đoán sơ bộ</Label>
            <Textarea id="summary" placeholder="Mô tả các tình trạng sức khỏe, dị ứng hoặc ghi chú đặc biệt..." className="rounded-2xl border-hairline bg-surface-secondary/30 focus:bg-white transition-all min-h-[140px] shadow-none font-medium leading-relaxed" />
          </div>
        </div>
        <DialogFooter className="pt-4 flex-col sm:flex-col gap-3">
          <Button type="submit" className="w-full bg-action text-white rounded-full py-7 h-14 text-base font-black uppercase tracking-[0.15em] hover:opacity-95 shadow-2xl shadow-action/20 transition-all border-b-4 border-white/10 active:border-b-0 active:translate-y-0.5">
            Xác nhận tạo hồ sơ
          </Button>
          <p className="text-[10px] text-center font-bold text-on-surface-tertiary uppercase tracking-widest">Dữ liệu sẽ được mã hóa đầu cuối theo chuẩn HIPAA</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PatientRow({ patient }: { patient: Patient }) {
  const [expanded, setExpanded] = React.useState(false)
  const assignedStaffMembers = staff.filter(s => patient.assignedStaff.includes(s.id))

  return (
    <>
      <TableRow 
        className={cn(
          "group transition-all cursor-pointer relative",
          expanded ? "bg-surface-tinted/40 shadow-inner" : "hover:bg-surface-secondary/50"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell className="px-8 py-6">
           <span className="font-mono text-[10px] font-black text-primary-strong bg-surface-tinted px-2.5 py-1.5 rounded-xl border border-primary/20 shadow-xs">#{patient.id.replace('BN-', '')}</span>
        </TableCell>
        <TableCell className="px-8 py-6">
          <div className="flex items-center gap-5">
            <div className={cn(
              "w-14 h-14 rounded-[20px] flex items-center justify-center font-black text-primary text-base shadow-sm border-2 border-white transition-all duration-500 group-hover:rotate-3 group-hover:scale-105",
              expanded ? "bg-primary text-white rotate-0! scale-100!" : "bg-surface-secondary"
            )}>
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">{patient.name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">{patient.gender}</span>
                <div className="w-1 h-1 rounded-full bg-hairline" />
                <span className="text-[9px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">{patient.age} TUỔI</span>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="px-8 py-6">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center text-on-surface-tertiary group-hover:bg-white transition-all shadow-xs group-hover:text-primary">
                <Calendar className="w-5 h-5" />
             </div>
             <div>
                <p className="text-sm font-bold text-foreground leading-tight">{patient.lastVisit}</p>
                <p className="text-[10px] text-on-surface-tertiary font-black font-mono tracking-tighter uppercase mt-1 opacity-70">{patient.lastVisitTime}</p>
             </div>
          </div>
        </TableCell>
        <TableCell className="px-8 py-6">
          <span className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border transition-all duration-300",
            patient.status === "Đang điều trị" 
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
              : "bg-white text-on-surface-tertiary border-hairline group-hover:bg-surface-secondary"
          )}>
            {patient.status === "Đang điều trị" && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            {patient.status}
          </span>
        </TableCell>
        <TableCell className="px-8 py-6 text-right">
          <Button variant="ghost" size="icon" className="text-on-surface-tertiary hover:bg-white hover:text-action rounded-2xl transition-all shadow-none h-11 w-11">
            <MoreVertical className="w-6 h-6" />
          </Button>
        </TableCell>
      </TableRow>
      
      <AnimatePresence>
        {expanded && (
          <TableRow className="bg-surface-tinted/10 border-none! hover:bg-surface-tinted/10">
            <TableCell colSpan={5} className="px-8 py-0">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "circOut" }}
              >
                <div className="py-12 grid grid-cols-1 xl:grid-cols-10 gap-12 border-t border-primary/10">
                  <div className="xl:col-span-4 space-y-7">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary">
                        <FileText className="w-5.5 h-5.5" />
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-strong">Thông tin y khoa</h4>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] border border-hairline shadow-xl shadow-black/[0.02] relative group/box overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-surface-tinted/50 rounded-bl-[60px] -mr-12 -mt-12 transition-all group-hover/box:scale-110" />
                       <div className="flex items-center gap-2 mb-4 relative z-10">
                          <ClipboardList className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-widest">Chẩn đoán hiện tại</span>
                       </div>
                       <p className="text-base text-foreground leading-relaxed font-medium relative z-10 antialiased">
                        {patient.summary}
                      </p>
                    </div>
                  </div>

                  <div className="xl:col-span-3 space-y-7">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary">
                        <Stethoscope className="w-5.5 h-5.5" />
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-strong">Nhân sự phụ trách</h4>
                    </div>
                    <div className="space-y-4">
                      {assignedStaffMembers.map(s => (
                        <div key={s.id} className="flex items-center gap-5 bg-white p-4.5 rounded-[24px] border border-hairline hover:border-primary/30 hover:shadow-lg transition-all group/member shadow-sm cursor-pointer">
                          <img src={s.avatar} className="w-12 h-12 rounded-[18px] object-cover ring-2 ring-white shadow-md transition-transform group-hover/member:scale-110" alt={s.name} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-foreground group-hover/member:text-primary transition-colors truncate">{s.name}</p>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.15em] mt-1 opacity-80">{s.role.split('•')[0]}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-hairline group-hover/member:text-primary transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="xl:col-span-3 space-y-7">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary">
                          <History className="w-5.5 h-5.5" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-strong">Nhật ký điều trị</h4>
                      </div>
                      <button className="text-primary-strong text-[9px] font-black uppercase tracking-widest hover:underline flex items-center gap-2 bg-surface-tinted px-3 py-1.5 rounded-full border border-primary/10 transition-all hover:bg-primary hover:text-white">
                        LỊCH SỬ <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="bg-white rounded-[32px] border border-hairline overflow-hidden shadow-sm divide-y divide-hairline">
                      {[
                        { title: 'Thay băng & Kiểm tra', date: '12/06', type: 'Clinical' },
                        { title: 'Vật lý trị liệu', date: '10/06', type: 'Rehab' },
                        { title: 'Kiểm tra tổng quát', date: '05/06', type: 'Clinical' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-5 hover:bg-surface-secondary/40 transition-all cursor-pointer group/item">
                          <div>
                            <span className="text-xs font-black text-foreground group-hover/item:text-primary transition-colors">{item.title}</span>
                            <p className="text-[8px] font-black text-on-surface-tertiary uppercase tracking-widest mt-1 opacity-60">{item.type}</p>
                          </div>
                          <span className="font-mono text-[10px] font-black text-on-surface-tertiary uppercase bg-surface-secondary/50 px-2 py-1 rounded-lg border border-hairline">{item.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </TableCell>
          </TableRow>
        )}
      </AnimatePresence>
    </>
  )
}

export default function PatientsPage() {
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
             <div className="flex items-center gap-2 bg-surface-tinted px-3 py-1.5 rounded-full border border-primary/10 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="eyebrow text-[10px] font-black">Cơ sở dữ liệu trung tâm</span>
             </div>
             <div className="w-px h-4 bg-hairline" />
             <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-widest">842 Bệnh nhân</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tight-tracking text-foreground leading-[1.1] uppercase">Quản lý <br />Bệnh nhân</h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-2xl font-medium leading-relaxed antialiased">
            Hệ thống quản lý bệnh án số hóa theo tiêu chuẩn lâm sàng. Theo dõi sát sao quá trình hồi phục và lịch trình thăm khám tại gia.
          </p>
        </motion.div>
        <div className="shrink-0 relative group">
           <div className="absolute -inset-4 bg-primary/5 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
           <AddPatientDialog />
        </div>
      </div>

      {/* Enhanced Control Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-6">
         <div className="relative flex-1 w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
            <Input 
              placeholder="Tìm kiếm danh tính, mã hồ sơ hoặc liên lạc..." 
              className="pl-14 h-16 rounded-[24px] bg-white border-hairline focus:ring-8 focus:ring-primary/5 transition-all text-base font-bold shadow-xl shadow-black/[0.02] border-b-2 border-b-hairline placeholder:text-on-surface-tertiary placeholder:font-medium"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2 bg-surface-secondary/50 px-3 py-1.5 rounded-xl border border-hairline">
                <span className="text-[9px] font-black text-on-surface-tertiary uppercase tracking-widest">Alt + S</span>
            </div>
         </div>
         <div className="flex items-center gap-4 w-full lg:w-auto">
            <Button variant="outline" className="h-16 px-8 rounded-[24px] border-hairline bg-white font-black text-[11px] uppercase tracking-[0.15em] flex items-center gap-3 shadow-lg shadow-black/[0.03] transition-all hover:bg-surface-secondary active:scale-95 group">
               <Filter className="w-4.5 h-4.5 text-primary group-hover:rotate-180 transition-transform duration-500" /> Lọc hồ sơ
            </Button>
            <Button variant="outline" className="h-16 px-8 rounded-[24px] border-hairline bg-white font-black text-[11px] uppercase tracking-[0.15em] flex items-center gap-3 shadow-lg shadow-black/[0.03] transition-all hover:bg-surface-secondary active:scale-95 group">
               <Download className="w-4.5 h-4.5 text-primary group-hover:-translate-y-1 transition-transform" /> Xuất báo cáo
            </Button>
         </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-hairline rounded-[48px] overflow-hidden shadow-2xl shadow-black/[0.04] relative">
        {/* Subtle top decoration */}
        <div className="h-1.5 w-full bg-linear-to-r from-primary/10 via-primary to-primary/10 opacity-50" />
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-secondary/40 border-b border-hairline hover:bg-surface-secondary/40">
                <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em]">Định danh</TableHead>
                <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em]">Bệnh nhân & Thông tin cá nhân</TableHead>
                <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em]">Phiên khám cuối</TableHead>
                <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em]">Trạng thái lâm sàng</TableHead>
                <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-hairline/40">
              {patients.map((patient) => (
                <PatientRow key={patient.id} patient={patient} />
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="px-10 py-8 border-t border-hairline flex flex-col md:flex-row items-center justify-between bg-surface-secondary/10 gap-6">
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-primary" />
             <p className="text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">Hiển thị <span className="text-foreground">1-10</span> trong số <span className="text-foreground">840</span> hồ sơ hệ thống</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-hairline bg-white shadow-md hover:bg-surface-secondary transition-all disabled:opacity-30 disabled:shadow-none" disabled>
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-3 bg-white border border-hairline px-6 h-12 rounded-2xl shadow-md group">
               <span className="text-sm font-black text-primary group-hover:scale-110 transition-transform">1</span>
               <span className="text-xs font-bold text-muted-foreground opacity-30">/</span>
               <span className="text-xs font-bold text-on-surface-tertiary uppercase tracking-widest">84</span>
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-hairline bg-white shadow-md hover:bg-surface-secondary transition-all">
              <ChevronRight className="w-6 h-6 text-primary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
