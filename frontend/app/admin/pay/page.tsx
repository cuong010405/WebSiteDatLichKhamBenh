"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { API_URL, authFetch } from "@/lib/api";
import { useLoading } from "@/lib/loading-context";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  RefreshCw,
  Receipt,
  Trash2,
  CreditCard,
  Banknote,
  Wallet,
  AlertCircle,
  Clock,
  User,
  CalendarDays,
} from "lucide-react";

interface PaymentVisit {
  id: string;
  type: string;
  patientName: string;
  userName?: string;
  staffName: string;
  date?: string;
  time: string;
  status: string;
  paymentStatus?: string;
}

interface PaymentRecord {
  id: string;
  visitId: string;
  amount: string;
  method: string;
  status: string;
  note: string;
  createdAt: string;
  visitType: string;
  visitTime: string;
  visitDate?: string;
  patientName: string;
  staffName: string;
  userName?: string;
}

const methodIcon: Record<string, React.ReactNode> = {
  "Tiền mặt": <Banknote className="w-4 h-4" />,
  "Chuyển khoản": <CreditCard className="w-4 h-4" />,
  "Ví điện tử": <Wallet className="w-4 h-4" />,
  "Thẻ tín dụng": <CreditCard className="w-4 h-4" />,
};

const PAYMENT_METHODS = ["Tiền mặt", "Chuyển khoản", "Ví điện tử", "Thẻ tín dụng"];

export default function AdminPayPage() {
  const { show, hide } = useLoading();
  const [pendingVisits, setPendingVisits] = React.useState<PaymentVisit[]>([]);
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [selectedVisitId, setSelectedVisitId] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("Tiền mặt");
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentNote, setPaymentNote] = React.useState("");
  const [loadingVisits, setLoadingVisits] = React.useState(true);
  const [loadingPayments, setLoadingPayments] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load visits chờ thanh toán
  const fetchPendingVisits = React.useCallback(async () => {
    setLoadingVisits(true);
    try {
      // URL-encode Vietnamese query params to avoid server receiving garbled characters
      const params = new URLSearchParams({
        status: "Đã xác nhận",
        paymentStatus: "Chưa thanh toán",
      });
      const res = await fetch(`${API_URL}/visits?${params.toString()}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setPendingVisits(list);
      if (list.length > 0 && !selectedVisitId) setSelectedVisitId(list[0].id);
    } catch {
      setPendingVisits([]);
    } finally {
      setLoadingVisits(false);
    }
  }, [selectedVisitId]);

  // Load lịch sử hóa đơn
  const fetchPayments = React.useCallback(async () => {
    setLoadingPayments(true);
    try {
      const res = await authFetch(`${API_URL}/payments`);
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPendingVisits();
    fetchPayments();
  }, [fetchPendingVisits, fetchPayments]);

  // Helper to determine price based on visit type
  const getPriceByVisitType = (type: string): string => {
    if (!type) return "200000";
    if (type.includes("Vật lý")) return "500000";
    if (type.includes("Truyền")) return "400000";
    if (type.includes("Chăm sóc")) return "300000";
    return "200000";
  };

  // Automatically prefill amount when a visit is selected
  React.useEffect(() => {
    if (selectedVisitId) {
      const visit = pendingVisits.find((v) => v.id === selectedVisitId);
      if (visit) {
        setPaymentAmount(getPriceByVisitType(visit.type));
      }
    } else {
      setPaymentAmount("");
    }
  }, [selectedVisitId, pendingVisits]);

  const handleSubmit = async () => {
    if (!selectedVisitId || !paymentAmount) return;

    // Validate amount is a positive number
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Số tiền thanh toán không hợp lệ", "err");
      return;
    }

    setSaving(true);
    show("Đang thanh toán...")
    try {
      const res = await authFetch(`${API_URL}/payments`, {
        method: "POST",
        body: JSON.stringify({
          visitId: selectedVisitId,
          amount: paymentAmount,
          method: paymentMethod,
          note: paymentNote,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Lỗi lưu hóa đơn");
      }
      showToast("Hóa đơn đã được lưu thành công!", "ok");
      setPaymentAmount("");
      setPaymentNote("");
      setSelectedVisitId("");
      await Promise.all([fetchPendingVisits(), fetchPayments()]);
    } catch (e: any) {
      showToast(e?.message || "Lỗi không xác định", "err");
    } finally {
      setSaving(false);
      hide();
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm("Xóa hóa đơn này? Lịch hẹn sẽ trở về trạng thái Đã xác nhận.")) return;
    setDeletingId(paymentId);
    show("Đang xóa hóa đơn...")
    try {
      const res = await authFetch(`${API_URL}/payments/${paymentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa thất bại");
      showToast("Đã xóa hóa đơn.", "ok");
      await Promise.all([fetchPendingVisits(), fetchPayments()]);
    } catch (e: any) {
      showToast(e?.message || "Lỗi xóa hóa đơn", "err");
    } finally {
      setDeletingId(null);
      hide();
    }
  };

  const selectedVisit = pendingVisits.find((v) => v.id === selectedVisitId);

  const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-10">
      {/* Toast */}
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
            {toast.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 bg-surface-tinted px-3 py-1.5 rounded-full border border-primary/10 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="eyebrow text-[10px] font-black uppercase tracking-widest text-primary-strong">
              Quản lý thanh toán
            </span>
          </div>
          <div className="w-px h-4 bg-hairline" />
          <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-widest">
            {pendingVisits.length} Ca chờ
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tight-tracking text-foreground leading-[1.1] uppercase text-left">
          Hóa đơn & <br />
          Thanh toán
        </h1>
        <p className="text-xl text-muted-foreground mt-4 max-w-2xl font-medium leading-relaxed antialiased text-left">
          Xử lý thanh toán và đối soát hóa đơn cho các ca khám đã xác nhận. Mỗi lần giao dịch sẽ tự động tạo hóa đơn điện tử trên hệ thống.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Chờ thanh toán", value: loadingVisits ? "..." : pendingVisits.length, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
          { label: "Đã thanh toán", value: loadingPayments ? "..." : payments.length, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Tổng doanh thu", value: loadingPayments ? "..." : totalRevenue.toLocaleString("vi-VN") + "đ", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-3xl border p-6", s.bg)}>
            <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1">{s.label}</p>
            <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Pending visits + Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Pending visits list */}
          <div className="bg-white border border-hairline rounded-[32px] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-black text-foreground">Ca chờ thanh toán</h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Đã xác nhận, chưa thu tiền</p>
              </div>
              <button
                onClick={fetchPendingVisits}
                suppressHydrationWarning
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 text-slate-400", loadingVisits && "animate-spin")} />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {loadingVisits ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                ))
              ) : pendingVisits.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">Không có ca chờ thanh toán</p>
                </div>
              ) : (
                pendingVisits.map((v) => (
                  <button
                    key={v.id}
                    suppressHydrationWarning
                    onClick={() => setSelectedVisitId(v.id)}
                    className={cn(
                      "w-full text-left rounded-2xl border p-3.5 transition-all",
                      v.id === selectedVisitId
                        ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                        : "border-slate-100 bg-slate-50 hover:border-slate-200"
                    )}
                  >
                    <p className="text-xs font-black text-slate-800 truncate">{v.type}</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {v.patientName || v.userName || "—"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {v.date && `${v.date} · `}{v.time}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white border border-hairline rounded-[32px] p-6 shadow-xs">
            <h2 className="text-base font-black text-foreground mb-5">Form thanh toán</h2>
            <div className="space-y-4">
              {selectedVisit && (
                <div className="rounded-2xl bg-primary/5 border border-primary/20 p-3.5">
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Ca đã chọn</p>
                  <p className="text-xs font-black text-slate-800">{selectedVisit.type}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{selectedVisit.patientName} · {selectedVisit.time}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Ca xác nhận</Label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={selectedVisitId}
                  onChange={(e) => setSelectedVisitId(e.target.value)}
                >
                  <option value="">Chọn ca thanh toán</option>
                  {pendingVisits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.patientName || v.userName} · {v.staffName} · {v.time}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Phương thức</Label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Số tiền (VNĐ)</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="VD: 500000"
                  className="rounded-2xl border-slate-200 h-11 font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Ghi chú</Label>
                <Textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Ghi chú thêm..."
                  rows={3}
                  className="rounded-2xl border-slate-200 text-sm font-semibold resize-none"
                />
              </div>
              <Button
                disabled={!selectedVisitId || !paymentAmount || saving}
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-primary to-emerald-400 text-white rounded-2xl h-12 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang lưu...</span>
                ) : (
                  <span className="flex items-center gap-2"><Receipt className="w-3.5 h-3.5" /> Tạo hóa đơn</span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Invoice history */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-hairline rounded-[32px] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-hairline flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-foreground">Lịch sử hóa đơn</h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{payments.length} hóa đơn đã lưu</p>
              </div>
              <button
                onClick={fetchPayments}
                suppressHydrationWarning
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 text-slate-400", loadingPayments && "animate-spin")} />
              </button>
            </div>
            <div className="divide-y divide-hairline max-h-[600px] overflow-y-auto">
              {loadingPayments ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-5 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-slate-50 rounded w-1/3" />
                  </div>
                ))
              ) : payments.length === 0 ? (
                <div className="py-16 text-center">
                  <Receipt className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">Chưa có hóa đơn nào</p>
                </div>
              ) : (
                payments.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="p-5 hover:bg-slate-50/50 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                          {methodIcon[p.method] ?? <Banknote className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800 truncate">{p.visitType}</p>
                          <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 shrink-0" />
                            {p.patientName || p.userName || "—"}
                          </p>
                          {p.visitDate && (
                            <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                              <CalendarDays className="w-3 h-3 shrink-0" />
                              {p.visitDate} · {p.visitTime}
                            </p>
                          )}
                          {p.note && (
                            <p className="text-[10px] text-slate-400 italic mt-1 truncate">"{p.note}"</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-black text-emerald-600">
                          {parseFloat(p.amount).toLocaleString("vi-VN")}đ
                        </p>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.method}</span>
                        <p className="text-[9px] text-slate-300 mt-1">
                          {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                        <button
                          suppressHydrationWarning
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="mt-1.5 w-7 h-7 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 ml-auto disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
