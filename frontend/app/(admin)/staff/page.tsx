"use client"

import React from "react"
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
  ShieldCheck,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  User,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { staff as initialStaff } from "@/lib/mock-data"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Staff } from "@/lib/types"

const ROLES = ["Bác sĩ Chuyên khoa", "Y tá Điều dưỡng", "Chuyên gia VLTL", "Chuyên gia Dinh dưỡng"]
const DEPARTMENTS = ["Nội khoa", "Ngoại khoa", "Phục hồi chức năng", "Cấp cứu tại gia"]

/* ─── Edit Dialog ─── */
function EditStaffDialog({
  person,
  open,
  onOpenChange,
  onSave,
}: {
  person: Staff
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (updated: Staff) => void
}) {
  const [name, setName] = React.useState(person.name)
  const [role, setRole] = React.useState(person.role.split("•")[0].trim())
  const [department, setDepartment] = React.useState(person.department)
  const [phone, setPhone] = React.useState(person.phone)

  React.useEffect(() => {
    if (open) {
      setName(person.name)
      setRole(person.role.split("•")[0].trim())
      setDepartment(person.department)
      setPhone(person.phone)
    }
  }, [open, person])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...person, name, role, department, phone })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[28px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-indigo-500" />
        <form onSubmit={handleSubmit} className="p-8">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Pencil className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Chỉnh sửa chuyên gia</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Cập nhật thông tin hồ sơ nhân sự trong hệ thống.</DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Họ và tên</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Chức vụ</label>
                <Select value={role} onValueChange={(v) => setRole(v ?? "")}>
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none text-slate-800 transition-all">
                    <SelectValue placeholder="Chọn chức vụ..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    {ROLES.map((r) => <SelectItem key={r} value={r} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Phòng ban</label>
                <Select value={department} onValueChange={(v) => setDepartment(v ?? "")}>
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none text-slate-800 transition-all">
                    <SelectValue placeholder="Chọn phòng ban..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Số điện thoại</label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
            </div>
          </div>

          <DialogFooter className="pt-6 mt-6 border-t border-slate-100 flex-col sm:flex-col gap-3 bg-white">
            <Button type="submit" className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-95 transition-all shadow-md border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5 group">
              Lưu thay đổi <Sparkles className="w-3.5 h-3.5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">
              Hủy bỏ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Delete Dialog ─── */
function DeleteStaffDialog({
  person,
  open,
  onOpenChange,
  onDelete,
}: {
  person: Staff
  open: boolean
  onOpenChange: (v: boolean) => void
  onDelete: (id: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[24px] border border-red-100 shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-400 to-rose-500" />
        <div className="p-7">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 mb-4">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Xác nhận xóa</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">Hành động này không thể hoàn tác.</DialogDescription>
            </div>
          </DialogHeader>
          <div className="bg-red-50/80 border border-red-100 rounded-xl p-4 space-y-1.5 mb-6">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{person.name}</p>
            <p className="text-[10px] font-bold text-slate-500">Chức vụ: <span className="text-slate-700">{person.role.split("•")[0].trim()}</span></p>
            <p className="text-[10px] font-bold text-slate-500">Phòng ban: <span className="text-slate-700">{person.department}</span></p>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2 bg-white">
            <Button onClick={() => { onDelete(person.id); onOpenChange(false) }} className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-95 shadow-md shadow-red-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Xóa vĩnh viễn
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">
              Giữ lại
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Staff Card ─── */
function StaffCard({
  person,
  onEdit,
  onDelete,
}: {
  person: Staff
  onEdit: (p: Staff) => void
  onDelete: (id: string) => void
}) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  return (
    <>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -5 }} transition={{ duration: 0.4 }}>
        <div className="group border border-hairline rounded-[36px] p-8 bg-white hover:border-primary/30 transition-all cursor-pointer relative shadow-xs hover:shadow-2xl hover:shadow-black/[0.04]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-surface-tinted/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-22 h-20 rounded-[30px] border-4 border-white shadow-xl ring-1 ring-hairline group-hover:ring-primary/20 transition-all duration-500">
                  <AvatarImage src={person.avatar} alt={person.name} className="object-cover" />
                  <AvatarFallback className="bg-surface-secondary text-primary-strong text-2xl font-black uppercase">{person.name[0]}</AvatarFallback>
                </Avatar>
                <div className={cn("absolute -bottom-1 -right-1 w-7 h-7 border-4 border-white rounded-full shadow-lg transition-colors duration-500", person.available ? "bg-primary" : "bg-orange-500")}>
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-30" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-2xl text-foreground group-hover:text-primary transition-colors duration-300 leading-none uppercase tracking-tight truncate">{person.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="bg-surface-tinted text-primary-strong text-[9px] font-black px-3 py-1 rounded-xl uppercase tracking-widest border border-primary/10">{person.role.split("•")[0]}</span>
                  <div className="w-1 h-1 rounded-full bg-hairline" />
                  <span className="text-[9px] font-black text-on-surface-tertiary uppercase tracking-widest">{person.department}</span>
                </div>
              </div>
            </div>

            {/* ─── Spacer for layout balance ─── */}
            <div className="w-2 shrink-0" />
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
              <div className={cn("w-11 h-11 rounded-[18px] flex items-center justify-center shadow-md transition-all group-hover:scale-110", person.available ? "bg-surface-tinted text-primary" : "bg-orange-50 text-orange-600")}>
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

          {/* ─── Hover Action Bar (bottom) ─── */}
          <div className="overflow-hidden transition-all duration-300 ease-out max-h-0 group-hover:max-h-[52px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
            <div className="pt-4 flex gap-2.5">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-blue-100 text-blue-600 border border-blue-200 text-[9px] font-black uppercase tracking-widest hover:bg-blue-200/70 transition-colors"
              >
                <Pencil className="w-3 h-3" /> Sửa
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => { e.stopPropagation(); setDeleteOpen(true) }}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-red-100 text-red-500 border border-red-200 text-[9px] font-black uppercase tracking-widest hover:bg-red-200/70 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Xóa
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <EditStaffDialog person={person} open={editOpen} onOpenChange={setEditOpen} onSave={onEdit} />
      <DeleteStaffDialog person={person} open={deleteOpen} onOpenChange={setDeleteOpen} onDelete={onDelete} />
    </>
  )
}

/* ─── Add Staff Form ─── */
function AddStaffForm({ onAdd }: { onAdd: (s: Staff) => void }) {
  const [name, setName] = React.useState("")
  const [role, setRole] = React.useState("")
  const [department, setDepartment] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !role || !department) return
    const newStaff: Staff = {
      id: `S${Date.now()}`,
      name,
      role,
      status: "Sẵn sàng",
      department,
      phone: phone || "Chưa cập nhật",
      email: "",
      location: "Chưa cập nhật",
      avatar: "",
      available: true,
      isNew: true,
    }
    onAdd(newStaff)
    setName(""); setRole(""); setDepartment(""); setPhone("")
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="bg-white rounded-[48px] p-10 sticky top-32 border border-hairline shadow-2xl shadow-black/[0.04] overflow-hidden">
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-surface-tinted/40 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-50/40 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 mb-10">
        <div className="w-14 h-14 bg-action rounded-[22px] flex items-center justify-center text-white mb-8 shadow-2xl shadow-action/30 transform -rotate-3 transition-transform hover:rotate-0">
          <UserPlus className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-black tight-tracking uppercase leading-none">Đăng ký <br />Chuyên gia</h2>
        <p className="text-base text-muted-foreground mt-3 font-medium leading-relaxed">Thiết lập tài khoản công vụ cho nhân sự mới gia nhập hệ thống.</p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl p-4">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <p className="text-xs font-black text-green-700 uppercase tracking-widest">Đã thêm chuyên gia thành công!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form className="space-y-7 relative z-10" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-tertiary ml-1">Họ và tên đầy đủ</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="VD: Nguyễn Văn A" className="w-full bg-surface-secondary/20 border-hairline focus:bg-white focus:ring-8 focus:ring-primary/5 rounded-[20px] h-14 shadow-none font-black text-base placeholder:font-medium transition-all" />
        </div>
        <div className="grid grid-cols-1 gap-7">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-tertiary ml-1">Chức vụ chuyên môn</label>
            <Select value={role} onValueChange={(v) => setRole(v ?? "")}>
              <SelectTrigger className="w-full bg-surface-secondary/20 border-hairline focus:bg-white rounded-[20px] h-14 shadow-none font-black text-sm transition-all">
                <SelectValue placeholder="Chọn chức vụ" />
              </SelectTrigger>
              <SelectContent className="rounded-[24px] border-hairline shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2">
                {ROLES.map((r) => <SelectItem key={r} value={r} className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted">{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-tertiary ml-1">Phòng ban quản lý</label>
            <Select value={department} onValueChange={(v) => setDepartment(v ?? "")}>
              <SelectTrigger className="w-full bg-surface-secondary/20 border-hairline focus:bg-white rounded-[20px] h-14 shadow-none font-black text-sm transition-all">
                <SelectValue placeholder="Chọn phòng ban" />
              </SelectTrigger>
              <SelectContent className="rounded-[24px] border-hairline shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2">
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d} className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted">{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-tertiary ml-1">Số điện thoại liên lạc</label>
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="090 123 4567" className="w-full bg-surface-secondary/20 border-hairline focus:bg-white rounded-[20px] h-14 shadow-none font-black text-base placeholder:font-medium transition-all" />
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

/* ─── Page ─── */
export default function StaffPage() {
  const [staffList, setStaffList] = React.useState<Staff[]>(initialStaff)

  const handleEdit = (updated: Staff) => setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  const handleDelete = (id: string) => setStaffList((prev) => prev.filter((s) => s.id !== id))
  const handleAdd = (newStaff: Staff) => setStaffList((prev) => [newStaff, ...prev])

  return (
    <div className="p-10 max-w-7xl mx-auto w-full space-y-16 pb-32">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-surface-tinted px-3.5 py-2 rounded-full border border-primary/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="eyebrow text-[10px] font-black uppercase tracking-widest">Nguồn lực nhân sự</span>
            </div>
            <div className="w-px h-5 bg-hairline" />
            <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">{staffList.length} Thành viên</span>
          </div>
          <h1 className="text-6xl font-black tight-tracking text-foreground leading-[1] uppercase">Quản lý <br />Chuyên gia</h1>
          <p className="text-xl text-muted-foreground mt-5 max-w-2xl font-medium leading-relaxed antialiased">
            Điều phối và nâng cao hiệu suất làm việc cho đội ngũ y tế lưu động. Nền tảng đo lường năng lực và phản hồi khách quan từ bệnh nhân.
          </p>
        </motion.div>
        <div className="shrink-0">
          <Button variant="outline" className="bg-white text-foreground border-hairline rounded-[24px] px-10 h-16 text-xs font-black uppercase tracking-[0.2em] hover:bg-surface-secondary transition-all shadow-xl shadow-black/[0.02] flex items-center gap-3 active:scale-95 group">
            <Download className="w-5 h-5 text-primary group-hover:-translate-y-1 transition-transform" /> Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 space-y-12">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
              <Input placeholder="Tìm theo định danh, chức vụ hoặc vị trí..." className="pl-16 h-18 rounded-[24px] bg-white border-hairline focus:ring-12 focus:ring-primary/5 transition-all text-lg font-black shadow-xl shadow-black/[0.03] placeholder:text-on-surface-tertiary placeholder:font-medium placeholder:text-base border-b-2 border-b-hairline" />
            </div>
            <div className="flex bg-surface-secondary/60 p-2 rounded-[22px] border border-hairline shadow-inner shrink-0">
              <button className="p-3.5 rounded-2xl bg-white shadow-md text-primary transition-all scale-105"><LayoutGrid className="w-6 h-6" /></button>
              <button className="p-3.5 rounded-2xl text-on-surface-tertiary hover:bg-white/50 transition-all"><List className="w-6 h-6" /></button>
            </div>
            <Button variant="outline" className="h-18 px-8 rounded-[24px] border-hairline bg-white font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-black/[0.03] hover:bg-surface-secondary active:scale-95 shrink-0">
              <Filter className="w-5 h-5 text-primary" /> Lọc
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <AnimatePresence>
              {staffList.map((person) => (
                <StaffCard key={person.id} person={person} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </div>

          <div className="pt-14 flex justify-center">
            <Button variant="outline" className="rounded-full px-14 h-14 border-hairline text-[11px] font-black uppercase tracking-[0.25em] hover:bg-surface-secondary transition-all shadow-xl shadow-black/[0.01]">
              Mở rộng danh sách nhân viên
            </Button>
          </div>
        </div>

        <div className="xl:col-span-4">
          <AddStaffForm onAdd={handleAdd} />
        </div>
      </div>
    </div>
  )
}
