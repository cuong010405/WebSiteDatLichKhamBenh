"use client"

import React from "react"

// Remove Vietnamese diacritics for ASCII email generation
function toAsciiSlug(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 40) || "user"
}

import {
  MapPin, Clock, UserPlus, Download, Search, Filter,
  Star, MessageSquare, Phone, LayoutGrid, List,
  Sparkles, ShieldCheck, Pencil, Trash2, X,
  AlertTriangle, CheckCircle2, Upload, ImageIcon,
  FileText, Award, Eye, Calendar, Plus,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
import { Staff, StaffStatus } from "@/lib/types"
import { API_URL, authFetch } from "@/lib/api"
import { useLoading } from "@/lib/loading-context"

/* ─── Avatar Upload Input ─── */
function AvatarUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (dataUrl: string) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => onChange(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3">
      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Ảnh đại diện</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex items-center gap-4 rounded-2xl border-2 border-dashed p-4 cursor-pointer transition-all",
          dragging ? "border-blue-400 bg-blue-50/60" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
          {value ? (
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-7 h-7 text-slate-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate-700 uppercase tracking-tight">
            {value ? "Ảnh đã chọn" : "Kéo thả hoặc nhấn để chọn"}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">PNG, JPG, WEBP — tối đa 5MB</p>
        </div>
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange("") }}
            className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-500 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <Upload className={cn("absolute right-4 bottom-4 w-4 h-4 transition-colors", dragging ? "text-blue-400" : "text-slate-200")} />
      </div>
    </div>
  )
}

/* ─── Add Staff Dialog ─── */
function AddStaffDialog({ onAdd, departments, positions }: { onAdd: (s: Staff) => void; departments: string[]; positions: string[] }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [role, setRole] = React.useState("")
  const [department, setDepartment] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [avatar, setAvatar] = React.useState("")
  const [success, setSuccess] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [status, setStatus] = React.useState<StaffStatus>("Sẵn sàng")
  const [available, setAvailable] = React.useState(true)

  const [licenseNumber, setLicenseNumber] = React.useState("")
  const [issuedBy, setIssuedBy] = React.useState("Bộ Y tế")
  const [issuedDate, setIssuedDate] = React.useState("")
  const [expiryDate, setExpiryDate] = React.useState("")
  const [specialty, setSpecialty] = React.useState("")
  const [licenseNote, setLicenseNote] = React.useState("")

  const reset = () => {
    setName(""); setRole(""); setDepartment(""); setPhone("")
    setEmail(""); setLocation(""); setAvatar("")
    setStatus("Sẵn sàng"); setAvailable(true)
    setLicenseNumber(""); setIssuedBy("Bộ Y tế"); setIssuedDate(""); setExpiryDate(""); setSpecialty(""); setLicenseNote("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !role || !department) return
    setSubmitting(true)
    const slug = toAsciiSlug(name)
    const newStaff: Staff = {
      id: `S-${Date.now()}`,
      name,
      role,
      status,
      department,
      phone: phone && phone.length >= 10 ? phone : "0000000000",
      email: email || `${slug}@mintcare.com`,
      location: location || "Van phong chinh",
      avatar: avatar || `https://i.pravatar.cc/150?u=${Date.now()}`,
      available,
      isNew: true,
    }

    try {
      await onAdd(newStaff)
      if (licenseNumber && issuedDate) {
        await authFetch(`${API_URL}/licenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            staffId: newStaff.id,
            licenseNumber,
            issuedBy: issuedBy || "Bộ Y tế",
            issuedDate,
            expiryDate: expiryDate || null,
            specialty: specialty || role,
            note: licenseNote || null,
          }),
        })
      }
      setSuccess(true)
      reset()
      setTimeout(() => {
        setSuccess(false)
        setOpen(false)
      }, 1500)
    } catch {
      // handled in parent
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Trigger button */}
      <Button
        onClick={() => setOpen(true)}
        className="bg-primary text-white rounded-[24px] px-8 h-14 text-xs font-black uppercase tracking-[0.15em] flex items-center gap-3 shadow-xl shadow-primary/20 hover:opacity-95 transition-all border-b-4 border-white/10 active:border-b-0 active:translate-y-0.5"
      >
        <UserPlus className="w-5 h-5" />
        Thêm chuyên gia
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setSuccess(false) } }}>
        <DialogContent className="sm:max-w-[900px] rounded-[32px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
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
                  <p className="text-xs text-slate-500 font-semibold mt-1">Hồ sơ chuyên gia đã được lưu thành công vào hệ thống.</p>
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
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Đăng ký chuyên gia</DialogTitle>
                    <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Khởi tạo và quản lý hồ sơ nhân sự mới trên hệ thống.</DialogDescription>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-5">
                  {/* Left Column: Avatar & Name */}
                  <div className="space-y-4">
                    {/* Avatar upload */}
                    <AvatarUpload value={avatar} onChange={setAvatar} />

                    {/* Name */}
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Họ và tên đầy đủ <span className="text-red-400">*</span></label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="VD: Nguyễn Văn A" className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                    </div>
                  </div>

                  {/* Col 2: Phone & Email */}
                  <div className="space-y-4 justify-start">
                    {/* Phone */}
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Số điện thoại</label>
                      <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="090 123 4567" className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                    </div>
                    {/* Email */}
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Email công vụ</label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ten@mintcare.com" className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                    </div>
                  </div>

                  {/* Col 3: Status & Location */}
                  <div className="space-y-4 justify-start">
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Trạng thái hoạt động</label>
                      <Select value={status} onValueChange={(v) => { setStatus(v ?? "Sẵn sàng"); setAvailable(v === "Sẵn sàng") }}>
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                          <SelectValue placeholder="Chọn trạng thái..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                          <SelectItem value="Sẵn sàng" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">Sẵn sàng (Được đặt lịch)</SelectItem>
                          <SelectItem value="Đang bận" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">Đang bận (Khóa đặt lịch)</SelectItem>
                          <SelectItem value="Nghỉ phép" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">Nghỉ phép (Khóa đặt lịch)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Location */}
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Địa điểm / Vị trí</label>
                      <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="VD: Quận 1, TP.HCM" className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Role + Department — full width row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Chức vụ <span className="text-red-400">*</span></label>
                    <Select value={role} onValueChange={(v) => setRole(v ?? "")}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                        <SelectValue placeholder="Chọn chức vụ..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800 min-w-[260px]">
                        {positions.map((r) => <SelectItem key={r} value={r} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Phòng ban <span className="text-red-400">*</span></label>
                    <Select value={department} onValueChange={(v) => setDepartment(v ?? "")}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                        <SelectValue placeholder="Chọn phòng ban..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800 min-w-[260px]">
                        {departments.map((d) => <SelectItem key={d} value={d} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* License Section */}
                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-3 text-left">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-black text-rose-900 uppercase tracking-wider">Chứng chỉ hành nghề (Tùy chọn)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Số chứng chỉ</label>
                      <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="VD: 01234/BYT-CCHN" className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs shadow-none px-3" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Cơ quan cấp</label>
                      <Input value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)} placeholder="VD: Bộ Y tế" className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs shadow-none px-3" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Ngày cấp</label>
                      <Input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs shadow-none px-3" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Hạn sử dụng</label>
                      <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs shadow-none px-3" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Chuyên khoa</label>
                      <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="VD: Nội khoa" className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs shadow-none px-3" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Ghi chú chứng chỉ</label>
                      <Input value={licenseNote} onChange={(e) => setLicenseNote(e.target.value)} placeholder="VD: Khám chữa bệnh tổng hợp" className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs shadow-none px-3" />
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    disabled={!name || !role || !department || submitting}
                    className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-95 transition-all shadow-md border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5 disabled:opacity-40 group"
                  >
                    {submitting ? "Đang lưu..." : "Tạo hồ sơ"}
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

/* ─── Staff Detail Dialog (View Info & Manage Licenses) ─── */
function StaffDetailDialog({
  person, open, onOpenChange,
}: {
  person: Staff
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [tab, setTab] = React.useState<"info" | "licenses">("info")
  const [licenses, setLicenses] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)

  // License form state
  const [isAdding, setIsAdding] = React.useState(false)
  const [licNumber, setLicNumber] = React.useState("")
  const [licIssuer, setLicIssuer] = React.useState("Bộ Y tế")
  const [licDate, setLicDate] = React.useState("")
  const [licExpiry, setLicExpiry] = React.useState("")
  const [licSpec, setLicSpec] = React.useState("")
  const [licNote, setLicNote] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  // Edit state
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editNumber, setEditNumber] = React.useState("")
  const [editIssuer, setEditIssuer] = React.useState("")
  const [editDate, setEditDate] = React.useState("")
  const [editExpiry, setEditExpiry] = React.useState("")
  const [editSpec, setEditSpec] = React.useState("")
  const [editNote, setEditNote] = React.useState("")
  const [editSaving, setEditSaving] = React.useState(false)

  const fetchLicenses = React.useCallback(async () => {
    if (!person?.id) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/licenses/${person.id}`)
      if (res.ok) {
        const data = await res.json()
        setLicenses(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [person?.id])

  React.useEffect(() => {
    if (open) {
      fetchLicenses()
      setIsAdding(false)
      setEditingId(null)
    }
  }, [open, fetchLicenses])

  const startEdit = (lic: any) => {
    setEditingId(lic.id)
    setEditNumber(lic.licenseNumber || "")
    setEditIssuer(lic.issuedBy || "Bộ Y tế")
    setEditDate(lic.issuedDate || "")
    setEditExpiry(lic.expiryDate || "")
    setEditSpec(lic.specialty || "")
    setEditNote(lic.note || "")
    setIsAdding(false)
  }

  const handleUpdateLicense = async (e: React.FormEvent, id: string) => {
    e.preventDefault()
    if (!editNumber || !editDate) return
    setEditSaving(true)
    try {
      const res = await authFetch(`${API_URL}/licenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseNumber: editNumber,
          issuedBy: editIssuer || "Bộ Y tế",
          issuedDate: editDate,
          expiryDate: editExpiry || null,
          specialty: editSpec || person.role,
          note: editNote || null,
        }),
      })
      if (res.ok) {
        setEditingId(null)
        fetchLicenses()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setEditSaving(false)
    }
  }

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!licNumber || !licDate) return
    setSaving(true)
    try {
      const res = await authFetch(`${API_URL}/licenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: person.id,
          licenseNumber: licNumber,
          issuedBy: licIssuer || "Bộ Y tế",
          issuedDate: licDate,
          expiryDate: licExpiry || null,
          specialty: licSpec || person.role,
          note: licNote || null,
        }),
      })
      if (res.ok) {
        setLicNumber(""); setLicDate(""); setLicExpiry(""); setLicSpec(""); setLicNote(""); setLicIssuer("Bộ Y tế")
        setIsAdding(false)
        fetchLicenses()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLicense = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa chứng chỉ này?")) return
    try {
      const res = await authFetch(`${API_URL}/licenses/${id}`, { method: "DELETE" })
      if (res.ok) fetchLicenses()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] rounded-[32px] border border-slate-200 shadow-2xl p-0 overflow-hidden bg-white flex flex-col max-h-[90vh]">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 shrink-0" />
        
        {/* Header Profile Summary */}
        <div className="p-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-white shadow-md">
              <AvatarImage src={person.avatar || `https://i.pravatar.cc/150?u=${person.id}`} className="object-cover" />
              <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold uppercase">{person.name[0]}</AvatarFallback>
            </Avatar>
            <div className="text-left flex-1 min-w-0">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight truncate">{person.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="bg-emerald-100/80 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide border border-emerald-200/60 max-w-[220px] truncate">
                  {person.role}
                </span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide border border-blue-100">
                  {person.department}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-200/60 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setTab("info")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                tab === "info" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Eye className="w-3.5 h-3.5" /> Thông tin
            </button>
            <button
              onClick={() => setTab("licenses")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                tab === "licenses" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Award className="w-3.5 h-3.5" /> Chứng chỉ ({licenses.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 text-left overflow-y-auto flex-1">
          {tab === "info" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Số điện thoại</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">{person.phone || "Chưa cập nhật"}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Email công vụ</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">{person.email || "Chưa cập nhật"}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Vị trí hiện tại</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">{person.location}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Trạng thái đặt lịch</span>
                  <span className={cn("text-xs font-black mt-1 block", person.available ? "text-emerald-600" : "text-orange-500")}>
                    {person.available ? "Sẵn sàng nhận lịch" : "Khóa nhận lịch (" + person.status + ")"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-rose-500" /> Danh sách Chứng chỉ hành nghề
                </h3>
                {!isAdding && (
                  <Button
                    onClick={() => setIsAdding(true)}
                    size="sm"
                    className="h-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm chứng chỉ
                  </Button>
                )}
              </div>

              {/* Add License Inline Form */}
              {isAdding && (
                <form onSubmit={handleCreateLicense} className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3">
                  <p className="text-[10px] font-black text-rose-900 uppercase tracking-wider">Cấp mới chứng chỉ hành nghề</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase">Số chứng chỉ <span className="text-rose-500">*</span></label>
                      <Input value={licNumber} onChange={(e) => setLicNumber(e.target.value)} required placeholder="VD: 01234/BYT-CCHN" className="h-9 text-xs bg-white border-rose-200" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase">Cơ quan cấp</label>
                      <Input value={licIssuer} onChange={(e) => setLicIssuer(e.target.value)} required placeholder="VD: Bộ Y tế" className="h-9 text-xs bg-white border-rose-200" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase">Ngày cấp <span className="text-rose-500">*</span></label>
                      <Input type="date" value={licDate} onChange={(e) => setLicDate(e.target.value)} required className="h-9 text-xs bg-white border-rose-200" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase">Hạn sử dụng</label>
                      <Input type="date" value={licExpiry} onChange={(e) => setLicExpiry(e.target.value)} className="h-9 text-xs bg-white border-rose-200" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase">Chuyên khoa</label>
                      <Input value={licSpec} onChange={(e) => setLicSpec(e.target.value)} placeholder="VD: Nội khoa" className="h-9 text-xs bg-white border-rose-200" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase">Ghi chú</label>
                      <Input value={licNote} onChange={(e) => setLicNote(e.target.value)} placeholder="VD: Khám chữa bệnh tổng hợp" className="h-9 text-xs bg-white border-rose-200" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)} className="h-8 text-[10px] rounded-xl border-slate-300">
                      Hủy
                    </Button>
                    <Button type="submit" size="sm" disabled={saving} className="h-8 text-[10px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase">
                      {saving ? "Lưu..." : "Xác nhận tạo"}
                    </Button>
                  </div>
                </form>
              )}

              {/* License Red Badge Cards List */}
              {loading ? (
                <p className="text-xs text-slate-400 font-bold text-center py-6">Đang tải chứng chỉ...</p>
              ) : licenses.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                  <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">Chưa có chứng chỉ hành nghề nào được cập nhật</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {licenses.map((lic) => (
                    <div key={lic.id} className="relative rounded-2xl bg-gradient-to-br from-rose-50/80 via-white to-red-50/40 border-2 border-rose-200/80 shadow-md overflow-hidden">
                      {editingId === lic.id ? (
                        /* ── Inline Edit Form ── */
                        <form onSubmit={(e) => handleUpdateLicense(e, lic.id)} className="p-4 space-y-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-black text-rose-900 uppercase tracking-wider">Chỉnh sửa chứng chỉ</p>
                            <button type="button" onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕ Hủy</button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] font-black text-slate-500 uppercase">Số chứng chỉ <span className="text-rose-500">*</span></label>
                              <Input value={editNumber} onChange={(e) => setEditNumber(e.target.value)} required className="h-9 text-xs bg-white border-rose-200" />
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-slate-500 uppercase">Cơ quan cấp</label>
                              <Input value={editIssuer} onChange={(e) => setEditIssuer(e.target.value)} className="h-9 text-xs bg-white border-rose-200" />
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-slate-500 uppercase">Ngày cấp <span className="text-rose-500">*</span></label>
                              <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required className="h-9 text-xs bg-white border-rose-200" />
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-slate-500 uppercase">Hạn sử dụng</label>
                              <Input type="date" value={editExpiry} onChange={(e) => setEditExpiry(e.target.value)} className="h-9 text-xs bg-white border-rose-200" />
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-slate-500 uppercase">Chuyên khoa</label>
                              <Input value={editSpec} onChange={(e) => setEditSpec(e.target.value)} placeholder="VD: Nội khoa" className="h-9 text-xs bg-white border-rose-200" />
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-slate-500 uppercase">Ghi chú</label>
                              <Input value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="VD: Khám chữa bệnh tổng hợp" className="h-9 text-xs bg-white border-rose-200" />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)} className="h-8 text-[10px] rounded-xl border-slate-300">Hủy</Button>
                            <Button type="submit" size="sm" disabled={editSaving} className="h-8 text-[10px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase">
                              {editSaving ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                          </div>
                        </form>
                      ) : (
                        /* ── View Mode ── */
                        <div className="p-5 space-y-3">
                          {/* Red Stamp Badge Visual */}
                          <div className="absolute top-4 right-20 w-12 h-12 rounded-full border-2 border-dashed border-rose-500/40 bg-rose-100/50 flex flex-col items-center justify-center rotate-[-12deg] pointer-events-none">
                            <Award className="w-4 h-4 text-rose-600" />
                            <span className="text-[6px] font-black text-rose-700 uppercase tracking-tighter">ĐÁNG TIN</span>
                          </div>

                          <div className="flex items-start justify-between">
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-300">
                                📜 CHỨNG CHỈ HÀNH NGHỀ Y TẾ
                              </span>
                              <h4 className="text-sm font-black text-slate-900 mt-1.5 font-mono">
                                Số: {lic.licenseNumber}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => startEdit(lic)}
                                className="text-slate-300 hover:text-blue-600 transition-colors p-1"
                                title="Sửa chứng chỉ"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLicense(lic.id)}
                                className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                                title="Xóa chứng chỉ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600 border-t border-rose-100/60 pt-2.5">
                            <p><span className="text-slate-400 uppercase text-[9px] font-black block">Cơ quan cấp:</span> {lic.issuedBy}</p>
                            <p><span className="text-slate-400 uppercase text-[9px] font-black block">Chuyên khoa:</span> {lic.specialty || person.role}</p>
                            <p><span className="text-slate-400 uppercase text-[9px] font-black block">Ngày cấp:</span> {lic.issuedDate}</p>
                            <p><span className="text-slate-400 uppercase text-[9px] font-black block">Hạn sử dụng:</span> {lic.expiryDate || "Vô thời hạn (Vĩnh viễn)"}</p>
                          </div>
                          {lic.note && (
                            <div className="p-2.5 rounded-xl bg-white/80 border border-rose-100/80 text-[10px] font-semibold text-slate-600">
                              <span className="font-black text-rose-800 uppercase text-[9px]">Ghi chú:</span> {lic.note}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pb-7 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0 rounded-b-[32px]">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-2xl px-8 h-11 text-xs font-black uppercase tracking-wider border-slate-300 hover:bg-slate-200/60 shadow-xs cursor-pointer">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Edit Staff Dialog ─── */
function EditStaffDialog({
  person, open, onOpenChange, onSave, departments, positions,
}: {
  person: Staff
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (updated: Staff) => void
  departments: string[]
  positions: string[]
}) {
  const [name, setName] = React.useState(person.name)
  const [role, setRole] = React.useState(person.role.split("•")[0].trim())
  const [department, setDepartment] = React.useState(person.department)
  const [phone, setPhone] = React.useState(person.phone)
  const [email, setEmail] = React.useState(person.email || "")
  const [location, setLocation] = React.useState(person.location || "")
  const [avatar, setAvatar] = React.useState(person.avatar || "")
  const [status, setStatus] = React.useState<StaffStatus>(person.status || "Sẵn sàng")
  const [available, setAvailable] = React.useState(person.available ?? true)

  React.useEffect(() => {
    if (open) {
      setName(person.name); setRole(person.role.split("•")[0].trim())
      setDepartment(person.department); setPhone(person.phone)
      setEmail(person.email || "")
      setLocation(person.location || "")
      setAvatar(person.avatar || "")
      setStatus(person.status || "Sẵn sàng")
      setAvailable(person.available ?? true)
    }
  }, [open, person])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...person, name, role, department, phone, email, location, avatar, status, available })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[740px] rounded-[32px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-indigo-500" />
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Pencil className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Chỉnh sửa chuyên gia</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Cập nhật thông tin hồ sơ nhân sự trong hệ thống.</DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <AvatarUpload value={avatar} onChange={setAvatar} />

              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Họ và tên</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Chức vụ</label>
                  <Select value={role} onValueChange={(v) => setRole(v ?? "")}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                      <SelectValue placeholder="Chọn chức vụ..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                      {positions.map((r) => <SelectItem key={r} value={r} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Phòng ban</label>
                  <Select value={department} onValueChange={(v) => setDepartment(v ?? "")}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                      <SelectValue placeholder="Chọn phòng ban..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                      {departments.map((d) => <SelectItem key={d} value={d} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Số điện thoại</label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Email công vụ</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ten@mintcare.com" className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Trạng thái hoạt động</label>
                  <Select value={status} onValueChange={(v) => { setStatus(v ?? "Sẵn sàng"); setAvailable(v === "Sẵn sàng") }}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                      <SelectValue placeholder="Chọn trạng thái..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                      <SelectItem value="Sẵn sàng" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">Sẵn sàng (Được đặt lịch)</SelectItem>
                      <SelectItem value="Đang bận" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">Đang bận (Khóa đặt lịch)</SelectItem>
                      <SelectItem value="Nghỉ phép" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">Nghỉ phép (Khóa đặt lịch)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Địa điểm</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="VD: Quận 1, TP.HCM" className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                </div>
              </div>
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

/* ─── Delete Dialog ─── */
function DeleteStaffDialog({
  person, open, onOpenChange, onDelete,
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
  person, onEdit, onDelete, departments, positions,
}: {
  person: Staff
  onEdit: (p: Staff) => void
  onDelete: (id: string) => void
  departments: string[]
  positions: string[]
}) {
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.35 }}
        className="h-full"
        onClick={() => setDetailOpen(true)}
      >
        <div className="group border border-hairline rounded-3xl bg-white hover:border-primary/30 transition-all cursor-pointer relative shadow-xs hover:shadow-xl hover:shadow-black/[0.04] flex flex-col h-full">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-surface-tinted/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-3xl" />

          {/* Top: avatar + name + tags in one row */}
          <div className="p-5 pb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <Avatar className="w-11 h-11 rounded-xl border-2 border-white shadow-lg ring-1 ring-hairline group-hover:ring-primary/20 transition-all duration-500">
                  <AvatarImage src={person.avatar || `https://i.pravatar.cc/150?u=${person.id}`} alt={person.name} className="object-cover" />
                  <AvatarFallback className="bg-surface-secondary text-primary-strong text-sm font-black uppercase">{person.name[0]}</AvatarFallback>
                </Avatar>
                <div className={cn("absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full shadow-sm transition-colors duration-500", person.available ? "bg-primary" : "bg-orange-500")}>
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-30" />
                </div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-black text-sm text-foreground group-hover:text-primary transition-colors duration-300 leading-tight uppercase tracking-tight line-clamp-1">{person.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="bg-surface-tinted text-primary-strong text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider border border-primary/10 whitespace-nowrap">{person.role.split("•")[0]}</span>
                  <div className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                  <span className="text-[8px] font-black text-on-surface-tertiary uppercase tracking-wider whitespace-nowrap truncate">{person.department}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-5 pb-3 relative z-10">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-secondary/40 p-3 rounded-xl border border-hairline/40 transition-all group-hover:bg-white group-hover:shadow-sm text-left">
                <p className="text-[8px] font-black text-on-surface-tertiary uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-primary text-primary" /> Xếp hạng
                </p>
                <p className="text-base font-black text-foreground tracking-tight">4.9<span className="text-[9px] text-on-surface-tertiary ml-0.5 opacity-50">/5.0</span></p>
              </div>
              <div className="bg-surface-secondary/40 p-3 rounded-xl border border-hairline/40 transition-all group-hover:bg-white group-hover:shadow-sm text-left">
                <p className="text-[8px] font-black text-on-surface-tertiary uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-primary" /> Hiệu suất
                </p>
                <p className="text-base font-black text-foreground tracking-tight">120+<span className="text-[9px] text-on-surface-tertiary ml-0.5 opacity-50">CA TRỰC</span></p>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Location + contact */}
          <div className="px-5 py-3 border-t border-hairline/40 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-left min-w-0">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-all shrink-0", person.available ? "bg-surface-tinted text-primary" : "bg-orange-50 text-orange-600")}>
                  {person.available ? <MapPin className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] font-black text-on-surface-tertiary uppercase tracking-wider block">Vị trí hiện tại</span>
                  <span className="text-xs font-black tracking-tight truncate block max-w-[120px]">{person.location}</span>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-hairline bg-white hover:bg-primary hover:text-white hover:shadow-lg transition-all shadow-sm">
                  <MessageSquare className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-hairline bg-white hover:bg-primary hover:text-white hover:shadow-lg transition-all shadow-sm">
                  <Phone className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action buttons - hover reveal */}
          <div className="overflow-hidden transition-all duration-300 ease-out max-h-0 group-hover:max-h-[44px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
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
                onClick={(e) => { e.stopPropagation(); setDeleteOpen(true) }}
                className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-red-100 text-red-500 border border-red-200 text-[8px] font-black uppercase tracking-widest hover:bg-red-200/70 transition-colors"
              >
                <Trash2 className="w-2.5 h-2.5" /> Xóa
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <StaffDetailDialog person={person} open={detailOpen} onOpenChange={setDetailOpen} />
      <EditStaffDialog person={person} open={editOpen} onOpenChange={setEditOpen} onSave={onEdit} departments={departments} positions={positions} />
      <DeleteStaffDialog person={person} open={deleteOpen} onOpenChange={setDeleteOpen} onDelete={onDelete} />
    </>
  )
}

/* ─── Page ─── */
export default function StaffPage() {
  const { show, hide } = useLoading()
  const [staffList, setStaffList] = React.useState<Staff[]>([])
  const [departments, setDepartments] = React.useState<string[]>([])
  const [positions, setPositions] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")

  const loadStaff = () => {
    setLoading(true)
    fetch(`${API_URL}/staff`)
      .then((res) => { if (!res.ok) throw new Error("Staff fetch failed"); return res.json() })
      .then((data) => { setStaffList(Array.isArray(data) ? data : []); setLoading(false) })
      .catch((err) => { console.error("Lỗi tải chuyên gia:", err); setLoading(false) })
  }

  const loadDepartments = () => {
    fetch(`${API_URL}/departments/active`)
      .then((res) => { if (!res.ok) throw new Error("Departments fetch failed"); return res.json() })
      .then((data) => { setDepartments(data.map((d: any) => d.Name)) })
      .catch((err) => { console.error("Lỗi tải phòng ban:", err) })
  }

  const loadPositions = () => {
    fetch(`${API_URL}/positions/active`)
      .then((res) => { if (!res.ok) throw new Error("Positions fetch failed"); return res.json() })
      .then((data) => { setPositions(data.map((p: any) => p.Name)) })
      .catch((err) => { console.error("Lỗi tải chức vụ:", err) })
  }

  React.useEffect(() => { loadStaff(); loadDepartments(); loadPositions() }, [])

  const handleAdd = async (newStaff: Staff) => {
    show("Đang thêm chuyên gia...")
    try {
      const res = await authFetch(`${API_URL}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      })
      if (!res.ok) throw new Error("Add staff failed")
      const created = await res.json()
      setStaffList((prev) => [created, ...prev])
    } catch (err) {
      console.error("Lỗi thêm chuyên gia:", err)
    } finally {
      hide()
    }
  }

  const handleEdit = async (updated: Staff) => {
    show("Đang cập nhật...")
    try {
      const res = await authFetch(`${API_URL}/staff/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error("Update staff failed")
      const saved = await res.json()
      setStaffList((prev) => prev.map((s) => (s.id === saved.id ? saved : s)))
    } catch (err) {
      console.error("Lỗi cập nhật chuyên gia:", err)
    } finally {
      hide()
    }
  }

  const handleDelete = async (id: string) => {
    show("Đang xóa chuyên gia...")
    try {
      const res = await authFetch(`${API_URL}/staff/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setStaffList((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error("Lỗi xóa chuyên gia:", err)
    } finally {
      hide()
    }
  }

  const filteredStaff = staffList.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-10 max-w-7xl mx-auto w-full space-y-16 pb-32">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-surface-tinted px-3.5 py-2 rounded-full border border-primary/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="eyebrow text-[10px] font-black uppercase tracking-widest text-primary-strong">Hồ sơ nhân viên y tế</span>
            </div>
            <div className="w-px h-5 bg-hairline" />
            <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">{staffList.length} Thành viên</span>
          </div>
          <h1 className="text-6xl font-black tight-tracking text-foreground leading-[1] uppercase text-left">Quản lý <br />Chuyên gia</h1>
          <p className="text-xl text-muted-foreground mt-5 max-w-2xl font-medium leading-relaxed antialiased text-left">
            Điều phối và nâng cao hiệu suất làm việc cho đội ngũ chuyên gia y tế lưu động của phòng khám.
          </p>
        </motion.div>
        <div className="flex items-center gap-4 shrink-0">
          <Button variant="outline" className="bg-white text-foreground border-hairline rounded-[24px] px-8 h-14 text-xs font-black uppercase tracking-[0.2em] hover:bg-surface-secondary transition-all shadow-xl shadow-black/[0.02] flex items-center gap-3 active:scale-95 group">
            <Download className="w-5 h-5 text-primary group-hover:-translate-y-1 transition-transform" /> Xuất báo cáo
          </Button>
          <AddStaffDialog onAdd={handleAdd} departments={departments} positions={positions} />
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo định danh, chức vụ hoặc vị trí..."
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

      {/* Staff Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang tải danh sách chuyên gia...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          <AnimatePresence>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((person) => (
                <StaffCard key={person.id} person={person} onEdit={handleEdit} onDelete={handleDelete} departments={departments} positions={positions} />
              ))
            ) : (
              <p className="col-span-3 py-20 text-center font-bold text-slate-400 uppercase text-xs tracking-widest">Không tìm thấy chuyên gia nào</p>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="pt-14 flex justify-center">
        <Button variant="outline" className="rounded-full px-14 h-14 border-hairline text-[11px] font-black uppercase tracking-[0.25em] hover:bg-surface-secondary transition-all shadow-xl shadow-black/[0.01]">
          Mở rộng danh sách nhân viên
        </Button>
      </div>
    </div>
  )
}
