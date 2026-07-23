"use client"

import React from "react"
import {
  Search, Filter, LayoutGrid, List,
  Sparkles, ShieldCheck, Pencil, Trash2, X,
  AlertTriangle, CheckCircle2, Plus, Stethoscope,
  Clock, DollarSign, Tag, ToggleLeft, ToggleRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: string
  type: string
  active: boolean
}

const SERVICE_TYPES = [
  "Clinical",
  "Rehab",
  "Nutrition",
  "Dental",
  "Mental Health",
]

const DURATION_OPTIONS = [
  { value: "0.5h", label: "30 Phút" },
  { value: "1h", label: "1 Giờ" },
  { value: "1.5h", label: "1.5 Giờ" },
  { value: "2h", label: "2 Giờ" },
  { value: "2.5h", label: "2.5 Giờ" },
  { value: "3h", label: "3 Giờ" },
]

/* ─── Add Service Dialog ─── */
function AddServiceDialog({ onAdd }: { onAdd: (s: Service) => Promise<boolean> }) {
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
    setSubmitting(true)
    setError("")
    const newService: Service = {
      id: `svc-${Date.now()}`,
      name,
      description,
      price: parseCurrencyNumber(price),
      duration,
      type,
      active: true,
    }
    const ok = await onAdd(newService)
    setSubmitting(false)
    if (ok) {
      setSuccess(true)
      reset()
      setTimeout(() => { setSuccess(false); setOpen(false) }, 1500)
    } else {
      setError("Không thể thêm dịch vụ. Vui lòng thử lại.")
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-primary text-white rounded-[24px] px-8 h-14 text-xs font-black uppercase tracking-[0.15em] flex items-center gap-3 shadow-xl shadow-primary/20 hover:opacity-95 transition-all border-b-4 border-white/10 active:border-b-0 active:translate-y-0.5"
      >
        <Plus className="w-5 h-5" />
        Thêm dịch vụ
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setSuccess(false) } }}>
        <DialogContent className="sm:max-w-[640px] rounded-[32px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-green-500" />

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 flex flex-col items-center gap-5 text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-green-50 border border-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 uppercase tracking-tight">Thêm thành công!</p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Dịch vụ đã được lưu vào hệ thống.</p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="p-8 space-y-5"
              >
                <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Thêm dịch vụ mới</DialogTitle>
                    <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Đăng ký dịch vụ chăm sóc y tế trên hệ thống.</DialogDescription>
                  </div>
                </DialogHeader>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-bold">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tên dịch vụ <span className="text-red-400">*</span></label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="VD: Kiểm tra sức khỏe định kỳ"
                      className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mô tả</label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả ngắn về dịch vụ..."
                      className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all"
                    />
                  </div>

                  {/* Price + Duration */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Giá (VNĐ) <span className="text-red-400">*</span></label>
                      <Input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(formatCurrencyInput(e.target.value))}
                        required
                        placeholder="VD: 500.000"
                        className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Thời lượng <span className="text-red-400">*</span></label>
                      <Select value={duration} onValueChange={(v) => setDuration(v ?? "1h")}>
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                          <SelectValue placeholder="Chọn thời lượng..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                          {DURATION_OPTIONS.map((d) => (
                            <SelectItem key={d.value} value={d.value} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{d.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Loại dịch vụ <span className="text-red-400">*</span></label>
                    <Select value={type} onValueChange={(v) => setType(v ?? "")}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                        <SelectValue placeholder="Chọn loại dịch vụ..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                        {SERVICE_TYPES.map((t) => (
                          <SelectItem key={t} value={t} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    disabled={!name || !price || !type || submitting}
                    className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-95 transition-all shadow-md border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5 disabled:opacity-40 group"
                  >
                    {submitting ? "Đang lưu..." : "Tạo dịch vụ"}
                    <Sparkles className="w-3.5 h-3.5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
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

/* ─── Edit Service Dialog ─── */
function EditServiceDialog({
  service, open, onOpenChange, onSave,
}: {
  service: Service
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (updated: Service) => void
}) {
  const [name, setName] = React.useState(service.name)
  const [description, setDescription] = React.useState(service.description)
  const [price, setPrice] = React.useState(formatCurrencyInput(service.price))
  const [duration, setDuration] = React.useState(service.duration)
  const [type, setType] = React.useState(service.type)

  React.useEffect(() => {
    if (open) {
      setName(service.name); setDescription(service.description)
      setPrice(formatCurrencyInput(service.price)); setDuration(service.duration); setType(service.type)
    }
  }, [open, service])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...service, name, description, price: parseCurrencyNumber(price), duration, type })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] rounded-[32px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-indigo-500" />
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Pencil className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Chỉnh sửa dịch vụ</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Cập nhật thông tin dịch vụ trong hệ thống.</DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tên dịch vụ</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mô tả</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Giá (VNĐ)</label>
                <Input type="text" value={price} onChange={(e) => setPrice(formatCurrencyInput(e.target.value))} required className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Thời lượng</label>
                <Select value={duration} onValueChange={(v) => setDuration(v ?? "1h")}>
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                    <SelectValue placeholder="Chọn thời lượng..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    {DURATION_OPTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Loại dịch vụ</label>
              <Select value={type} onValueChange={(v) => setType(v ?? "")}>
                <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                  <SelectValue placeholder="Chọn loại dịch vụ..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                  {SERVICE_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">
              Hủy bỏ
            </Button>
            <Button type="submit" className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-95 transition-all shadow-md border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5 group">
              Lưu thay đổi <Sparkles className="w-3.5 h-3.5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Toggle Active Dialog ─── */
function ToggleActiveDialog({
  service, open, onOpenChange, onToggle,
}: {
  service: Service
  open: boolean
  onOpenChange: (v: boolean) => void
  onToggle: (updated: Service) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[24px] border border-amber-100 shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
        <div className="p-7">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 mb-4 text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
              {service.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                {service.active ? "Vô hiệu hóa" : "Kích hoạt"} dịch vụ
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">
                {service.active
                  ? "Dịch vụ sẽ ngừng hiển thị trên form đặt lịch."
                  : "Dịch vụ sẽ hiển thị trở lại trên form đặt lịch."}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-4 space-y-1.5 mb-6 text-left">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{service.name}</p>
            <p className="text-[10px] font-bold text-slate-500">Giá: <span className="text-slate-700">{service.price.toLocaleString("vi-VN")} VNĐ</span></p>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2 bg-white">
            <Button onClick={() => { onToggle({ ...service, active: !service.active }); onOpenChange(false) }} className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-95 shadow-md shadow-amber-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5">
              {service.active ? "Vô hiệu hóa" : "Kích hoạt"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">
              Hủy bỏ
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Delete Service Dialog ─── */
function DeleteServiceDialog({
  service, open, onOpenChange, onDelete,
}: {
  service: Service
  open: boolean
  onOpenChange: (v: boolean) => void
  onDelete: (id: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[24px] border border-red-100 shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-400 to-rose-500" />
        <div className="p-7">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 mb-4 text-left">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Xác nhận xóa</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">Hành động này không thể hoàn tác.</DialogDescription>
            </div>
          </DialogHeader>
          <div className="bg-red-50/80 border border-red-100 rounded-xl p-4 space-y-1.5 mb-6 text-left">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{service.name}</p>
            <p className="text-[10px] font-bold text-slate-500">Giá: <span className="text-slate-700">{service.price.toLocaleString("vi-VN")} VNĐ</span></p>
            <p className="text-[10px] font-bold text-slate-500">Loại: <span className="text-slate-700">{service.type}</span></p>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2 bg-white">
            <Button onClick={() => { onDelete(service.id); onOpenChange(false) }} className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-95 shadow-md shadow-red-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5">
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

/* ─── Service Card ─── */
function ServiceCard({
  service, onEdit, onToggle, onDelete,
}: {
  service: Service
  onEdit: (s: Service) => void
  onToggle: (s: Service) => void
  onDelete: (id: string) => void
}) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [toggleOpen, setToggleOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const typeColors: Record<string, string> = {
    Clinical: "bg-blue-50 text-blue-600 border-blue-100",
    Rehab: "bg-purple-50 text-purple-600 border-purple-100",
    Nutrition: "bg-green-50 text-green-600 border-green-100",
    Dental: "bg-cyan-50 text-cyan-600 border-cyan-100",
    "Mental Health": "bg-amber-50 text-amber-600 border-amber-100",
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -4 }} transition={{ duration: 0.35 }} className="h-full">
        <div className={cn(
          "group border rounded-3xl bg-white transition-all cursor-pointer relative shadow-xs hover:shadow-xl hover:shadow-black/[0.04] flex flex-col h-full",
          service.active ? "border-hairline hover:border-primary/30" : "border-dashed border-slate-200 opacity-60 hover:opacity-80"
        )}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-surface-tinted/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-3xl" />

          {/* Top section: icon + title + status */}
          <div className="p-5 pb-3 relative z-10">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-500 shrink-0",
                service.active
                  ? "bg-gradient-to-br from-primary to-blue-600 text-white group-hover:scale-105"
                  : "bg-slate-100 text-slate-400"
              )}>
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm text-foreground group-hover:text-primary transition-colors duration-300 leading-snug uppercase tracking-tight line-clamp-2">{service.name}</h3>
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shrink-0 whitespace-nowrap",
                service.active ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-100 text-slate-400 border border-slate-200"
              )}>
                {service.active ? "Hoạt động" : "Tắt"}
              </div>
            </div>

            {/* Tags row */}
            <div className="flex items-center gap-1.5 mt-2.5 ml-[52px]">
              <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider border", typeColors[service.type] || "bg-slate-50 text-slate-600 border-slate-100")}>
                {service.type}
              </span>
              <div className="w-0.5 h-0.5 rounded-full bg-slate-300" />
              <span className="text-[8px] font-black text-on-surface-tertiary uppercase tracking-wider flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" /> {service.duration}
              </span>
            </div>
          </div>

          {/* Description */}
          {service.description && (
            <div className="px-5 pb-3 relative z-10">
              <p className="text-[10px] font-semibold text-slate-500 leading-relaxed text-left line-clamp-2">{service.description}</p>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price section */}
          <div className="px-5 py-3 border-t border-hairline/40 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-tinted flex items-center justify-center text-primary shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black text-on-surface-tertiary uppercase tracking-widest">Giá dịch vụ</p>
                <p className="text-base font-black text-foreground tracking-tight leading-tight">{service.price.toLocaleString("vi-VN")}<span className="text-[9px] text-on-surface-tertiary ml-0.5 opacity-50">VNĐ</span></p>
              </div>
            </div>
          </div>

          {/* Action buttons - hover reveal */}
          <div className="overflow-hidden transition-all duration-300 ease-out max-h-0 group-hover:max-h-[48px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
            <div className="px-5 pb-4 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
                className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-blue-100 text-blue-600 border border-blue-200 text-[8px] font-black uppercase tracking-widest hover:bg-blue-200/70 transition-colors"
              >
                <Pencil className="w-2.5 h-2.5" /> Sửa
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={(e) => { e.stopPropagation(); setToggleOpen(true) }}
                className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-amber-100 text-amber-600 border border-amber-200 text-[8px] font-black uppercase tracking-widest hover:bg-amber-200/70 transition-colors"
              >
                {service.active ? <ToggleRight className="w-2.5 h-2.5" /> : <ToggleLeft className="w-2.5 h-2.5" />}
                {service.active ? "Tắt" : "Bật"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={(e) => { e.stopPropagation(); setDeleteOpen(true) }}
                className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-red-100 text-red-500 border border-red-200 text-[8px] font-black uppercase tracking-widest hover:bg-red-200/70 transition-colors"
              >
                <Trash2 className="w-2.5 h-2.5" /> Xóa
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <EditServiceDialog service={service} open={editOpen} onOpenChange={setEditOpen} onSave={onEdit} />
      <ToggleActiveDialog service={service} open={toggleOpen} onOpenChange={setToggleOpen} onToggle={onToggle} />
      <DeleteServiceDialog service={service} open={deleteOpen} onOpenChange={setDeleteOpen} onDelete={onDelete} />
    </>
  )
}

/* ─── Page ─── */
export default function ServicesPage() {
  const { show, hide } = useLoading()
  const [services, setServices] = React.useState<Service[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")

  const loadServices = () => {
    setLoading(true)
    fetch(`${API_URL}/services`)
      .then((res) => { if (!res.ok) throw new Error("Services fetch failed"); return res.json() })
      .then((data) => { setServices(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => {
        // Fallback to hardcoded data if API not available yet
        setServices([
          { id: "svc-001", name: "Kiểm tra sức khỏe định kỳ", description: "Kiểm tra tổng quát và đo sinh hiệu tại nhà", price: 200000, duration: "1h", type: "Clinical", active: true },
          { id: "svc-002", name: "Vật lý trị liệu", description: "Điều trị vật lý phục hồi cơ xương khớp", price: 500000, duration: "1.5h", type: "Rehab", active: true },
          { id: "svc-003", name: "Phục hồi chức năng", description: "Hỗ trợ phục hồi chức năng sau phẫu thuật", price: 500000, duration: "1.5h", type: "Rehab", active: true },
          { id: "svc-004", name: "Truyền dịch tại nhà", description: "Truyền dịch y tế an toàn tại nhà", price: 400000, duration: "1h", type: "Clinical", active: true },
          { id: "svc-005", name: "Chăm sóc vết thương", description: "Vệ sinh và băng bó vết thương chuyên nghiệp", price: 350000, duration: "1h", type: "Clinical", active: true },
          { id: "svc-006", name: "Khám nội khoa", description: "Khám và tư vấn bệnh lý nội khoa", price: 300000, duration: "1h", type: "Clinical", active: true },
          { id: "svc-007", name: "Tư vấn dinh dưỡng", description: "Tư vấn chế độ dinh dưỡng cá nhân hóa", price: 300000, duration: "1h", type: "Nutrition", active: true },
        ])
        setLoading(false)
      })
  }

  React.useEffect(() => { loadServices() }, [])

  const handleAdd = async (newService: Service): Promise<boolean> => {
    show("Đang thêm dịch vụ...")
    try {
      const res = await authFetch(`${API_URL}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error("Add service failed:", err)
        hide()
        return false
      }
      const created = await res.json()
      setServices((prev) => [created, ...prev])
      hide()
      return true
    } catch (err) {
      console.error("Add service error:", err)
      hide()
      return false
    }
  }

  const handleEdit = async (updated: Service) => {
    show("Đang cập nhật...")
    try {
      const res = await authFetch(`${API_URL}/services/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error("Update failed")
      const saved = await res.json()
      setServices((prev) => prev.map((s) => (s.id === saved.id ? saved : s)))
    } catch (err) {
      console.error("Update service error:", err)
    } finally {
      hide()
    }
  }

  const handleToggle = async (updated: Service) => {
    show("Đang cập nhật...")
    try {
      const res = await authFetch(`${API_URL}/services/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error("Toggle failed")
      const saved = await res.json()
      setServices((prev) => prev.map((s) => (s.id === saved.id ? saved : s)))
    } catch (err) {
      console.error("Toggle service error:", err)
    } finally {
      hide()
    }
  }

  const handleDelete = async (id: string) => {
    show("Đang xóa dịch vụ...")
    try {
      const res = await authFetch(`${API_URL}/services/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setServices((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error("Delete service error:", err)
    } finally {
      hide()
    }
  }

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeCount = services.filter((s) => s.active).length

  return (
    <div className="p-10 max-w-7xl mx-auto w-full space-y-16 pb-32">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-surface-tinted px-3.5 py-2 rounded-full border border-primary/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="eyebrow text-[10px] font-black uppercase tracking-widest text-primary-strong">Dịch vụ chăm sóc</span>
            </div>
            <div className="w-px h-5 bg-hairline" />
            <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">{activeCount} / {services.length} Hoạt động</span>
          </div>
          <h1 className="text-6xl font-black tight-tracking text-foreground leading-[1] uppercase text-left">Quản lý <br />Dịch vụ</h1>
          <p className="text-xl text-muted-foreground mt-5 max-w-2xl font-medium leading-relaxed antialiased text-left">
            Quản lý danh sách dịch vụ chăm sóc y tế tại nhà — giá cả, thời lượng và trạng thái hiển thị.
          </p>
        </motion.div>
        <div className="flex items-center gap-4 shrink-0">
          <AddServiceDialog onAdd={handleAdd} />
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên dịch vụ, loại hoặc mô tả..."
            className="pl-16 h-18 rounded-[24px] bg-white border-hairline focus:ring-12 focus:ring-primary/5 transition-all text-lg font-black shadow-xl shadow-black/[0.03] placeholder:text-on-surface-tertiary placeholder:font-medium placeholder:text-base border-b-2 border-b-hairline"
          />
        </div>
        <div className="flex bg-surface-secondary/60 p-2 rounded-[22px] border border-hairline shadow-inner shrink-0">
          <button className="p-3.5 rounded-2xl bg-white shadow-md text-primary transition-all scale-105"><LayoutGrid className="w-6 h-6" /></button>
          <button className="p-3.5 rounded-2xl text-on-surface-tertiary hover:bg-white/50 transition-all"><List className="w-6 h-6" /></button>
        </div>
        <Button variant="outline" className="h-18 px-8 rounded-[24px] border-hairline bg-white font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-black/[0.03] hover:bg-surface-secondary active:scale-95 shrink-0">
          <Filter className="w-5 h-5 text-primary" /> Lọc
        </Button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang tải danh sách dịch vụ...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          <AnimatePresence>
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} onEdit={handleEdit} onToggle={handleToggle} onDelete={handleDelete} />
              ))
            ) : (
              <p className="col-span-3 py-20 text-center font-bold text-slate-400 uppercase text-xs tracking-widest">Không tìm thấy dịch vụ nào</p>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="pt-14 flex justify-center">
        <Button variant="outline" className="rounded-full px-14 h-14 border-hairline text-[11px] font-black uppercase tracking-[0.25em] hover:bg-surface-secondary transition-all shadow-xl shadow-black/[0.01]">
          Xem tất cả dịch vụ
        </Button>
      </div>
    </div>
  )
}
