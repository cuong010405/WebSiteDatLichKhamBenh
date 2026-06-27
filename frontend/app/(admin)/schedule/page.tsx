"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  CalendarPlus,
  Search,
  Settings2,
  Users,
  Calendar as CalendarIcon,
  Sparkles,
  CheckCircle2,
  Bell,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { staff, visits, patients } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Visit, VisitStatus } from "@/lib/types";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
function getPositionPercent(time: string) {
  const [h, m] = time.split(":").map(Number);
  const startHour = 8;
  const totalMinutes = 12 * 60;
  const minutes = (h - startHour) * 60 + m;
  return (minutes / totalMinutes) * 100;
}
function getWidthPercent(duration: string) {
  const hours = parseFloat(duration.replace("h", ""));
  return (hours / 12) * 100;
}

const VISIT_TYPES = [
  "Kiểm tra sức khỏe định kỳ",
  "Vật lý trị liệu",
  "Phục hồi chức năng",
  "Truyền dịch tại nhà",
  "Chăm sóc vết thương",
  "Khám nội khoa",
  "Tư vấn dinh dưỡng",
];

const DURATION_OPTIONS = [
  { value: "0.5h", label: "30 Phút" },
  { value: "1h", label: "1 Giờ" },
  { value: "1.5h", label: "1.5 Giờ" },
  { value: "2h", label: "2 Giờ" },
];

interface SessionFormDialogProps {
  mode: "create" | "edit";
  visit?: Visit;
  onSave: (data: Partial<Visit>) => void;
  trigger: React.ReactElement;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

function SessionFormDialog({ mode, visit, onSave, trigger, open: externalOpen, onOpenChange: externalOnOpenChange }: SessionFormDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    externalOnOpenChange?.(v);
  };
  const [staffId, setStaffId] = React.useState(visit?.staffId ?? "");
  const [patientId, setPatientId] = React.useState(visit?.patientId ?? "");
  const [startTime, setStartTime] = React.useState(visit?.startTime ?? "");
  const [duration, setDuration] = React.useState(visit?.duration ?? "");
  const [visitType, setVisitType] = React.useState(visit?.type ?? "");

  React.useEffect(() => {
    if (open) {
      setStaffId(visit?.staffId ?? "");
      setPatientId(visit?.patientId ?? "");
      setStartTime(visit?.startTime ?? "");
      setDuration(visit?.duration ?? "");
      setVisitType(visit?.type ?? "");
    }
  }, [open, visit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPatient = patients.find((p) => p.id === patientId);
    const durationHours = parseFloat(duration.replace("h", ""));
    const [h, m] = startTime.split(":").map(Number);
    const totalEndMins = h * 60 + m + durationHours * 60;
    const endH = Math.floor(totalEndMins / 60);
    const endM = Math.round(totalEndMins % 60);
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
    onSave({
      staffId,
      patientId,
      patientName: selectedPatient?.name ?? "Benh nhan",
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
        <div className={cn("h-1.5 w-full", mode === "create" ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-blue-400 to-indigo-500")} />
        <form onSubmit={handleSubmit} className="p-8">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100 mb-6">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md", mode === "create" ? "bg-gradient-to-br from-green-400 to-emerald-600 text-white" : "bg-gradient-to-br from-blue-400 to-indigo-600 text-white")}>
              {mode === "create" ? <CalendarPlus className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
            </div>
            <div className="text-left flex-1">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                {mode === "create" ? "Phân công ca trực mới" : "Chỉnh sửa lịch trình"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">
                {mode === "create" ? "Thiết lập phiên làm việc mới cho chuyên gia và bệnh nhân." : "Cập nhật thông tin ca trực hiện tại trong hệ thống."}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Loại dịch vụ</Label>
              <Select value={visitType} onValueChange={(val) => setVisitType(val ?? "")} required>
                <SelectTrigger className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none text-slate-800 transition-all">
                  <SelectValue placeholder="Chọn loại dịch vụ..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                  {VISIT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Chuyên gia phụ trách</Label>
                <Select value={staffId} onValueChange={(val) => setStaffId(val ?? "")} required>
                   <SelectTrigger className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none text-slate-800 transition-all">
                    <SelectValue placeholder="Chọn nhân viên..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{s.name} ({s.department})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Bệnh nhân tiếp nhận</Label>
                <Select value={patientId} onValueChange={(val) => setPatientId(val ?? "")} required>
                   <SelectTrigger className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none text-slate-800 transition-all">
                    <SelectValue placeholder="Chọn bệnh nhân..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Giờ bắt đầu</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Thời lượng</Label>
                <Select value={duration} onValueChange={(val) => setDuration(val ?? "")} required>
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 h-11 min-h-[44px] max-h-[44px] bg-white font-bold text-xs shadow-none text-slate-800 transition-all">
                    <SelectValue placeholder="Chọn thời lượng..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 mt-6 border-t border-slate-100 flex-col sm:flex-col gap-3 bg-white">
            <Button type="submit" disabled={!isValid} className={cn("w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] transition-all group border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5 shadow-md disabled:opacity-40", mode === "create" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-95" : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-95")}>
              {mode === "create" ? "Xác nhận phân công" : "Lưu thay đổi"}{" "}
              <Sparkles className="w-3.5 h-3.5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700">
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
function DeleteDialog({ visit, onDelete, trigger, open: externalOpen, onOpenChange: externalOnOpenChange }: DeleteDialogProps) {
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
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Xác nhận xóa</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">Hành động này không thể hoàn tác.</DialogDescription>
            </div>
          </DialogHeader>
          <div className="bg-red-50/80 border border-red-100 rounded-xl p-4 space-y-1.5 mb-6">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{visit.type}</p>
            <p className="text-[10px] font-bold text-slate-500">Bệnh nhân: <span className="text-slate-700">{visit.patientName}</span></p>
            <p className="text-[10px] font-bold text-slate-500">Thời gian: <span className="text-slate-700 font-mono">{visit.time}</span></p>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={() => { onDelete(visit.id); setOpen(false); }} className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-95 shadow-md shadow-red-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Xóa vĩnh viễn
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">
              Giữ lại
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ApproveVisitsDialog({ pendingVisits, onApprove, onReject }: { pendingVisits: Visit[]; onApprove: (id: string) => void; onReject: (id: string) => void; }) {
  return (
    <Dialog>
      <DialogTrigger render={
        <Button className={cn("relative border rounded-[24px] px-6 h-14 font-black text-xs uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-sm duration-200", pendingVisits.length > 0 ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800" : "bg-white hover:bg-slate-50 border-hairline text-slate-700")}>
          <Bell className={cn("w-4.5 h-4.5 shrink-0", pendingVisits.length > 0 ? "text-amber-600 animate-bounce" : "text-slate-400")} />
          Duyệt lịch hẹn
          {pendingVisits.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white rounded-full text-[9px] font-black w-6 h-6 flex items-center justify-center animate-pulse shadow-md shadow-orange-500/20">
              {pendingVisits.length}
            </span>
          )}
        </Button>
      } />
      <DialogContent className="sm:max-w-[500px] rounded-[28px] border-hairline shadow-2xl p-0 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
        <div className="p-8">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Yêu cầu chờ duyệt</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">Phê duyệt hoặc từ chối các yêu cầu đặt lịch hẹn của bệnh nhân.</DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {pendingVisits.length > 0 ? (
              pendingVisits.map((visit) => (
                <motion.div key={visit.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100/80 space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[8px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">#LH-{visit.id}</span>
                      <h4 className="font-black text-xs uppercase text-slate-800 leading-none mt-2 truncate">{visit.type}</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">BN: {visit.patientName}</p>
                      <p className="text-[10px] text-indigo-600 font-black uppercase tracking-wider mt-0.5">CG: {staff.find((s) => s.id === visit.staffId)?.name || "Chuyên gia"}</p>
                    </div>
                    <span className="text-[10px] font-mono font-black text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-lg shrink-0">{visit.time}</span>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-amber-100">
                    <Button onClick={() => onApprove(visit.id)} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl h-9 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 mr-1.5" /> Phê duyệt
                    </Button>
                    <Button onClick={() => onReject(visit.id)} variant="outline" className="flex-1 text-rose-500 border-rose-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-[9px] font-black uppercase tracking-widest rounded-xl h-9 shadow-none">
                      <X className="w-3 h-3 mr-1.5" /> Từ chối
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Tất cả đã được xử lý</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Không có yêu cầu chờ duyệt nào.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SessionCard({ visit, staffName, onEdit, onDelete }: { visit: Visit; staffName?: string; onEdit: (v: Visit) => void; onDelete: (id: string) => void; }) {
  const left = getPositionPercent(visit.startTime || "08:00");
  const width = getWidthPercent(visit.duration);
  const isOngoing = visit.status === "Đang thực hiện";
  const isPending = visit.status === "Chờ duyệt";
  const isConfirmed = visit.status === "Đã xác nhận";
  const statusColor = isOngoing ? "bg-primary text-white" : isPending ? "bg-slate-100 text-slate-500" : isConfirmed ? "bg-blue-50 text-blue-600" : "bg-surface-secondary text-muted-foreground";

  const cardRef = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [tooltipPos, setTooltipPos] = React.useState({ top: 0, left: 0, arrowLeft: 0 });
  const hoverTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const TOOLTIP_WIDTH = 280;

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      let tooltipLeft = cardCenterX - TOOLTIP_WIDTH / 2;
      tooltipLeft = Math.max(8, Math.min(tooltipLeft, window.innerWidth - TOOLTIP_WIDTH - 8));
      const arrowLeft = cardCenterX - tooltipLeft;
      setTooltipPos({ top: rect.top + window.scrollY - 8, left: tooltipLeft, arrowLeft: Math.max(16, Math.min(arrowLeft, TOOLTIP_WIDTH - 24)) });
    }
    setHovered(true);
  };
  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setHovered(false);
    }, 150);
  };

  const tooltipContent = ReactDOM.createPortal(
    <div className="pointer-events-none" style={{ position: "absolute", top: tooltipPos.top, left: tooltipPos.left, width: TOOLTIP_WIDTH, height: 0, zIndex: 99999 }}>
      <AnimatePresence>
        {hovered && (
          <motion.div key="tooltip" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="pointer-events-auto" style={{ position: "absolute", bottom: 8, left: 0, right: 0, transformOrigin: `${tooltipPos.arrowLeft}px bottom` }} initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.97 }} transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <div className="bg-white rounded-[20px] p-4 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.18)] border border-slate-200/80">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-foreground uppercase tracking-tight leading-none truncate">{visit.type}</p>
                  <p className="text-[9px] text-on-surface-tertiary font-bold mt-1 uppercase tracking-wider">#{visit.id} - {visit.duration}</p>
                </div>
                <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shrink-0", statusColor)}>{visit.status}</span>
              </div>
              <div className="h-px bg-slate-100 mb-3" />
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <p className="text-[8px] text-on-surface-tertiary font-bold uppercase tracking-widest">Bệnh nhân</p>
                    <p className="text-[12px] font-black text-foreground leading-tight">{visit.patientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <p className="text-[8px] text-on-surface-tertiary font-bold uppercase tracking-widest">Thời gian</p>
                    <p className="text-[12px] font-black text-foreground font-mono leading-tight">{visit.time}</p>
                  </div>
                </div>
                {staffName && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div>
                      <p className="text-[8px] text-on-surface-tertiary font-bold uppercase tracking-widest">Chuyên gia</p>
                      <p className="text-[12px] font-black text-foreground leading-tight">{staffName}</p>
                    </div>
                  </div>
                )}
              </div>
              {isOngoing && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[8px] font-black text-primary-strong uppercase tracking-widest">Đang thực hiện</span>
                    <span className="text-[8px] font-mono font-black text-on-surface-tertiary">65%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: "0%" }} animate={{ width: "65%" }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }} className="h-full bg-primary rounded-full" />
                  </div>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                <Button
                  onClick={() => { setHovered(false); setEditOpen(true); }}
                  size="sm" variant="outline"
                  className="flex-1 h-8 text-[9px] font-black uppercase tracking-widest rounded-xl border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                >
                  <Pencil className="w-3 h-3 mr-1" /> Sửa
                </Button>
                <Button
                  onClick={() => { setHovered(false); setDeleteOpen(true); }}
                  size="sm" variant="outline"
                  className="flex-1 h-8 text-[9px] font-black uppercase tracking-widest rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Xóa
                </Button>
              </div>
            </div>
            <div className="relative h-2" style={{ marginTop: "-1px" }}>
              <div className="absolute w-3 h-3 rotate-45 -top-1.5 bg-white border-b border-r border-slate-200/80" style={{ left: tooltipPos.arrowLeft - 6 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
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
          "absolute h-[74px] top-2 rounded-[12px] p-2 flex flex-col justify-between cursor-pointer border shadow-sm",
          isOngoing ? "bg-white border-primary/40 text-foreground ring-4 ring-primary/5" : isPending ? "bg-slate-50/80 border-dashed border-slate-300 text-slate-400 opacity-80" : isConfirmed ? "bg-white border-hairline text-foreground" : "bg-surface-secondary/50 border-hairline text-muted-foreground",
        )}
        style={{ left: `${left}%`, width: `${width}%`, zIndex: hovered ? 50 : 10 }}
      >
        {isOngoing && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_0_10px_rgba(24,190,102,0.5)]" />}
        {isPending && <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-300 rounded-t-full" />}
        <div className="flex items-start justify-between gap-2">
          <p className={cn("font-black text-[10px] uppercase tracking-tight truncate leading-none transition-colors", hovered ? "text-primary" : "")}>{visit.type}</p>
          {isOngoing && <div className="flex items-center gap-1 bg-surface-tinted px-1 py-0.5 rounded-full border border-primary/10 shrink-0"><div className="w-1 h-1 rounded-full bg-primary animate-pulse" /></div>}
          {isPending && <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 border border-slate-200 px-1 py-0.5 rounded-full shrink-0">Chờ</span>}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold truncate opacity-80">{visit.patientName}</span>
          <span className="text-[8px] font-black font-mono uppercase tracking-[0.05em] text-on-surface-tertiary">{visit.time}</span>
        </div>
      </motion.div>
      {tooltipContent}
      <SessionFormDialog
        mode="edit"
        visit={visit}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(data) => { onEdit({ ...visit, ...data }); setEditOpen(false); }}
        trigger={<span />}
      />
      <DeleteDialog
        visit={visit}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDelete={(id) => { onDelete(id); setDeleteOpen(false); }}
        trigger={<span />}
      />
    </>
  );
}

export default function SchedulePage() {
  const [view, setView] = React.useState<"day" | "week" | "month">("day");
  const [allVisits, setAllVisits] = React.useState<Visit[]>([]);

  React.useEffect(() => {
    const stored = localStorage.getItem("mintcare_visits");
    if (stored) {
      const parsed = JSON.parse(stored);
      const formatted: Visit[] = parsed.map((b: any) => ({
        id: b.id, type: b.type, patientId: b.patientId ?? "BN-0842", patientName: b.patientName ?? "Evelyn Green",
        staffId: b.staffId, time: b.time, startTime: b.startTime ?? b.time.split(" - ")[0],
        endTime: b.endTime ?? b.time.split(" - ")[1] ?? "09:00", duration: b.duration ?? "1h", status: b.status,
      }));
      setAllVisits(formatted);
    } else {
      localStorage.setItem("mintcare_visits", JSON.stringify(visits.map((v) => ({
        id: v.id, staffId: v.staffId, staffName: staff.find((s) => s.id === v.staffId)?.name || "Chuyên gia y tế",
        type: v.type, patientId: v.patientId, patientName: v.patientName, date: "2026-06-22",
        time: v.time, startTime: v.startTime ?? v.time.split(" - ")[0], endTime: v.endTime ?? v.time.split(" - ")[1],
        duration: v.duration, status: v.status,
      }))));
      setAllVisits(visits);
    }
  }, []);

  const saveVisits = (updated: Visit[]) => {
    setAllVisits(updated);
    localStorage.setItem("mintcare_visits", JSON.stringify(updated.map((v) => ({
      id: v.id, staffId: v.staffId, staffName: staff.find((s) => s.id === v.staffId)?.name || "Chuyên gia y tế",
      type: v.type, patientId: v.patientId, patientName: v.patientName, date: "2026-06-22",
      time: v.time, startTime: v.startTime, endTime: v.endTime, duration: v.duration, status: v.status,
    }))));
  };

  const handleCreateSession = (data: Partial<Visit>) => {
    const newVisit: Visit = {
      id: `V${Date.now()}`, type: data.type ?? "Khám nội khoa", patientId: data.patientId ?? "",
      patientName: data.patientName ?? "", staffId: data.staffId ?? "", time: data.time ?? "",
      startTime: data.startTime, endTime: data.endTime, duration: data.duration ?? "1h", status: "Đã xác nhận" as VisitStatus,
    };
    saveVisits([...allVisits, newVisit]);
  };

  const handleEditSession = (updated: Visit) => saveVisits(allVisits.map((v) => (v.id === updated.id ? updated : v)));
  const handleDeleteSession = (id: string) => saveVisits(allVisits.filter((v) => v.id !== id));
  const handleApprove = (id: string) => saveVisits(allVisits.map((v) => (v.id === id ? { ...v, status: "Đã xác nhận" as VisitStatus } : v)));
  const handleReject = (id: string) => saveVisits(allVisits.filter((v) => v.id !== id));

  return (
    <div className="p-10 max-w-7xl mx-auto w-full space-y-16 pb-32">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-surface-tinted px-3.5 py-2 rounded-full border border-primary/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="eyebrow text-[10px] font-black uppercase tracking-widest">Giam sat dieu phoi</span>
            </div>
            <div className="w-px h-5 bg-hairline" />
            <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">Cap nhat 2p truoc</span>
          </div>
          <h1 className="text-6xl font-black tight-tracking text-foreground leading-[1] uppercase">Lich truc <br />Chuyen gia</h1>
        </motion.div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-[24px] border border-hairline shadow-xl shadow-black/[0.03]">
          <ApproveVisitsDialog pendingVisits={allVisits.filter((v) => v.status === "Chờ duyệt")} onApprove={handleApprove} onReject={handleReject} />
          <div className="w-px h-6 bg-hairline" />
          <div className="flex bg-surface-secondary rounded-[16px] p-1 border border-hairline/50">
            {(["day", "week", "month"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cn("px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-[12px] transition-all duration-300", view === v ? "bg-white text-primary shadow-lg shadow-black/[0.08] scale-105" : "text-on-surface-tertiary hover:bg-white/50")}>
                {v === "day" ? "Ngay" : v === "week" ? "Tuan" : "Thang"}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-hairline" />
          <SessionFormDialog mode="create" onSave={handleCreateSession} trigger={
            <Button className="bg-primary text-white rounded-full px-8 py-3 font-black text-sm flex items-center gap-3 hover:opacity-95 transition-all shadow-2xl shadow-primary/20 h-14 uppercase tracking-widest border-b-4 border-white/10 active:border-b-0 active:translate-y-1">
              <CalendarPlus className="w-5 h-5" /> Phan cong ca truc
            </Button>
          } />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
          <Input placeholder="Tim kiem..." className="pl-14 h-16 rounded-[24px] bg-white border-hairline focus:ring-8 focus:ring-primary/5 transition-all text-base font-bold shadow-xl shadow-black/[0.02] border-b-2 border-b-hairline placeholder:text-on-surface-tertiary placeholder:font-medium" />
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <Button variant="outline" className="h-16 px-8 rounded-[24px] border-hairline bg-white font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-black/[0.03] transition-all hover:bg-surface-secondary active:scale-95 group">
            <CalendarIcon className="w-4.5 h-4.5 text-primary group-hover:scale-110 transition-transform" /> 12 Thang 06
          </Button>
          <Button variant="outline" className="h-16 px-8 rounded-[24px] border-hairline bg-white font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-black/[0.03] transition-all hover:bg-surface-secondary active:scale-95 group">
            <Settings2 className="w-4.5 h-4.5 text-primary group-hover:rotate-180 transition-transform duration-500" /> Tuy chinh
          </Button>
        </div>
      </div>

      <div className="border border-hairline rounded-[32px] overflow-hidden bg-white shadow-2xl shadow-black/[0.05] relative">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(#18BE66 1px, transparent 0), linear-gradient(90deg, #18BE66 1px, transparent 0)", backgroundSize: "30px 30px" }} />
        <div className="overflow-x-auto relative z-10 scrollbar-none" style={{ overflowY: "visible" }}>
          <div className="w-full min-w-[960px] grid grid-cols-[220px_1fr]" style={{ overflowY: "visible" }}>
            <div className="sticky left-0 top-0 z-40 bg-white/95 backdrop-blur-xl px-5 flex items-center border-r border-b border-hairline h-[70px]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-surface-tinted flex items-center justify-center text-primary shadow-sm border border-primary/5"><Users className="w-3.5 h-3.5" /></div>
                <span className="text-[11px] font-black uppercase tracking-[0.1em] text-primary-strong">Nhan su</span>
              </div>
            </div>
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl grid grid-cols-12 border-b border-hairline h-[70px] w-full">
              {HOURS.slice(0, -1).map((hour) => (
                <div key={hour} className="flex items-center justify-center font-black text-[10px] uppercase tracking-[0.1em] text-on-surface-tertiary border-r border-hairline/50 last:border-r-0">
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>
            {staff.map((person, idx) => {
              const staffVisits = allVisits.filter((v) => v.staffId === person.id);
              return (
                <React.Fragment key={person.id}>
                  <div className={cn("sticky left-0 z-20 backdrop-blur-sm flex items-center gap-3 px-4 py-3 h-[90px] border-r border-b border-hairline group/row transition-all duration-300 hover:bg-surface-tinted/20", idx % 2 === 0 ? "bg-white" : "bg-surface-secondary/20")}>
                    <div className="relative shrink-0">
                      <div className={cn("absolute -inset-0.5 rounded-xl opacity-0 group-hover/row:opacity-100 transition-opacity", person.available ? "bg-primary/10" : "bg-orange-100")} />
                      <img src={person.avatar} className="relative w-10 h-10 rounded-xl border-2 border-white shadow-md object-cover transition-transform duration-300 group-hover/row:scale-105" alt={person.name} />
                      <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full shadow-sm", person.available ? "bg-primary" : "bg-orange-400")}>
                        {person.available && <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-foreground uppercase tracking-tight leading-none mb-1.5 group-hover/row:text-primary transition-colors">{person.name}</p>
                      <p className="text-[9px] text-on-surface-tertiary font-bold uppercase tracking-[0.08em] leading-none mb-1.5">{String(person.role).split("*")[0].trim()}</p>
                      <span className={cn("inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md", person.available ? "bg-primary/10 text-primary-strong" : "bg-orange-50 text-orange-600")}>
                        <span className={cn("w-1 h-1 rounded-full", person.available ? "bg-primary" : "bg-orange-400")} />
                        {person.available ? "San sang" : "Dang ban"}
                      </span>
                    </div>
                  </div>
                  <div className={cn("relative grid grid-cols-12 h-[90px] border-b border-hairline last:border-b-0 group/timeline transition-colors overflow-visible", idx % 2 === 0 ? "bg-white" : "bg-surface-secondary/15")}>
                    {HOURS.slice(0, -1).map((hour) => (
                      <div key={hour} className="border-r border-hairline/30 last:border-r-0 group-hover/timeline:bg-primary/[0.02] transition-colors" />
                    ))}
                    {staffVisits.map((visit) => (
                      <SessionCard key={visit.id} visit={visit} staffName={person.name} onEdit={handleEditSession} onDelete={handleDeleteSession} />
                    ))}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <div className="bg-surface-secondary/40 px-12 py-8 border-t border-hairline flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-10">
            <div className="flex items-center gap-4"><div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(24,190,102,0.5)]" /><span className="text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">Phien dang thuc thi</span></div>
            <div className="flex items-center gap-4"><div className="w-3 h-3 rounded-full bg-white border border-hairline shadow-sm" /><span className="text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">Khung gio trong</span></div>
            <div className="flex items-center gap-4 opacity-50"><div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]" /><span className="text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">Nhan su ban ca ngoai</span></div>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-hairline shadow-sm text-[11px] font-black text-primary-strong uppercase tracking-[0.25em] animate-pulse">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Dang dong bo du lieu mang luoi
          </div>
        </div>
      </div>
    </div>
  );
}

