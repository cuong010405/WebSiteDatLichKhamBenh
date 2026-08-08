"use client";

import * as React from "react";
import {
  Plus,
  ClipboardList,
  Stethoscope,
  History,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  ArrowUpRight,
  FileText,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Users,
  Activity,
  Heart,
  Sparkles,
  Thermometer,
  Pill,
  ImageIcon,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { Patient, Staff, Visit, CareLog } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL, authFetch } from "@/lib/api";
import { useLoading } from "@/lib/loading-context";
import { Pagination } from "@/components/ui/pagination";

// Simple MultiSelect component for assigned staff
function StaffMultiSelect({
  staff,
  selectedIds,
  onChange,
}: {
  staff: Staff[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary">
        Chuyên gia phụ trách
      </Label>
      <div className="flex flex-wrap gap-2 max-h-[260px] overflow-y-auto p-2.5 border border-slate-200/80 rounded-2xl bg-slate-50/50">
        {staff.map((s) => {
          const isSelected = selectedIds.includes(s.id);
          const isStaffBusy = !s.available || s.status !== "Sẵn sàng";
          return (
            <button
              key={s.id}
              type="button"
              disabled={isStaffBusy && !isSelected}
              onClick={() => toggleSelect(s.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border flex items-center gap-2",
                isSelected
                  ? "bg-primary/10 border-primary text-primary-strong shadow-xs scale-[1.02]"
                  : isStaffBusy
                    ? "bg-slate-100 border-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <img
                src={s.avatar || `https://i.pravatar.cc/150?u=${s.id}`}
                alt=""
                className="w-5 h-5 rounded-full object-cover border border-white shadow-xs"
              />
              <span>{s.name} {isStaffBusy ? `[${s.status}]` : ""}</span>
              {isSelected && (
                <X className="w-3.5 h-3.5 ml-0.5 text-primary shrink-0" />
              )}
            </button>
          );
        })}
        {staff.length === 0 && (
          <span className="text-xs text-muted-foreground p-1">
            Không có nhân sự nào
          </span>
        )}
      </div>
    </div>
  );
}

interface AddPatientDialogProps {
  onAdd: (patient: Patient) => void;
  staff: Staff[];
  prefilled?: { name?: string; visitId?: string; summary?: string };
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

function AddPatientDialog({ onAdd, staff, prefilled, open: controlledOpen, onOpenChange: controlledOnOpenChange }: AddPatientDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(prefilled?.name || "");
  const [ageStr, setAgeStr] = React.useState("");
  const [gender, setGender] = React.useState<"Nam" | "Nữ" | "Khác">("Nam");
  const [summary, setSummary] = React.useState(prefilled?.summary || "");
  const [assignedStaff, setAssignedStaff] = React.useState<string[]>([]);
  const [success, setSuccess] = React.useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const setIsOpen = (v: boolean) => {
    if (controlledOnOpenChange) controlledOnOpenChange(v);
    else setOpen(v);
  };

  // Sync prefilled values when dialog opens
  React.useEffect(() => {
    if (isOpen && prefilled) {
      setName(prefilled.name || "");
      setSummary(prefilled.summary || "");
    }
  }, [isOpen, prefilled?.name, prefilled?.summary]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ageStr) return;

    const age = parseInt(ageStr) || 0;

    // Format current date as lastVisit (DD/MM/YYYY)
    const now = new Date();
    const lastVisit = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    const lastVisitTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const newPatient: Patient = {
      id: `BN-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      age,
      gender,
      lastVisit,
      lastVisitTime,
      status: "Đang điều trị",
      summary,
      assignedStaff,
    };

    onAdd(newPatient);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setIsOpen(false);
      // Reset states
      setName("");
      setAgeStr("");
      setGender("Nam");
      setSummary("");
      setAssignedStaff([]);
    }, 1500);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        setIsOpen(v);
        if (!v) setSuccess(false);
      }}
    >
      {controlledOpen === undefined && (
        <DialogTrigger
          render={
            <Button className="bg-primary text-white rounded-[24px] px-8 h-14 text-xs font-black uppercase tracking-[0.15em] flex items-center gap-3 shadow-xl shadow-primary/20 hover:opacity-95 transition-all border-b-4 border-white/10 active:border-b-0 active:translate-y-0.5">
              <Plus className="w-5 h-5" /> Thêm bệnh nhân
            </Button>
          }
        />
      )}
      <DialogContent className="sm:max-w-[720px] rounded-[32px] border-hairline shadow-2xl p-0 overflow-hidden bg-white">
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
                <p className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Thêm hồ sơ thành công!
                </p>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Hồ sơ bệnh nhân đã được khởi tạo thành công trên hệ thống.
                </p>
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
              <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                    Hồ sơ bệnh nhân mới
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 mt-1 text-[10px] font-semibold leading-tight">
                    Khởi tạo mã định danh và nhập thông tin lâm sàng ban đầu.
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Info */}
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label
                      htmlFor="name"
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary"
                    >
                      Họ và tên bệnh nhân <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="rounded-xl border-hairline h-10 bg-surface-secondary/20 focus:bg-white font-bold text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                      <Label
                        htmlFor="age"
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary"
                      >
                        Tuổi <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="age"
                        required
                        type="number"
                        min="0"
                        max="150"
                        value={ageStr}
                        onChange={(e) => setAgeStr(e.target.value)}
                        placeholder="VD: 45"
                        className="rounded-xl border-hairline h-10 bg-surface-secondary/20 focus:bg-white font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary">
                        Giới tính
                      </Label>
                      <div className="relative">
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as "Nam" | "Nữ" | "Khác")}
                          className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs text-slate-800 px-3 pr-8 appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer hover:border-slate-300"
                        >
                          <option value="Nam">👨 Nam</option>
                          <option value="Nữ">👩 Nữ</option>
                          <option value="Khác">🧑 Khác</option>
                        </select>
                        <svg className="w-3.5 h-3.5 text-blue-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary">
                      Trạng thái lâm sàng
                    </Label>
                    <div className="flex items-center h-10 bg-slate-50 rounded-xl px-3 text-xs font-bold text-slate-500 border border-slate-200/80">
                      Đang điều trị
                    </div>
                  </div>
                </div>

                {/* Right Column: Staff Assignment */}
                <div className="flex flex-col h-full justify-between">
                  <StaffMultiSelect
                    staff={staff}
                    selectedIds={assignedStaff}
                    onChange={setAssignedStaff}
                  />
                </div>
              </div>

              {/* Bottom: Summary (Spans full width) */}
              <div className="space-y-2 text-left">
                <Label
                  htmlFor="summary"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary"
                >
                  Tiền sử & Chẩn đoán sơ bộ
                </Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Mô tả các tình trạng sức khỏe..."
                  className="rounded-xl border-hairline bg-surface-secondary/20 focus:bg-white min-h-[90px] text-xs font-semibold leading-relaxed"
                />
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={!name || !ageStr}
                  className="bg-action text-white rounded-xl h-10 px-6 text-xs font-black uppercase tracking-[0.15em] hover:opacity-95 shadow-md border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5 disabled:opacity-40"
                >
                  Xác nhận tạo hồ sơ
                </Button>
              </DialogFooter>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Edit Patient Dialog ─── */
interface EditPatientDialogProps {
  patient: Patient;
  staff: Staff[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Patient) => void;
}

function EditPatientDialog({
  patient,
  staff,
  open,
  onOpenChange,
  onSave,
}: EditPatientDialogProps) {
  const [name, setName] = React.useState("");
  const [ageStr, setAgeStr] = React.useState("");
  const [gender, setGender] = React.useState<"Nam" | "Nữ" | "Khác">("Nam");
  const [status, setStatus] = React.useState<
    "Đang điều trị" | "Chờ tái khám" | "Đã xuất viện" | "Chờ duyệt"
  >("Đang điều trị");
  const [summary, setSummary] = React.useState("");
  const [assignedStaff, setAssignedStaff] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(patient.name);
      setAgeStr(String(patient.age));
      setGender(patient.gender);
      setStatus((patient.status as any) || "Đang điều trị");
      setSummary(patient.summary || "");
      setAssignedStaff(patient.assignedStaff || []);
    }
  }, [open, patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ageStr) return;
    setSubmitting(true);

    const updatedPatient: Patient = {
      ...patient,
      name,
      age: parseInt(ageStr) || 0,
      gender,
      status,
      summary,
      assignedStaff,
    };

    onSave(updatedPatient);
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[28px] border-hairline shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Pencil className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                Chỉnh sửa hồ sơ bệnh nhân
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1 text-[10px] font-semibold leading-tight">
                Cập nhật thông tin hành chính & lâm sàng của bệnh nhân.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="edit-name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Họ và tên bệnh nhân <span className="text-red-400">*</span>
                </Label>
                <Input id="edit-name" required value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-9 font-bold text-xs" />
              </div>
              <div className="space-y-1.5 text-left">
                <Label htmlFor="edit-age" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Tuổi <span className="text-red-400">*</span>
                </Label>
                <Input id="edit-age" required type="number" min="0" max="150" value={ageStr} onChange={(e) => setAgeStr(e.target.value)} className="rounded-xl h-9 font-bold text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giới tính</Label>
                <div className="relative">
                  <select value={gender} onChange={(e) => setGender(e.target.value as "Nam" | "Nữ" | "Khác")} className="w-full rounded-xl border border-slate-200 h-9 bg-white font-bold text-xs text-slate-800 px-3 pr-8 appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer hover:border-slate-300">
                    <option value="Nam">👨 Nam</option>
                    <option value="Nữ">👩 Nữ</option>
                    <option value="Khác">🧑 Khác</option>
                  </select>
                  <svg className="w-3.5 h-3.5 text-blue-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <div className="space-y-1.5 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái lâm sàng</Label>
                <Select value={status} onValueChange={(val) => setStatus(val as any)}>
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 h-9 bg-white font-bold text-xs shadow-none text-slate-800"><SelectValue placeholder="Chọn trạng thái..." /></SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    <SelectItem value="Đang điều trị" className="rounded-lg py-2 font-bold text-xs focus:bg-slate-50">Đang điều trị</SelectItem>
                    <SelectItem value="Chờ tái khám" className="rounded-lg py-2 font-bold text-xs focus:bg-slate-50">Chờ tái khám</SelectItem>
                    <SelectItem value="Đã xuất viện" className="rounded-lg py-2 font-bold text-xs focus:bg-slate-50">Đã xuất viện</SelectItem>
                    <SelectItem value="Chờ duyệt" className="rounded-lg py-2 font-bold text-xs focus:bg-slate-50">Chờ duyệt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <StaffMultiSelect
              staff={staff}
              selectedIds={assignedStaff}
              onChange={setAssignedStaff}
            />

            <div className="space-y-1.5 text-left">
              <Label htmlFor="edit-summary" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tiền sử & Chẩn đoán sơ bộ</Label>
              <Textarea id="edit-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Mô tả chẩn đoán lâm sàng..." className="rounded-xl border-hairline bg-surface-secondary/20 focus:bg-white min-h-[60px] text-xs font-semibold leading-relaxed resize-none" />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full h-10 px-6 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={!name || !ageStr || submitting}
              className="rounded-full h-10 px-8 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:opacity-95 group"
            >
              {submitting ? "Đang lưu..." : <><span>Lưu thay đổi</span><Sparkles className="w-3.5 h-3.5 ml-2 group-hover:rotate-180 transition-transform duration-500" /></>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Delete Patient Dialog ─── */
function DeletePatientDialog({
  patient,
  open,
  onOpenChange,
  onDelete,
}: {
  patient: Patient;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDelete: (id: string) => void;
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
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                Xác nhận xóa
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">
                Tất cả dữ liệu bệnh nhân và lịch hẹn liên quan sẽ bị xóa vĩnh
                viễn.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="bg-red-50/80 border border-red-100 rounded-xl p-4 space-y-1.5 mb-6 text-left">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
              {patient.name}
            </p>
            <p className="text-[10px] font-bold text-slate-500">
              Mã bệnh nhân: <span className="text-slate-700">{patient.id}</span>
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2 bg-white">
            <Button
              onClick={() => {
                onDelete(patient.id);
                onOpenChange(false);
              }}
              className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-95 shadow-md shadow-red-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Xóa vĩnh viễn
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              Hủy bỏ
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FileUploadField({
  value,
  onChange,
  label = "Hình ảnh đính kèm",
}: {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-1.5 text-left">
      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </Label>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Dán URL ảnh hoặc nhấn Tải tệp..."
            className="h-9 rounded-xl font-bold text-xs pr-8 bg-white"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 p-0.5 rounded-full hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="h-9 px-3.5 rounded-xl border-slate-200 text-slate-700 font-bold text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
        >
          <Upload className="w-3.5 h-3.5 text-blue-500" />
          <span>Tải tệp</span>
        </Button>
      </div>
      {value && (
        <div className="mt-1 flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <img
            src={value}
            alt="Preview"
            className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
          <span className="text-[10px] text-slate-600 font-bold truncate max-w-[220px]">
            {value.startsWith("data:image") ? "📷 Tệp ảnh đã chọn" : "🔗 " + value}
          </span>
        </div>
      )}
    </div>
  );
}

function AddCareLogDialog({
  patient,
  staff,
  open,
  onOpenChange,
  onAdded,
}: {
  patient: Patient;
  staff: Staff[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdded: (log: CareLog) => void;
}) {
  const [careDate, setCareDate] = React.useState("");
  const [staffName, setStaffName] = React.useState("");
  const [serviceName, setServiceName] = React.useState("Chăm sóc y tế định kỳ");
  const [temperature, setTemperature] = React.useState("36.8");
  const [bloodPressure, setBloodPressure] = React.useState("120/80");
  const [heartRate, setHeartRate] = React.useState("75");
  const [spo2, setSpo2] = React.useState("98");
  const [bloodSugar, setBloodSugar] = React.useState("");
  const [medications, setMedications] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [assessment, setAssessment] = React.useState("");
  const [attachment, setAttachment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const validStaff = staff.filter((s) => s.id !== "PENDING");

  React.useEffect(() => {
    if (open) {
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
      setCareDate(formattedDate);
      if (validStaff.length > 0) setStaffName(validStaff[0].name);
    }
  }, [open, staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessment) return;
    setSubmitting(true);

    const payload = {
      patientId: patient.id,
      staffName: staffName || "Nhân viên y tế",
      serviceName: serviceName || "Chăm sóc y tế",
      careDate: careDate || new Date().toLocaleDateString("vi-VN"),
      temperature: temperature ? `${temperature} °C` : null,
      bloodPressure: bloodPressure ? `${bloodPressure} mmHg` : null,
      heartRate: heartRate ? `${heartRate} bpm` : null,
      spo2: spo2 ? `${spo2} %` : null,
      bloodSugar: bloodSugar ? `${bloodSugar} mg/dL` : null,
      medications: medications || null,
      notes: notes || null,
      assessment: assessment,
      attachment: attachment || null,
    };

    try {
      const res = await authFetch(`${API_URL}/care-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Thêm nhật ký thất bại");
      const created = await res.json();
      onAdded(created);
      onOpenChange(false);
      setMedications("");
      setNotes("");
      setAssessment("");
      setAttachment("");
    } catch (err) {
      console.error("Lỗi khi lưu nhật ký chăm sóc:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] rounded-[28px] border-hairline shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
        <form onSubmit={handleSubmit} className="py-8 px-7 space-y-4">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                Thêm nhật ký chăm sóc
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1 text-[10px] font-semibold">
                Ghi nhận thông tin sinh hiệu, đánh giá và ghi chú cho bệnh nhân <strong className="text-slate-800">{patient.name}</strong> ({patient.id}).
              </DialogDescription>
            </div>
          </DialogHeader>

              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thời gian chăm sóc</Label>
                    <Input value={careDate} onChange={(e) => setCareDate(e.target.value)} required className="h-9 rounded-xl font-bold text-xs" />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nhân viên thực hiện</Label>
                    <Select value={staffName} onValueChange={(v) => setStaffName(v ?? "")}>
                      <SelectTrigger className="!h-[35px] rounded-xl font-bold text-xs w-full"><SelectValue placeholder="Chọn nhân viên..." /></SelectTrigger>
                      <SelectContent className="rounded-xl min-w-[320px]">
                        {validStaff.map((s) => <SelectItem key={s.id} value={s.name} className="font-bold text-xs">{s.name} ({s.role.split("•")[0]})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dịch vụ đã thực hiện</Label>
                  <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} required placeholder="VD: Truyền dịch y tế, Phục hồi chức năng..." className="h-9 rounded-xl font-bold text-xs" />
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Chỉ số sinh hiệu bệnh nhân</p>
                  <div className="grid grid-cols-5 gap-2.5">
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-bold text-slate-400">Nhiệt độ (°C)</label>
                      <Input value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="36.8" className="h-9 rounded-xl font-mono font-bold text-xs" />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-bold text-slate-400">Huyết áp (mmHg)</label>
                      <Input value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} placeholder="120/80" className="h-9 rounded-xl font-mono font-bold text-xs" />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-bold text-slate-400">Nhịp tim (bpm)</label>
                      <Input value={heartRate} onChange={(e) => setHeartRate(e.target.value)} placeholder="75" className="h-9 rounded-xl font-mono font-bold text-xs" />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-bold text-slate-400">SpO₂ (%)</label>
                      <Input value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="98" className="h-9 rounded-xl font-mono font-bold text-xs" />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-bold text-slate-400">Đường huyết</label>
                      <Input value={bloodSugar} onChange={(e) => setBloodSugar(e.target.value)} placeholder="95 mg/dL" className="h-9 rounded-xl font-mono font-bold text-xs" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thuốc đã sử dụng</Label>
                  <Input value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="VD: Paracetamol 500mg, NaCl 0.9% 500ml..." className="h-9 rounded-xl font-bold text-xs" />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đánh giá tình trạng bệnh nhân <span className="text-red-400">*</span></Label>
                  <Textarea value={assessment} onChange={(e) => setAssessment(e.target.value)} required rows={1} placeholder="Đánh giá chi tiết sau ca chăm sóc..." className="rounded-xl font-bold text-xs resize-none min-h-[42px]" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ghi chú thêm</Label>
                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dặn dò gia đình, dặn theo dõi..." className="h-9 rounded-xl font-bold text-xs" />
                  </div>
                  <FileUploadField value={attachment} onChange={setAttachment} />
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full h-10 px-6 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Hủy</Button>
                <Button type="submit" disabled={!assessment || submitting} className="rounded-full h-10 px-8 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:opacity-95 group">
                  {submitting ? "Đang lưu..." : <><span>Lưu nhật ký chăm sóc</span><Sparkles className="w-3.5 h-3.5 ml-2 group-hover:rotate-180 transition-transform duration-500" /></>}
                </Button>
              </DialogFooter>
            </form>
      </DialogContent>
    </Dialog>
  );
}

function EditCareLogDialog({
  log,
  staff,
  open,
  onOpenChange,
  onUpdated,
}: {
  log: CareLog;
  staff: Staff[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdated: (log: CareLog) => void;
}) {
  const [careDate, setCareDate] = React.useState(log.careDate || "");
  const [staffName, setStaffName] = React.useState(log.staffName || "");
  const [serviceName, setServiceName] = React.useState(log.serviceName || "");
  const [temperature, setTemperature] = React.useState(log.temperature || "");
  const [bloodPressure, setBloodPressure] = React.useState(log.bloodPressure || "");
  const [heartRate, setHeartRate] = React.useState(log.heartRate || "");
  const [spo2, setSpo2] = React.useState(log.spo2 || "");
  const [bloodSugar, setBloodSugar] = React.useState(log.bloodSugar || "");
  const [medications, setMedications] = React.useState(log.medications || "");
  const [notes, setNotes] = React.useState(log.notes || "");
  const [assessment, setAssessment] = React.useState(log.assessment || "");
  const [attachment, setAttachment] = React.useState(log.attachment || "");
  const [submitting, setSubmitting] = React.useState(false);

  const validStaff = staff.filter((s) => s.id !== "PENDING");

  React.useEffect(() => {
    if (open) {
      setCareDate(log.careDate || "");
      setStaffName(log.staffName || (validStaff.length > 0 ? validStaff[0].name : ""));
      setServiceName(log.serviceName || "");
      setTemperature(log.temperature || "");
      setBloodPressure(log.bloodPressure || "");
      setHeartRate(log.heartRate || "");
      setSpo2(log.spo2 || "");
      setBloodSugar(log.bloodSugar || "");
      setMedications(log.medications || "");
      setNotes(log.notes || "");
      setAssessment(log.assessment || "");
      setAttachment(log.attachment || "");
    }
  }, [open, log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        staffName,
        serviceName,
        careDate,
        temperature: temperature || null,
        bloodPressure: bloodPressure || null,
        heartRate: heartRate || null,
        spo2: spo2 || null,
        bloodSugar: bloodSugar || null,
        medications: medications || null,
        notes: notes || null,
        assessment: assessment || null,
        attachment: attachment || null,
      };

      const res = await authFetch(`${API_URL}/care-logs/${log.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");
      const updated = await res.json();
      onUpdated(updated);
      onOpenChange(false);
    } catch (err) {
      console.error("Lỗi cập nhật nhật ký:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] rounded-[28px] border-hairline shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
        <form onSubmit={handleSubmit} className="py-8 px-7 space-y-4">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Pencil className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Chỉnh sửa nhật ký chăm sóc</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1 text-[10px] font-semibold">Cập nhật sinh hiệu, thuốc đã sử dụng và đánh giá của ca #{log.id.slice(0, 8)}.</DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thời gian chăm sóc</Label>
                <Input value={careDate} onChange={(e) => setCareDate(e.target.value)} required className="h-9 rounded-xl font-bold text-xs" />
              </div>
              <div className="space-y-1.5 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nhân viên thực hiện</Label>
                <Select value={staffName} onValueChange={(v) => setStaffName(v ?? "")}>
                  <SelectTrigger className="!h-[35px] rounded-xl font-bold text-xs w-full"><SelectValue placeholder="Chọn nhân viên..." /></SelectTrigger>
                  <SelectContent className="rounded-xl min-w-[320px]">
                    {validStaff.map((s) => <SelectItem key={s.id} value={s.name} className="font-bold text-xs">{s.name} ({s.role.split("•")[0]})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dịch vụ đã thực hiện</Label>
              <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} required placeholder="VD: Truyền dịch y tế, Phục hồi chức năng..." className="h-9 rounded-xl font-bold text-xs" />
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Chỉ số sinh hiệu bệnh nhân</p>
              <div className="grid grid-cols-5 gap-2.5">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-slate-400">Nhiệt độ (°C)</label>
                  <Input value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="36.8" className="h-9 rounded-xl font-mono font-bold text-xs" />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-slate-400">Huyết áp (mmHg)</label>
                  <Input value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} placeholder="120/80" className="h-9 rounded-xl font-mono font-bold text-xs" />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-slate-400">Nhịp tim (bpm)</label>
                  <Input value={heartRate} onChange={(e) => setHeartRate(e.target.value)} placeholder="75" className="h-9 rounded-xl font-mono font-bold text-xs" />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-slate-400">SpO₂ (%)</label>
                  <Input value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="98" className="h-9 rounded-lg font-mono font-bold text-xs" />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-slate-400">Đường huyết</label>
                  <Input value={bloodSugar} onChange={(e) => setBloodSugar(e.target.value)} placeholder="95 mg/dL" className="h-9 rounded-lg font-mono font-bold text-xs" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thuốc đã sử dụng</Label>
              <Input value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="VD: Paracetamol 500mg, NaCl 0.9%..." className="h-9 rounded-xl font-bold text-xs" />
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đánh giá tình trạng bệnh nhân <span className="text-red-400">*</span></Label>
              <Textarea value={assessment} onChange={(e) => setAssessment(e.target.value)} rows={1} placeholder="Đánh giá chi tiết sau ca chăm sóc..." className="rounded-xl font-bold text-xs resize-none min-h-[42px]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ghi chú thêm</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dặn dò gia đình, dặn theo dõi..." className="h-9 rounded-xl font-bold text-xs" />
              </div>
              <FileUploadField value={attachment} onChange={setAttachment} />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full h-10 px-6 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Hủy</Button>
            <Button type="submit" disabled={submitting} className="rounded-full h-10 px-8 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:opacity-95 group">
              {submitting ? "Đang lưu..." : <><span>Cập nhật nhật ký</span><Sparkles className="w-3.5 h-3.5 ml-2 group-hover:rotate-180 transition-transform duration-500" /></>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CareLogItem({
  log,
  staff,
  onDelete,
  onUpdate,
}: {
  log: CareLog;
  staff: Staff[];
  onDelete: (id: string) => void;
  onUpdate: (updated: CareLog) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleDeleteConfirm = async () => {
    try {
      await authFetch(`${API_URL}/care-logs/${log.id}`, { method: "DELETE" });
      onDelete(log.id);
    } catch (err) {
      console.error("Lỗi xóa nhật ký:", err);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[20px] border border-hairline overflow-hidden shadow-2xs hover:shadow-md transition-all"
      >
        {/* Compact Header (Always Visible & Clickable) */}
        <div
          onClick={() => setOpen(!open)}
          className="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                {log.serviceName || "Chăm sóc y tế"}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                👤 Thực hiện: <strong className="text-slate-800">{log.staffName}</strong> · 📅 {log.careDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200">
              #{log.id.slice(0, 8)}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-xl">
              <span>{open ? "Thu gọn" : "Xem chi tiết"}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", open && "rotate-180")} />
            </div>
          </div>
        </div>

        {/* Expanded Content Details */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-slate-100 bg-slate-50/50 p-5 text-left space-y-4"
            >
              {/* Vitals pills */}
              <div className="flex flex-wrap gap-2.5">
                {log.temperature && (
                  <div className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                    <Thermometer className="w-3.5 h-3.5 text-red-500" />
                    <span>Nhiệt độ: <strong>{log.temperature}</strong></span>
                  </div>
                )}
                {log.bloodPressure && (
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    <span>Huyết áp: <strong>{log.bloodPressure}</strong></span>
                  </div>
                )}
                {log.heartRate && (
                  <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Nhịp tim: <strong>{log.heartRate}</strong></span>
                  </div>
                )}
                {log.spo2 && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>SpO₂: <strong>{log.spo2}</strong></span>
                  </div>
                )}
                {log.bloodSugar && (
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                    <span>Đường huyết: <strong>{log.bloodSugar}</strong></span>
                  </div>
                )}
              </div>

              {/* Assessment & Medications */}
              <div className="space-y-2 text-xs text-slate-700">
                {log.assessment && (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Đánh giá tình trạng bệnh nhân</p>
                    <p className="font-semibold text-slate-800 mt-1 leading-relaxed">{log.assessment}</p>
                  </div>
                )}
                {log.medications && (
                  <div className="flex items-start gap-2 text-[11px] font-medium text-slate-600">
                    <Pill className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-800">Thuốc đã dùng:</strong> {log.medications}</span>
                  </div>
                )}
                {log.notes && (
                  <p className="text-[10px] italic text-slate-500">📝 Ghi chú: {log.notes}</p>
                )}
                {log.attachment && (
                  <div className="pt-2">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1.5">Hình ảnh đính kèm</p>
                    <img src={log.attachment} alt="care log attachment" className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-xs" />
                  </div>
                )}
              </div>

              {/* Action buttons: Sửa & Xóa */}
              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
                  className="h-8 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Sửa
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
                  className="h-8 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <EditCareLogDialog
        log={log}
        staff={staff}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={onUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[28px] border border-red-100 shadow-2xl p-0 overflow-hidden bg-white">
          <div className="h-1.5 w-full bg-gradient-to-r from-red-400 to-rose-500" />
          <div className="p-6">
            <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 mb-4 text-left">
              <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Xác nhận xóa</DialogTitle>
                <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">Hành động này không thể hoàn tác.</DialogDescription>
              </div>
            </DialogHeader>
            <div className="bg-red-50/80 border border-red-100 rounded-xl p-4 space-y-1.5 mb-5 text-left">
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{log.serviceName || "Nhật ký chăm sóc"}</p>
              <p className="text-[10px] font-bold text-slate-500">👤 {log.staffName} · 📅 {log.careDate}</p>
              <p className="text-[10px] font-bold text-slate-500">Mã: <span className="text-slate-700 font-mono">#{log.id.slice(0, 8)}</span></p>
            </div>
            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button
                onClick={() => { handleDeleteConfirm(); setDeleteOpen(false); }}
                className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-95 shadow-md shadow-red-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Xóa vĩnh viễn
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                Giữ lại
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PatientRow({
  patient,
  staff,
  allVisits = [],
  onEdit,
  onDelete,
  onApprove,
}: {
  patient: Patient;
  staff: Staff[];
  allVisits?: Visit[];
  onEdit: (p: Patient) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [addLogOpen, setAddLogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"info" | "visits" | "care-logs">("info");
  const [careLogs, setCareLogs] = React.useState<CareLog[]>([]);
  const [loadingCareLogs, setLoadingCareLogs] = React.useState(false);

  const [careLogPage, setCareLogPage] = React.useState(1);
  const CARE_LOGS_PER_PAGE = 4;
  const [visitTabPage, setVisitTabPage] = React.useState(1);
  const VISITS_TAB_PER_PAGE = 4;

  const assignedStaffMembers = staff
    .filter((s) => s.id !== "PENDING" && patient.assignedStaff?.includes(s.id))
    .slice(-1);

  const fetchCareLogs = React.useCallback(() => {
    setLoadingCareLogs(true);
    fetch(`${API_URL}/care-logs/patient/${patient.id}`)
      .then((res) => res.json())
      .then((data) => setCareLogs(Array.isArray(data) ? data : []))
      .catch(() => setCareLogs([]))
      .finally(() => setLoadingCareLogs(false));
  }, [patient.id]);

  React.useEffect(() => {
    if (expanded) {
      fetchCareLogs();
    }
  }, [expanded, fetchCareLogs]);

  const handleCareLogAdded = (newLog: CareLog) => {
    setCareLogs((prev) => [newLog, ...prev]);
  };

  return (
    <>
      <TableRow
        className={cn(
          "group transition-all cursor-pointer relative",
          expanded
            ? "bg-surface-tinted/40 shadow-inner"
            : "hover:bg-surface-secondary/50",
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell className="px-8 py-6">
          <span className="font-mono text-[10px] font-black text-primary-strong bg-surface-tinted px-2.5 py-1.5 rounded-xl border border-primary/20 shadow-xs">
            #{patient.id.replace("BN-", "")}
          </span>
        </TableCell>
        <TableCell className="px-8 py-6">
          <div className="flex items-center gap-5">
            <div
              className={cn(
                "w-14 h-14 rounded-[20px] flex items-center justify-center font-black text-primary text-base shadow-sm border-2 border-white transition-all duration-500 group-hover:rotate-3 group-hover:scale-105",
                expanded
                  ? "bg-primary text-white rotate-0! scale-100!"
                  : "bg-surface-secondary",
              )}
            >
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="text-left">
              <p className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
                {patient.name}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">
                  {patient.gender}
                </span>
                <div className="w-1 h-1 rounded-full bg-hairline" />
                <span className="text-[9px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">
                  {patient.age} TUỔI
                </span>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="px-8 py-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center text-on-surface-tertiary group-hover:bg-white transition-all shadow-xs group-hover:text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">
                {patient.lastVisit || "Chưa khám"}
              </p>
              <p className="text-[10px] text-on-surface-tertiary font-black font-mono tracking-tighter uppercase mt-1 opacity-70">
                {patient.lastVisitTime || "--:--"}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell className="px-8 py-6 text-left">
          <span
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border transition-all duration-300",
              patient.status === "Đang điều trị"
                ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                : patient.status === "Chờ duyệt"
                  ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20"
                  : patient.status === "Đã xuất viện"
                    ? "bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-600/20"
                    : patient.status === "Chờ tái khám"
                      ? "bg-violet-500 text-white border-violet-600 shadow-md shadow-violet-500/20"
                      : "bg-slate-100 text-slate-700 border-slate-200",
            )}
          >
            {patient.status === "Đang điều trị" && (
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
            {patient.status === "Chờ duyệt" ? "Chờ khám" : patient.status}
          </span>
        </TableCell>
        <TableCell className="px-8 py-6 text-right">
          <div
            className="flex items-center justify-end gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {patient.status === "Chờ duyệt" && (
              <Button
                onClick={() => onApprove(patient.id)}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-hairline bg-white hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={() => setEditOpen(true)}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-hairline bg-white hover:bg-blue-50 hover:text-blue-600 transition-all shadow-xs"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setDeleteOpen(true)}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-hairline bg-white hover:bg-red-50 hover:text-red-500 transition-all shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <AnimatePresence>
        {expanded && (
          <TableRow className="bg-surface-tinted/10 border-none! hover:bg-surface-tinted/10">
            <TableCell colSpan={5} className="px-8 py-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="space-y-6"
              >
                {/* Tab Navigation in Patient Profile */}
                <div className="flex bg-white p-1 rounded-2xl border border-hairline w-fit shadow-xs">
                  <button
                    onClick={() => setActiveTab("info")}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                      activeTab === "info" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" /> Thông tin
                  </button>
                  <button
                    onClick={() => setActiveTab("visits")}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                      activeTab === "visits" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <Calendar className="w-3.5 h-3.5" /> Lịch hẹn
                  </button>
                  <button
                    onClick={() => setActiveTab("care-logs")}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                      activeTab === "care-logs" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <Activity className="w-3.5 h-3.5" /> Nhật ký chăm sóc ({careLogs.length})
                  </button>
                </div>

                {/* TAB 1: THÔNG TIN */}
                {activeTab === "info" && (
                  <div className="grid grid-cols-1 xl:grid-cols-10 gap-8 border-t border-primary/10 pt-6">
                    <div className="xl:col-span-6 space-y-5 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-100">
                          <FileText className="w-4 h-4" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-strong">
                          Thông tin y khoa & Chẩn đoán
                        </h4>
                      </div>
                      <div className="bg-white p-6 rounded-[24px] border border-hairline shadow-sm relative group/box overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                          <ClipboardList className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-widest">
                            Chẩn đoán lâm sàng hiện tại
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed font-medium antialiased whitespace-pre-wrap break-words">
                          {patient.summary || "Chưa có chẩn đoán lâm sàng."}
                        </p>
                      </div>
                    </div>

                    <div className="xl:col-span-4 space-y-5 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-100">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-strong">
                          Nhân sự phụ trách
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {assignedStaffMembers.length > 0 ? (
                          assignedStaffMembers.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center gap-4 bg-white p-3.5 rounded-[20px] border border-hairline hover:border-primary/30 shadow-xs transition-all"
                            >
                              <img
                                src={s.avatar || "https://i.pravatar.cc/150"}
                                className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-xs"
                                alt={s.name}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-foreground truncate">{s.name}</p>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5 opacity-80">
                                  {s.role.split("•")[0]}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-on-surface-tertiary font-bold p-4 bg-white rounded-2xl border border-hairline">
                            Chưa có chuyên gia nào được chỉ định.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: LỊCH HẸN */}
                {activeTab === "visits" && (
                  <div className="space-y-4 text-left border-t border-primary/10 pt-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-strong">
                        Lịch sử thăm khám & hẹn lịch
                      </h4>
                    </div>
                    <div className="bg-white rounded-[24px] border border-hairline overflow-hidden divide-y divide-hairline">
                      {(() => {
                        const patientVisits = (allVisits || []).filter(
                          (v) =>
                            v.patientId === patient.id ||
                            (v.patientName && v.patientName.toLowerCase() === patient.name.toLowerCase()) ||
                            (v.userName && v.userName.toLowerCase() === patient.name.toLowerCase())
                        );
                        if (patientVisits.length === 0) {
                          return (
                            <div className="p-8 text-center text-xs font-bold text-slate-400">
                              Chưa có lịch sử thăm khám nào.
                            </div>
                          );
                        }
                        const totalVisitPages = Math.max(1, Math.ceil(patientVisits.length / VISITS_TAB_PER_PAGE));
                        const safeVisitPage = Math.min(visitTabPage, totalVisitPages);
                        const paginatedVisits = patientVisits.slice(
                          (safeVisitPage - 1) * VISITS_TAB_PER_PAGE,
                          safeVisitPage * VISITS_TAB_PER_PAGE
                        );
                        return (
                          <>
                            {paginatedVisits.map((v) => (
                              <div key={v.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div>
                                  <p className="text-xs font-black text-slate-800">{v.type || "Khám bệnh tại nhà"}</p>
                                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                    📅 {v.date || "Chưa chọn ngày"} ({v.time}) · 👤 Người khám: <strong className="text-slate-800">{v.staffName || "Chưa phân công"}</strong>
                                  </p>
                                </div>
                                <span
                                  className={cn(
                                    "text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border",
                                    v.status === "Đã hoàn tất"
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                      : v.status === "Đã xác nhận"
                                        ? "bg-blue-50 text-blue-600 border-blue-200"
                                        : "bg-amber-50 text-amber-600 border-amber-200"
                                  )}
                                >
                                  {v.status}
                                </span>
                              </div>
                            ))}
                            {patientVisits.length > VISITS_TAB_PER_PAGE && (
                              <div className="p-3.5 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-hairline">
                                <span className="text-[10px] font-bold text-slate-500">
                                  Hiển thị <span className="font-mono font-black text-slate-800">{(safeVisitPage - 1) * VISITS_TAB_PER_PAGE + 1}-{Math.min(safeVisitPage * VISITS_TAB_PER_PAGE, patientVisits.length)}</span> / <span className="font-mono font-black text-slate-800">{patientVisits.length}</span> lịch hẹn
                                </span>
                                <Pagination
                                  currentPage={safeVisitPage}
                                  totalPages={totalVisitPages}
                                  onPageChange={setVisitTabPage}
                                  className="py-0"
                                />
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* TAB 3: NHẬT KÝ CHĂM SÓC */}
                {activeTab === "care-logs" && (
                  <div className="space-y-6 text-left border-t border-primary/10 pt-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-strong">
                          Nhật ký chăm sóc bệnh nhân theo thời gian
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Toàn bộ lịch sử các buổi chăm sóc, đo sinh hiệu và đánh giá từ nhân viên y tế.
                        </p>
                      </div>
                      <Button
                        onClick={() => setAddLogOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md shadow-primary/20"
                      >
                        <Plus className="w-4 h-4" /> Thêm nhật ký chăm sóc
                      </Button>
                    </div>

                    {loadingCareLogs ? (
                      <div className="py-12 text-center space-y-2">
                        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-[10px] font-black uppercase text-slate-400">Đang tải nhật ký chăm sóc...</p>
                      </div>
                    ) : careLogs.length === 0 ? (
                      <div className="bg-white rounded-[24px] border border-dashed border-slate-200 p-10 text-center space-y-3">
                        <Activity className="w-10 h-10 text-slate-300 mx-auto" />
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-slate-600">Chưa có nhật ký chăm sóc nào</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1">Nhấn "+ Thêm nhật ký chăm sóc" để tạo bản ghi đầu tiên sau khi hoàn thành ca làm việc.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(() => {
                          const totalLogPages = Math.max(1, Math.ceil(careLogs.length / CARE_LOGS_PER_PAGE));
                          const safeLogPage = Math.min(careLogPage, totalLogPages);
                          const paginatedLogs = careLogs.slice(
                            (safeLogPage - 1) * CARE_LOGS_PER_PAGE,
                            safeLogPage * CARE_LOGS_PER_PAGE
                          );

                          return (
                            <>
                              {paginatedLogs.map((log) => (
                                <CareLogItem
                                  key={log.id}
                                  log={log}
                                  staff={staff}
                                  onDelete={(id) => setCareLogs((prev) => prev.filter((l) => l.id !== id))}
                                  onUpdate={(updated) => setCareLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))}
                                />
                              ))}

                              {careLogs.length > CARE_LOGS_PER_PAGE && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                                  <span className="text-[10px] font-bold text-slate-500">
                                    Hiển thị <span className="font-mono font-black text-slate-800">{(safeLogPage - 1) * CARE_LOGS_PER_PAGE + 1}-{Math.min(safeLogPage * CARE_LOGS_PER_PAGE, careLogs.length)}</span> / <span className="font-mono font-black text-slate-800">{careLogs.length}</span> nhật ký
                                  </span>
                                  <Pagination
                                    currentPage={safeLogPage}
                                    totalPages={totalLogPages}
                                    onPageChange={setCareLogPage}
                                    className="py-0"
                                  />
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </TableCell>
          </TableRow>
        )}
      </AnimatePresence>

      <EditPatientDialog
        patient={patient}
        staff={staff}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={onEdit}
      />
      <DeletePatientDialog
        patient={patient}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDelete={onDelete}
      />
      <AddCareLogDialog
        patient={patient}
        staff={staff}
        open={addLogOpen}
        onOpenChange={setAddLogOpen}
        onAdded={handleCareLogAdded}
      />
    </>
  );
}

export default function PatientsPage() {
  const { show, hide } = useLoading();
  const [patientList, setPatientList] = React.useState<Patient[]>([]);
  const [staffList, setStaffList] = React.useState<Staff[]>([]);
  const [visitList, setVisitList] = React.useState<Visit[]>([]);
  const [loadingVisits, setLoadingVisits] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("Tất cả");
  const [currentPage, setCurrentPage] = React.useState(1);


  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const [syncing, setSyncing] = React.useState(false);

  const sortByNewestDate = React.useCallback((a: any, b: any) => {
    const dateA = a.date || a.lastVisit || "";
    const dateB = b.date || b.lastVisit || "";
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA); // Newest date first (2026-07-27 > 2026-07-26)
    }
    const timeA = a.time || a.startTime || a.lastVisitTime || "";
    const timeB = b.time || b.startTime || b.lastVisitTime || "";
    return timeB.localeCompare(timeA);
  }, []);

  const syncPatients = React.useCallback(async (silent = false) => {
    if (!silent) {
      setSyncing(true);
      show("ĐANG ĐỒNG BỘ DỮ LIỆU BỆNH NHÂN...");
    }
    try {
      await authFetch(`${API_URL}/visits/sync-patients`, { method: "POST" });
      // Reload patients after sync
      await new Promise<void>((resolve) => {
        Promise.all([
          authFetch(`${API_URL}/patients`).then((r) => r.json()),
          fetch(`${API_URL}/staff`).then((r) => r.json()),
        ]).then(([p, s]) => {
          setPatientList(Array.isArray(p) ? [...p].sort(sortByNewestDate) : []);
          setStaffList(Array.isArray(s) ? s : []);
          resolve();
        }).catch(() => resolve());
      });
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      if (!silent) {
        setSyncing(false);
        hide();
      }
    }
  }, [sortByNewestDate, show, hide]);

  // Tải dữ liệu bệnh nhân + nhân viên (có thể gọi lại để refresh)
  const loadData = React.useCallback(async () => {
    setLoading(true);
    show("ĐANG TẢI DỮ LIỆU BỆNH NHÂN...");
    try {
      // Fetch patients and staff independently so one failure doesn't block the other
      const patientsRes = await authFetch(`${API_URL}/patients`);
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatientList(Array.isArray(patientsData) ? [...patientsData].sort(sortByNewestDate) : []);
      } else {
        const errBody = await patientsRes.text().catch(() => "");
        console.error(`[PatientsPage] /patients trả ${patientsRes.status}:`, errBody);
      }

      const staffRes = await fetch(`${API_URL}/staff`);
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaffList(Array.isArray(staffData) ? staffData : []);
      }
    } catch (err: any) {
      console.error("[PatientsPage] Lỗi tải dữ liệu:", err?.message ?? err);
    } finally {
      setLoading(false);
      hide();
    }
  }, [sortByNewestDate, show, hide]);

  React.useEffect(() => {
    // Tải dữ liệu ban đầu, sau đó tự động đồng bộ các lịch đã xác nhận
    const init = async () => {
      await loadData();
      try {
        await authFetch(`${API_URL}/visits/sync-patients`, { method: "POST" });
        // Reload patients after sync to pick up any newly linked profiles
        const freshPatients = await authFetch(`${API_URL}/patients`).then((r) => r.json());
        setPatientList(Array.isArray(freshPatients) ? [...freshPatients].sort(sortByNewestDate) : []);
      } catch (err: any) {
        console.warn("[PatientsPage] Đồng bộ lịch hẹn thất bại:", err?.message ?? err);
      }
    };
    init();

    // Load lịch hẹn từ người dùng app
    setLoadingVisits(true);
    fetch(`${API_URL}/visits`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => {
        const userVisits = Array.isArray(data)
          ? [...data.filter((v: Visit) => v.userId)].sort(sortByNewestDate)
          : [];
        setVisitList(userVisits);
      })
      .catch(() => setVisitList([]))
      .finally(() => setLoadingVisits(false));
  }, [loadData, sortByNewestDate]);

  const handleAddPatient = async (newPatient: Patient) => {
    show("ĐANG THÊM BỆNH NHÂN...");
    try {
      const res = await authFetch(`${API_URL}/patients`, {
        method: "POST",
        body: JSON.stringify(newPatient),
      });
      if (!res.ok) throw new Error("Create patient failed");
      const created = await res.json();
      setPatientList((prev) => [created, ...prev]);
    } catch (err) {
      console.error("[PatientsPage] Lỗi thêm bệnh nhân:", err);
    } finally {
      hide();
    }
  };

  const handleEditPatient = async (updatedPatient: Patient) => {
    show("ĐANG CẬP NHẬT BỆNH NHÂN...");
    try {
      const res = await authFetch(`${API_URL}/patients/${updatedPatient.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedPatient),
      });
      if (!res.ok) throw new Error("Update patient failed");
      const saved = await res.json();
      setPatientList((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    } catch (err) {
      console.error("[PatientsPage] Lỗi cập nhật bệnh nhân:", err);
    } finally {
      hide();
    }
  };

  const handleApprovePatient = async (id: string) => {
    show("ĐANG PHÊ DUYỆT BỆNH NHÂN...");
    try {
      const res = await authFetch(`${API_URL}/patients/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Đang điều trị" }),
      });
      if (!res.ok) throw new Error("Approve patient failed");
      const saved = await res.json();
      setPatientList((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    } catch (err) {
      console.error("[PatientsPage] Lỗi duyệt bệnh nhân:", err);
    } finally {
      hide();
    }
  };

  // Approve a visit from app → automatically creates patient record on SQL Server backend
  const handleApproveVisit = (visit: Visit) => {
    show("ĐANG PHÊ DUYỆT LỊCH HẸN...");
    authFetch(`${API_URL}/visits/${visit.id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "Đã xác nhận" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Approve visit failed");
        return res.json();
      })
      .then((updated) => {
        // Update visit list locally
        setVisitList((prev) =>
          prev.map((v) => (v.id === updated.id ? updated : v)),
        );
        // Reload patients list to show the newly synchronized patient profile
        loadData();
      })
      .catch((err) => {
        console.error("[PatientsPage] Lỗi duyệt lịch hẹn:", err);
      })
      .finally(() => {
        hide();
      });
  };

  const handleDeletePatient = async (id: string) => {
    show("ĐANG XÓA BỆNH NHÂN...");
    try {
      const res = await authFetch(`${API_URL}/patients/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete patient failed");
      setPatientList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("[PatientsPage] Lỗi xóa bệnh nhân:", err);
    } finally {
      hide();
    }
  };

  const filteredPatients = (Array.isArray(patientList) ? patientList : []).filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.summary &&
        p.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus =
      statusFilter === "Tất cả" ||
      p.status === statusFilter ||
      (statusFilter === "Chờ khám" && p.status === "Chờ duyệt");

    return matchQuery && matchStatus;
  });

  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / ITEMS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredPatients.length,
  );
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  const [visitPage, setVisitPage] = React.useState(1);
  const VISITS_PER_PAGE = 4;
  const totalVisitPages = Math.max(1, Math.ceil(visitList.length / VISITS_PER_PAGE));
  const paginatedVisits = visitList.slice((visitPage - 1) * VISITS_PER_PAGE, visitPage * VISITS_PER_PAGE);

  const exportToCSV = () => {
    const headers = [
      "Mã bệnh nhân",
      "Họ và tên",
      "Tuổi",
      "Giới tính",
      "Ngày khám cuối",
      "Giờ khám cuối",
      "Trạng thái",
      "Tiền sử chẩn đoán",
    ];
    const rows = filteredPatients.map((p) => [
      p.id,
      p.name,
      p.age,
      p.gender,
      p.lastVisit || "",
      p.lastVisitTime || "",
      p.status,
      p.summary || "",
    ]);
    const csvContent =
      "\uFEFF" +
      [
        headers.join(","),
        ...rows.map((e) =>
          e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_benh_nhan_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <span className="eyebrow text-[10px] font-black uppercase tracking-widest text-primary-strong">
                Hồ sơ bệnh án số hóa
              </span>
            </div>
            <div className="w-px h-4 bg-hairline" />
            <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-widest">
              {patientList.length} Bệnh nhân
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tight-tracking text-foreground leading-[1.1] uppercase text-left">
            Quản lý <br />
            Bệnh nhân
          </h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-2xl font-medium leading-relaxed antialiased text-left">
            Hệ thống quản lý bệnh án số hóa theo tiêu chuẩn lâm sàng đồng bộ thời gian thực. Theo dõi sát sao quá trình hồi phục và lịch trình thăm khám tại gia.
          </p>
        </motion.div>
        <div className="shrink-0 relative group">
          <Button
            variant="outline"
            onClick={() => syncPatients(false)}
            disabled={syncing}
            className="rounded-full px-6 h-14 text-xs font-black uppercase tracking-[0.15em] border-hairline bg-white shadow-sm hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all flex items-center gap-2"
          >
            <Users className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Đang đồng bộ..." : "Đồng bộ lịch hẹn"}
          </Button>
          <div className="absolute -inset-4 bg-primary/5 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      </div>

      {/* Enhanced Control Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm danh tính, mã hồ sơ hoặc liên lạc..."
            className="pl-14 h-16 rounded-[24px] bg-white border-hairline focus:ring-8 focus:ring-primary/5 transition-all text-base font-bold shadow-xl shadow-black/[0.02] border-b-2 border-b-hairline placeholder:text-on-surface-tertiary placeholder:font-medium"
          />
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* Status Filter Pills */}
          <div className="flex bg-slate-100 rounded-[20px] p-1 border border-hairline/60">
            {[
              "Tất cả",
              "Chờ khám",
              "Đang điều trị",
              "Khám hoàn thành",
              "Đã hủy",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200",
                  statusFilter === status
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                    : "text-slate-400 hover:text-slate-600",
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="h-16 px-8 rounded-[24px] border-hairline bg-white font-black text-[11px] uppercase tracking-[0.15em] flex items-center gap-3 shadow-lg shadow-black/[0.03] transition-all hover:bg-surface-secondary active:scale-95 group"
          >
            <Download className="w-4.5 h-4.5 text-primary group-hover:-translate-y-1 transition-transform" />{" "}
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-hairline rounded-[48px] overflow-hidden shadow-2xl shadow-black/[0.04] relative">
        <div className="h-1.5 w-full bg-linear-to-r from-primary/10 via-primary to-primary/10 opacity-50" />

        <div className="overflow-x-auto">
          {loading && patientList.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Đang đồng bộ dữ liệu hệ thống...
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-secondary/40 border-b border-hairline hover:bg-surface-secondary/40">
                  <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em]">
                    Định danh
                  </TableHead>
                  <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em]">
                    Bệnh nhân & Thông tin cá nhân
                  </TableHead>
                  <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em]">
                    Phiên khám cuối
                  </TableHead>
                  <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em]">
                    Trạng thái lâm sàng
                  </TableHead>
                  <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em] text-right">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-hairline/40">
                {paginatedPatients.length > 0 ? (
                  paginatedPatients.map((patient) => (
                    <PatientRow
                      key={patient.id}
                      patient={patient}
                      staff={staffList}
                      allVisits={visitList}
                      onEdit={handleEditPatient}
                      onDelete={handleDeletePatient}
                      onApprove={handleApprovePatient}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-20 text-center font-bold text-slate-400 uppercase text-xs tracking-widest"
                    >
                      Không tìm thấy hồ sơ bệnh nhân nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="px-10 py-8 border-t border-hairline flex flex-col md:flex-row items-center justify-between bg-surface-secondary/10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <p className="text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">
              Hiển thị{" "}
              <span className="text-foreground">
                {filteredPatients.length > 0 ? startIndex + 1 : 0}-{endIndex}
              </span>{" "}
              trong số{" "}
              <span className="text-foreground">{filteredPatients.length}</span>{" "}
              hồ sơ hệ thống
            </p>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ── Lịch hẹn từ người dùng app ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              📱 Lịch hẹn từ ứng dụng
            </span>
          </div>
          <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-widest">
            {visitList.length} lịch hẹn
          </span>
        </div>

        <div className="bg-white border border-hairline rounded-[32px] shadow-xs overflow-hidden">
          <div className="px-8 py-5 border-b border-hairline bg-slate-50/50">
            <p className="text-sm font-black text-foreground">Danh sách lịch hẹn người dùng đặt qua app</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Hiển thị tất cả lịch hẹn do tài khoản người dùng tạo ra</p>
          </div>

          {loadingVisits ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : visitList.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">Chưa có lịch hẹn nào từ người dùng</p>
            </div>
          ) : (
            <div className="divide-y divide-hairline">
              {paginatedVisits.map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="flex items-center gap-5 px-8 py-5 hover:bg-slate-50/60 transition-all group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-slate-800">{v.type}</p>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        v.status === "Chờ duyệt"
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : v.status === "Đã xác nhận"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : v.status === "Đã hoàn tất"
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        {v.status}
                      </span>
                      {v.paymentStatus === "Đã thanh toán" && (
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border bg-green-50 text-green-600 border-green-200">
                          ✓ Đã thanh toán
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      👤 {v.userName || "Người dùng"}
                      {(v as any).userPhone && ` · 📞 ${(v as any).userPhone}`}
                      {v.date && ` · 📅 ${v.date}`}
                      {v.time && ` · 🕐 ${v.time}`}
                    </p>
                    {(v as any).address && (
                      <p className="text-[10px] text-blue-600 font-bold mt-0.5">
                        📍 {(v as any).address}
                      </p>
                    )}
                    {((v as any).notes || (v.paymentNote && !v.paymentNote.startsWith("Lý do hủy:"))) && (
                      <p className="text-[10px] text-amber-700 font-medium mt-0.5 italic">
                        📝 Triệu chứng/Ghi chú: {(v as any).notes || v.paymentNote}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chuyên gia</p>
                    <p className="text-xs font-bold text-slate-600">{v.staffName || "Chưa phân công"}</p>
                  </div>
                  {v.status === "Chờ duyệt" && (
                    <Button
                      onClick={() => handleApproveVisit(v)}
                      size="sm"
                      className="shrink-0 h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200 border-none"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Duyệt & tạo hồ sơ
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          {visitList.length > VISITS_PER_PAGE && (
            <div className="p-4 border-t border-hairline bg-slate-50/50 flex justify-center">
              <Pagination
                currentPage={visitPage}
                totalPages={totalVisitPages}
                onPageChange={setVisitPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
