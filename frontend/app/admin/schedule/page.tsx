"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  CalendarPlus,
  Search,
  Settings2,
  Users,
  User,
  Clock,
  Stethoscope,
  CreditCard,
  Calendar as CalendarIcon,
  Sparkles,
  CheckCircle2,
  Bell,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  MapPin,
  FileText,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Visit, VisitStatus, Staff, Patient } from "@/lib/types";
import { API_URL, authFetch } from "@/lib/api";
import { useLoading } from "@/lib/loading-context";
import { formatVietnameseDate, parseCurrencyNumber } from "@/lib/utils/format";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

function parseStartTime(timeStr?: string, startTimeStr?: string): string {
  if (startTimeStr && startTimeStr.includes(":")) return startTimeStr.trim();
  if (timeStr && timeStr.includes(":")) {
    const firstPart = timeStr.split("-")[0].trim();
    if (firstPart.includes(":")) return firstPart;
  }
  return "08:00";
}

function parseDurationHours(durationStr?: string, timeStr?: string, packageShiftStr?: string): number {
  const combined = `${durationStr || ""} ${packageShiftStr || ""}`.toLowerCase();
  if (combined.includes("8h") || combined.includes("8 tiếng") || combined.includes("8h/ngày") || combined.includes("(8h)")) {
    return 8;
  }
  if (timeStr && timeStr.includes("-")) {
    const parts = timeStr.split("-").map((p) => p.trim());
    if (parts.length === 2 && parts[0].includes(":") && parts[1].includes(":")) {
      const [h1, m1] = parts[0].split(":").map(Number);
      const [h2, m2] = parts[1].split(":").map(Number);
      if (!isNaN(h1) && !isNaN(h2)) {
        const diffMinutes = (h2 * 60 + (m2 || 0)) - (h1 * 60 + (m1 || 0));
        if (diffMinutes > 0) return diffMinutes / 60;
      }
    }
  }

  if (durationStr) {
    const matches = durationStr.match(/(\d+(\.\d+)?)\s*(h|giờ)?/gi);
    if (matches) {
      for (const m of matches) {
        if (m.toLowerCase().includes("h") || m.toLowerCase().includes("giờ")) {
          const val = parseFloat(m);
          if (!isNaN(val) && val > 0) return val;
        }
      }
      const firstVal = parseFloat(matches[0]);
      if (!isNaN(firstVal) && firstVal > 0 && firstVal <= 12) return firstVal;
    }
  }

  return 4;
}

function formatVisitDisplayTime(v: Visit): string {
  const durationHours = parseDurationHours(v.duration, v.time, v.packageShift ?? undefined);
  const start = parseStartTime(v.time, v.startTime ?? undefined);
  const [h, m] = start.split(":").map(Number);
  if (isNaN(h)) return v.time || "08:00 - 12:00";

  const endH = (h + durationHours) % 24;
  const endHStr = String(endH).padStart(2, "0");
  const mStr = String(isNaN(m) ? 0 : m).padStart(2, "0");
  return `${start} - ${endHStr}:${mStr}`;
}

function getPositionPercent(timeStr?: string, startTimeStr?: string): number {
  const start = parseStartTime(timeStr, startTimeStr);
  const [h, m] = start.split(":").map(Number);
  if (isNaN(h)) return 0;
  const startHour = 8;
  const totalMinutes = 12 * 60;
  const minutes = (h - startHour) * 60 + (isNaN(m) ? 0 : m);
  return Math.max(0, Math.min(100, (minutes / totalMinutes) * 100));
}

function getWidthPercent(durationStr?: string, timeStr?: string, packageShiftStr?: string): number {
  const hours = parseDurationHours(durationStr, timeStr, packageShiftStr);
  const totalHours = 12;
  return Math.max(10, Math.min(100, (hours / totalHours) * 100));
}

function isVisitOnDate(v: Visit, targetDateStr?: string): boolean {
  if (!v.date || !targetDateStr) return true;
  if (v.date === targetDateStr) return true;

  const pkgPlan = String((v as any).packagePlan || v.duration || "").toLowerCase();
  const careMode = String((v as any).careMode || "").toLowerCase();

  let days = 0;
  if (pkgPlan.includes("30") || pkgPlan.includes("tháng")) days = 30;
  else if (pkgPlan.includes("14")) days = 14;
  else if (pkgPlan.includes("7") || pkgPlan.includes("tuần")) days = 7;
  else if (careMode === "package" || careMode.includes("gói")) days = 7;

  if (days > 1) {
    const startDate = new Date(v.date);
    const targetDate = new Date(targetDateStr);
    if (!isNaN(startDate.getTime()) && !isNaN(targetDate.getTime())) {
      const diffTime = targetDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < days) {
        return true;
      }
    }
  }

  return false;
}

function isOverlapping(
  v1: { startTime?: string; time?: string; duration?: string },
  v2: { startTime?: string; time?: string; duration?: string },
) {
  const start1Str = parseStartTime(v1.time, v1.startTime);
  const start2Str = parseStartTime(v2.time, v2.startTime);
  const dur1 = parseDurationHours(v1.duration, v1.time);
  const dur2 = parseDurationHours(v2.duration, v2.time);

  const getMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (isNaN(h) ? 8 : h) * 60 + (isNaN(m) ? 0 : m);
  };

  const s1 = getMin(start1Str);
  const e1 = s1 + dur1 * 60;
  const s2 = getMin(start2Str);
  const e2 = s2 + dur2 * 60;

  return s1 < e2 && s2 < e1;
}

// Flexible helper to match visits to staff members by ID or Name
function isStaffMatch(person: Staff, staffId?: string, staffName?: string): boolean {
  if (!person) return false;
  const pId = String(person.id || "").trim().toLowerCase();
  const pName = String(person.name || "").trim().toLowerCase();

  const sId = String(staffId || "").trim().toLowerCase();
  const sName = String(staffName || "").trim().toLowerCase();

  if (sId && pId && sId === pId) return true;
  if (sName && pName && sName === pName) return true;
  if (sId && pName && sId === pName) return true;

  return false;
}

// Service names MUST match exactly what customers submit from dat-lich page
const DEFAULT_VISIT_TYPES = [
  "Chăm sóc & Khám bệnh tổng quát tại nhà",
  "Chăm sóc vết thương & Thay băng y tế",
  "Vật lý trị liệu & Phục hồi chức năng",
  "Chăm sóc người cao tuổi & Bệnh nhân tại gia",
  "Truyền dịch tại nhà",
  "Tư vấn dinh dưỡng",
  "Kiểm tra sức khỏe định kỳ",
];

const DURATION_OPTIONS = [
  { value: "0.5h", label: "30 Phút" },
  { value: "1h", label: "1 Giờ" },
  { value: "1.5h", label: "1.5 Giờ" },
  { value: "2h", label: "2 Giờ" },
  { value: "2.5h", label: "2.5 Giờ" },
  { value: "3h", label: "3 Giờ" },
];

interface SessionFormDialogProps {
  mode: "create" | "edit";
  visit?: Visit;
  onSave: (data: Partial<Visit>) => void;
  trigger: React.ReactElement;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  staffList: Staff[];
  patientList: Patient[];
  allVisits: Visit[];
  visitTypes?: string[];
  selectedDate?: string;
}

function SessionFormDialog({
  mode,
  visit,
  onSave,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  staffList,
  patientList,
  allVisits,
  visitTypes = DEFAULT_VISIT_TYPES,
  selectedDate,
}: SessionFormDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    externalOnOpenChange?.(v);
  };
  const [staffId, setStaffId] = React.useState(visit?.staffId ?? "");
  const [patientId, setPatientId] = React.useState(visit?.patientId ?? "");
  const [startTime, setStartTime] = React.useState(visit?.startTime ?? "08:00");
  const [duration, setDuration] = React.useState(visit?.duration ?? "1h");
  const [visitType, setVisitType] = React.useState(visit?.type ?? "");
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    if (open) {
      const matchedStaff = staffList.find((s) => isStaffMatch(s, visit?.staffId, (visit as any)?.staffName));
      setStaffId(matchedStaff?.id ?? visit?.staffId ?? "");

      const matchedPatient = patientList.find(
        (p) => String(p.id).toLowerCase() === String(visit?.patientId).toLowerCase() ||
               p.name.toLowerCase() === visit?.patientName?.toLowerCase()
      );
      setPatientId(matchedPatient?.id ?? visit?.patientId ?? "");

      setStartTime(visit?.startTime ?? "08:00");
      setDuration(visit?.duration ?? "1h");
      setVisitType(visit?.type ?? "");
      setErrorMsg("");
    }
  }, [open, visit, staffList, patientList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const selectedPatient = patientList.find((p) => p.id === patientId);
    const durationHours = parseFloat(duration.replace("h", ""));
    const [h, m] = startTime.split(":").map(Number);
    const totalStartMins = h * 60 + m;
    const totalEndMins = totalStartMins + durationHours * 60;

    // 1. Validate work hours (08:00 - 20:00)
    if (totalStartMins < 8 * 60 || totalEndMins > 20 * 60) {
      setErrorMsg(
        "Thời gian ca trực phải nằm trong khung giờ làm việc (08:00 - 20:00)",
      );
      return;
    }

    // 2. Overlap Check for the same staff member on the same date
    const hasOverlap = allVisits.some(
      (v) =>
        v.id !== visit?.id &&
        v.staffId === staffId &&
        (!selectedDate || !v.date || v.date === selectedDate) &&
        isOverlapping(
          { startTime: v.startTime || "08:00", duration: v.duration },
          { startTime, duration },
        ),
    );

    if (hasOverlap) {
      setErrorMsg("Chuyên gia này đã có lịch trực khác trùng khung giờ này!");
      return;
    }

    const endH = Math.floor(totalEndMins / 60);
    const endM = Math.round(totalEndMins % 60);
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    onSave({
      staffId,
      patientId,
      patientName: selectedPatient?.name ?? "Bệnh nhân",
      startTime,
      endTime,
      time: `${startTime} - ${endTime}`,
      duration,
      type: visitType,
      status: (visit?.status ?? "Đã xác nhận") as VisitStatus,
    });
    setOpen(false);
  };

  const isValid = staffId && patientId && startTime && duration && visitType;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-[480px] rounded-[28px] border border-slate-200/80 shadow-2xl shadow-black/10 p-0 overflow-hidden bg-white">
        <div
          className={cn(
            "h-1.5 w-full",
            mode === "create"
              ? "bg-gradient-to-r from-green-400 to-emerald-500"
              : "bg-gradient-to-r from-blue-400 to-indigo-500",
          )}
        />
        <form onSubmit={handleSubmit} className="p-8">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100 mb-6">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md",
                mode === "create"
                  ? "bg-gradient-to-br from-green-400 to-emerald-600 text-white"
                  : "bg-gradient-to-br from-blue-400 to-indigo-600 text-white",
              )}
            >
              {mode === "create" ? (
                <CalendarPlus className="w-5 h-5" />
              ) : (
                <Pencil className="w-5 h-5" />
              )}
            </div>
            <div className="text-left flex-1">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                {mode === "create"
                  ? "Phân công ca trực mới"
                  : "Chỉnh sửa lịch trình"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">
                {mode === "create"
                  ? "Thiết lập phiên làm việc mới cho chuyên gia và bệnh nhân."
                  : "Cập nhật thông tin ca trực hiện tại trong hệ thống."}
              </DialogDescription>
            </div>
          </DialogHeader>

          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-600">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs font-bold leading-tight text-left">
                {errorMsg}
              </p>
            </div>
          )}

          <div className="grid gap-5">
            <div className="space-y-2 text-left">
              <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                Loại dịch vụ
              </Label>
              <Select
                value={visitType}
                onValueChange={(val) => setVisitType(val ?? "")}
                required
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none text-slate-800 transition-all">
                  <SelectValue placeholder="Chọn loại dịch vụ..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                  {visitTypes.map((t) => (
                    <SelectItem
                      key={t}
                      value={t}
                      className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                    >
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Chuyên gia phụ trách
                </Label>
                <Select
                  value={staffId}
                  onValueChange={(val) => setStaffId(val ?? "")}
                  required
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none text-slate-800 transition-all">
                    <span className="truncate">
                      {staffList.find((s) => isStaffMatch(s, staffId, (visit as any)?.staffName))?.name ||
                        (visit as any)?.staffName ||
                        "Chọn nhân viên..."}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    {staffList.map((s) => {
                      const isStaffBusy = (!s.available || s.status !== "Sẵn sàng") && s.id !== visit?.staffId;
                      return (
                        <SelectItem
                          key={s.id}
                          value={s.id}
                          disabled={isStaffBusy}
                          className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                        >
                          {s.name} ({s.department}) {isStaffBusy ? `[${s.status}]` : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-left">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Bệnh nhân tiếp nhận
                </Label>
                <Select
                  value={patientId}
                  onValueChange={(val) => setPatientId(val ?? "")}
                  required
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none text-slate-800 transition-all">
                    <span className="truncate">
                      {patientList.find((p) => String(p.id).toLowerCase() === String(patientId).toLowerCase() || p.name.toLowerCase() === visit?.patientName?.toLowerCase())?.name ||
                        visit?.patientName ||
                        "Chọn bệnh nhân..."}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    {patientList.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                        className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                      >
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Giờ bắt đầu
                </Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Thời lượng
                </Label>
                <Select
                  value={duration}
                  onValueChange={(val) => setDuration(val ?? "")}
                  required
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none text-slate-800 transition-all">
                    <SelectValue placeholder="Chọn thời lượng..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 mt-6 border-t border-slate-100 flex-col sm:flex-col gap-3 bg-white">
            <Button
              type="submit"
              disabled={!isValid}
              className={cn(
                "w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] transition-all group border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5 shadow-md disabled:opacity-40",
                mode === "create"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-95"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-95",
              )}
            >
              {mode === "create" ? "Xác nhận phân công" : "Lưu thay đổi"}{" "}
              <Sparkles className="w-3.5 h-3.5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            >
              Hủy bỏ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteDialogProps {
  visit: Visit;
  onDelete: (id: string) => void;
  trigger: React.ReactElement;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

function DeleteDialog({
  visit,
  onDelete,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: DeleteDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    externalOnOpenChange?.(v);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-[400px] rounded-[24px] border border-red-100 shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-400 to-rose-500" />
        <div className="p-7">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 mb-4">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                Xác nhận xóa
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">
                Hành động này không thể hoàn tác.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="bg-red-50/80 border border-red-100 rounded-xl p-4 space-y-1.5 mb-6 text-left">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
              {visit.type}
            </p>
            <p className="text-[10px] font-bold text-slate-500">
              Bệnh nhân:{" "}
              <span className="text-slate-700">{visit.patientName}</span>
            </p>
            <p className="text-[10px] font-bold text-slate-500">
              Thời gian:{" "}
              <span className="text-slate-700 font-mono">{visit.time}</span>
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2 bg-white">
            <Button
              onClick={() => {
                onDelete(visit.id);
                setOpen(false);
              }}
              className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-95 shadow-md shadow-red-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Xóa vĩnh viễn
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              Giữ lại
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function checkStaffConflict(
  staff: Staff,
  targetVisit: Visit,
  allVisits: Visit[]
): boolean {
  if (!staff || !targetVisit || !targetVisit.date) return false;
  const staffVisits = allVisits.filter(
    (v) =>
      v.id !== targetVisit.id &&
      v.date === targetVisit.date &&
      v.status !== "Đã hủy" &&
      isStaffMatch(staff, v.staffId, (v as any).staffName)
  );
  if (staffVisits.length === 0) return false;

  const targetStart = targetVisit.startTime || (targetVisit.time ? targetVisit.time.split("-")[0]?.trim() : "");
  const targetDuration = targetVisit.duration || "2h";

  return staffVisits.some((sv) => {
    const svStart = sv.startTime || (sv.time ? sv.time.split("-")[0]?.trim() : "");
    const svDuration = sv.duration || "2h";
    return isOverlapping(
      { startTime: targetStart, duration: targetDuration },
      { startTime: svStart, duration: svDuration }
    );
  });
}

function filterStaffForRequirement(staffList: Staff[], requiredSpecialty?: string) {
  if (!staffList || staffList.length === 0) return [];
  if (!requiredSpecialty || requiredSpecialty === "" || requiredSpecialty.includes("tự chọn")) {
    return staffList;
  }
  const req = requiredSpecialty.toLowerCase().trim();

  // Phát hiện trực tiếp loại chuyên gia từ form đặt lịch của khách hàng
  // Khách hàng chọn "Điều dưỡng viên" hoặc "Vật lý trị liệu"
  const wantsNurseExplicit =
    req === "điều dưỡng viên" ||
    req === "điều dưỡng" ||
    req.startsWith("điều dưỡng");

  const wantsPhysioExplicit =
    req === "vật lý trị liệu" ||
    req === "chuyên viên vật lý trị liệu" ||
    req.startsWith("vật lý");

  // Kiểm tra nếu yêu cầu thuộc nhóm Vật lý trị liệu / Phục hồi chức năng
  const wantsPhysio = wantsPhysioExplicit ||
    (!wantsNurseExplicit && (
      req.includes("vật lý") ||
      req.includes("trị liệu") ||
      req.includes("vltl") ||
      req.includes("phục hồi")
    ));

  // Hàm kiểm tra nhân viên thuộc nhóm VLTL hay nhóm Điều dưỡng
  const isPhysioStaff = (st: Staff) => {
    const savedType = ((st as any).staffType || "").toLowerCase();
    if (savedType) {
      return (
        savedType.includes("vật lý") ||
        savedType.includes("vltl") ||
        savedType.includes("trị liệu")
      );
    }
    const roleLower = (st.role || "").toLowerCase();
    const deptLower = (st.department || "").toLowerCase();
    return (
      roleLower.includes("vltl") ||
      roleLower.includes("vật lý") ||
      deptLower.includes("phục hồi") ||
      deptLower.includes("vật lý")
    );
  };

  // Ưu tiên hiển thị đúng nhóm chuyên môn lên đầu danh sách combobox
  // Nếu KH chọn rõ "Điều dưỡng viên" → nhóm Điều dưỡng lên đầu
  // Nếu KH chọn rõ "Vật lý trị liệu" → nhóm VLTL lên đầu
  const matchingGroup = staffList.filter((st) =>
    wantsPhysio ? isPhysioStaff(st) : !isPhysioStaff(st)
  );
  const otherGroup = staffList.filter((st) =>
    wantsPhysio ? !isPhysioStaff(st) : isPhysioStaff(st)
  );

  return [...matchingGroup, ...otherGroup];
}

function ApproveVisitsDialog({
  pendingVisits,
  onApprove,
  onReject,
  staffList,
  allVisits = [],
  onToast,
}: {
  pendingVisits: Visit[];
  onApprove: (id: string, staffId: string) => void;
  onReject: (id: string, reason?: string) => void;
  staffList: Staff[];
  allVisits?: Visit[];
  onToast?: (msg: string, type: "ok" | "err") => void;
}) {
  const [selectedStaffMap, setSelectedStaffMap] = React.useState<Record<string, string>>({});
  const [rejectingVisitId, setRejectingVisitId] = React.useState<string | null>(null);
  const [selectedReason, setSelectedReason] = React.useState("Lịch làm việc của chuyên gia bận / quá tải ca trực");
  const [customReason, setCustomReason] = React.useState("");

  const PRESET_REASONS = [
    "Lịch làm việc của chuyên gia bận / quá tải ca trực",
    "Khung giờ yêu cầu trùng với ca khám khác",
    "Thông tin bệnh nhân chưa đầy đủ hoặc không hợp lệ",
    "Dịch vụ không đáp ứng tại thời điểm này",
    "Khác (Tự nhập lý do bên dưới)",
  ];

  const handleConfirmReject = (id: string) => {
    const finalReason =
      selectedReason === "Khác (Tự nhập lý do bên dưới)"
        ? customReason.trim() || "Phòng khám chưa sắp xếp được lịch phù hợp"
        : selectedReason;
    onReject(id, finalReason);
    setRejectingVisitId(null);
    setCustomReason("");
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            className={cn(
              "relative border rounded-[24px] px-6 h-14 font-black text-xs uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-sm duration-200 bg-white",
              pendingVisits.length > 0
                ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
                : "hover:bg-slate-50 border-hairline text-slate-700",
            )}
          >
            <Bell
              className={cn(
                "w-4.5 h-4.5 shrink-0",
                pendingVisits.length > 0
                  ? "text-amber-600 animate-bounce"
                  : "text-slate-400",
              )}
            />
            Duyệt lịch hẹn
            {pendingVisits.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white rounded-full text-[9px] font-black w-6 h-6 flex items-center justify-center animate-pulse shadow-md shadow-orange-500/20">
                {pendingVisits.length}
              </span>
            )}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[620px] rounded-[32px] border-hairline shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
        <div className="pt-5 px-9 pb-7">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-3 border-b border-slate-100 mb-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <Bell className="w-5.5 h-5.5" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">
                Yêu cầu chờ duyệt
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-xs font-semibold leading-tight">
                Phê duyệt hoặc từ chối các yêu cầu đặt lịch hẹn của bệnh nhân.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {pendingVisits.length > 0 ? (
              pendingVisits.map((visit) => (
                <div key={visit.id}>
                  {rejectingVisitId === visit.id ? (
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider">
                          Chọn lý do từ chối #{visit.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRejectingVisitId(null)}
                          className="text-rose-400 hover:text-rose-600 text-xs font-bold cursor-pointer"
                        >
                          ✕ Hủy
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {PRESET_REASONS.map((r) => (
                          <label
                            key={r}
                            className={cn(
                              "flex items-center gap-2.5 p-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-all",
                              selectedReason === r
                                ? "bg-white border-rose-400 text-rose-900 shadow-xs"
                                : "bg-white/60 border-rose-100 text-slate-600 hover:bg-white"
                            )}
                          >
                            <input
                              type="radio"
                              name={`reason-${visit.id}`}
                              checked={selectedReason === r}
                              onChange={() => setSelectedReason(r)}
                              className="accent-rose-600 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span>{r}</span>
                          </label>
                        ))}
                      </div>

                      {selectedReason === "Khác (Tự nhập lý do bên dưới)" && (
                        <Input
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          placeholder="Nhập lý do cụ thể gửi bệnh nhân..."
                          className="text-xs bg-white border-rose-200 h-9 rounded-xl focus:ring-rose-400"
                        />
                      )}

                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={() => handleConfirmReject(visit.id)}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-black uppercase tracking-widest rounded-xl h-9 shadow-sm"
                        >
                          Xác nhận từ chối
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100/80 space-y-3"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                              #{visit.id}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              📅 {visit.date || "Hôm nay"} ({visit.time})
                            </span>
                          </div>
                          <h4 className="font-black text-sm uppercase text-slate-800 leading-tight mt-1.5">
                            {visit.type}
                          </h4>

                          {/* Full Customer Information Card */}
                          <div className="mt-2.5 p-3 rounded-xl bg-white border border-amber-100 space-y-1.5 text-[11px] text-slate-700">
                            <p className="font-extrabold text-blue-950">
                              👤 Bệnh nhân: <span className="text-slate-800 font-bold">{visit.patientName}</span>
                            </p>
                            <p className="font-semibold text-slate-600">
                              📞 Khách hàng: <span className="text-slate-800 font-bold">{visit.userName || "Khách hàng"}</span>
                              {((visit as any).userPhone || (visit as any).phone) && ` • SĐT: ${(visit as any).userPhone || (visit as any).phone}`}
                              {((visit as any).userEmail || (visit as any).email) && ` • ${(visit as any).userEmail || (visit as any).email}`}
                            </p>
                            {((visit as any).address || (visit as any).customerArea) && (
                              <p className="font-semibold text-slate-600 leading-snug">
                                📍 Địa chỉ khám: <span className="text-slate-800 font-bold">{(visit as any).address || (visit as any).customerArea}</span>
                              </p>
                            )}
                            {(visit as any).careMode && (
                              <p className="font-bold text-emerald-700">
                                📌 Hình thức: {(visit as any).careMode === "hourly" ? "⏱️ Chăm sóc theo giờ" : "📦 Gói dài hạn"}
                                {(visit as any).packagePlan ? ` (${(visit as any).packagePlan})` : ""}
                              </p>
                            )}
                            {(visit as any).requiredSpecialty && (
                              <p className="font-extrabold text-indigo-700">
                                🩺 Yêu cầu chuyên môn: <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-200">{(visit as any).requiredSpecialty}</span>
                              </p>
                            )}
                            {((visit as any).notes || visit.paymentNote) && (
                              <p className="font-medium text-slate-500 italic text-[10px]">
                                📝 Mô tả/Triệu chứng: {(visit as any).notes || visit.paymentNote}
                              </p>
                            )}
                            {visit.paymentMethod && (
                              <p className="font-bold text-slate-600">
                                💳 Thanh toán: <span className="text-blue-600">{visit.paymentMethod}</span>
                                {visit.paymentAmount && ` (${parseCurrencyNumber(visit.paymentAmount).toLocaleString("vi-VN")}đ)`}
                              </p>
                            )}
                          </div>

                          {/* Currently Assigned / Selected Staff */}
                          <div className="mt-2.5 flex items-center justify-between">
                            <p className="text-[11px] text-indigo-700 font-extrabold uppercase tracking-wider">
                              CG Đã chọn:{" "}
                              <span className="text-indigo-950 font-black">
                                {(() => {
                                  const selId = selectedStaffMap[visit.id] || (visit.staffId !== "PENDING" ? visit.staffId : "");
                                  const st = staffList.find((s) => isStaffMatch(s, selId, (visit as any).staffName));
                                  return st ? `${st.name} (${st.specialty || st.role || st.department || "Chuyên gia"})` : "Chưa chọn chuyên gia";
                                })()}
                              </span>
                            </p>
                          </div>

                          {/* Filtered Staff selector by Customer Requirement & Time Conflict check */}
                          <div className="mt-2.5 flex items-center gap-2">
                            {(() => {
                              const reqSpecialty = (visit as any).requiredSpecialty || "";
                              const req = reqSpecialty.toLowerCase().trim();

                              // Xác định nhóm chuyên môn khách hàng muốn
                              const wantsPhysio =
                                req.startsWith("vật lý") ||
                                req.includes("vltl") ||
                                req.includes("trị liệu") ||
                                req.includes("phục hồi");
                              const wantsNurse =
                                req.startsWith("điều dưỡng");

                              const isPhysioStaff = (st: Staff) => {
                                const savedType = ((st as any).staffType || "").toLowerCase();
                                if (savedType) {
                                  return savedType.includes("vật lý") || savedType.includes("vltl") || savedType.includes("trị liệu");
                                }
                                const r = (st.role || "").toLowerCase();
                                const d = (st.department || "").toLowerCase();
                                return r.includes("vltl") || r.includes("vật lý") || d.includes("phục hồi") || d.includes("vật lý");
                              };

                              const hasFilter = wantsPhysio || wantsNurse;
                              let matchingGroup: Staff[] = [];
                              let otherGroup: Staff[] = [];

                              if (hasFilter) {
                                matchingGroup = staffList.filter((st) => wantsPhysio ? isPhysioStaff(st) : !isPhysioStaff(st));
                                otherGroup = staffList.filter((st) => wantsPhysio ? !isPhysioStaff(st) : isPhysioStaff(st));
                              }

                              const currentVal = selectedStaffMap[visit.id] || (visit.staffId && visit.staffId !== "PENDING" ? visit.staffId : "");

                              const renderItem = (st: Staff) => {
                                const hasConflict = checkStaffConflict(st, visit, allVisits);
                                return (
                                  <SelectItem
                                    key={st.id}
                                    value={st.id || ""}
                                    disabled={hasConflict}
                                    className={cn(
                                      "cursor-pointer py-1.5 font-bold text-xs",
                                      hasConflict && "opacity-50 text-rose-500 bg-rose-50/40"
                                    )}
                                  >
                                    <span>{st.name} ({st.specialty || st.role || st.department || "Chuyên gia"})</span>
                                    {hasConflict && (
                                      <span className="ml-2 text-[9px] font-black text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200">
                                        [🔴 Trùng lịch]
                                      </span>
                                    )}
                                  </SelectItem>
                                );
                              };

                              return (
                                <Select
                                  value={currentVal}
                                  onValueChange={(val) => {
                                    setSelectedStaffMap((prev) => ({ ...prev, [visit.id]: val ?? "" }));
                                  }}
                                >
                                  <SelectTrigger className="h-9 text-[10px] font-bold bg-white border-amber-200 rounded-xl focus:ring-1 focus:ring-amber-400 flex-1">
                                    <SelectValue placeholder="Chọn chuyên gia...">
                                      {(() => {
                                        const assigned = staffList.find((s) => isStaffMatch(s, currentVal, (visit as any).staffName));
                                        return assigned ? `${assigned.name} (${assigned.specialty || assigned.role || assigned.department || "Chuyên gia"})` : "Chọn chuyên gia...";
                                      })()}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent className="bg-white rounded-xl text-xs font-bold p-1 max-h-60">
                                    {hasFilter ? (
                                      <>
                                        {matchingGroup.length > 0 && (
                                          <>
                                            <div className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 rounded-lg mb-1 border border-emerald-100">
                                              ✅ Phù hợp yêu cầu ({wantsPhysio ? "Vật lý trị liệu" : "Điều dưỡng"})
                                            </div>
                                            {matchingGroup.map(renderItem)}
                                          </>
                                        )}
                                        {otherGroup.length > 0 && (
                                          <>
                                            <div className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 rounded-lg mt-2 mb-1 border border-slate-100">
                                              ↓ Nhóm khác
                                            </div>
                                            {otherGroup.map(renderItem)}
                                          </>
                                        )}
                                      </>
                                    ) : (
                                      staffList.map(renderItem)
                                    )}
                                  </SelectContent>
                                </Select>
                              );
                            })()}


                            <button
                              type="button"
                              onClick={() => {
                                const reqSpecialty = (visit as any).requiredSpecialty || "";
                                const candidateStaff = filterStaffForRequirement(staffList, reqSpecialty);
                                const bestStaff = candidateStaff.find((st) => !checkStaffConflict(st, visit, allVisits));
                                if (bestStaff?.id) {
                                  setSelectedStaffMap((prev) => ({ ...prev, [visit.id]: bestStaff.id! }));
                                  if (onToast) onToast(`Đã gợi ý chuyên gia: ${bestStaff.name}. Bấm Phê duyệt để xác nhận!`, "ok");
                                } else {
                                  if (onToast) onToast("Không có chuyên gia phù hợp không trùng lịch!", "err");
                                }
                              }}
                              className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-wider rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shrink-0 shadow-xs cursor-pointer"
                              title="Gợi ý chọn chuyên gia phù hợp nhất không trùng lịch"
                            >
                              ⚡ AI Gợi ý
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1 border-t border-amber-100">
                        <Button
                          onClick={() => {
                            const chosenStaffId = selectedStaffMap[visit.id] || (visit.staffId !== "PENDING" ? visit.staffId : "");
                            if (!chosenStaffId) {
                              alert("Vui lòng chọn Chuyên gia / Điều dưỡng cho ca trực trước khi phê duyệt!");
                              return;
                            }
                            onApprove(visit.id, chosenStaffId);
                          }}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl h-9 shadow-sm"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1.5" /> Phê duyệt
                        </Button>
                        <Button
                          onClick={() => {
                            setRejectingVisitId(visit.id);
                            setSelectedReason("Lịch làm việc của chuyên gia bận / quá tải ca trực");
                            setCustomReason("");
                          }}
                          variant="outline"
                          className="flex-1 text-rose-500 border-rose-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-[9px] font-black uppercase tracking-widest rounded-xl h-9 shadow-none"
                        >
                          <X className="w-3 h-3 mr-1.5" /> Từ chối
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 space-y-3 bg-white">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-tight">
                    Tất cả đã được xử lý
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    Không có yêu cầu chờ duyệt nào.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentFormDialog({
  open,
  onOpenChange,
  confirmedVisits,
  paymentInfo,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  confirmedVisits: Visit[];
  paymentInfo: Record<
    string,
    { paymentMethod: string; paymentAmount: string; paymentNote: string }
  >;
  onSave: (
    visitId: string,
    paymentMethod: string,
    paymentAmount: string,
    paymentNote: string,
  ) => void;
}) {
  const [selectedVisitId, setSelectedVisitId] = React.useState(
    confirmedVisits[0]?.id ?? "",
  );
  const [paymentMethod, setPaymentMethod] = React.useState("Tiền mặt");
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentNote, setPaymentNote] = React.useState("");

  React.useEffect(() => {
    if (
      confirmedVisits.length > 0 &&
      !confirmedVisits.some((v) => v.id === selectedVisitId)
    ) {
      setSelectedVisitId(confirmedVisits[0].id);
    }
  }, [confirmedVisits, selectedVisitId]);

  React.useEffect(() => {
    if (!open) return;
    const saved = paymentInfo[selectedVisitId];
    if (saved) {
      setPaymentMethod(saved.paymentMethod);
      setPaymentAmount(saved.paymentAmount);
      setPaymentNote(saved.paymentNote);
    }
  }, [open, selectedVisitId, paymentInfo]);

  const selectedVisit = confirmedVisits.find((v) => v.id === selectedVisitId);
  const isValid = selectedVisitId && paymentAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-[28px] border border-slate-200 shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedVisitId) return;
            onSave(selectedVisitId, paymentMethod, paymentAmount, paymentNote);
          }}
          className="p-8"
        >
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                Thanh toán cho lịch đã duyệt
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">
                Chọn bệnh nhân được duyệt và hoàn tất thanh toán ngay trên hệ
                thống.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="space-y-2 text-left">
              <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                Ca đã xác nhận
              </Label>
              <Select
                value={selectedVisitId}
                onValueChange={(val) => setSelectedVisitId(val ?? "")}
                required
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none text-slate-800 transition-all">
                  <SelectValue placeholder="Chọn lịch đã xác nhận..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                  {confirmedVisits.map((visit) => (
                    <SelectItem
                      key={visit.id}
                      value={visit.id}
                      className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                    >
                      {visit.patientName} • {visit.type} • {visit.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedVisit && (
              <div className="rounded-3xl border border-slate-200 p-4 bg-slate-50 text-slate-700">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-3">
                  Thông tin ca đã duyệt
                </p>
                <p className="text-sm font-black text-slate-900">
                  {selectedVisit.patientName}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {selectedVisit.type}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {selectedVisit.time}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Phương thức thanh toán
                </Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val ?? "Tiền mặt")}
                  required
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none text-slate-800 transition-all">
                    <SelectValue placeholder="Chọn phương thức..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    {[
                      "Tiền mặt",
                      "Chuyển khoản",
                      "Ví điện tử",
                      "Thẻ tín dụng",
                    ].map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-left">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Số tiền
                </Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Nhập số tiền"
                  required
                  className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none text-slate-800 px-3"
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                Ghi chú thanh toán
              </Label>
              <Textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Thêm ghi chú hoặc mô tả..."
                className="w-full rounded-3xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-none"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="pt-6 mt-6 border-t border-slate-100 flex-col gap-3 bg-white">
            <Button
              type="submit"
              disabled={!isValid}
              className="w-full rounded-xl h-11 bg-violet-500 text-white text-xs font-black uppercase tracking-[0.15em] shadow-sm hover:bg-violet-600"
            >
              Lưu thanh toán
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              Đóng
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SessionCard({
  visit,
  staffName,
  onEdit,
  onDelete,
  onStatusChange,
  staffList,
  patientList,
  allVisits,
  visitTypes = DEFAULT_VISIT_TYPES,
  selectedDate,
}: {
  visit: Visit;
  staffName?: string;
  onEdit: (v: Visit) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: VisitStatus) => void;
  staffList: Staff[];
  patientList: Patient[];
  allVisits: Visit[];
  visitTypes?: string[];
  selectedDate?: string;
}) {
  const left = getPositionPercent(visit.time, visit.startTime ?? undefined);
  const width = getWidthPercent(visit.duration, visit.time, visit.packageShift ?? undefined);
  const displayTime = formatVisitDisplayTime(visit);
  const isOngoing = visit.status === "Đang thực hiện";
  const isPending = visit.status === "Chờ duyệt";
  const isConfirmed = visit.status === "Đã xác nhận";
  const isCompleted = visit.status === "Đã hoàn tất";
  const statusColor = isOngoing
      ? "bg-primary text-white"
      : isPending
        ? "bg-slate-100 text-slate-500"
        : isConfirmed
          ? "bg-blue-50 text-blue-600"
          : isCompleted
            ? "bg-emerald-50 text-emerald-700"
            : "bg-surface-secondary text-muted-foreground";

  const cardRef = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [tooltipPos, setTooltipPos] = React.useState({
    top: 0,
    left: 0,
    arrowLeft: 0,
  });
  const hoverTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const TOOLTIP_WIDTH = 440;

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      let tooltipLeft = cardCenterX - TOOLTIP_WIDTH / 2;
      tooltipLeft = Math.max(
        12,
        Math.min(tooltipLeft, window.innerWidth - TOOLTIP_WIDTH - 12),
      );
      const arrowLeft = cardCenterX - tooltipLeft;
      setTooltipPos({
        top: rect.top + window.scrollY - 6,
        left: tooltipLeft,
        arrowLeft: Math.max(20, Math.min(arrowLeft, TOOLTIP_WIDTH - 28)),
      });
    }
    setHovered(true);
  };
  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setHovered(false);
    }, 150);
  };

  const tooltipContent = ReactDOM.createPortal(
    <div
      className="pointer-events-none"
      style={{
        position: "absolute",
        top: tooltipPos.top,
        left: tooltipPos.left,
        width: TOOLTIP_WIDTH,
        height: 0,
        zIndex: 99999,
      }}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="tooltip"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="pointer-events-auto"
            style={{
              position: "absolute",
              bottom: 6,
              left: 0,
              right: 0,
              transformOrigin: `${tooltipPos.arrowLeft}px bottom`,
            }}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="bg-white rounded-[22px] p-4 shadow-[0_16px_45px_-8px_rgba(0,0,0,0.20)] border border-slate-200/90 text-left space-y-2.5">
              {/* Header: Service Name & Status */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-[9px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                      #{visit.id}
                    </span>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">
                      {visit.type}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shrink-0 shadow-xs",
                      statusColor,
                    )}
                  >
                    {visit.status}
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Information Grid: 2 Compact Columns */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Column 1: Patient & Time */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        Bệnh nhân
                      </p>
                      <p className="text-[11px] font-black text-slate-900 truncate mt-0.5">
                        {visit.patientName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        Thời gian ({visit.duration || "1h"})
                      </p>
                      <p className="text-[11px] font-black font-mono text-slate-900 truncate mt-0.5">
                        {displayTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 2: Specialist & Contact */}
                <div className="p-2.5 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[7.5px] font-black text-indigo-500 uppercase tracking-widest leading-none">
                        Chuyên gia
                      </p>
                      <p className="text-[11px] font-black text-indigo-950 truncate mt-0.5">
                        {staffName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-indigo-100/80">
                    <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[7.5px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                        Số điện thoại
                      </p>
                      <p className="text-[11px] font-black text-slate-900 truncate mt-0.5">
                        {(visit as any).userPhone || "Chưa nhập SĐT"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Badges Row: Hình thức, Chuyên môn & Thanh toán */}
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg">
                  📌 {(visit as any).careMode === "hourly"
                    ? "Theo giờ"
                    : (visit as any).packagePlan === "30days"
                    ? "Gói tháng (30d)"
                    : (visit as any).packagePlan === "14days"
                    ? "Gói 14 ngày"
                    : (visit as any).packagePlan === "7days"
                    ? "Gói 7 ngày"
                    : "Gói dài hạn"}
                  {(visit as any).packageShift ? ` (${(visit as any).packageShift})` : ""}
                </span>

                {(visit as any).requiredSpecialty && (
                  <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-lg">
                    🩺 {(visit as any).requiredSpecialty}
                  </span>
                )}

                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-lg">
                  💳 {visit.paymentAmount ? `${parseCurrencyNumber(visit.paymentAmount).toLocaleString("vi-VN")}đ` : "Theo gói"}
                  {visit.paymentMethod ? ` (${visit.paymentMethod})` : ""}
                </span>
              </div>

              {/* 📍 Địa chỉ & 📝 Ghi chú */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 text-[11px] text-slate-700 bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-bold truncate">
                    📍 {(visit as any).address || "Chưa cập nhật địa chỉ"}
                  </span>
                </div>

                {((visit as any).notes || (visit.paymentNote && !visit.paymentNote.startsWith("Lý do hủy:"))) && (
                  <div className="flex items-center gap-2 text-[11px] text-amber-800 bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                    <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-semibold truncate">
                      📝 {(visit as any).notes || visit.paymentNote}
                    </span>
                  </div>
                )}
              </div>

              {/* Status transition buttons */}
              {isConfirmed && onStatusChange && (
                <div className="pt-1 border-t border-slate-100">
                  <Button
                    onClick={() => {
                      setHovered(false);
                      onStatusChange(visit.id, "Đã hoàn tất" as VisitStatus);
                    }}
                    size="sm"
                    className="w-full h-8 text-[9px] font-black uppercase tracking-widest rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-95 shadow-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn thành khám
                  </Button>
                </div>
              )}

              <div className="pt-1 border-t border-slate-100">
                {!isCompleted ? (
                  <Button
                    onClick={() => {
                      setHovered(false);
                      setEditOpen(true);
                    }}
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-[9px] font-black uppercase tracking-widest rounded-xl border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                  >
                    <Pencil className="w-3 h-3 mr-1" /> Sửa ca trực
                  </Button>
                ) : (
                  <Button
                    disabled
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-[9px] font-black uppercase tracking-widest rounded-xl border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed opacity-60"
                  >
                    <Pencil className="w-3 h-3 mr-1" /> Sửa ca trực (Đã hoàn tất)
                  </Button>
                )}
              </div>
              {isOngoing && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[8px] font-black text-primary-strong uppercase tracking-widest">
                      Đang thực hiện
                    </span>
                    <span className="text-[8px] font-mono font-black text-on-surface-tertiary">
                      65%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "65%" }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: 0.1,
                      }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              )}
              {isCompleted && (
                <div className="mt-3 pt-3 border-t border-emerald-200 bg-emerald-50 -mx-4 -mb-4 px-4 pb-3 rounded-b-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">
                        Đã hoàn tất
                      </p>
                      {visit.paymentAmount && (
                        <p className="text-[11px] font-black text-emerald-800">
                          {parseCurrencyNumber(visit.paymentAmount).toLocaleString("vi-VN")}đ
                          {visit.paymentMethod && (
                            <span className="text-[9px] font-bold text-emerald-600 ml-1">
                              ({visit.paymentMethod})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="relative h-2" style={{ marginTop: "-1px" }}>
              <div
                className="absolute w-3 h-3 rotate-45 -top-1.5 bg-white border-b border-r border-slate-200/80"
                style={{ left: tooltipPos.arrowLeft - 6 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "absolute h-[80px] top-1.5 rounded-[12px] p-2.5 flex flex-col justify-between cursor-pointer border shadow-sm text-left overflow-hidden",
          isOngoing
            ? "bg-white border-primary/40 text-foreground ring-4 ring-primary/5"
            : isPending
              ? "bg-slate-50/80 border-dashed border-slate-300 text-slate-400 opacity-80"
              : isConfirmed
                ? "bg-white border-hairline text-foreground"
                : isCompleted
                  ? "bg-emerald-50/60 border-emerald-200 text-foreground"
                  : "bg-surface-secondary/50 border-hairline text-muted-foreground",
        )}
        style={{
          left: `${left}%`,
          width: `${width}%`,
          zIndex: hovered ? 50 : 10,
        }}
      >

        {isOngoing && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_0_10px_rgba(24,190,102,0.5)]" />
        )}
        {isPending && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-300 rounded-t-full" />
        )}
        {isCompleted && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-t-full" />
        )}
        <div className="flex items-center gap-1 min-w-0 overflow-hidden">
          <p
            className={cn(
              "font-black text-[9px] uppercase tracking-tight leading-none transition-colors whitespace-nowrap overflow-hidden",
              hovered ? "text-primary" : "text-slate-800",
            )}
          >
            {visit.type}
          </p>
          {isOngoing && (
            <div className="flex items-center gap-1 bg-surface-tinted px-1 py-0.5 rounded-full border border-primary/10 shrink-0 ml-auto">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            </div>
          )}
          {isPending && (
            <span className="text-[7px] font-black text-amber-600 uppercase bg-amber-100 border border-amber-200 px-1 py-0.5 rounded-full shrink-0 ml-auto whitespace-nowrap">
              Chờ
            </span>
          )}
          {isCompleted && (
            <span className="text-[7px] font-black text-emerald-700 uppercase bg-emerald-100 border border-emerald-200 px-1 py-0.5 rounded-full shrink-0 ml-auto whitespace-nowrap">
              ✓ Thanh toán
            </span>
          )}
          {!isOngoing && !isPending && !isCompleted && visit.userId && (
            <span className="text-[7px] font-black text-indigo-400 uppercase bg-indigo-50 border border-indigo-100 px-1 py-0.5 rounded-full shrink-0 ml-auto whitespace-nowrap">
              App
            </span>
          )}
        </div>
        <div className="flex flex-col min-w-0 overflow-hidden">
          <span className="text-[10px] font-bold text-slate-900 leading-tight whitespace-nowrap overflow-hidden">
            {visit.patientName}
          </span>
          <span className="text-[8px] font-black font-mono uppercase tracking-[0.05em] text-on-surface-tertiary mt-0.5 whitespace-nowrap overflow-hidden">
            {displayTime}
          </span>
        </div>
      </motion.div>
      {tooltipContent}
      <SessionFormDialog
        mode="edit"
        visit={visit}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(data) => {
          onEdit({ ...visit, ...data });
          setEditOpen(false);
        }}
        trigger={<button className="hidden" />}
        staffList={staffList}
        patientList={patientList}
        allVisits={allVisits}
        visitTypes={visitTypes}
        selectedDate={selectedDate}
      />
      <DeleteDialog
        visit={visit}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDelete={(id) => {
          onDelete(id);
          setDeleteOpen(false);
        }}
        trigger={<button className="hidden" />}
      />
    </>
  );
}

export default function SchedulePage() {
  const { show, hide } = useLoading();
  const [toast, setToast] = React.useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = React.useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const [view, setView] = React.useState<"day" | "week" | "month">("day");
  const [allVisits, setAllVisits] = React.useState<Visit[]>([]);
  const [staffList, setStaffList] = React.useState<Staff[]>([]);
  const [patientList, setPatientList] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [visitTypes, setVisitTypes] = React.useState<string[]>(DEFAULT_VISIT_TYPES);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("Tất cả");
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [selectedPaymentVisit, setSelectedPaymentVisit] =
    React.useState<string>("");
  const [paymentInfo, setPaymentInfo] = React.useState<
    Record<
      string,
      {
        paymentMethod: string;
        paymentAmount: string;
        paymentNote: string;
      }
    >
  >({});

  const [staffPage, setStaffPage] = React.useState(1);
  const STAFF_PER_PAGE = 5;

  const loadData = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/visits`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } }).then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(`Visits fetch failed ${r.status}: ${text}`);
        try { return JSON.parse(text); } catch { throw new Error(`Visits JSON parse failed: ${text}`); }
      }),
      fetch(`${API_URL}/staff`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } }).then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(`Staff fetch failed ${r.status}: ${text}`);
        try { return JSON.parse(text); } catch { throw new Error(`Staff JSON parse failed: ${text}`); }
      }),
      authFetch(`${API_URL}/patients`).then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(`Patients fetch failed ${r.status}: ${text}`);
        try { return JSON.parse(text); } catch { throw new Error(`Patients JSON parse failed: ${text}`); }
      }),
    ])
      .then(([visits, staff, patients]) => {
        // Normalize visits: map all fields from dat-lich customer booking format
        const normalizedVisits = (Array.isArray(visits) ? visits : []).map((v: any) => ({
          ...v,
          // Ensure all dispatch metadata fields from dat-lich are present
          careMode: v.careMode || null,
          packagePlan: v.packagePlan || null,
          packageShift: v.packageShift || null,
          requiredSpecialty: v.requiredSpecialty || null,
          customerArea: v.customerArea || null,
          address: v.address || v.customerArea || "",
          notes: v.notes || "",
          userPhone: v.userPhone || "",
          userEmail: v.userEmail || "",
          // Ensure staffName shown correctly for PENDING
          staffName: v.staffId === "PENDING" || !v.staffId
            ? "⏳ Chưa phân công"
            : (v.staffName || ""),
        }));

        // Filter PENDING out of staffList (only real staff for dispatch dropdown)
        const realStaff = (Array.isArray(staff) ? staff : []).filter(
          (s: any) => s.id !== "PENDING" && s.email !== "pending@mintcare.com"
        );

        setAllVisits(normalizedVisits);
        setStaffList(realStaff);
        setPatientList(Array.isArray(patients) ? patients : []);
      })
      .catch((err) => console.error("[SchedulePage] Lỗi tải dữ liệu lịch trình:", err))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    loadData();
    const handleFocus = () => loadData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadData]);



  // Fetch service types from API
  React.useEffect(() => {
    fetch(`${API_URL}/services/active`)
      .then((res) => { if (!res.ok) throw new Error("fail"); return res.json() })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setVisitTypes(data.map((s: any) => s.name));
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateSession = async (data: Partial<Visit>) => {
    show("Đang phân công ca trực...")
    const newVisit: Visit = {
      id: `V${Date.now()}`,
      type: data.type ?? "Khám nội khoa",
      patientId: data.patientId ?? "",
      patientName: data.patientName ?? "",
      staffId: data.staffId ?? "",
      time: data.time ?? "",
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration ?? "1h",
      status: (data.status ?? "Đã xác nhận") as VisitStatus,
    };
    try {
      const r = await authFetch(`${API_URL}/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVisit),
      });
      const resData = await r.json();
      if (!r.ok) {
        showToast(resData.error || "Lỗi tạo lịch trực!", "err");
        return;
      }
      setAllVisits((prev) => [...prev, resData]);
      showToast("Tạo ca trực thành công!", "ok");
    } catch (err: any) {
      console.error("[SchedulePage] Lỗi tạo lịch trực:", err);
      showToast(err.message || "Lỗi tạo lịch trực!", "err");
    } finally {
      hide();
    }
  };

  const handleEditSession = async (updated: Visit) => {
    show("Đang cập nhật...")
    try {
      const r = await authFetch(`${API_URL}/visits/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const resData = await r.json();
      if (!r.ok) {
        showToast(resData.error || "Lỗi cập nhật lịch trực!", "err");
        return;
      }
      setAllVisits((prev) => prev.map((v) => (v.id === resData.id ? resData : v)));
      showToast("Cập nhật ca trực thành công!", "ok");
    } catch (err: any) {
      console.error("[SchedulePage] Lỗi cập nhật lịch trực:", err);
      showToast(err.message || "Lỗi cập nhật lịch trực!", "err");
    } finally {
      hide();
    }
  };

  const handleDeleteSession = async (id: string) => {
    show("Đang xóa lịch trực...")
    try {
      const r = await authFetch(`${API_URL}/visits/${id}`, { method: "DELETE" });
      if (r.ok) {
        setAllVisits((prev) => prev.filter((v) => v.id !== id));
        showToast("Đã xóa lịch trực!", "ok");
      }
    } catch (err) {
      console.error("[SchedulePage] Lỗi xóa lịch trực:", err);
    } finally {
      hide();
    }
  };

  const handleApprove = async (id: string, targetStaffId?: string) => {
    const visit = allVisits.find((v) => v.id === id);
    if (!visit) return;

    const finalStaffId = targetStaffId || visit.staffId;
    if (!finalStaffId || finalStaffId === "PENDING") {
      showToast("Vui lòng chọn Chuyên gia / Điều dưỡng trước khi phê duyệt!", "err");
      return;
    }

    const assignedStaff = staffList.find((s) => isStaffMatch(s, finalStaffId));
    const staffName = assignedStaff?.name || "Chuyên gia y tế";

    show("Đang phê duyệt & phân công ca trực...");
    try {
      const r = await authFetch(`${API_URL}/visits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...visit, staffId: finalStaffId, staffName, status: "Đã xác nhận" }),
      });
      const saved = await r.json();
      if (!r.ok) {
        showToast(saved.error || "Lỗi phê duyệt!", "err");
        return;
      }

      // If it's a long-term package, lock this specialist for the entire package period
      if ((visit as any).careMode === "package" || (visit as any).packagePlan) {
        setAllVisits((prev) =>
          prev.map((v) =>
            v.userId === visit.userId && ((v as any).packagePlan || (v as any).careMode === "package")
              ? { ...v, staffId: finalStaffId, staffName, status: "Đã xác nhận" }
              : v.id === saved.id ? saved : v
          )
        );
      } else {
        setAllVisits((prev) => prev.map((v) => (v.id === saved.id ? saved : v)));
      }

      showToast(`Đã phê duyệt và phân công ca trực cho chuyên gia "${staffName}" thành công!`, "ok");
    } catch (err: any) {
      console.error("Lỗi phê duyệt lịch:", err);
      showToast(err?.message || "Lỗi phê duyệt lịch!", "err");
    } finally {
      hide();
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    const visit = allVisits.find((v) => v.id === id);
    const noteText = reason && reason.trim()
      ? `Lý do hủy: ${reason.trim()}`
      : "Lý do hủy: Phòng khám từ chối yêu cầu đặt lịch này (Lịch chuyên viên bận hoặc trùng khung giờ)";

    show("Đang từ chối...");
    try {
      const r = await authFetch(`${API_URL}/visits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...visit,
          status: "Đã hủy",
          paymentNote: noteText,
        }),
      });
      const saved = await r.json();
      if (r.ok) {
        setAllVisits((prev) => prev.map((v) => (v.id === saved.id ? saved : v)));
      }
    } catch (err) {
      console.error("Lỗi từ chối lịch:", err);
    } finally {
      hide();
    }
  };

  const handleStatusChange = async (id: string, newStatus: VisitStatus) => {
    const visit = allVisits.find((v) => v.id === id);
    if (!visit) return;
    show(`Đang cập nhật trạng thái...`);
    try {
      const r = await authFetch(`${API_URL}/visits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...visit, status: newStatus }),
      });
      const saved = await r.json();
      if (!r.ok) {
        showToast(saved.error || "Lỗi cập nhật trạng thái!", "err");
        return;
      }
      setAllVisits((prev) => prev.map((v) => (v.id === saved.id ? saved : v)));
      // Sync patient status after visit status changes
      authFetch(`${API_URL}/visits/sync-patients`, { method: "POST" }).catch(() => {});
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    } finally {
      hide();
    }
  };

  const handleSavePayment = (
    visitId: string,
    paymentMethod: string,
    paymentAmount: string,
    paymentNote: string,
  ) => {
    setPaymentInfo((prev) => ({
      ...prev,
      [visitId]: { paymentMethod, paymentAmount, paymentNote },
    }));
    setAllVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? { ...v, paymentMethod, paymentAmount, paymentNote }
          : v,
      ),
    );
    setSelectedPaymentVisit(visitId);
    setPaymentDialogOpen(false);
  };

  const handleAutoAssign = async (visitId: string) => {
    show("Đang tự động điều phối chuyên gia phù hợp nhất...");
    try {
      const res = await authFetch(`${API_URL}/dispatch/assign/${visitId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Không có chuyên gia phù hợp lịch trực này!", "err");
        return;
      }
      setAllVisits((prev) =>
        prev.map((v) =>
          v.id === visitId
            ? { ...v, staffId: data.staffId, staffName: data.staffName, status: "Đã xác nhận" }
            : v
        )
      );
      showToast(`Đã tự động phân công chuyên gia "${data.staffName}" cho ca trực #${visitId}`, "ok");
    } catch (err: any) {
      showToast(err.message || "Lỗi tự động điều phối!", "err");
    } finally {
      hide();
    }
  };

  const handleManualAssign = async (visitId: string, staffId: string) => {
    show("Đang phân công chuyên gia...");
    try {
      const res = await authFetch(`${API_URL}/dispatch/manual/${visitId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Lỗi phân công chuyên gia!", "err");
        return;
      }
      setAllVisits((prev) =>
        prev.map((v) =>
          v.id === visitId
            ? { ...v, staffId: data.staffId, staffName: data.staffName }
            : v
        )
      );
      showToast("Phân công chuyên gia thành công!", "ok");
    } catch (err: any) {
      showToast(err.message || "Lỗi phân công chuyên gia!", "err");
    } finally {
      hide();
    }
  };

  const confirmedVisits = allVisits.filter((v) => v.status === "Đã xác nhận");


  // Filter logic for timeline
  const filteredVisits = allVisits.filter((v) => {
    const pName = v.patientName?.toLowerCase() || "";
    const staff = staffList.find((s) => isStaffMatch(s, v.staffId, (v as any).staffName));
    const sName = staff?.name?.toLowerCase() || (v as any).staffName?.toLowerCase() || "";
    const type = v.type?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    const matchQuery =
      pName.includes(query) || sName.includes(query) || type.includes(query);

    const matchStatus = statusFilter === "Tất cả" || v.status === statusFilter;

    // Filter by selected date (supports multi-day packages)
    const matchDate = isVisitOnDate(v, selectedDate);

    // Hide only cancelled visits
    const isCancelled = v.status === "Đã hủy";

    return matchQuery && matchStatus && matchDate && !isCancelled;
  });

  const _totalStaffPages = Math.max(1, Math.ceil(staffList.length / STAFF_PER_PAGE));
  const _currentStaffPage = Math.min(staffPage, _totalStaffPages);
  const paginatedStaff = staffList.slice(
    (_currentStaffPage - 1) * STAFF_PER_PAGE,
    _currentStaffPage * STAFF_PER_PAGE
  );

  return (
    <div className="p-10 max-w-7xl mx-auto w-full space-y-5 pb-32">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold border",
              toast.type === "ok"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-600 border-red-200"
            )}
          >
            {toast.type === "ok" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 bg-surface-tinted px-3.5 py-2 rounded-full border border-primary/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="eyebrow text-[10px] font-black uppercase tracking-widest text-primary-strong">
                Lịch phân công ca trực
              </span>
            </div>
            <div className="w-px h-5 bg-hairline" />
            <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">
              {allVisits.length} Ca trực
            </span>
          </div>
          <h1 className="text-6xl font-black tight-tracking text-foreground leading-[1] uppercase">
            Lịch trực <br />
            Chuyên gia
          </h1>
        </motion.div>
      </div>

      {/* Control Bar: Date Navigator (Left) + Duyệt Lịch Hẹn (Right) aligned horizontally */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-1">
        {/* Date Navigator Bar */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] border border-hairline shadow-xl shadow-black/[0.03] flex-wrap">
          <span className="px-3.5 py-2 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wider border border-primary/20 flex items-center gap-1.5">
            📅 {formatVietnameseDate(selectedDate)}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split("T")[0]);
              }}
              className="w-8 h-8 rounded-full border border-hairline bg-white hover:bg-slate-50 flex items-center justify-center transition-all text-slate-600 text-base font-black shadow-xs cursor-pointer"
              title="Ngày trước"
            >‹</button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold border border-hairline rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
            />
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split("T")[0]);
              }}
              className="w-8 h-8 rounded-full border border-hairline bg-white hover:bg-slate-50 flex items-center justify-center transition-all text-slate-600 text-base font-black shadow-xs cursor-pointer"
              title="Ngày tiếp"
            >›</button>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
              className="px-3.5 h-8 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-black hover:bg-primary/20 transition-all uppercase tracking-wider shadow-xs cursor-pointer"
            >Hôm nay</button>
          </div>
        </div>

        {/* Duyệt Lịch Hẹn Button */}
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-[24px] border border-hairline shadow-xl shadow-black/[0.03]">
          <ApproveVisitsDialog
            pendingVisits={allVisits.filter((v) => v.status === "Chờ duyệt")}
            onApprove={handleApprove}
            onReject={handleReject}
            staffList={staffList}
            allVisits={allVisits}
            onToast={showToast}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm lịch trực (bệnh nhân, chuyên gia, dịch vụ)..."
            className="pl-14 h-16 rounded-[24px] bg-white border-hairline focus:ring-8 focus:ring-primary/5 transition-all text-base font-bold shadow-xl shadow-black/[0.02] border-b-2 border-b-hairline placeholder:text-on-surface-tertiary placeholder:font-medium"
          />
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* Status filter pills */}
          <div className="flex bg-slate-100 rounded-[20px] p-1 border border-hairline/60">
            {["Tất cả", "Đang thực hiện", "Đã xác nhận", "Chờ duyệt"].map(
              (status) => (
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
              ),
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4 bg-white rounded-[32px] border border-hairline shadow-sm">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            Đang tải lịch trực từ hệ thống...
          </p>
        </div>
      ) : (
        <div className="border border-hairline rounded-[32px] overflow-hidden bg-white shadow-2xl shadow-black/[0.05] relative">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(#18BE66 1px, transparent 0), linear-gradient(90deg, #18BE66 1px, transparent 0)",
              backgroundSize: "30px 30px",
            }}
          />
          <div
            className="overflow-x-auto relative z-10 scrollbar-none"
            style={{ overflowY: "visible" }}
          >
            <div
              className="w-full min-w-[960px] grid grid-cols-[220px_1fr]"
              style={{ overflowY: "visible" }}
            >
              <div className="sticky left-0 top-0 z-40 bg-white/95 backdrop-blur-xl px-5 flex items-center border-r border-b border-hairline h-[70px]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-surface-tinted flex items-center justify-center text-primary shadow-sm border border-primary/5">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.1em] text-primary-strong">
                    Nhân sự
                  </span>
                </div>
              </div>
              <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl grid grid-cols-12 border-b border-hairline h-[70px] w-full">
                {HOURS.slice(0, -1).map((hour) => (
                  <div
                    key={hour}
                    className="flex items-center justify-center font-black text-[10px] uppercase tracking-[0.1em] text-on-surface-tertiary border-r border-hairline/50 last:border-r-0"
                  >
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                ))}
              </div>
              {paginatedStaff.map((person, idx) => {
                const staffVisits = filteredVisits.filter((v) =>
                  isStaffMatch(person, v.staffId, (v as any).staffName),
                );
                return (
                  <React.Fragment key={person.id}>
                    <div
                      className={cn(
                        "sticky left-0 z-20 backdrop-blur-sm flex items-center gap-3 px-4 py-3 h-[90px] border-r border-b border-hairline group/row transition-all duration-300 hover:bg-surface-tinted/20",
                        idx % 2 === 0 ? "bg-white" : "bg-surface-secondary/20",
                      )}
                    >
                      <div className="relative shrink-0">
                        <div
                          className={cn(
                            "absolute -inset-0.5 rounded-xl opacity-0 group-hover/row:opacity-100 transition-opacity",
                            person.available
                              ? "bg-primary/10"
                              : "bg-orange-100",
                          )}
                        />
                        <img
                          src={
                            person.avatar ||
                            `https://i.pravatar.cc/150?u=${person.id}`
                          }
                          className="relative w-10 h-10 rounded-xl border-2 border-white shadow-md object-cover transition-transform duration-300 group-hover/row:scale-105"
                          alt={person.name}
                        />
                        <div
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full shadow-xs",
                            person.status === "Nghỉ phép"
                              ? "bg-rose-500"
                              : person.status === "Đang bận" || !person.available
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          )}
                        >
                          {person.available && person.status !== "Nghỉ phép" && (
                            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[11px] font-black text-foreground uppercase tracking-tight leading-none mb-1.5 group-hover/row:text-primary transition-colors truncate">
                          {person.name}
                        </p>
                        <p className="text-[9px] text-on-surface-tertiary font-bold uppercase tracking-[0.08em] leading-none mb-1.5 truncate">
                          {String(person.role).split("*")[0].trim()}
                        </p>
                        {person.status === "Nghỉ phép" ? (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Nghỉ phép
                          </span>
                        ) : (person.status === "Đang bận" || !person.available) ? (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300/90 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                            Đang bận
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 border border-emerald-300/90 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Sẵn sàng
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "relative grid grid-cols-12 h-[90px] border-b border-hairline last:border-b-0 group/timeline transition-colors overflow-visible",
                        idx % 2 === 0 ? "bg-white" : "bg-surface-secondary/15",
                      )}
                    >
                      {HOURS.slice(0, -1).map((hour) => (
                        <div
                          key={hour}
                          className="border-r border-hairline/30 last:border-r-0 group-hover/timeline:bg-primary/[0.02] transition-colors"
                        />
                      ))}
                      {staffVisits.map((visit) => (
                        <SessionCard
                          key={visit.id}
                          visit={visit}
                          staffName={person.name}
                          onEdit={handleEditSession}
                          onDelete={handleDeleteSession}
                          onStatusChange={handleStatusChange}
                          staffList={staffList}
                          patientList={patientList}
                          allVisits={allVisits}
                          visitTypes={visitTypes}
                          selectedDate={selectedDate}
                        />
                      ))}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div className="bg-surface-secondary/40 px-6 py-3 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(24,190,102,0.5)]" />
                <span className="text-[9px] font-black text-on-surface-tertiary uppercase tracking-widest">
                  Đang thực hiện
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white border border-hairline shadow-sm" />
                <span className="text-[9px] font-black text-on-surface-tertiary uppercase tracking-widest">
                  Khung giờ trống
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                <span className="text-[9px] font-black text-on-surface-tertiary uppercase tracking-widest">
                  Nhân sự bận
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[10px] font-bold text-slate-500">
                Hiển thị{" "}
                <span className="font-mono font-black text-slate-800">
                  {staffList.length > 0 ? (staffPage - 1) * STAFF_PER_PAGE + 1 : 0}-
                  {Math.min(staffPage * STAFF_PER_PAGE, staffList.length)}
                </span>{" "}
                /{" "}
                <span className="font-mono font-black text-slate-800">{staffList.length}</span> nhân sự
              </span>
              <Pagination
                currentPage={staffPage}
                totalPages={Math.max(1, Math.ceil(staffList.length / STAFF_PER_PAGE))}
                onPageChange={setStaffPage}
                className="py-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
