"use client"

import React from "react"
import {
  Search, Filter, LayoutGrid, List,
  Sparkles, Pencil, Trash2, X,
  AlertTriangle, CheckCircle2, Plus, Stethoscope,
  Clock, DollarSign, Tag, ToggleLeft, ToggleRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { API_URL, authFetch } from "@/lib/api"
import { useLoading } from "@/lib/loading-context"
import { formatCurrencyInput, parseCurrencyNumber } from "@/lib/utils/format"

/* ══════════════════════════════════════════
   INTERFACES
══════════════════════════════════════════ */
interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: string
  type: string
  active: boolean
}

interface ServiceType {
  id: string
  name: string
  description: string
  color: string
  active: boolean
}

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
const DURATION_OPTIONS = [
  { value: "0.5h", label: "30 Phút" },
  { value: "1h", label: "1 Giờ" },
  { value: "1.5h", label: "1.5 Giờ" },
  { value: "2h", label: "2 Giờ" },
  { value: "2.5h", label: "2.5 Giờ" },
  { value: "3h", label: "3 Giờ" },
]

const TYPE_COLOR_OPTIONS = [
  { value: "blue", label: "Xanh dương" },
  { value: "purple", label: "Tím" },
  { value: "green", label: "Xanh lá" },
  { value: "cyan", label: "Cyan" },
  { value: "amber", label: "Vàng cam" },
  { value: "rose", label: "Hồng đỏ" },
  { value: "indigo", label: "Chàm" },
]

/* ══════════════════════════════════════════
   SERVICE TYPE BADGE COLOR MAP
══════════════════════════════════════════ */
const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  green: "bg-green-50 text-green-600 border-green-100",
  cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  rose: "bg-rose-50 text-rose-600 border-rose-100",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
}

/* ══════════════════════════════════════════
   SERVICE DIALOGS
══════════════════════════════════════════ */
function AddServiceDialog({ serviceTypes, onAdd }: { serviceTypes: ServiceType[]; onAdd: (s: Service) => Promise<boolean> }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [duration, setDuration] = React.useState("1h")
  const [type, setType] = React.useState("")
  const [success, setSuccess] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")

  const reset = () => {
    setName(""); setDescription(""); setPrice(""); setDuration("1h"); setType(""); setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !type) return
    setSubmitting(true); setError("")
    const ok = await onAdd({ id: `svc-${Date.now()}`, name, description, price: parseCurrencyNumber(price), duration, type, active: true })
    setSubmitting(false)
    if (ok) { setSuccess(true); reset(); setTimeout(() => { setSuccess(false); setOpen(false) }, 1500) }
    else setError("Không thể thêm dịch vụ. Vui lòng thử lại.")
  }

  const typeOptions = serviceTypes.length > 0 ? serviceTypes.filter(t => t.active).map(t => t.name) : ["Khám lâm sàng", "Phục hồi chức năng", "Tư vấn dinh dưỡng", "Nha khoa", "Sức khỏe tâm thần"]

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-primary text-white rounded-[24px] px-8 h-14 text-xs font-black uppercase tracking-[0.15em] flex items-center gap-3 shadow-xl shadow-primary/20 hover:opacity-95 transition-all border-b-4 border-white/10 active:border-b-0 active:translate-y-0.5">
        <Plus className="w-5 h-5" /> Thêm dịch vụ
      </Button>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setSuccess(false) } }}>
        <DialogContent className="sm:max-w-[640px] rounded-[32px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-green-500" />
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-12 flex flex-col items-center gap-5 text-center">
                <div className="w-20 h-20 rounded-3xl bg-green-50 border border-green-100 flex items-center justify-center"><CheckCircle2 className="w-10 h-10 text-green-500" /></div>
                <div><p className="text-base font-black text-slate-900 uppercase tracking-tight">Thêm thành công!</p><p className="text-xs text-slate-500 font-semibold mt-1">Dịch vụ đã được lưu vào hệ thống.</p></div>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="p-8 space-y-5">
                <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-white flex items-center justify-center shrink-0 shadow-md"><Plus className="w-5 h-5" /></div>
                  <div className="text-left flex-1">
                    <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Thêm dịch vụ mới</DialogTitle>
                    <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Đăng ký dịch vụ chăm sóc y tế trên hệ thống.</DialogDescription>
                  </div>
                </DialogHeader>
                {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600"><AlertTriangle className="w-4 h-4 shrink-0" /><p className="text-xs font-bold">{error}</p></div>}
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tên dịch vụ <span className="text-red-400">*</span></label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="VD: Kiểm tra sức khỏe định kỳ" className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mô tả</label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn về dịch vụ..." className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Giá (VNĐ) <span className="text-red-400">*</span></label>
                      <Input type="text" value={price} onChange={(e) => setPrice(formatCurrencyInput(e.target.value))} required placeholder="VD: 500.000" className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Thời lượng <span className="text-red-400">*</span></label>
                      <Select value={duration} onValueChange={(v) => setDuration(v ?? "1h")}>
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800"><SelectValue placeholder="Chọn thời lượng..." /></SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                          {DURATION_OPTIONS.map((d) => <SelectItem key={d.value} value={d.value} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{d.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Loại dịch vụ <span className="text-red-400">*</span></label>
                    <Select value={type} onValueChange={(v) => setType(v ?? "")}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800"><SelectValue placeholder="Chọn loại dịch vụ..." /></SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                        {typeOptions.map((t) => <SelectItem key={t} value={t} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Hủy bỏ</Button>
                  <Button type="submit" disabled={!name || !price || !type || submitting} className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-95 transition-all shadow-md border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5 disabled:opacity-40 group">
                    {submitting ? "Đang lưu..." : "Tạo dịch vụ"}<Sparkles className="w-3.5 h-3.5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
                  </Button>
                </DialogFooter>
              </motion.form>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  )
}

function EditServiceDialog({ service, serviceTypes, open, onOpenChange, onSave }: { service: Service; serviceTypes: ServiceType[]; open: boolean; onOpenChange: (v: boolean) => void; onSave: (updated: Service) => void }) {
  const [name, setName] = React.useState(service.name)
  const [description, setDescription] = React.useState(service.description)
  const [price, setPrice] = React.useState(formatCurrencyInput(service.price))
  const [duration, setDuration] = React.useState(service.duration)
  const [type, setType] = React.useState(service.type)

  React.useEffect(() => {
    if (open) { setName(service.name); setDescription(service.description); setPrice(formatCurrencyInput(service.price)); setDuration(service.duration); setType(service.type) }
  }, [open, service])

  const typeOptions = serviceTypes.length > 0 ? serviceTypes.filter(t => t.active).map(t => t.name) : ["Khám lâm sàng", "Phục hồi chức năng", "Tư vấn dinh dưỡng", "Nha khoa", "Sức khỏe tâm thần"]
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...service, name, description, price: parseCurrencyNumber(price), duration, type }); onOpenChange(false) }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] rounded-[32px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-indigo-500" />
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md"><Pencil className="w-5 h-5" /></div>
            <div className="text-left flex-1">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Chỉnh sửa dịch vụ</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Cập nhật thông tin dịch vụ trong hệ thống.</DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 text-left"><label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tên dịch vụ</label><Input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" /></div>
            <div className="space-y-2 text-left"><label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mô tả</label><Input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 text-left"><label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Giá (VNĐ)</label><Input type="text" value={price} onChange={(e) => setPrice(formatCurrencyInput(e.target.value))} required className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" /></div>
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Thời lượng</label>
                <Select value={duration} onValueChange={(v) => setDuration(v ?? "1h")}>
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    {DURATION_OPTIONS.map((d) => <SelectItem key={d.value} value={d.value} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Loại dịch vụ</label>
              <Select value={type} onValueChange={(v) => setType(v ?? "")}>
                <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                  {typeOptions.map((t) => <SelectItem key={t} value={t} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Hủy bỏ</Button>
            <Button type="submit" className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-95 transition-all shadow-md">Lưu thay đổi <Sparkles className="w-3.5 h-3.5 ml-2 group-hover:rotate-180 transition-transform duration-500" /></Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ToggleServiceDialog({ service, open, onOpenChange, onToggle }: { service: Service; open: boolean; onOpenChange: (v: boolean) => void; onToggle: (s: Service) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[24px] border border-amber-100 shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
        <div className="p-7">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 mb-4 text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">{service.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}</div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">{service.active ? "Vô hiệu hóa" : "Kích hoạt"} dịch vụ</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">{service.active ? "Dịch vụ sẽ ngừng hiển thị trên form đặt lịch." : "Dịch vụ sẽ hiển thị trở lại trên form đặt lịch."}</DialogDescription>
            </div>
          </DialogHeader>
          <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-4 space-y-1.5 mb-6 text-left">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{service.name}</p>
            <p className="text-[10px] font-bold text-slate-500">Giá: <span className="text-slate-700">{service.price.toLocaleString("vi-VN")} VNĐ</span></p>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2 bg-white">
            <Button onClick={() => { onToggle({ ...service, active: !service.active }); onOpenChange(false) }} className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-95 shadow-md shadow-amber-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5">{service.active ? "Vô hiệu hóa" : "Kích hoạt"}</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Hủy bỏ</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DeleteServiceDialog({ service, open, onOpenChange, onDelete }: { service: Service; open: boolean; onOpenChange: (v: boolean) => void; onDelete: (id: string) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[24px] border border-red-100 shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-400 to-rose-500" />
        <div className="p-7">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 mb-4 text-left">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0"><AlertTriangle className="w-5 h-5" /></div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Xác nhận xóa</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">Hành động này không thể hoàn tác.</DialogDescription>
            </div>
          </DialogHeader>
          <div className="bg-red-50/80 border border-red-100 rounded-xl p-4 space-y-1.5 mb-6 text-left">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{service.name}</p>
            <p className="text-[10px] font-bold text-slate-500">Loại: <span className="text-slate-700">{service.type}</span></p>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2 bg-white">
            <Button onClick={() => { onDelete(service.id); onOpenChange(false) }} className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-95 shadow-md shadow-red-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5"><Trash2 className="w-3.5 h-3.5 mr-2" /> Xóa vĩnh viễn</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Giữ lại</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ServiceCard({ service, serviceTypes, onEdit, onToggle, onDelete }: { service: Service; serviceTypes: ServiceType[]; onEdit: (s: Service) => void; onToggle: (s: Service) => void; onDelete: (id: string) => void }) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [toggleOpen, setToggleOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const matchedType = serviceTypes.find(t => t.name === service.type)
  const badgeClass = matchedType ? (colorMap[matchedType.color] || "bg-slate-50 text-slate-600 border-slate-100") : "bg-slate-50 text-slate-600 border-slate-100"

  return (
    <>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -4 }} transition={{ duration: 0.35 }} className="h-full">
        <div className={cn("group border rounded-3xl bg-white transition-all cursor-pointer relative shadow-xs hover:shadow-xl hover:shadow-black/[0.04] flex flex-col h-full", service.active ? "border-hairline hover:border-primary/30" : "border-dashed border-slate-200 opacity-60 hover:opacity-80")}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-surface-tinted/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-3xl" />
          <div className="p-5 pb-3 relative z-10">
            <div className="flex items-start gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-500 shrink-0", service.active ? "bg-gradient-to-br from-primary to-blue-600 text-white group-hover:scale-105" : "bg-slate-100 text-slate-400")}><Stethoscope className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0"><h3 className="font-black text-sm text-foreground group-hover:text-primary transition-colors duration-300 leading-snug uppercase tracking-tight line-clamp-2">{service.name}</h3></div>
              <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shrink-0 whitespace-nowrap", service.active ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-100 text-slate-400 border border-slate-200")}>{service.active ? "Hoạt động" : "Tắt"}</div>
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 ml-[52px]">
              <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider border", badgeClass)}>{service.type}</span>
              <div className="w-0.5 h-0.5 rounded-full bg-slate-300" />
              <span className="text-[8px] font-black text-on-surface-tertiary uppercase tracking-wider flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {service.duration}</span>
            </div>
          </div>
          {service.description && <div className="px-5 pb-3 relative z-10"><p className="text-[10px] font-semibold text-slate-500 leading-relaxed text-left line-clamp-2">{service.description}</p></div>}
          <div className="flex-1" />
          <div className="px-5 py-3 border-t border-hairline/40 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-tinted flex items-center justify-center text-primary shrink-0"><DollarSign className="w-4 h-4" /></div>
              <div className="min-w-0">
                <p className="text-[8px] font-black text-on-surface-tertiary uppercase tracking-widest">Giá dịch vụ</p>
                <p className="text-base font-black text-foreground tracking-tight leading-tight">{service.price.toLocaleString("vi-VN")}<span className="text-[9px] text-on-surface-tertiary ml-0.5 opacity-50">VNĐ</span></p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden transition-all duration-300 ease-out max-h-0 group-hover:max-h-[48px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
            <div className="px-5 pb-4 flex gap-2">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.stopPropagation(); setEditOpen(true) }} className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-blue-100 text-blue-600 border border-blue-200 text-[8px] font-black uppercase tracking-widest hover:bg-blue-200/70 transition-colors"><Pencil className="w-2.5 h-2.5" /> Sửa</motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.stopPropagation(); setToggleOpen(true) }} className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-amber-100 text-amber-600 border border-amber-200 text-[8px] font-black uppercase tracking-widest hover:bg-amber-200/70 transition-colors">{service.active ? <ToggleRight className="w-2.5 h-2.5" /> : <ToggleLeft className="w-2.5 h-2.5" />}{service.active ? "Tắt" : "Bật"}</motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.stopPropagation(); setDeleteOpen(true) }} className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-red-100 text-red-500 border border-red-200 text-[8px] font-black uppercase tracking-widest hover:bg-red-200/70 transition-colors"><Trash2 className="w-2.5 h-2.5" /> Xóa</motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      <EditServiceDialog service={service} serviceTypes={serviceTypes} open={editOpen} onOpenChange={setEditOpen} onSave={onEdit} />
      <ToggleServiceDialog service={service} open={toggleOpen} onOpenChange={setToggleOpen} onToggle={onToggle} />
      <DeleteServiceDialog service={service} open={deleteOpen} onOpenChange={setDeleteOpen} onDelete={onDelete} />
    </>
  )
}

/* ══════════════════════════════════════════
   SERVICE TYPE DIALOGS
══════════════════════════════════════════ */
function AddServiceTypeDialog({ onAdd }: { onAdd: (st: ServiceType) => Promise<boolean> }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [color, setColor] = React.useState("blue")
  const [success, setSuccess] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")

  const reset = () => { setName(""); setDescription(""); setColor("blue"); setError("") }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    setSubmitting(true); setError("")
    const ok = await onAdd({ id: `st-${Date.now()}`, name, description, color, active: true })
    setSubmitting(false)
    if (ok) { setSuccess(true); reset(); setTimeout(() => { setSuccess(false); setOpen(false) }, 1500) }
    else setError("Không thể thêm loại dịch vụ. Vui lòng thử lại.")
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-primary text-white rounded-[24px] px-8 h-14 text-xs font-black uppercase tracking-[0.15em] flex items-center gap-3 shadow-xl shadow-primary/20 hover:opacity-95 transition-all border-b-4 border-white/10 active:border-b-0 active:translate-y-0.5">
        <Plus className="w-5 h-5" /> Thêm loại dịch vụ
      </Button>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setSuccess(false) } }}>
        <DialogContent className="sm:max-w-[520px] rounded-[32px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-green-500" />
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-12 flex flex-col items-center gap-5 text-center">
                <div className="w-20 h-20 rounded-3xl bg-green-50 border border-green-100 flex items-center justify-center"><CheckCircle2 className="w-10 h-10 text-green-500" /></div>
                <div><p className="text-base font-black text-slate-900 uppercase tracking-tight">Thêm thành công!</p><p className="text-xs text-slate-500 font-semibold mt-1">Loại dịch vụ đã được lưu vào hệ thống.</p></div>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="p-8 space-y-5">
                <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-white flex items-center justify-center shrink-0 shadow-md"><Tag className="w-5 h-5" /></div>
                  <div className="text-left flex-1">
                    <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Thêm loại dịch vụ mới</DialogTitle>
                    <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Đăng ký loại dịch vụ trên hệ thống.</DialogDescription>
                  </div>
                </DialogHeader>
                {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600"><AlertTriangle className="w-4 h-4 shrink-0" /><p className="text-xs font-bold">{error}</p></div>}
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tên loại dịch vụ <span className="text-red-400">*</span></label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="VD: Clinical, Rehab, Nutrition..." className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mô tả</label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả về loại dịch vụ..." rows={3} className="w-full rounded-xl border border-slate-200 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all resize-none" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Màu badge</label>
                    <Select value={color} onValueChange={(v) => setColor(v ?? "blue")}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                        {TYPE_COLOR_OPTIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-3 h-3 rounded-full", colorMap[c.value]?.split(" ")[0])} />
                              {c.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {color && <div className={cn("inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border mt-1", colorMap[color] || "bg-slate-50 text-slate-600 border-slate-100")}>{name || "Xem trước"}</div>}
                  </div>
                </div>
                <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Hủy bỏ</Button>
                  <Button type="submit" disabled={!name || submitting} className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-95 transition-all shadow-md border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5 disabled:opacity-40 group">
                    {submitting ? "Đang lưu..." : "Tạo loại dịch vụ"}<Sparkles className="w-3.5 h-3.5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
                  </Button>
                </DialogFooter>
              </motion.form>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  )
}

function EditServiceTypeDialog({ item, open, onOpenChange, onSave }: { item: ServiceType; open: boolean; onOpenChange: (v: boolean) => void; onSave: (updated: ServiceType) => void }) {
  const [name, setName] = React.useState(item.name)
  const [description, setDescription] = React.useState(item.description)
  const [color, setColor] = React.useState(item.color || "blue")
  React.useEffect(() => { if (open) { setName(item.name); setDescription(item.description); setColor(item.color || "blue") } }, [open, item])
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...item, name, description, color }); onOpenChange(false) }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-[32px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-indigo-500" />
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md"><Pencil className="w-5 h-5" /></div>
            <div className="text-left flex-1">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Chỉnh sửa loại dịch vụ</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Cập nhật thông tin loại dịch vụ trong hệ thống.</DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 text-left"><label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tên loại dịch vụ</label><Input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" /></div>
            <div className="space-y-2 text-left"><label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mô tả</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all resize-none" /></div>
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Màu badge</label>
              <Select value={color} onValueChange={(v) => setColor(v ?? "blue")}>
                <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                  {TYPE_COLOR_OPTIONS.map((c) => (<SelectItem key={c.value} value={c.value} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"><div className="flex items-center gap-2"><div className={cn("w-3 h-3 rounded-full", colorMap[c.value]?.split(" ")[0])} />{c.label}</div></SelectItem>))}
                </SelectContent>
              </Select>
              {color && <div className={cn("inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border mt-1", colorMap[color] || "bg-slate-50 text-slate-600 border-slate-100")}>{name || "Xem trước"}</div>}
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Hủy bỏ</Button>
            <Button type="submit" className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-95 transition-all shadow-md">Lưu thay đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ToggleServiceTypeDialog({ item, open, onOpenChange, onToggle }: { item: ServiceType; open: boolean; onOpenChange: (v: boolean) => void; onToggle: (st: ServiceType) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[28px] border border-slate-200/80 shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
        <div className="p-7">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 mb-4 text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">{item.active ? <ToggleLeft className="w-5 h-5" /> : <ToggleRight className="w-5 h-5" />}</div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">{item.active ? "Tắt loại dịch vụ?" : "Bật loại dịch vụ?"}</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">{item.active ? "Loại dịch vụ sẽ ngừng hiển thị." : "Loại dịch vụ sẽ hiển thị trở lại."}</DialogDescription>
            </div>
          </DialogHeader>
          <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-4 space-y-1.5 mb-6 text-left">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{item.name}</p>
            <p className="text-[10px] font-bold text-slate-500">Trạng thái: <span className="text-slate-700">{item.active ? "Đang hoạt động" : "Ngừng hoạt động"}</span></p>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2 bg-white">
            <Button onClick={() => { onToggle({ ...item, active: !item.active }); onOpenChange(false) }} className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-95 shadow-md shadow-amber-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5">{item.active ? "Tắt hoạt động" : "Bật hoạt động"}</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Giữ lại</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DeleteServiceTypeDialog({ item, open, onOpenChange, onDelete }: { item: ServiceType; open: boolean; onOpenChange: (v: boolean) => void; onDelete: (id: string) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[28px] border border-slate-200/80 shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-400 to-rose-500" />
        <div className="p-7">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 mb-4 text-left">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0"><AlertTriangle className="w-5 h-5" /></div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Xác nhận xóa</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">Hành động này không thể hoàn tác.</DialogDescription>
            </div>
          </DialogHeader>
          <div className="bg-red-50/80 border border-red-100 rounded-xl p-4 space-y-1.5 mb-6 text-left">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{item.name}</p>
            <p className="text-[10px] font-bold text-slate-500">Mô tả: <span className="text-slate-700">{item.description || "Không có"}</span></p>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2 bg-white">
            <Button onClick={() => { onDelete(item.id); onOpenChange(false) }} className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-95 shadow-md shadow-red-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5"><Trash2 className="w-3.5 h-3.5 mr-2" /> Xóa vĩnh viễn</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Giữ lại</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ServiceTypeCard({ item, onEdit, onToggle, onDelete }: { item: ServiceType; onEdit: (st: ServiceType) => void; onToggle: (st: ServiceType) => void; onDelete: (id: string) => void }) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [toggleOpen, setToggleOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const badgeClass = colorMap[item.color] || "bg-slate-50 text-slate-600 border-slate-100"

  return (
    <>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -4 }} transition={{ duration: 0.35 }} className="h-full">
        <div className={cn("group border rounded-3xl bg-white transition-all cursor-pointer relative shadow-xs hover:shadow-xl hover:shadow-black/[0.04] flex flex-col h-full", item.active ? "border-hairline hover:border-primary/30" : "border-dashed border-slate-200 opacity-60 hover:opacity-80")}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-surface-tinted/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-3xl" />
          <div className="p-5 pb-3 relative z-10">
            <div className="flex items-start gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-500 shrink-0", item.active ? "bg-gradient-to-br from-primary to-blue-600 text-white group-hover:scale-105" : "bg-slate-100 text-slate-400")}><Tag className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0"><h3 className="font-black text-sm text-foreground group-hover:text-primary transition-colors duration-300 leading-snug uppercase tracking-tight line-clamp-2">{item.name}</h3></div>
              <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shrink-0 whitespace-nowrap", item.active ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-100 text-slate-400 border border-slate-200")}>{item.active ? "Hoạt động" : "Tắt"}</div>
            </div>
            <div className="mt-2.5 ml-[52px]">
              <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider border", badgeClass)}>{item.name}</span>
            </div>
          </div>
          {item.description && <div className="px-5 pb-3 relative z-10"><p className="text-[10px] font-semibold text-slate-500 leading-relaxed text-left line-clamp-2">{item.description}</p></div>}
          <div className="flex-1" />
          <div className="overflow-hidden transition-all duration-300 ease-out max-h-0 group-hover:max-h-[48px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
            <div className="px-5 pb-4 flex gap-2">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.stopPropagation(); setEditOpen(true) }} className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-blue-100 text-blue-600 border border-blue-200 text-[8px] font-black uppercase tracking-widest hover:bg-blue-200/70 transition-colors"><Pencil className="w-2.5 h-2.5" /> Sửa</motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.stopPropagation(); setToggleOpen(true) }} className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-amber-100 text-amber-600 border border-amber-200 text-[8px] font-black uppercase tracking-widest hover:bg-amber-200/70 transition-colors">{item.active ? <ToggleRight className="w-2.5 h-2.5" /> : <ToggleLeft className="w-2.5 h-2.5" />}{item.active ? "Tắt" : "Bật"}</motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.stopPropagation(); setDeleteOpen(true) }} className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-red-100 text-red-500 border border-red-200 text-[8px] font-black uppercase tracking-widest hover:bg-red-200/70 transition-colors"><Trash2 className="w-2.5 h-2.5" /> Xóa</motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      <EditServiceTypeDialog item={item} open={editOpen} onOpenChange={setEditOpen} onSave={onEdit} />
      <ToggleServiceTypeDialog item={item} open={toggleOpen} onOpenChange={setToggleOpen} onToggle={onToggle} />
      <DeleteServiceTypeDialog item={item} open={deleteOpen} onOpenChange={setDeleteOpen} onDelete={onDelete} />
    </>
  )
}

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function ServicesPage() {
  const { show, hide } = useLoading()
  const [activeTab, setActiveTab] = React.useState<"services" | "service-types">("services")
  const [services, setServices] = React.useState<Service[]>([])
  const [serviceTypes, setServiceTypes] = React.useState<ServiceType[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")

  /* ── Load services ── */
  const loadServices = () => {
    return fetch(`${API_URL}/services`)
      .then((res) => { if (!res.ok) throw new Error("Failed"); return res.json() })
      .then((data) => {
        setServices(Array.isArray(data) ? data.map((s: any) => ({
          id: s.id || s.Id, name: s.name || s.Name, description: s.description || s.Description || "",
          price: s.price ?? s.Price ?? 0, duration: s.duration || s.Duration || "1h",
          type: s.type || s.Type || "", active: s.active ?? s.Active ?? true,
        })) : [])
      })
      .catch(() => {
        setServices([
          { id: "svc-001", name: "Kiểm tra sức khỏe định kỳ", description: "Kiểm tra tổng quát và đo sinh hiệu tại nhà", price: 200000, duration: "1h", type: "Khám lâm sàng", active: true },
          { id: "svc-002", name: "Khám nội khoa", description: "Khám và tư vấn bệnh lý nội khoa", price: 300000, duration: "2h", type: "Khám lâm sàng", active: true },
          { id: "svc-003", name: "Phục hồi chức năng", description: "Hỗ trợ phục hồi chức năng sau phẫu thuật", price: 500000, duration: "2.5h", type: "Phục hồi chức năng", active: true },
          { id: "svc-004", name: "Tư vấn dinh dưỡng", description: "Tư vấn chế độ dinh dưỡng cá nhân hóa", price: 300000, duration: "1h", type: "Tư vấn dinh dưỡng", active: true },
          { id: "svc-005", name: "Truyền dịch tại nhà", description: "Truyền dịch y tế an toàn tại nhà", price: 400000, duration: "2h", type: "Khám lâm sàng", active: true },
          { id: "svc-006", name: "Vật lý trị liệu", description: "Điều trị vật lý phục hồi cơ xương khớp", price: 500000, duration: "3h", type: "Phục hồi chức năng", active: true },
        ])
      })
  }

  /* ── Load service types ── */
  const loadServiceTypes = () => {
    return fetch(`${API_URL}/service-types`)
      .then((res) => { if (!res.ok) throw new Error("Failed"); return res.json() })
      .then((data) => {
        setServiceTypes(Array.isArray(data) ? data.map((t: any) => ({
          id: t.Id || t.id, name: t.Name || t.name, description: t.Description || t.description || "",
          color: t.Color || t.color || "blue", active: t.Active ?? t.active ?? true,
        })) : [])
      })
      .catch(() => {
        setServiceTypes([
          { id: "st-001", name: "Khám lâm sàng", description: "Dịch vụ khám và điều trị lâm sàng tại nhà", color: "blue", active: true },
          { id: "st-002", name: "Phục hồi chức năng", description: "Phục hồi chức năng và vật lý trị liệu", color: "purple", active: true },
          { id: "st-003", name: "Tư vấn dinh dưỡng", description: "Tư vấn và theo dõi chế độ dinh dưỡng", color: "green", active: true },
          { id: "st-004", name: "Nha khoa", description: "Dịch vụ chăm sóc nha khoa tại nhà", color: "cyan", active: true },
          { id: "st-005", name: "Sức khỏe tâm thần", description: "Hỗ trợ và tư vấn sức khỏe tâm thần", color: "amber", active: true },
        ])
      })
  }

  React.useEffect(() => {
    show("Đang tải dữ liệu...")
    Promise.all([loadServices(), loadServiceTypes()]).finally(() => { setLoading(false); hide() })
  }, [])

  /* ── Service CRUD ── */
  const handleAddService = async (newService: Service): Promise<boolean> => {
    show("Đang thêm dịch vụ...")
    try {
      const res = await authFetch(`${API_URL}/services`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newService) })
      if (!res.ok) { hide(); return false }
      const created = await res.json()
      setServices((prev) => [{ id: created.id || created.Id, name: created.name || created.Name, description: created.description || created.Description || "", price: created.price ?? created.Price ?? 0, duration: created.duration || created.Duration || "1h", type: created.type || created.Type || "", active: created.active ?? created.Active ?? true }, ...prev])
      hide(); return true
    } catch { hide(); return false }
  }

  const handleEditService = async (updated: Service) => {
    show("Đang cập nhật...")
    try {
      const res = await authFetch(`${API_URL}/services/${updated.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) })
      if (!res.ok) throw new Error("Update failed")
      const saved = await res.json()
      setServices((prev) => prev.map((s) => s.id === (saved.id || saved.Id) ? { ...s, ...saved, id: saved.id || saved.Id } : s))
    } catch { } finally { hide() }
  }

  const handleToggleService = async (updated: Service) => {
    show("Đang cập nhật...")
    try {
      const res = await authFetch(`${API_URL}/services/${updated.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) })
      if (!res.ok) throw new Error("Toggle failed")
      setServices((prev) => prev.map((s) => s.id === updated.id ? updated : s))
    } catch { } finally { hide() }
  }

  const handleDeleteService = async (id: string) => {
    show("Đang xóa...")
    try {
      const res = await authFetch(`${API_URL}/services/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setServices((prev) => prev.filter((s) => s.id !== id))
    } catch { } finally { hide() }
  }

  /* ── ServiceType CRUD ── */
  const handleAddServiceType = async (item: ServiceType): Promise<boolean> => {
    show("Đang thêm loại dịch vụ...")
    try {
      const res = await authFetch(`${API_URL}/service-types`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Id: item.id, Name: item.name, Description: item.description, Color: item.color, Active: item.active }) })
      if (!res.ok) { hide(); return false }
      const created = await res.json()
      setServiceTypes((prev) => [{ id: created.Id || created.id, name: created.Name || created.name, description: created.Description || created.description || "", color: created.Color || created.color || "blue", active: created.Active ?? created.active ?? true }, ...prev])
      hide(); return true
    } catch { hide(); return false }
  }

  const handleEditServiceType = async (updated: ServiceType) => {
    show("Đang cập nhật...")
    try {
      const res = await authFetch(`${API_URL}/service-types/${updated.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Name: updated.name, Description: updated.description, Color: updated.color }) })
      if (!res.ok) throw new Error("Update failed")
      const saved = await res.json()
      setServiceTypes((prev) => prev.map((t) => t.id === updated.id ? { ...t, name: saved.Name || saved.name || updated.name, description: saved.Description || saved.description || updated.description, color: saved.Color || saved.color || updated.color } : t))
    } catch { } finally { hide() }
  }

  const handleToggleServiceType = async (updated: ServiceType) => {
    show("Đang cập nhật...")
    try {
      const res = await authFetch(`${API_URL}/service-types/${updated.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Active: updated.active }) })
      if (!res.ok) throw new Error("Toggle failed")
      setServiceTypes((prev) => prev.map((t) => t.id === updated.id ? updated : t))
    } catch { } finally { hide() }
  }

  const handleDeleteServiceType = async (id: string) => {
    show("Đang xóa...")
    try {
      const res = await authFetch(`${API_URL}/service-types/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setServiceTypes((prev) => prev.filter((t) => t.id !== id))
    } catch { } finally { hide() }
  }

  /* ── Computed ── */
  const isServicesTab = activeTab === "services"
  const activeCount = isServicesTab ? services.filter(s => s.active).length : serviceTypes.filter(t => t.active).length
  const totalCount = isServicesTab ? services.length : serviceTypes.length

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredServiceTypes = serviceTypes.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-10 max-w-7xl mx-auto w-full space-y-16 pb-32">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-surface-tinted px-3.5 py-2 rounded-full border border-primary/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="eyebrow text-[10px] font-black uppercase tracking-widest text-primary-strong">{isServicesTab ? "Dịch vụ chăm sóc" : "Loại dịch vụ"}</span>
            </div>
            <div className="w-px h-5 bg-hairline" />
            <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">{activeCount} / {totalCount} Hoạt động</span>
          </div>
          <h1 className="text-6xl font-black tight-tracking text-foreground leading-[1] uppercase text-left">Quản lý <br />{isServicesTab ? "Dịch vụ" : "Loại dịch vụ"}</h1>
          <p className="text-xl text-muted-foreground mt-5 max-w-2xl font-medium leading-relaxed antialiased text-left">
            {isServicesTab ? "Quản lý danh sách dịch vụ chăm sóc y tế tại nhà — giá cả, thời lượng và trạng thái hiển thị." : "Quản lý danh mục loại dịch vụ — phân loại và màu hiển thị badge trên hệ thống."}
          </p>
        </motion.div>
        <div className="flex items-center gap-4 shrink-0">
          {isServicesTab
            ? <AddServiceDialog serviceTypes={serviceTypes} onAdd={handleAddService} />
            : <AddServiceTypeDialog onAdd={handleAddServiceType} />
          }
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="space-y-6">
        <div className="flex bg-surface-secondary/60 p-1.5 rounded-[20px] border border-hairline w-fit">
          <button
            onClick={() => { setActiveTab("services"); setSearchQuery("") }}
            className={cn("flex items-center gap-2.5 px-6 py-3 rounded-[16px] text-[11px] font-black uppercase tracking-[0.15em] transition-all", activeTab === "services" ? "bg-white shadow-md text-primary" : "text-on-surface-tertiary hover:bg-white/50")}
          >
            <Stethoscope className="w-4 h-4" /> Dịch vụ
          </button>
          <button
            onClick={() => { setActiveTab("service-types"); setSearchQuery("") }}
            className={cn("flex items-center gap-2.5 px-6 py-3 rounded-[16px] text-[11px] font-black uppercase tracking-[0.15em] transition-all", activeTab === "service-types" ? "bg-white shadow-md text-primary" : "text-on-surface-tertiary hover:bg-white/50")}
          >
            <Tag className="w-4 h-4" /> Loại dịch vụ
          </button>
        </div>

        {/* Search + View Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isServicesTab ? "Tìm theo tên dịch vụ, loại hoặc mô tả..." : "Tìm theo tên hoặc mô tả loại dịch vụ..."}
              className="pl-16 h-18 rounded-[24px] bg-white border-hairline focus:ring-12 focus:ring-primary/5 transition-all text-lg font-black shadow-xl shadow-black/[0.03] placeholder:text-on-surface-tertiary placeholder:font-medium placeholder:text-base border-b-2 border-b-hairline"
            />
          </div>
          <div className="flex bg-surface-secondary/60 p-2 rounded-[22px] border border-hairline shadow-inner shrink-0">
            <button className="p-3.5 rounded-2xl bg-white shadow-md text-primary transition-all scale-105"><LayoutGrid className="w-6 h-6" /></button>
            <button className="p-3.5 rounded-2xl text-on-surface-tertiary hover:bg-white/50 transition-all"><List className="w-6 h-6" /></button>
          </div>
          {isServicesTab && (
            <Button variant="outline" className="h-18 px-8 rounded-[24px] border-hairline bg-white font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-black/[0.03] hover:bg-surface-secondary active:scale-95 shrink-0">
              <Filter className="w-5 h-5 text-primary" /> Lọc
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang tải danh sách...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          <AnimatePresence>
            {isServicesTab ? (
              filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} serviceTypes={serviceTypes} onEdit={handleEditService} onToggle={handleToggleService} onDelete={handleDeleteService} />
                ))
              ) : (
                <div className="col-span-3 py-20 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center"><Stethoscope className="w-8 h-8 text-slate-300" /></div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Không tìm thấy dịch vụ nào</p>
                </div>
              )
            ) : (
              filteredServiceTypes.length > 0 ? (
                filteredServiceTypes.map((item) => (
                  <ServiceTypeCard key={item.id} item={item} onEdit={handleEditServiceType} onToggle={handleToggleServiceType} onDelete={handleDeleteServiceType} />
                ))
              ) : (
                <div className="col-span-3 py-20 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center"><Tag className="w-8 h-8 text-slate-300" /></div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Không tìm thấy loại dịch vụ nào</p>
                </div>
              )
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
