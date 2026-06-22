"use client";

import * as React from "react";
import {
  CalendarPlus,
  ChevronRight,
  Search,
  Settings2,
  Users,
  Calendar as CalendarIcon,
  Sparkles,
  CheckCircle2,
  Bell,
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
import { motion } from "framer-motion";
import { Visit, VisitStatus } from "@/lib/types";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00
function getPositionPercent(time: string) {
  const [h, m] = time.split(":").map(Number);
  const startHour = 8;
  const totalMinutes = 12 * 60; // 12 hours total
  const minutes = (h - startHour) * 60 + m;
  return (minutes / totalMinutes) * 100;
}

function getWidthPercent(duration: string) {
  const hours = parseFloat(duration.replace("h", ""));
  return (hours / 12) * 100;
}

function AssignSessionDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className="bg-primary text-white rounded-full px-8 py-3 font-black text-sm flex items-center gap-3 hover:opacity-95 transition-all shadow-2xl shadow-primary/20 h-14 uppercase tracking-widest border-b-4 border-white/10 active:border-b-0 active:translate-y-1">
            <CalendarPlus className="w-5 h-5" /> Phân công ca trực
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] rounded-[36px] border-hairline shadow-2xl p-10">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl bg-surface-tinted flex items-center justify-center text-primary mb-8 shadow-sm">
            <CalendarPlus className="w-7 h-7" />
          </div>
          <DialogTitle className="text-3xl font-black tight-tracking text-foreground uppercase leading-tight">
            Điều phối <br />
            Lịch trình
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-3 text-base font-medium">
            Thiết lập phiên làm việc mới cho chuyên gia và bệnh nhân trong hệ
            thống.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-8 py-10">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary ml-1">
              Chuyên gia phụ trách
            </Label>
            <Select>
              <SelectTrigger className="w-full rounded-2xl border-hairline h-14 bg-surface-secondary/20 focus:bg-white transition-all font-black text-sm shadow-none">
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-hairline shadow-2xl p-2">
                {staff.map((s) => (
                  <SelectItem
                    key={s.id}
                    value={s.id}
                    className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted"
                  >
                    {s.name} ({s.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary ml-1">
              Bệnh nhân tiếp nhận
            </Label>
            <Select>
              <SelectTrigger className="w-full rounded-2xl border-hairline h-14 bg-surface-secondary/20 focus:bg-white transition-all font-black text-sm shadow-none">
                <SelectValue placeholder="Chọn bệnh nhân" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-hairline shadow-2xl p-2">
                {patients.map((p) => (
                  <SelectItem
                    key={p.id}
                    value={p.id}
                    className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted"
                  >
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary ml-1">
                Giờ bắt đầu
              </Label>
              <Input
                type="time"
                className="rounded-2xl border-hairline h-14 bg-surface-secondary/20 focus:bg-white transition-all font-black shadow-none"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-tertiary ml-1">
                Thời lượng phiên
              </Label>
              <Select>
                <SelectTrigger className="w-full rounded-2xl border-hairline h-14 bg-surface-secondary/20 focus:bg-white transition-all font-black text-sm shadow-none">
                  <SelectValue placeholder="Chọn TG" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-hairline shadow-2xl p-2">
                  <SelectItem
                    value="0.5"
                    className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted"
                  >
                    30 Phút
                  </SelectItem>
                  <SelectItem
                    value="1"
                    className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted"
                  >
                    1 Giờ
                  </SelectItem>
                  <SelectItem
                    value="1.5"
                    className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted"
                  >
                    1.5 Giờ
                  </SelectItem>
                  <SelectItem
                    value="2"
                    className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest focus:bg-surface-tinted"
                  >
                    2 Giờ
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="pt-4 flex-col sm:flex-col gap-3">
          <Button
            type="submit"
            className="w-full bg-action text-white rounded-full py-9 h-14 text-base font-black uppercase tracking-[0.2em] hover:opacity-95 shadow-2xl shadow-action/20 transition-all group border-b-4 border-white/10 active:border-b-0 active:translate-y-1"
          >
            Xác nhận phân công{" "}
            <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function ApproveVisitsDialog({ 
  pendingVisits, 
  onApprove, 
  onReject 
}: { 
  pendingVisits: Visit[]; 
  onApprove: (id: string) => void; 
  onReject: (id: string) => void; 
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className={cn(
            "relative border rounded-[24px] px-6 h-14 font-black text-xs uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-sm duration-200",
            pendingVisits.length > 0
              ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
              : "bg-white hover:bg-slate-50 border-hairline text-slate-700"
          )}>
            <Bell className={cn("w-4.5 h-4.5 shrink-0", pendingVisits.length > 0 ? "text-amber-600 animate-bounce" : "text-slate-400")} />
            Duyệt lịch hẹn
            {pendingVisits.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white rounded-full text-[9px] font-black w-6 h-6 flex items-center justify-center animate-pulse shadow-md shadow-orange-500/20">
                {pendingVisits.length}
              </span>
            )}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] rounded-[36px] border-hairline shadow-2xl p-10 bg-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black tight-tracking text-foreground uppercase leading-tight">
            Yêu cầu <br /> Chờ duyệt
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-3 text-xs font-semibold">
            Phê duyệt hoặc từ chối các yêu cầu đặt lịch hẹn của bệnh nhân từ cổng khách hàng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-8 max-h-[350px] overflow-y-auto pr-1">
          {pendingVisits.length > 0 ? (
            pendingVisits.map((visit) => (
              <div key={visit.id} className="p-5 bg-surface-secondary/20 rounded-2xl border border-hairline space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[9px] font-black text-primary-strong bg-surface-tinted px-2 py-1 rounded-lg border border-primary/10">
                      #LH-{visit.id}
                    </span>
                    <h4 className="font-black text-sm uppercase text-foreground leading-none mt-2">{visit.type}</h4>
                    <p className="text-xs text-muted-foreground font-bold mt-1">Bệnh nhân: {visit.patientName}</p>
                    <p className="text-xs text-primary-strong font-black uppercase tracking-wider mt-1">Chuyên gia: {staff.find(s => s.id === visit.staffId)?.name || "Chuyên gia"}</p>
                  </div>
                  <span className="text-[10px] font-mono font-black text-on-surface-tertiary bg-white border border-hairline px-2 py-1 rounded-lg">
                    {visit.time}
                  </span>
                </div>

                <div className="flex gap-3 pt-2 border-t border-hairline/40">
                  <Button 
                    onClick={() => onApprove(visit.id)}
                    className="flex-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl h-10 shadow-md shadow-primary/15"
                  >
                    Phê duyệt
                  </Button>
                  <Button 
                    onClick={() => onReject(visit.id)}
                    variant="outline"
                    className="flex-1 text-orange-500 border-orange-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 text-[10px] font-black uppercase tracking-widest rounded-xl h-10 shadow-xs"
                  >
                    Từ chối
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-primary/50 mx-auto" />
              <p className="text-xs text-muted-foreground font-bold">Không có yêu cầu chờ duyệt nào.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
function SessionCard({ visit }: { visit: Visit }) {
  const left = getPositionPercent(visit.startTime || "08:00");
  const width = getWidthPercent(visit.duration);
  const isOngoing = visit.status === "Đang thực hiện";
  const isPending = visit.status === "Chờ duyệt";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
      className={cn(
        "absolute h-[64px] top-2 rounded-[12px] p-2 flex flex-col justify-between transition-all cursor-pointer border shadow-sm group overflow-hidden",
        isOngoing
          ? "bg-white border-primary/40 text-foreground ring-4 ring-primary/5"
          : isPending
            ? "bg-slate-50/80 border-dashed border-slate-300 text-slate-400 opacity-80"
            : visit.status === "Đã xác nhận"
              ? "bg-white border-hairline text-foreground"
              : "bg-surface-secondary/50 border-hairline text-muted-foreground",
      )}
      style={{ left: `${left}%`, width: `${width}%` }}
    >
      {isOngoing && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_0_10px_rgba(24,190,102,0.5)]" />
      )}
      {isPending && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-300 rounded-t-full" />
      )}

      <div className="flex items-start justify-between gap-2 relative z-10">
        <p className="font-black text-[10px] uppercase tracking-tight truncate leading-none group-hover:text-primary transition-colors">
          {visit.type}
        </p>
        {isOngoing && (
          <div className="flex items-center gap-1 bg-surface-tinted px-1 py-0.5 rounded-full border border-primary/10">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          </div>
        )}
        {isPending && (
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 border border-slate-200 px-1 py-0.5 rounded-full">
            Chờ duyệt
          </span>
        )}
      </div>

      <div className="flex justify-between items-end mt-auto relative z-10">
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-[10px] font-bold truncate opacity-80 group-hover:opacity-100 transition-opacity">
            {visit.patientName}
          </span>
          <span className="text-[8px] font-black font-mono uppercase tracking-[0.05em] text-on-surface-tertiary">
            {visit.time}
          </span>
        </div>
      </div>
    </motion.div>
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
        id: b.id,
        type: b.type,
        patientId: "BN-0842",
        patientName: "Evelyn Green",
        staffId: b.staffId,
        time: b.time,
        startTime: b.time.split(" - ")[0],
        endTime: b.time.split(" - ")[1] || "09:00",
        duration: b.time.includes("1.5") ? "1.5h" : "1h",
        status: b.status
      }));
      setAllVisits(formatted);
    } else {
      localStorage.setItem("mintcare_visits", JSON.stringify(
        visits.map(v => ({
          id: v.id,
          staffId: v.staffId,
          staffName: staff.find(s => s.id === v.staffId)?.name || "Chuyên gia y tế",
          type: v.type,
          date: "2026-06-22",
          time: v.time,
          status: v.status,
          price: v.type.includes("Vật lý") ? "500.000 VNĐ" : v.type.includes("Truyền") ? "400.000 VNĐ" : "200.000 VNĐ",
          paymentMethod: "Tiền mặt"
        }))
      ));
      setAllVisits(visits);
    }
  }, []);

  const saveVisits = (updated: Visit[]) => {
    setAllVisits(updated);
    const formattedStorage = updated.map(v => ({
      id: v.id,
      staffId: v.staffId,
      staffName: staff.find(s => s.id === v.staffId)?.name || "Chuyên gia y tế",
      type: v.type,
      date: "2026-06-22",
      time: v.time,
      status: v.status,
      price: v.type.includes("Vật lý") ? "500.000 VNĐ" : v.type.includes("Truyền") ? "400.000 VNĐ" : "200.000 VNĐ",
      paymentMethod: "Tiền mặt"
    }));
    localStorage.setItem("mintcare_visits", JSON.stringify(formattedStorage));
  };

  const handleApprove = (id: string) => {
    const updated: Visit[] = allVisits.map(v => v.id === id ? { ...v, status: "Đã xác nhận" as VisitStatus } : v);
    saveVisits(updated);
  };

  const handleReject = (id: string) => {
    const updated = allVisits.filter(v => v.id !== id);
    saveVisits(updated);
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
            <div className="flex items-center gap-2 bg-surface-tinted px-3.5 py-2 rounded-full border border-primary/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="eyebrow text-[10px] font-black uppercase tracking-widest">
                Giám sát điều phối
              </span>
            </div>
            <div className="w-px h-5 bg-hairline" />
            <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">
              Cập nhật 2p trước
            </span>
          </div>
          <h1 className="text-6xl font-black tight-tracking text-foreground leading-[1] uppercase">
            Lịch trực <br />
            Chuyên gia
          </h1>
        </motion.div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-[24px] border border-hairline shadow-xl shadow-black/[0.03]">
          <ApproveVisitsDialog 
            pendingVisits={allVisits.filter(v => v.status === "Chờ duyệt")}
            onApprove={handleApprove}
            onReject={handleReject}
          />
          <div className="w-px h-6 bg-hairline" />
          <div className="flex bg-surface-secondary rounded-[16px] p-1 border border-hairline/50">
            {(["day", "week", "month"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-[12px] transition-all duration-300",
                  view === v
                    ? "bg-white text-primary shadow-lg shadow-black/[0.08] scale-105"
                    : "text-on-surface-tertiary hover:bg-white/50",
                )}
              >
                {v === "day" ? "Ngày" : v === "week" ? "Tuần" : "Tháng"}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-hairline" />
          <AssignSessionDialog />
        </div>
      </div>

      {/* Enhanced Control Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
          <Input
            placeholder="Tìm kiếm..."
            className="pl-14 h-16 rounded-[24px] bg-white border-hairline focus:ring-8 focus:ring-primary/5 transition-all text-base font-bold shadow-xl shadow-black/[0.02] border-b-2 border-b-hairline placeholder:text-on-surface-tertiary placeholder:font-medium"
          />
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <Button
            variant="outline"
            className="h-16 px-8 rounded-[24px] border-hairline bg-white font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-black/[0.03] transition-all hover:bg-surface-secondary active:scale-95 group"
          >
            <CalendarIcon className="w-4.5 h-4.5 text-primary group-hover:scale-110 transition-transform" />{" "}
            12 Tháng 06
          </Button>
          <Button
            variant="outline"
            className="h-16 px-8 rounded-[24px] border-hairline bg-white font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-black/[0.03] transition-all hover:bg-surface-secondary active:scale-95 group"
          >
            <Settings2 className="w-4.5 h-4.5 text-primary group-hover:rotate-180 transition-transform duration-500" />{" "}
            Tùy chỉnh
          </Button>
        </div>
      </div>

      {/* Timeline Grid Container */}
      <div className="border border-hairline rounded-[32px] overflow-hidden bg-white shadow-2xl shadow-black/[0.05] relative">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#18BE66 1px, transparent 0), linear-gradient(90deg, #18BE66 1px, transparent 0)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="overflow-x-auto relative z-10 scrollbar-none">
          <div className="w-full min-w-[960px] grid grid-cols-[160px_1fr]">
            {/* Left Header Corner */}
            <div className="sticky left-0 top-0 z-40 bg-white/95 backdrop-blur-xl p-4 flex items-center border-r border-b border-hairline h-[70px]">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-surface-tinted flex items-center justify-center text-primary shadow-sm border border-primary/5">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.1em] text-primary-strong">
                  Nhân sự
                </span>
              </div>
            </div>

            {/* Time Header */}
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

            {/* Grid Content */}
            {staff.map((person, idx) => {
              const staffVisits = allVisits.filter((v) => v.staffId === person.id);
              return (
                <React.Fragment key={person.id}>
                  {/* Staff Info Cell */}
                  <div
                    className={cn(
                      "sticky left-0 z-20 bg-white/98 backdrop-blur-sm flex items-center gap-3 px-4 h-[80px] border-r border-b border-hairline group/row transition-all duration-300 hover:bg-surface-tinted/10",
                      idx % 2 === 0 ? "bg-white" : "bg-surface-secondary/15",
                    )}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={person.avatar}
                        className="w-8 h-8 rounded-lg border border-white shadow-md object-cover transition-all duration-500 group-hover/row:scale-110"
                        alt={person.name}
                      />
                      <div
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border border-white rounded-full shadow-md",
                          person.available ? "bg-primary" : "bg-orange-500",
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-black text-foreground uppercase tracking-tight truncate leading-none mb-1 group-hover/row:text-primary transition-colors">
                        {person.name}
                      </p>
                      <p className="text-[10px] text-on-surface-tertiary font-black uppercase tracking-[0.05em] opacity-80 truncate">
                        {person.role.split("•")[0]}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Row */}
                  <div
                    className={cn(
                      "relative grid grid-cols-12 h-[80px] border-b border-hairline last:border-b-0 group/timeline transition-colors",
                      idx % 2 === 0 ? "bg-white" : "bg-surface-secondary/15",
                    )}
                  >
                    {/* Background Slots */}
                    {HOURS.slice(0, -1).map((hour) => (
                      <div
                        key={hour}
                        className="border-r border-hairline/30 last:border-r-0 group-hover/timeline:bg-primary/[0.02] transition-colors"
                      />
                    ))}

                    {/* Active Sessions */}
                    {staffVisits.map((visit) => (
                      <SessionCard key={visit.id} visit={visit} />
                    ))}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Bottom Status Info */}
        <div className="bg-surface-secondary/40 px-12 py-8 border-t border-hairline flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-10">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(24,190,102,0.5)]" />
              <span className="text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">
                Phiên đang thực thi
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-white border border-hairline shadow-sm" />
              <span className="text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">
                Khung giờ trống
              </span>
            </div>
            <div className="flex items-center gap-4 opacity-50">
              <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]" />
              <span className="text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">
                Nhân sự bận ca ngoài
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-hairline shadow-sm text-[11px] font-black text-primary-strong uppercase tracking-[0.25em] animate-pulse">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Đang đồng bộ dữ liệu mạng lưới
          </div>
        </div>
      </div>
    </div>
  );
}
