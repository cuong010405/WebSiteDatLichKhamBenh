"use client";

import * as React from "react";
import {
  Plus,
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
  FileText,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Users,
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
import { Patient, Staff, Visit } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL, authFetch } from "@/lib/api";

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
  const [gender, setGender] = React.useState<"Nam" | "Nữ">("Nam");
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
                      <Select
                        value={gender}
                        onValueChange={(val) => setGender(val as "Nam" | "Nữ")}
                      >
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-10 bg-white font-bold text-xs shadow-none text-slate-800">
                          <SelectValue placeholder="Chọn giới tính..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                          <SelectItem
                            value="Nam"
                            className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                          >
                            Nam
                          </SelectItem>
                          <SelectItem
                            value="Nữ"
                            className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                          >
                            Nữ
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
  const [gender, setGender] = React.useState<"Nam" | "Nữ">("Nam");
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
      <DialogContent className="sm:max-w-[500px] rounded-[32px] border-hairline shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-indigo-500" />
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Pencil className="w-5 h-5" />
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

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <Label
                  htmlFor="edit-name"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary"
                >
                  Họ và tên bệnh nhân <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-hairline h-10 bg-surface-secondary/20 focus:bg-white font-bold text-xs"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label
                  htmlFor="edit-age"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary"
                >
                  Tuổi <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit-age"
                  required
                  type="number"
                  min="0"
                  max="150"
                  value={ageStr}
                  onChange={(e) => setAgeStr(e.target.value)}
                  className="rounded-xl border-hairline h-10 bg-surface-secondary/20 focus:bg-white font-bold text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary">
                  Giới tính
                </Label>
                <Select
                  value={gender}
                  onValueChange={(val) => setGender(val as "Nam" | "Nữ")}
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs shadow-none text-slate-800">
                    <SelectValue placeholder="Chọn giới tính..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    <SelectItem
                      value="Nam"
                      className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                    >
                      Nam
                    </SelectItem>
                    <SelectItem
                      value="Nữ"
                      className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                    >
                      Nữ
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary">
                  Trạng thái lâm sàng
                </Label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as any)}
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 h-10 bg-white font-bold text-xs shadow-none text-slate-800">
                    <SelectValue placeholder="Chọn trạng thái..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    <SelectItem
                      value="Đang điều trị"
                      className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                    >
                      Đang điều trị
                    </SelectItem>
                    <SelectItem
                      value="Chờ tái khám"
                      className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                    >
                      Chờ tái khám
                    </SelectItem>
                    <SelectItem
                      value="Đã xuất viện"
                      className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                    >
                      Đã xuất viện
                    </SelectItem>
                    <SelectItem
                      value="Chờ duyệt"
                      className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                    >
                      Chờ duyệt
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <StaffMultiSelect
              staff={staff}
              selectedIds={assignedStaff}
              onChange={setAssignedStaff}
            />

            <div className="space-y-2 text-left">
              <Label
                htmlFor="edit-summary"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary"
              >
                Tiền sử & Chẩn đoán sơ bộ
              </Label>
              <Textarea
                id="edit-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Mô tả chẩn đoán lâm sàng..."
                className="rounded-xl border-hairline bg-surface-secondary/20 focus:bg-white min-h-[90px] text-xs font-semibold leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex-col sm:flex-col gap-2">
            <Button
              type="submit"
              disabled={!name || !ageStr || submitting}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] hover:opacity-95 shadow-md border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5"
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              Hủy bỏ
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

function PatientRow({
  patient,
  staff,
  onEdit,
  onDelete,
  onApprove,
}: {
  patient: Patient;
  staff: Staff[];
  onEdit: (p: Patient) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const assignedStaffMembers = staff.filter((s) =>
    patient.assignedStaff.includes(s.id),
  );

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
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : patient.status === "Chờ duyệt"
                  ? "bg-slate-100 text-slate-700 border-slate-200"
                  : patient.status === "Chờ tái khám"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-slate-100 text-slate-700 border-slate-200",
            )}
          >
            {patient.status === "Đang điều trị" && (
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
            {patient.status}
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
            <TableCell colSpan={5} className="px-8 py-0">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "circOut" }}
              >
                <div className="py-12 grid grid-cols-1 xl:grid-cols-10 gap-12 border-t border-primary/10">
                  <div className="xl:col-span-4 space-y-7 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary">
                        <FileText className="w-5.5 h-5.5" />
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-strong">
                        Thông tin y khoa
                      </h4>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] border border-hairline shadow-xl shadow-black/[0.02] relative group/box overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-surface-tinted/50 rounded-bl-[60px] -mr-12 -mt-12 transition-all group-hover/box:scale-110" />
                      <div className="flex items-center gap-2 mb-4 relative z-10">
                        <ClipboardList className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-widest">
                          Chẩn đoán hiện tại
                        </span>
                      </div>
                      <p className="text-base text-foreground leading-relaxed font-medium relative z-10 antialiased whitespace-pre-wrap break-words">
                        {patient.summary || "Chưa có chẩn đoán lâm sàng."}
                      </p>
                    </div>
                  </div>

                  <div className="xl:col-span-3 space-y-7 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary">
                        <Stethoscope className="w-5.5 h-5.5" />
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-strong">
                        Nhân sự phụ trách
                      </h4>
                    </div>
                    <div className="space-y-4">
                      {assignedStaffMembers.length > 0 ? (
                        assignedStaffMembers.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center gap-5 bg-white p-4.5 rounded-[24px] border border-hairline hover:border-primary/30 hover:shadow-lg transition-all group/member shadow-sm cursor-pointer"
                          >
                            <img
                              src={s.avatar || "https://i.pravatar.cc/150"}
                              className="w-12 h-12 rounded-[18px] object-cover ring-2 ring-white shadow-md transition-transform group-hover/member:scale-110"
                              alt={s.name}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-foreground group-hover/member:text-primary transition-colors truncate">
                                {s.name}
                              </p>
                              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.15em] mt-1 opacity-80">
                                {s.role.split("•")[0]}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-hairline group-hover/member:text-primary transition-colors" />
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-on-surface-tertiary font-bold p-4 bg-white rounded-[24px] border border-hairline">
                          Chưa có chuyên gia nào được chỉ định.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="xl:col-span-3 space-y-7 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary">
                          <History className="w-5.5 h-5.5" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-strong">
                          Nhật ký điều trị
                        </h4>
                      </div>
                      <button className="text-primary-strong text-[9px] font-black uppercase tracking-widest hover:underline flex items-center gap-2 bg-surface-tinted px-3 py-1.5 rounded-full border border-primary/10 transition-all hover:bg-primary hover:text-white">
                        LỊCH SỬ <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="bg-white rounded-[32px] border border-hairline overflow-hidden shadow-sm divide-y divide-hairline">
                      {[
                        {
                          title: "Thăm khám định kỳ",
                          date: "Mới nhất",
                          type: "Clinical",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-5 hover:bg-surface-secondary/40 transition-all cursor-pointer group/item"
                        >
                          <div>
                            <span className="text-xs font-black text-foreground group-hover/item:text-primary transition-colors">
                              {item.title}
                            </span>
                            <p className="text-[8px] font-black text-on-surface-tertiary uppercase tracking-widest mt-1 opacity-60">
                              {item.type}
                            </p>
                          </div>
                          <span className="font-mono text-[10px] font-black text-on-surface-tertiary uppercase bg-surface-secondary/50 px-2 py-1 rounded-lg border border-hairline">
                            {item.date}
                          </span>
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
    </>
  );
}

export default function PatientsPage() {
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

  const syncPatients = React.useCallback(async (silent = false) => {
    if (!silent) setSyncing(true);
    try {
      await authFetch(`${API_URL}/visits/sync-patients`, { method: "POST" });
      // Reload patients after sync
      await new Promise<void>((resolve) => {
        Promise.all([
          authFetch(`${API_URL}/patients`).then((r) => r.json()),
          fetch(`${API_URL}/staff`).then((r) => r.json()),
        ]).then(([p, s]) => {
          setPatientList(Array.isArray(p) ? p : []);
          setStaffList(Array.isArray(s) ? s : []);
          resolve();
        }).catch(() => resolve());
      });
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      if (!silent) setSyncing(false);
    }
  }, []);

  // Tải dữ liệu bệnh nhân + nhân viên (có thể gọi lại để refresh)
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [patientsData, staffData] = await Promise.all([
        authFetch(`${API_URL}/patients`).then((res) => {
          if (!res.ok) throw new Error("Không thể tải danh sách bệnh nhân");
          return res.json();
        }),
        fetch(`${API_URL}/staff`).then((res) => {
          if (!res.ok) throw new Error("Không thể tải danh sách nhân viên");
          return res.json();
        }),
      ]);
      setPatientList(Array.isArray(patientsData) ? patientsData : []);
      setStaffList(Array.isArray(staffData) ? staffData : []);
    } catch (err: any) {
      console.error("[PatientsPage] Lỗi tải dữ liệu:", err?.message ?? err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Tải dữ liệu ban đầu, sau đó tự động đồng bộ các lịch đã xác nhận
    const init = async () => {
      await loadData();
      try {
        await authFetch(`${API_URL}/visits/sync-patients`, { method: "POST" });
        // Reload patients after sync to pick up any newly linked profiles
        const freshPatients = await authFetch(`${API_URL}/patients`).then((r) => r.json());
        setPatientList(Array.isArray(freshPatients) ? freshPatients : []);
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
          ? data.filter((v: Visit) => v.userId)
          : [];
        setVisitList(userVisits);
      })
      .catch(() => setVisitList([]))
      .finally(() => setLoadingVisits(false));
  }, [loadData]);

  const handleAddPatient = (newPatient: Patient) => {
    // Optimistic update: add immediately so it shows right away
    setPatientList((prev) => [newPatient, ...prev]);

    authFetch(`${API_URL}/patients`, {
      method: "POST",
      body: JSON.stringify(newPatient),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Create patient failed");
        return res.json();
      })
      .then((created) => {
        // Replace temp entry with server-confirmed data
        setPatientList((prev) =>
          prev.map((p) => (p.id === newPatient.id ? created : p)),
        );
      })
      .catch((err) => {
        console.error("[PatientsPage] Lỗi thêm bệnh nhân:", err);
        // Rollback optimistic update on failure
        setPatientList((prev) => prev.filter((p) => p.id !== newPatient.id));
      });
  };


  const handleEditPatient = (updatedPatient: Patient) => {
    authFetch(`${API_URL}/patients/${updatedPatient.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedPatient),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update patient failed");
        return res.json();
      })
      .then((saved) => {
        setPatientList((prev) =>
          prev.map((p) => (p.id === saved.id ? saved : p)),
        );
      })
      .catch((err) => {
        console.error("[PatientsPage] Lỗi cập nhật bệnh nhân:", err);
      });
  };

  const handleApprovePatient = (id: string) => {
    authFetch(`${API_URL}/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "Đang điều trị" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Approve patient failed");
        return res.json();
      })
      .then((saved) => {
        setPatientList((prev) =>
          prev.map((p) => (p.id === saved.id ? saved : p)),
        );
      })
      .catch((err) => {
        console.error("[PatientsPage] Lỗi duyệt bệnh nhân:", err);
      });
  };

  // Approve a visit from app → automatically creates patient record on SQL Server backend
  const handleApproveVisit = (visit: Visit) => {
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
      });
  };

  const handleDeletePatient = (id: string) => {
    authFetch(`${API_URL}/patients/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Delete patient failed");
        setPatientList((prev) => prev.filter((p) => p.id !== id));
      })
      .catch((err) => {
        console.error("[PatientsPage] Lỗi xóa bệnh nhân:", err);
      });
  };

  const filteredPatients = (Array.isArray(patientList) ? patientList : []).filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.summary &&
        p.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === "Tất cả" || p.status === statusFilter;

    return matchQuery && matchStatus;
  });

  const ITEMS_PER_PAGE = 5;
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
        <div className="shrink-0 relative group flex items-center gap-3">
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
          <AddPatientDialog onAdd={handleAddPatient} staff={staffList} />
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
              "Chờ duyệt",
              "Đang điều trị",
              "Chờ tái khám",
              "Đã xuất viện",
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
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-2xl border-hairline bg-white shadow-md hover:bg-surface-secondary transition-all disabled:opacity-30 disabled:shadow-none"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-3 bg-white border border-hairline px-6 h-12 rounded-2xl shadow-md group">
              <span className="text-sm font-black text-primary group-hover:scale-110 transition-transform">
                {currentPage}
              </span>
              <span className="text-xs font-bold text-muted-foreground opacity-30">
                /
              </span>
              <span className="text-xs font-bold text-on-surface-tertiary uppercase tracking-widest">
                {totalPages}
              </span>
            </div>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-2xl border-hairline bg-white shadow-md hover:bg-surface-secondary transition-all disabled:opacity-30 disabled:shadow-none"
            >
              <ChevronRight className="w-6 h-6 text-primary" />
            </Button>
          </div>
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
              {visitList.map((v, i) => (
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
                      {v.date && ` · 📅 ${v.date}`}
                      {v.time && ` · 🕐 ${v.time}`}
                    </p>
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
        </div>
      </div>
    </div>
  );
}
