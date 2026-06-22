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
import { Visit } from "@/lib/types";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00
const CELL_WIDTH = 75;

function getPosition(time: string) {
  const [h, m] = time.split(":").map(Number);
  const startHour = 8;
  const offset = (((h - startHour) * 60 + m) / 60) * CELL_WIDTH;
  return offset;
}

function getWidth(duration: string) {
  const hours = parseFloat(duration.replace("h", ""));
  return hours * CELL_WIDTH;
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

function SessionCard({ visit }: { visit: Visit }) {
  const left = getPosition(visit.startTime || "08:00");
  const width = getWidth(visit.duration);
  const isOngoing = visit.status === "Đang thực hiện";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
      className={cn(
        "absolute h-[64px] top-2 rounded-[12px] p-2.5 flex flex-col justify-between transition-all cursor-pointer border shadow-sm group overflow-hidden",
        isOngoing
          ? "bg-white border-primary/40 text-foreground ring-4 ring-primary/5"
          : visit.status === "Đã xác nhận"
            ? "bg-white border-hairline text-foreground"
            : "bg-surface-secondary/50 border-hairline text-muted-foreground",
      )}
      style={{ left: `${left}px`, width: `${width}px` }}
    >
      {isOngoing && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_0_10px_rgba(24,190,102,0.5)]" />
      )}

      <div className="flex items-start justify-between gap-2 relative z-10">
        <p className="font-black text-[9px] uppercase tracking-tighter truncate leading-none group-hover:text-primary transition-colors">
          {visit.type}
        </p>
        {isOngoing && (
          <div className="flex items-center gap-1 bg-surface-tinted px-1 py-0.5 rounded-full border border-primary/10">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex justify-between items-end mt-auto relative z-10">
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-[9px] font-bold truncate opacity-80 group-hover:opacity-100 transition-opacity">
            {visit.patientName.split(" ").slice(-1)[0]}
          </span>
          <span className="text-[7px] font-black font-mono uppercase tracking-[0.05em] text-on-surface-tertiary">
            {visit.time.split(" - ")[0]}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function SchedulePage() {
  const [view, setView] = React.useState<"day" | "week" | "month">("day");

  return (
    <div className="p-4 space-y-6 bg-surface-secondary/20 min-h-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 bg-surface-tinted px-2.5 py-1 rounded-full border border-primary/10 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="eyebrow text-[8px] font-black uppercase tracking-widest">
                Giám sát điều phối
              </span>
            </div>
            <div className="w-px h-3 bg-hairline" />
            <span className="text-[8px] font-black text-on-surface-tertiary uppercase tracking-[0.25em]">
              Cập nhật 2p trước
            </span>
          </div>
          <h1 className="text-3xl font-black tight-tracking text-foreground leading-[1] uppercase">
            Lịch trực <br />
            Chuyên gia
          </h1>
        </motion.div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-[24px] border border-hairline shadow-xl shadow-black/[0.03]">
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
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
          <Input
            placeholder="Tìm kiếm..."
            className="pl-11 h-11 rounded-[18px] bg-white border-hairline focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold shadow-sm placeholder:text-on-surface-tertiary placeholder:font-medium placeholder:text-xs border-b-2 border-b-hairline"
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            className="h-11 px-6 rounded-[18px] border-hairline bg-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-surface-secondary active:scale-95 group"
          >
            <CalendarIcon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />{" "}
            12 Tháng 06
          </Button>
          <Button
            variant="outline"
            className="h-11 px-6 rounded-[18px] border-hairline bg-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-surface-secondary active:scale-95 group"
          >
            <Settings2 className="w-4 h-4 text-primary group-hover:rotate-180 transition-transform duration-500" />{" "}
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
            backgroundSize: "75px 80px",
          }}
        />

        <div className="overflow-x-auto relative z-10 scrollbar-none">
          <div className="w-full grid grid-cols-[120px_1fr]">
            {/* Left Header Corner */}
            <div className="sticky left-0 top-0 z-40 bg-white/95 backdrop-blur-xl p-3 flex items-center border-r border-b border-hairline h-[70px]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-surface-tinted flex items-center justify-center text-primary shadow-sm border border-primary/5">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-primary-strong">
                  Nhân sự
                </span>
              </div>
            </div>

            {/* Time Header */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl flex border-b border-hairline h-[70px]">
              {HOURS.slice(0, -1).map((hour) => (
                <div
                  key={hour}
                  className="w-[75px] flex items-center justify-center font-black text-[8px] uppercase tracking-[0.1em] text-on-surface-tertiary border-r border-hairline/50 last:border-r-0"
                >
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Grid Content */}
            {staff.map((person, idx) => {
              const staffVisits = visits.filter((v) => v.staffId === person.id);
              return (
                <React.Fragment key={person.id}>
                  {/* Staff Info Cell */}
                  <div
                    className={cn(
                      "sticky left-0 z-20 bg-white/98 backdrop-blur-sm flex items-center gap-2 px-3 h-[80px] border-r border-b border-hairline group/row transition-all duration-300 hover:bg-surface-tinted/10",
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
                      <p className="text-[11px] font-black text-foreground uppercase tracking-tight truncate leading-none mb-0.5 group-hover/row:text-primary transition-colors">
                        {person.name.split(" ").slice(-1)[0]}
                      </p>
                      <p className="text-[7px] text-on-surface-tertiary font-black uppercase tracking-[0.05em] opacity-80 truncate">
                        {person.role.split("•")[0]}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Row */}
                  <div
                    className={cn(
                      "relative flex h-[80px] border-b border-hairline last:border-b-0 group/timeline transition-colors",
                      idx % 2 === 0 ? "bg-white" : "bg-surface-secondary/15",
                    )}
                  >
                    {/* Background Slots */}
                    {HOURS.slice(0, -1).map((hour) => (
                      <div
                        key={hour}
                        className="w-[75px] border-r border-hairline/30 last:border-r-0 group-hover/timeline:bg-primary/[0.02] transition-colors"
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
