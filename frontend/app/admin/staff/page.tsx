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

import { AdminRoleGuard } from "@/components/auth/admin-role-guard"
import {
  MapPin, Clock, UserPlus, Download, Search, Filter,
  Star, MessageSquare, Phone, LayoutGrid, List,
  Sparkles, ShieldCheck, Pencil, Trash2, X,
  AlertTriangle, CheckCircle2, Upload, ImageIcon,
  FileText, Award, Eye, Calendar, Plus, AlertCircle,
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
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Staff, StaffStatus } from "@/lib/types"
import { API_URL, authFetch } from "@/lib/api"
import { useLoading } from "@/lib/loading-context"
import { Pagination } from "@/components/ui/pagination"

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
function AddStaffDialog({ onAdd, departments, positions }: { onAdd: (s: Staff) => Promise<{ success: boolean; error?: string } | undefined>; departments: string[]; positions: string[] }) {
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
  const [staffSpecialty, setStaffSpecialty] = React.useState("")
  const [staffExperience, setStaffExperience] = React.useState("")
  const [services, setServices] = React.useState<string[]>([])

  React.useEffect(() => {
    if (open && services.length === 0) {
      fetch(`${API_URL}/services/active`)
        .then((r) => r.json())
        .then((data) => setServices(Array.isArray(data) ? data.map((s: any) => s.name) : []))
        .catch(() => {})
    }
  }, [open])

  const [licenseNumber, setLicenseNumber] = React.useState("")
  const [issuedBy, setIssuedBy] = React.useState("Bộ Y tế")
  const [issuedDate, setIssuedDate] = React.useState("")
  const [expiryDate, setExpiryDate] = React.useState("")
  const [specialty, setSpecialty] = React.useState("")
  const [licenseNote, setLicenseNote] = React.useState("")

  const [staffType, setStaffType] = React.useState<string>("Điều dưỡng viên")
  const [addError, setAddError] = React.useState("")

  const reset = () => {
    setName(""); setRole(""); setDepartment(""); setPhone("")
    setEmail(""); setLocation(""); setAvatar(""); setStaffType("Điều dưỡng viên")
    setStatus("Sẵn sàng"); setAvailable(true)
    setLicenseNumber(""); setIssuedBy("Bộ Y tế"); setIssuedDate(""); setExpiryDate(""); setSpecialty(""); setLicenseNote("")
    setStaffSpecialty(""); setStaffExperience(""); setAddError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError("")
    const selectedRole = role || staffType
    const selectedDept = department || (staffType === "Chuyên viên vật lý trị liệu" ? "Phục hồi chức năng" : "Khoa Điều dưỡng")
    if (!name) return
    setSubmitting(true)
    const slug = toAsciiSlug(name)
    const newStaff: Staff = {
      id: `S-${Date.now()}`,
      name,
      role: selectedRole,
      status,
      department: selectedDept,
      phone: phone && phone.length >= 10 ? phone : "0000000000",
      email: email || `${slug}@mintcare.com`,
      location: location || "Van phong chinh",
      avatar: avatar || `https://i.pravatar.cc/150?u=${Date.now()}`,
      available,
      isNew: true,
      specialty: staffSpecialty || null,
      experience: staffExperience || null,
    }

    try {
      const res = await onAdd(newStaff)
      if (res && !res.success) {
        setAddError(res.error || "Không thể thêm mới chuyên gia!")
        return
      }
      if (licenseNumber && issuedDate) {
        authFetch(`${API_URL}/licenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            staffId: newStaff.id,
            licenseNumber,
            issuedBy: issuedBy || "Bộ Y tế",
            issuedDate,
            expiryDate: expiryDate || null,
            specialty: specialty || selectedRole,
            note: licenseNote || null,
          }),
        }).catch(() => {})
      }
      reset()
      setOpen(false)
    } catch (err: any) {
      console.error("Add staff error:", err)
      setAddError(err.message || "Không thể thêm mới chuyên gia!")
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

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
        <DialogContent className="sm:max-w-[980px] rounded-[28px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-green-500" />
          <form onSubmit={handleSubmit} className="px-6 py-[10px] space-y-3">
                <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Đăng ký chuyên gia</DialogTitle>
                    <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Khởi tạo và quản lý hồ sơ nhân sự mới trên hệ thống.</DialogDescription>
                  </div>
                </DialogHeader>

                {/* Top Row: Avatar (Col 1), Phone & Email (Col 2), Status & Location (Col 3) */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <AvatarUpload value={avatar} onChange={setAvatar} />
                  </div>

                  <div className="space-y-3 justify-start">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Số điện thoại</label>
                      <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="090 123 4567" className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Gmail</label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ten@gmail.com" className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-3 justify-start">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Trạng thái hoạt động</label>
                      <Select value={status} onValueChange={(v) => { setStatus(v ?? "Sẵn sàng"); setAvailable(v === "Sẵn sàng") }}>
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-10 bg-white font-bold text-xs shadow-none text-slate-800">
                          <SelectValue placeholder="Chọn trạng thái..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                          <SelectItem value="Sẵn sàng" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">Sẵn sàng (Được đặt lịch)</SelectItem>
                          <SelectItem value="Đang bận" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">Đang bận (Khóa đặt lịch)</SelectItem>
                          <SelectItem value="Nghỉ phép" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">Nghỉ phép (Khóa đặt lịch)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Địa điểm / Vị trí</label>
                      <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="VD: Quận 1, TP.HCM" className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Name + Staff Type (Side-by-side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Họ và tên đầy đủ <span className="text-red-400">*</span></label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="VD: Nguyễn Văn A" className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Loại nhân viên <span className="text-red-400">*</span></label>
                    <Select
                      value={staffType}
                      onValueChange={(v) => {
                        setStaffType(v || "Điều dưỡng viên")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-10 bg-white font-bold text-xs shadow-none text-slate-800">
                        <SelectValue placeholder="Chọn loại nhân viên...">
                          {staffType}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                        <SelectItem value="Điều dưỡng viên" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">
                          Điều dưỡng viên
                        </SelectItem>
                        <SelectItem value="Chuyên viên vật lý trị liệu" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">
                          Chuyên viên vật lý trị liệu
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 3: Chức vụ | Phòng ban | Chuyên môn | Kinh nghiệm */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Chức vụ <span className="text-red-400">*</span></label>
                    <Select value={role} onValueChange={(v) => setRole(v ?? "")}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-10 bg-white font-bold text-xs shadow-none text-slate-800">
                        <SelectValue placeholder="Chọn chức vụ..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800 min-w-[220px]">
                        {positions.map((r) => <SelectItem key={r} value={r} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Phòng ban <span className="text-red-400">*</span></label>
                    <Select value={department} onValueChange={(v) => setDepartment(v ?? "")}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-10 bg-white font-bold text-xs shadow-none text-slate-800">
                        <SelectValue placeholder="Chọn phòng ban..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800 min-w-[220px]">
                        {departments.map((d) => <SelectItem key={d} value={d} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Chuyên môn</label>
                    <Select value={staffSpecialty} onValueChange={(v) => setStaffSpecialty(v ?? "")}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-10 bg-white font-bold text-xs shadow-none text-slate-800">
                        <SelectValue placeholder="Chọn dịch vụ...">
                          {staffSpecialty || "Chọn dịch vụ"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800 min-w-[220px]">
                        {services.length > 0 ? (
                          services.map((s) => (
                            <SelectItem key={s} value={s} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{s}</SelectItem>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-[10px] text-slate-400 font-semibold">Đang tải...</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Kinh nghiệm</label>
                    <Input value={staffExperience} onChange={(e) => setStaffExperience(e.target.value)} placeholder="VD: 5 năm" className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
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

                <div className="h-7 flex items-center">
                  {addError && (
                    <p className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[11px] font-bold flex items-center gap-1.5 w-fit">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      <span>{addError}</span>
                    </p>
                  )}
                </div>

                <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white pb-0">
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-full h-10 px-6 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">
                      Hủy bỏ
                    </Button>
                    <Button
                      type="submit"
                      disabled={!name || !role || !department || submitting}
                      className="rounded-full h-10 px-8 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-95 transition-all shadow-md disabled:opacity-40 group"
                    >
                      {submitting ? "Đang lưu..." : "Tạo hồ sơ"}
                      <Sparkles className="w-3.5 h-3.5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
                    </Button>
                  </div>
                </DialogFooter>
              </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ─── Staff Detail Dialog (View Info & Manage Licenses) ─── */
function StaffDetailDialog({
  person, open, onOpenChange, onLicensesUpdated,
}: {
  person: Staff
  open: boolean
  onOpenChange: (v: boolean) => void
  onLicensesUpdated?: (staffId: string, updatedLicenses: any[]) => void
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

  const onLicensesUpdatedRef = React.useRef(onLicensesUpdated)
  React.useEffect(() => {
    onLicensesUpdatedRef.current = onLicensesUpdated
  }, [onLicensesUpdated])

  const fetchLicenses = React.useCallback(async () => {
    if (!person?.id) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/licenses/${person.id}`)
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        setLicenses(list)
        if (onLicensesUpdatedRef.current) {
          onLicensesUpdatedRef.current(person.id, list)
        }
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
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Gmail</span>
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
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Chuyên môn</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">{person.specialty || "Chưa cập nhật"}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Kinh nghiệm</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">{person.experience || "Chưa cập nhật"}</span>
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

        <DialogFooter className="p-6 pb-7 bg-white border-t border-slate-100 flex justify-end shrink-0 rounded-b-[32px]">
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
  onSave: (updated: Staff) => Promise<{ success: boolean; error?: string } | undefined> | void
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
  const [specialty, setSpecialty] = React.useState(person.specialty || "")
  const [experience, setExperience] = React.useState(person.experience || "")
  const [staffType, setStaffType] = React.useState("Diều dưỡng viên")
  const [editServices, setEditServices] = React.useState<string[]>([])

  React.useEffect(() => {
    if (open && editServices.length === 0) {
      fetch(`${API_URL}/services/active`)
        .then((r) => r.json())
        .then((data) => setEditServices(Array.isArray(data) ? data.map((s: any) => s.name) : []))
        .catch(() => {})
    }
  }, [open])

  const [editError, setEditError] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setName(person.name)
      setRole(person.role)
      setDepartment(person.department)
      setPhone(person.phone)
      setEmail(person.email || "")
      setLocation(person.location || "")
      setAvatar(person.avatar || "")
      setStatus(person.status || "Sẵn sàng")
      setAvailable(person.available ?? true)
      setSpecialty(person.specialty || "")
      setExperience(person.experience || "")
      setEditError("")
      const dbStaffType = (person as any).staffType
      if (dbStaffType) {
        setStaffType(dbStaffType)
      } else {
        const isVLTL =
          person.role.includes("VLTL") ||
          person.role.includes("Vật lý") ||
          person.role.includes("vật lý") ||
          (person.department && (person.department.includes("Phục hồi") || person.department.includes("Vật lý")))
        setStaffType(isVLTL ? "Chuyên viên vật lý trị liệu" : "Điều dưỡng viên")
      }
    }
  }, [open, person])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError("")
    const finalRole = role || staffType
    try {
      const res = await onSave({ ...person, name, role: finalRole, department, phone, email, location, avatar, status, available, specialty: specialty || null, experience: experience || null, staffType } as any)
      if (res && !res.success) {
        setEditError(res.error || "Không thể cập nhật thông tin chuyên gia!")
        return
      }
      onOpenChange(false)
    } catch (err: any) {
      setEditError(err.message || "Không thể cập nhật thông tin chuyên gia!")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[980px] rounded-[28px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-slate-100">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Pencil className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Chỉnh sửa chuyên gia</DialogTitle>
                  <DialogDescription className="text-slate-500 mt-1 text-[10px] font-semibold">Cập nhật thông tin hồ sơ nhân sự trong hệ thống.</DialogDescription>
                </div>
              </DialogHeader>

              {/* Row 1: Avatar (Col 1), Phone & Email (Col 2), Status & Location (Col 3) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-3">
                  <AvatarUpload value={avatar} onChange={setAvatar} />
                </div>

                <div className="space-y-3 justify-start">
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số điện thoại</Label>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 h-9 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gmail</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ten@gmail.com" className="w-full rounded-xl border border-slate-200 h-9 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>
                </div>

                <div className="space-y-3 justify-start">
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái hoạt động</Label>
                      {((person as any).activeVisitCount > 0) && (
                        <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          🔒 Đang có ca trực
                        </span>
                      )}
                    </div>
                    <Select value={status} onValueChange={(v) => { setStatus(v ?? "Sẵn sàng"); setAvailable(v === "Sẵn sàng") }}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-9 bg-white font-bold text-xs shadow-none text-slate-800">
                        <SelectValue placeholder="Chọn trạng thái..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                        <SelectItem value="Sẵn sàng" className="rounded-lg py-2.5 font-bold text-xs focus:bg-emerald-50 text-emerald-700">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Sẵn sàng (Được đặt lịch)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Đang bận" className="rounded-lg py-2.5 font-bold text-xs focus:bg-amber-50 text-amber-700">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Đang bận (Khóa đặt lịch)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Nghỉ phép" className="rounded-lg py-2.5 font-bold text-xs focus:bg-rose-50 text-rose-700">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>Nghỉ phép (Khóa đặt lịch)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Địa điểm</Label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="VD: Quận 1, TP.HCM" className="w-full rounded-xl border border-slate-200 h-9 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>
                </div>
              </div>

              {/* Row 2: Name + Staff Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Họ và tên <span className="text-red-400">*</span></Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-slate-200 h-9 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loại nhân viên <span className="text-red-400">*</span></Label>
                  <Select value={staffType} onValueChange={(v) => setStaffType(v || "Điều dưỡng viên")}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-9 bg-white font-bold text-xs shadow-none text-slate-800">
                      <SelectValue placeholder="Chọn loại nhân viên...">
                        {staffType}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                      <SelectItem value="Điều dưỡng viên" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">
                        Điều dưỡng viên
                      </SelectItem>
                      <SelectItem value="Chuyên viên vật lý trị liệu" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">
                        Chuyên viên vật lý trị liệu
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Chức vụ | Phòng ban | Chuyên môn | Kinh nghiệm */}
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chức vụ <span className="text-red-400">*</span></Label>
                  <Select value={role} onValueChange={(v) => setRole(v ?? "")}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-9 bg-white font-bold text-xs shadow-none text-slate-800">
                      <SelectValue placeholder="Chọn chức vụ...">
                        {role || "Chọn chức vụ"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800 min-w-[220px]">
                      {positions.length > 0 ? (
                        positions.map((r) => (
                          <SelectItem key={r} value={r} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">
                            {r}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-center text-[10px] text-slate-400 font-semibold">Đang tải chức vụ...</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phòng ban <span className="text-red-400">*</span></Label>
                  <Select value={department} onValueChange={(v) => setDepartment(v ?? "")}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-9 bg-white font-bold text-xs shadow-none text-slate-800">
                      <SelectValue placeholder="Chọn phòng ban...">
                        {department || "Chọn phòng ban"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800 min-w-[220px]">
                      {departments && departments.length > 0 ? (
                        departments.map((d) => (
                          <SelectItem key={d} value={d} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">
                            {d}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Khoa Điều dưỡng" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">
                            Khoa Điều dưỡng
                          </SelectItem>
                          <SelectItem value="Phục hồi chức năng" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">
                            Phục hồi chức năng
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chuyên môn</Label>
                  <Select value={specialty} onValueChange={(v) => setSpecialty(v ?? "")}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-9 bg-white font-bold text-xs shadow-none text-slate-800">
                      <SelectValue placeholder="Chọn dịch vụ...">
                        {specialty || "Chọn dịch vụ"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800 min-w-[220px]">
                      {editServices.length > 0 ? (
                        editServices.map((s) => (
                          <SelectItem key={s} value={s} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{s}</SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-[10px] text-slate-400 font-semibold">Đang tải...</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kinh nghiệm</Label>
                  <Input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="VD: 5 năm" className="w-full rounded-xl border border-slate-200 h-9 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                </div>
              </div>

              <div className="h-7 flex items-center">
                {editError && (
                  <p className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[11px] font-bold flex items-center gap-1.5 w-fit">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                    <span>{editError}</span>
                  </p>
                )}
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full h-10 px-6 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">
                  Hủy bỏ
                </Button>
                <Button type="submit" className="rounded-full h-10 px-8 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 transition-all shadow-md group">
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

/* ─── Staff Card (Identical UI/UX to Services Card) ─── */
function StaffCard({
  person, onEdit, onDelete, departments, positions, onLicensesUpdated,
}: {
  person: Staff
  onEdit: (p: Staff) => Promise<{ success: boolean; error?: string } | undefined>
  onDelete: (id: string) => void
  departments: string[]
  positions: string[]
  onLicensesUpdated?: (staffId: string, updatedLicenses: any[]) => void
}) {
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  // Ưu tiên staffType từ DB (được lưu khi admin chỉnh sửa Loại nhân viên)
  const savedType = ((person as any).staffType || "").toLowerCase()
  const isPhysio = savedType
    ? savedType.includes("vật lý") || savedType.includes("vltl") || savedType.includes("trị liệu")
    : person.role.includes("VLTL") || person.role.includes("Vật lý") || person.department.includes("Phục hồi")
  const staffTypeLabel = isPhysio ? "Chuyên viên vật lý trị liệu" : "Điều dưỡng viên"
  const staffTypeBadgeClass = isPhysio ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-blue-50 text-blue-600 border-blue-100"
  const statusConfig = {
    "Sẵn sàng": { label: "Sẵn sàng", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80", ring: "ring-emerald-400", dot: "bg-emerald-500" },
    "Đang bận": { label: "Đang bận", badge: "bg-amber-50 text-amber-700 border-amber-200/80", ring: "ring-amber-400", dot: "bg-amber-500" },
    "Nghỉ phép": { label: "Nghỉ phép", badge: "bg-rose-50 text-rose-700 border-rose-200/80", ring: "ring-rose-400", dot: "bg-rose-500" },
  }[(person.status || "Sẵn sàng")] || { label: person.status || "Sẵn sàng", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80", ring: "ring-emerald-400", dot: "bg-emerald-500" }

  const primaryLicense = (person.licenses && person.licenses.length > 0)
    ? person.licenses[0]
    : ((person as any).StaffLicense && (person as any).StaffLicense.length > 0)
    ? (person as any).StaffLicense[0]
    : null
  const licenseNo = primaryLicense?.licenseNumber || primaryLicense?.LicenseNumber || (person as any).licenseNumber || "—"
  const specialty = person.specialty || primaryLicense?.specialty || "—"
  const experience = person.experience || "—"

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.35 }}
        className="h-full"
      >
        <div className="group border rounded-3xl bg-white transition-all cursor-pointer relative shadow-xs hover:shadow-xl hover:shadow-black/[0.04] flex flex-col h-full border-hairline hover:border-primary/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-surface-tinted/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-3xl" />

          <div className="p-5 pb-3 relative z-10">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={person.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`}
                  alt={person.name}
                  className={cn("w-14 h-14 rounded-2xl object-cover shadow-md ring-2 transition-all shrink-0", statusConfig.ring)}
                />
                <span className={cn("absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white", statusConfig.dot)} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-black text-sm text-foreground group-hover:text-primary transition-colors duration-300 uppercase tracking-tight line-clamp-1">
                  {person.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider border", staffTypeBadgeClass)}>
                    {staffTypeLabel}
                  </span>
                  <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border flex items-center gap-1", statusConfig.badge)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusConfig.dot)} />
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-left space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Chuyên môn:</span>
                <span className="font-black text-slate-700 truncate max-w-[170px]">{specialty}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Kinh nghiệm:</span>
                <span className="font-black text-slate-700">{experience}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Số CCHN:</span>
                <span className="font-mono font-bold text-primary">{licenseNo}</span>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          <div className="p-5 pt-2 relative z-10 flex gap-2">
            <Button
              onClick={() => setDetailOpen(true)}
              className="flex-1 h-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white text-slate-700 border border-slate-200 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 group/btn"
            >
              <Eye className="w-3.5 h-3.5 text-primary group-hover/btn:text-white transition-colors" />
              Xem chi tiết
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
              variant="outline"
              className="h-10 w-10 p-0 rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); setDeleteOpen(true) }}
              variant="outline"
              className="h-10 w-10 p-0 rounded-xl border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>

      <StaffDetailDialog person={person} open={detailOpen} onOpenChange={setDetailOpen} onLicensesUpdated={onLicensesUpdated} />
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
  const [staffFilter, setStaffFilter] = React.useState<"all" | "nurse" | "physio">("all")

  const loadStaff = () => {
    setLoading(true);
    show("ĐANG TẢI DỮ LIỆU CHUYÊN GIA...");
    fetch(`${API_URL}/staff`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } })
      .then((res) => { if (!res.ok) throw new Error("Staff fetch failed"); return res.json() })
      .then((data) => { setStaffList(Array.isArray(data) ? data : []) })
      .catch((err) => console.error("Lỗi tải chuyên gia:", err))
      .finally(() => { setLoading(false); hide() })
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
    show("ĐANG THÊM CHUYÊN GIA...")
    try {
      const res = await authFetch(`${API_URL}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      })
      if (res.ok) {
        const created = await res.json()
        setStaffList((prev) => [created, ...prev])
        return { success: true }
      } else {
        const errData = await res.json().catch(() => ({}))
        const errorMsg = errData.error || "Không thể thêm mới chuyên gia!"
        return { success: false, error: errorMsg }
      }
    } catch (err: any) {
      console.error("Lỗi thêm chuyên gia:", err)
      return { success: false, error: err.message || "Không thể thêm mới chuyên gia!" }
    } finally {
      hide()
    }
  }

  const handleEdit = async (updated: Staff) => {
    show("ĐANG CẬP NHẬT CHUYÊN GIA...")
    try {
      const res = await authFetch(`${API_URL}/staff/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
      if (res.ok) {
        const saved = await res.json()
        setStaffList((prev) => prev.map((s) => (s.id === saved.id ? saved : s)))
        return { success: true }
      } else {
        const errData = await res.json().catch(() => ({}))
        const errorMsg = errData.error || "Không thể cập nhật thông tin chuyên gia!"
        return { success: false, error: errorMsg }
      }
    } catch (err: any) {
      console.error("Lỗi cập nhật chuyên gia:", err)
      return { success: false, error: err.message || "Không thể cập nhật thông tin chuyên gia!" }
    } finally {
      hide()
    }
  }

  const handleDelete = async (id: string) => {
    show("ĐANG XÓA CHUYÊN GIA...")
    try {
      const res = await authFetch(`${API_URL}/staff/${id}`, { method: "DELETE" })
      setStaffList((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error("Lỗi xóa chuyên gia:", err)
      setStaffList((prev) => prev.filter((s) => s.id !== id))
    } finally {
      hide()
    }
  }

  const handleLicensesUpdated = React.useCallback((staffId: string, updatedLicenses: any[]) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, licenses: updatedLicenses } : s))
    )
  }, [])

  const filteredStaff = staffList.filter((s) => {
    // Ưu tiên staffType từ DB, fallback về role/department keywords
    const savedType = ((s as any).staffType || "").toLowerCase()
    const isPhysio = savedType
      ? savedType.includes("vật lý") || savedType.includes("vltl") || savedType.includes("trị liệu")
      : s.role.includes("VLTL") || s.role.includes("Vật lý") || s.department.includes("Phục hồi")
    const isNurse = !isPhysio

    if (staffFilter === "nurse" && !isNurse) return false
    if (staffFilter === "physio" && !isPhysio) return false

    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const STAFF_PER_PAGE = 6
  const [currentPage, setCurrentPage] = React.useState(1)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, staffFilter])

  const totalPages = Math.ceil(filteredStaff.length / STAFF_PER_PAGE) || 1
  const paginatedStaff = filteredStaff.slice((currentPage - 1) * STAFF_PER_PAGE, currentPage * STAFF_PER_PAGE)

  return (
    <AdminRoleGuard>
      <div className="p-10 max-w-7xl mx-auto w-full space-y-16 pb-32">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-surface-tinted px-3.5 py-2 rounded-full border border-primary/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="eyebrow text-[10px] font-black uppercase tracking-widest text-primary-strong">Danh sách Chuyên gia</span>
            </div>
            <div className="w-px h-5 bg-hairline" />
            <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">{staffList.length} Thành viên</span>
          </div>
          <h1 className="text-6xl font-black tight-tracking text-foreground leading-[1] uppercase text-left">Danh sách <br />Chuyên gia</h1>
          <p className="text-xl text-muted-foreground mt-5 max-w-2xl font-medium leading-relaxed antialiased text-left">
            Quản lý danh sách chuyên gia y tế — chứng chỉ hành nghề, chuyên môn và kinh nghiệm.
          </p>
        </motion.div>
        <div className="flex items-center gap-4 shrink-0">
          <Button variant="outline" className="bg-white text-foreground border-hairline rounded-[24px] px-8 h-14 text-xs font-black uppercase tracking-[0.2em] hover:bg-surface-secondary transition-all shadow-xl shadow-black/[0.02] flex items-center gap-3 active:scale-95 group">
            <Download className="w-5 h-5 text-primary group-hover:-translate-y-1 transition-transform" /> Xuất báo cáo
          </Button>
          <AddStaffDialog onAdd={handleAdd} departments={departments} positions={positions} />
        </div>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200/60">
          <button
            onClick={() => setStaffFilter("all")}
            className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all", staffFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900")}
          >
            Tất cả ({staffList.length})
          </button>
          <button
            onClick={() => setStaffFilter("nurse")}
            className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all", staffFilter === "nurse" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-900")}
          >
            Điều dưỡng
          </button>
          <button
            onClick={() => setStaffFilter("physio")}
            className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all", staffFilter === "physio" ? "bg-white text-purple-600 shadow-xs" : "text-slate-500 hover:text-slate-900")}
          >
            Vật lý trị liệu
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, chuyên môn, chức vụ hoặc vị trí..."
              className="pl-16 h-18 rounded-[24px] bg-white border-hairline focus:ring-12 focus:ring-primary/5 transition-all text-lg font-black shadow-xl shadow-black/[0.03] placeholder:text-on-surface-tertiary placeholder:font-medium placeholder:text-base border-b-2 border-b-hairline"
            />
          </div>
          <div className="flex bg-surface-secondary/60 p-2 rounded-[22px] border border-hairline shadow-inner shrink-0">
            <button className="p-3.5 rounded-2xl bg-white shadow-md text-primary transition-all scale-105"><LayoutGrid className="w-6 h-6" /></button>
            <button className="p-3.5 rounded-2xl text-on-surface-tertiary hover:bg-white/50 transition-all"><List className="w-6 h-6" /></button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading && staffList.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang tải danh sách nhân viên y tế...</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
            <AnimatePresence>
              {paginatedStaff.length > 0 ? (
                paginatedStaff.map((person) => (
                  <StaffCard key={person.id} person={person} onEdit={handleEdit} onDelete={handleDelete} departments={departments} positions={positions} onLicensesUpdated={handleLicensesUpdated} />
                ))
              ) : (
                <p className="col-span-3 py-20 text-center font-bold text-slate-400 uppercase text-xs tracking-widest">Không tìm thấy chuyên gia nào</p>
              )}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="pt-6 flex justify-center border-t border-slate-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
    </AdminRoleGuard>
  )
}
