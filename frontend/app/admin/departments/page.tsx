"use client"

import React from "react"
import {
  Search, Filter, LayoutGrid, List,
  Sparkles, ShieldCheck, Pencil, Trash2, X,
  AlertTriangle, CheckCircle2, Plus, Building2,
  Users, ToggleLeft, ToggleRight,
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

  const reset = () => {
    setName(""); setDescription(""); setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    setSubmitting(true)
    setError("")
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name,
      description,
      active: true,
    }
    const ok = await onAdd(newDept)
    setSubmitting(false)
    if (ok) {
      setSuccess(true)
      reset()
      setTimeout(() => { setSuccess(false); setOpen(false) }, 1500)
    } else {
      setError("Không thể thêm phòng ban. Vui lòng thử lại.")
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-primary text-white rounded-[24px] px-8 h-14 text-xs font-black uppercase tracking-[0.15em] flex items-center gap-3 shadow-xl shadow-primary/20 hover:opacity-95 transition-all border-b-4 border-white/10 active:border-b-0 active:translate-y-0.5"
      >
        <Plus className="w-5 h-5" />
        Thêm phòng ban
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setSuccess(false) } }}>
        <DialogContent className="sm:max-w-[520px] rounded-[32px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
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
                  <p className="text-xs text-slate-500 font-semibold mt-1">Phòng ban đã được lưu vào hệ thống.</p>
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
                    <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Thêm phòng ban mới</DialogTitle>
                    <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Đăng ký phòng ban trên hệ thống.</DialogDescription>
                  </div>
                </DialogHeader>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-bold">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tên phòng ban <span className="text-red-400">*</span></label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="VD: Nội khoa"
                      className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mô tả</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả về phòng ban..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all resize-none"
                    />
                  </div>
                </div>

                <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    disabled={!name || submitting}
                    className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-95 transition-all shadow-md border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5 disabled:opacity-40 group"
                  >
                    {submitting ? "Đang lưu..." : "Tạo phòng ban"}
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

/* ─── Edit Department Dialog ─── */
function EditDepartmentDialog({
  department, open, onOpenChange, onSave,
}: {
  department: Department
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (updated: Department) => void
}) {
  const [name, setName] = React.useState(department.name)
  const [description, setDescription] = React.useState(department.description)

  React.useEffect(() => {
    if (open) {
      setName(department.name); setDescription(department.description)
    }
  }, [open, department])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...department, name, description })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-[32px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-indigo-500" />
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Pencil className="w-5 h-5" />
            </div>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">
              Hủy bỏ
            </Button>
            <Button type="submit" className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-95 transition-all shadow-md">
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Department Card ─── */
function DepartmentCard({
  department, onEdit, onDelete, onToggleActive,
}: {
  department: Department
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-white border rounded-[28px] p-6 shadow-xs hover:shadow-md transition-all group relative overflow-hidden",
          department.active ? "border-slate-100" : "border-slate-200 opacity-60"
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{department.name}</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{department.description || "Không có mô tả"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleActive}
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                department.active
                  ? "bg-green-50 text-green-600 hover:bg-green-100"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              )}
            >
              {department.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-blue-100 text-blue-600 border border-blue-200 text-[8px] font-black uppercase tracking-widest hover:bg-blue-200/70 transition-colors"
          >
            <Pencil className="w-3 h-3" /> Sửa
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-red-100 text-red-500 border border-red-200 text-[8px] font-black uppercase tracking-widest hover:bg-red-200/70 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Xóa
          </button>
        </div>
      </motion.div>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-[400px] rounded-[28px] border border-slate-200/80 shadow-2xl p-8 bg-white">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Xác nhận xóa?</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Phòng ban "{department.name}" sẽ bị xóa vĩnh viễn.</p>
            </div>
            <div className="flex gap-3 w-full pt-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)} className="flex-1 rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200">
                Hủy
              </Button>
              <Button
                onClick={() => { onDelete(); setConfirmDelete(false) }}
                className="flex-1 rounded-xl h-10 text-xs font-black uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white"
              >
                Xóa ngay
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ─── Main Page ─── */
export default function DepartmentsPage() {
  const { show, hide } = useLoading()
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [filterActive, setFilterActive] = React.useState<string>("all")
  const [editingDept, setEditingDept] = React.useState<Department | null>(null)

  // Fetch departments
  const fetchDepartments = React.useCallback(async () => {
    show("Đang tải phòng ban...")
    try {
      const res = await fetch(`${API_URL}/api/departments`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setDepartments(data.map((d: any) => ({
        id: d.Id,
        name: d.Name,
        description: d.Description || "",
        active: d.Active,
      })))
    } catch {
      console.error("Failed to fetch departments")
    } finally {
      hide()
    }
  }, [show, hide])

  React.useEffect(() => { fetchDepartments() }, [fetchDepartments])

  // Add department
  const handleAdd = async (dept: Department): Promise<boolean> => {
    try {
      const token = localStorage.getItem("mintcare_token")
      const res = await fetch(`${API_URL}/api/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          Id: dept.id,
          Name: dept.name,
          Description: dept.description,
          Active: dept.active,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      await fetchDepartments()
      return true
    } catch {
      return false
    }
  }

  // Update department
  const handleUpdate = async (dept: Department) => {
    try {
      const token = localStorage.getItem("mintcare_token")
      await fetch(`${API_URL}/api/departments/${dept.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ Name: dept.name, Description: dept.description }),
      })
      await fetchDepartments()
    } catch {
      console.error("Failed to update department")
    }
  }

  // Delete department
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("mintcare_token")
      await fetch(`${API_URL}/api/departments/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      await fetchDepartments()
    } catch {
      console.error("Failed to delete department")
    }
  }

  // Toggle active
  const handleToggleActive = async (dept: Department) => {
    try {
      const token = localStorage.getItem("mintcare_token")
      await fetch(`${API_URL}/api/departments/${dept.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ Active: !dept.active }),
      })
      await fetchDepartments()
    } catch {
      console.error("Failed to toggle department")
    }
  }

  // Filter
  const filtered = departments.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchActive = filterActive === "all" ||
      (filterActive === "active" && d.active) ||
      (filterActive === "inactive" && !d.active)
    return matchSearch && matchActive
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-10 pt-10 pb-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Phòng ban</h1>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Quản lý các phòng ban trong hệ thống</p>
            </div>
          </div>

          <AddDepartmentDialog onAdd={handleAdd} />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm phòng ban..."
              className="w-full pl-11 pr-4 rounded-2xl border-slate-200 h-11 bg-slate-50 focus:bg-white font-bold text-xs shadow-none"
            />
          </div>

          <Select value={filterActive} onValueChange={(v) => setFilterActive(v ?? "all")}>
            <SelectTrigger className="w-40 rounded-2xl border-slate-200 h-11 bg-slate-50 font-bold text-xs">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white">
              <SelectItem value="all" className="rounded-lg py-2 font-bold text-xs">Tất cả</SelectItem>
              <SelectItem value="active" className="rounded-lg py-2 font-bold text-xs">Đang hoạt động</SelectItem>
              <SelectItem value="inactive" className="rounded-lg py-2 font-bold text-xs">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-all", viewMode === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-all", viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-10 pb-10">
        {filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">Không tìm thấy phòng ban nào</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtered.map((dept) => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  onEdit={() => setEditingDept(dept)}
                  onDelete={() => handleDelete(dept.id)}
                  onToggleActive={() => handleToggleActive(dept)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((dept) => (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "bg-white border rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition-all",
                    dept.active ? "border-slate-100" : "border-slate-200 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">{dept.name}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">{dept.description || "Không có mô tả"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(dept)}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                        dept.active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {dept.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setEditingDept(dept)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(dept.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingDept && (
        <EditDepartmentDialog
          department={editingDept}
          open={!!editingDept}
          onOpenChange={(v) => { if (!v) setEditingDept(null) }}
          onSave={handleUpdate}
        />
      )}
    </div>
  )
}
