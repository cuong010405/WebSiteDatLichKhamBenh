"use client"

import React from "react"
import {
  Search, Filter, LayoutGrid, List,
  Sparkles, ShieldCheck, Pencil, Trash2, X,
  AlertTriangle, CheckCircle2, Plus, Building2,
  ToggleLeft, ToggleRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { API_URL, authFetch } from "@/lib/api"
import { useLoading } from "@/lib/loading-context"

interface Department {
  id: string
  name: string
  description: string
  active: boolean
}

/* ─── Add Department Dialog ─── */
function AddDepartmentDialog({ onAdd }: { onAdd: (d: Department) => Promise<boolean> }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [success, setSuccess] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")

  const reset = () => { setName(""); setDescription(""); setError("") }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    setSubmitting(true); setError("")
    const ok = await onAdd({ id: `dept-${Date.now()}`, name, description, active: true })
    setSubmitting(false)
    if (ok) { setSuccess(true); reset(); setTimeout(() => { setSuccess(false); setOpen(false) }, 1500) }
    else setError("Không thể thêm phòng ban. Vui lòng thử lại.")
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-primary text-white rounded-[24px] px-8 h-14 text-xs font-black uppercase tracking-[0.15em] flex items-center gap-3 shadow-xl shadow-primary/20 hover:opacity-95 transition-all border-b-4 border-white/10 active:border-b-0 active:translate-y-0.5">
        <Plus className="w-5 h-5" /> Thêm phòng ban
      </Button>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setSuccess(false) } }}>
        <DialogContent className="sm:max-w-[520px] rounded-[32px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-green-500" />
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-12 flex flex-col items-center gap-5 text-center">
                <div className="w-20 h-20 rounded-3xl bg-green-50 border border-green-100 flex items-center justify-center"><CheckCircle2 className="w-10 h-10 text-green-500" /></div>
                <div><p className="text-base font-black text-slate-900 uppercase tracking-tight">Thêm thành công!</p><p className="text-xs text-slate-500 font-semibold mt-1">Phòng ban đã được lưu vào hệ thống.</p></div>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="p-8 space-y-5">
                <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-white flex items-center justify-center shrink-0 shadow-md"><Plus className="w-5 h-5" /></div>
                  <div className="text-left flex-1">
                    <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Thêm phòng ban mới</DialogTitle>
                    <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Đăng ký phòng ban trên hệ thống.</DialogDescription>
                  </div>
                </DialogHeader>
                {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600"><AlertTriangle className="w-4 h-4 shrink-0" /><p className="text-xs font-bold">{error}</p></div>}
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tên phòng ban <span className="text-red-400">*</span></label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="VD: Nội khoa" className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mô tả</label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả về phòng ban..." rows={3} className="w-full rounded-xl border border-slate-200 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all resize-none" />
                  </div>
                </div>
                <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Hủy bỏ</Button>
                  <Button type="submit" disabled={!name || submitting} className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-95 transition-all shadow-md border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5 disabled:opacity-40 group">
                    {submitting ? "Đang lưu..." : "Tạo phòng ban"}<Sparkles className="w-3.5 h-3.5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
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

/* ─── Edit Department Dialog ─── */
function EditDepartmentDialog({ department, open, onOpenChange, onSave }: { department: Department; open: boolean; onOpenChange: (v: boolean) => void; onSave: (updated: Department) => void }) {
  const [name, setName] = React.useState(department.name)
  const [description, setDescription] = React.useState(department.description)
  React.useEffect(() => { if (open) { setName(department.name); setDescription(department.description) } }, [open, department])
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...department, name, description }); onOpenChange(false) }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-[32px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-indigo-500" />
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md"><Pencil className="w-5 h-5" /></div>
            <div className="text-left flex-1">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Chỉnh sửa phòng ban</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Cập nhật thông tin phòng ban trong hệ thống.</DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tên phòng ban</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mô tả</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all resize-none" />
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

/* ─── Toggle Active Dialog ─── */
function ToggleActiveDialog({ department, open, onOpenChange, onToggle }: { department: Department; open: boolean; onOpenChange: (v: boolean) => void; onToggle: (d: Department) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[28px] border border-slate-200/80 shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
        <div className="p-7">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 mb-4 text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">{department.active ? <ToggleLeft className="w-5 h-5" /> : <ToggleRight className="w-5 h-5" />}</div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">{department.active ? "Tắt phòng ban?" : "Bật phòng ban?"}</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">{department.active ? "Phòng ban sẽ ngừng hiển thị." : "Phòng ban sẽ hiển thị trở lại."}</DialogDescription>
            </div>
          </DialogHeader>
          <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-4 space-y-1.5 mb-6 text-left">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{department.name}</p>
            <p className="text-[10px] font-bold text-slate-500">Trạng thái: <span className="text-slate-700">{department.active ? "Đang hoạt động" : "Ngừng hoạt động"}</span></p>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2 bg-white">
            <Button onClick={() => { onToggle({ ...department, active: !department.active }); onOpenChange(false) }} className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-95 shadow-md shadow-amber-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5">
              {department.active ? "Tắt hoạt động" : "Bật hoạt động"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Giữ lại</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Delete Department Dialog ─── */
function DeleteDepartmentDialog({ department, open, onOpenChange, onDelete }: { department: Department; open: boolean; onOpenChange: (v: boolean) => void; onDelete: (id: string) => void }) {
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
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{department.name}</p>
            <p className="text-[10px] font-bold text-slate-500">Mô tả: <span className="text-slate-700">{department.description || "Không có"}</span></p>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2 bg-white">
            <Button onClick={() => { onDelete(department.id); onOpenChange(false) }} className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-95 shadow-md shadow-red-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Xóa vĩnh viễn
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Giữ lại</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Department Card ─── */
function DepartmentCard({ department, onEdit, onToggle, onDelete }: { department: Department; onEdit: (d: Department) => void; onToggle: (d: Department) => void; onDelete: (id: string) => void }) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [toggleOpen, setToggleOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  return (
    <>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -4 }} transition={{ duration: 0.35 }} className="h-full">
        <div className={cn(
          "group border rounded-3xl bg-white transition-all cursor-pointer relative shadow-xs hover:shadow-xl hover:shadow-black/[0.04] flex flex-col h-full",
          department.active ? "border-hairline hover:border-primary/30" : "border-dashed border-slate-200 opacity-60 hover:opacity-80"
        )}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-surface-tinted/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-3xl" />

          {/* Top section */}
          <div className="p-5 pb-3 relative z-10">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-500 shrink-0",
                department.active ? "bg-gradient-to-br from-primary to-blue-600 text-white group-hover:scale-105" : "bg-slate-100 text-slate-400"
              )}><Building2 className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm text-foreground group-hover:text-primary transition-colors duration-300 leading-snug uppercase tracking-tight line-clamp-2">{department.name}</h3>
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shrink-0 whitespace-nowrap",
                department.active ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-100 text-slate-400 border border-slate-200"
              )}>{department.active ? "Hoạt động" : "Tắt"}</div>
            </div>
          </div>

          {/* Description */}
          {department.description && (
            <div className="px-5 pb-3 relative z-10">
              <p className="text-[10px] font-semibold text-slate-500 leading-relaxed text-left line-clamp-2">{department.description}</p>
            </div>
          )}

          <div className="flex-1" />

          {/* Action buttons - hover reveal */}
          <div className="overflow-hidden transition-all duration-300 ease-out max-h-0 group-hover:max-h-[48px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
            <div className="px-5 pb-4 flex gap-2">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.stopPropagation(); setEditOpen(true) }} className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-blue-100 text-blue-600 border border-blue-200 text-[8px] font-black uppercase tracking-widest hover:bg-blue-200/70 transition-colors">
                <Pencil className="w-2.5 h-2.5" /> Sửa
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.stopPropagation(); setToggleOpen(true) }} className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-amber-100 text-amber-600 border border-amber-200 text-[8px] font-black uppercase tracking-widest hover:bg-amber-200/70 transition-colors">
                {department.active ? <ToggleRight className="w-2.5 h-2.5" /> : <ToggleLeft className="w-2.5 h-2.5" />}{department.active ? "Tắt" : "Bật"}
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.stopPropagation(); setDeleteOpen(true) }} className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-red-100 text-red-500 border border-red-200 text-[8px] font-black uppercase tracking-widest hover:bg-red-200/70 transition-colors">
                <Trash2 className="w-2.5 h-2.5" /> Xóa
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <EditDepartmentDialog department={department} open={editOpen} onOpenChange={setEditOpen} onSave={onEdit} />
      <ToggleActiveDialog department={department} open={toggleOpen} onOpenChange={setToggleOpen} onToggle={onToggle} />
      <DeleteDepartmentDialog department={department} open={deleteOpen} onOpenChange={setDeleteOpen} onDelete={onDelete} />
    </>
  )
}

/* ─── Page ─── */
export default function DepartmentsPage() {
  const { show, hide } = useLoading()
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")

  const loadDepartments = () => {
    setLoading(true)
    fetch(`${API_URL}/api/departments`)
      .then((res) => { if (!res.ok) throw new Error("Failed"); return res.json() })
      .then((data) => { setDepartments(data.map((d: any) => ({ id: d.Id, name: d.Name, description: d.Description || "", active: d.Active }))); setLoading(false) })
      .catch(() => {
        setDepartments([
          { id: "dept-001", name: "Nội khoa", description: "Chuyên khoa nội tổng hợp", active: true },
          { id: "dept-002", name: "Ngoại khoa", description: "Chuyên khoa ngoại tổng hợp", active: true },
          { id: "dept-003", name: "Phục hồi chức năng", description: "Phục hồi chức năng sau phẫu thuật và chấn thương", active: true },
          { id: "dept-004", name: "Cấp cứu tại gia", description: "Dịch vụ cấp cứu và chăm sóc khẩn cấp tại nhà", active: true },
        ]); setLoading(false)
      })
  }

  React.useEffect(() => { loadDepartments() }, [])

  const handleAdd = async (dept: Department): Promise<boolean> => {
    show("Đang thêm phòng ban...")
    try {
      const res = await authFetch(`${API_URL}/api/departments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Id: dept.id, Name: dept.name, Description: dept.description, Active: dept.active }) })
      if (!res.ok) { hide(); return false }
      const created = await res.json()
      setDepartments((prev) => [{ id: created.Id, name: created.Name, description: created.Description || "", active: created.Active }, ...prev])
      hide(); return true
    } catch { hide(); return false }
  }

  const handleEdit = async (updated: Department) => {
    show("Đang cập nhật...")
    try {
      const res = await authFetch(`${API_URL}/api/departments/${updated.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Name: updated.name, Description: updated.description }) })
      if (!res.ok) throw new Error("Update failed")
      const saved = await res.json()
      setDepartments((prev) => prev.map((d) => d.id === saved.Id ? { id: saved.Id, name: saved.Name, description: saved.Description || "", active: saved.Active } : d))
    } catch (err) { console.error(err) } finally { hide() }
  }

  const handleToggle = async (updated: Department) => {
    show("Đang cập nhật...")
    try {
      const res = await authFetch(`${API_URL}/api/departments/${updated.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Active: updated.active }) })
      if (!res.ok) throw new Error("Toggle failed")
      const saved = await res.json()
      setDepartments((prev) => prev.map((d) => d.id === saved.Id ? { ...d, active: saved.Active } : d))
    } catch (err) { console.error(err) } finally { hide() }
  }

  const handleDelete = async (id: string) => {
    show("Đang xóa phòng ban...")
    try {
      const res = await authFetch(`${API_URL}/api/departments/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setDepartments((prev) => prev.filter((d) => d.id !== id))
    } catch (err) { console.error(err) } finally { hide() }
  }

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeCount = departments.filter((d) => d.active).length

  return (
    <div className="p-10 max-w-7xl mx-auto w-full space-y-16 pb-32">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-surface-tinted px-3.5 py-2 rounded-full border border-primary/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="eyebrow text-[10px] font-black uppercase tracking-widest text-primary-strong">Phòng ban</span>
            </div>
            <div className="w-px h-5 bg-hairline" />
            <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">{activeCount} / {departments.length} Hoạt động</span>
          </div>
          <h1 className="text-6xl font-black tight-tracking text-foreground leading-[1] uppercase text-left">Quản lý <br />Phòng ban</h1>
          <p className="text-xl text-muted-foreground mt-5 max-w-2xl font-medium leading-relaxed antialiased text-left">
            Quản lý danh sách phòng ban trong hệ thống — tên, mô tả và trạng thái hiển thị.
          </p>
        </motion.div>
        <div className="flex items-center gap-4 shrink-0">
          <AddDepartmentDialog onAdd={handleAdd} />
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên phòng ban hoặc mô tả..."
            className="pl-16 h-18 rounded-[24px] bg-white border-hairline focus:ring-12 focus:ring-primary/5 transition-all text-lg font-black shadow-xl shadow-black/[0.03] placeholder:text-on-surface-tertiary placeholder:font-medium placeholder:text-base border-b-2 border-b-hairline"
          />
        </div>
        <div className="flex bg-surface-secondary/60 p-2 rounded-[22px] border border-hairline shadow-inner shrink-0">
          <button className="p-3.5 rounded-2xl bg-white shadow-md text-primary transition-all scale-105"><LayoutGrid className="w-6 h-6" /></button>
          <button className="p-3.5 rounded-2xl text-on-surface-tertiary hover:bg-white/50 transition-all"><List className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang tải danh sách phòng ban...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          <AnimatePresence>
            {filtered.length > 0 ? (
              filtered.map((dept) => (
                <DepartmentCard key={dept.id} department={dept} onEdit={handleEdit} onToggle={handleToggle} onDelete={handleDelete} />
              ))
            ) : (
              <div className="col-span-3 py-20 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center"><Building2 className="w-8 h-8 text-slate-300" /></div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Không tìm thấy phòng ban nào</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
