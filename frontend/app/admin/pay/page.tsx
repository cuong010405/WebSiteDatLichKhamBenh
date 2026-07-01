"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/lib/api";

interface PaymentVisit {
  id: string;
  patientName: string;
  staffName: string;
  time: string;
  status: string;
  paymentStatus?: string;
}

export default function AdminPayPage() {
  const [pendingVisits, setPendingVisits] = React.useState<PaymentVisit[]>([]);
  const [selectedVisitId, setSelectedVisitId] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("Tiền mặt");
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentNote, setPaymentNote] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const fetchPendingVisits = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/visits?status=Đã xác nhận&paymentStatus=Chưa thanh toán`,
      );
      const result = await response.json();
      setPendingVisits(Array.isArray(result) ? result : []);
      if (Array.isArray(result) && result.length > 0) {
        setSelectedVisitId(result[0].id);
      }
    } catch (error) {
      console.error("Lỗi khi tải ca chờ thanh toán:", error);
      setPendingVisits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPendingVisits();
  }, [fetchPendingVisits]);

  const selectedVisit = pendingVisits.find(
    (visit) => visit.id === selectedVisitId,
  );

  const paymentOptions = pendingVisits.map((visit) => ({
    value: visit.id,
    label: `${visit.patientName} • ${visit.staffName} • ${visit.time}`,
  }));

  return (
    <div className="p-10 max-w-6xl mx-auto w-full space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-black">
          Quản lý thanh toán
        </p>
        <h1 className="text-4xl font-bold text-foreground">
          Thanh toán đơn riêng
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Trang này cho phép bạn xử lý thanh toán cho các ca đã được xác nhận,
          tách biệt khỏi báo cáo vận hành.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-white border-hairline rounded-[40px] p-10 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold">Danh sách ca chờ thanh toán</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Chỉ hiển thị các ca đã xác nhận nhưng chưa hoàn tất thanh toán.
              </p>
            </div>
            <Button variant="outline" onClick={fetchPendingVisits}>
              Làm mới
            </Button>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 rounded-[24px] bg-slate-100 animate-pulse"
                />
              ))
            ) : pendingVisits.length > 0 ? (
              pendingVisits.map((visit) => (
                <div
                  key={visit.id}
                  className={`rounded-[28px] border p-4 ${
                    visit.id === selectedVisitId
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {visit.patientName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {visit.staffName} • {visit.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Trạng thái
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {visit.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-slate-500 py-10">
                Không có ca chờ thanh toán.
              </p>
            )}
          </div>
        </Card>

        <Card className="bg-white border-hairline rounded-[40px] p-10 shadow-xs">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Form thanh toán</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Nhập thông tin thanh toán và cập nhật trạng thái cho ca đã chọn.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Ca xác nhận
                </Label>
                <select
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
                  value={selectedVisitId}
                  onChange={(e) => setSelectedVisitId(e.target.value)}
                >
                  <option value="">Chọn ca thanh toán</option>
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Phương thức thanh toán
                </Label>
                <select
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {[
                    "Tiền mặt",
                    "Chuyển khoản",
                    "Ví điện tử",
                    "Thẻ tín dụng",
                  ].map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Số tiền thanh toán
                </Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Nhập số tiền"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Ghi chú thanh toán
                </Label>
                <Textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Thêm ghi chú thanh toán..."
                  rows={4}
                />
              </div>

              {message && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {message}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  disabled={!selectedVisitId || !paymentAmount || saving}
                  onClick={async () => {
                    if (!selectedVisitId) return;
                    setSaving(true);
                    setMessage(null);
                    try {
                      const response = await fetch(
                        `${API_URL}/visits/${selectedVisitId}`,
                        {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            paymentMethod,
                            paymentAmount,
                            paymentNote,
                            paymentStatus: "Đã thanh toán",
                          }),
                        },
                      );

                      if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error?.error || "Lỗi lưu thanh toán");
                      }

                      setMessage("Thanh toán đã được cập nhật thành công.");
                      setPaymentAmount("");
                      setPaymentNote("");
                      await fetchPendingVisits();
                    } catch (error: any) {
                      setMessage(error?.message || "Lỗi không xác định");
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? "Đang lưu..." : "Lưu thanh toán"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedVisitId("");
                    setPaymentAmount("");
                    setPaymentNote("");
                    setPaymentMethod("Tiền mặt");
                    setMessage(null);
                  }}
                >
                  Đặt lại
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
