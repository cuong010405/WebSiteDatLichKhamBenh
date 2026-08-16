"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL, authFetch } from "@/lib/api";
import { useLoading } from "@/lib/loading-context";
import { AdminRoleGuard } from "@/components/auth/admin-role-guard";
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
  Printer,
  X,
  Search,
  Download,
  ShieldAlert,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Package,
  BadgeCheck,
} from "lucide-react";
import { formatCurrencyInput, parseCurrencyNumber } from "@/lib/utils/format";
import { exportToExcel } from "@/lib/utils/export";
import { Pagination } from "@/components/ui/pagination";

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
  paymentMethod?: string;
  paymentAmount?: string;
  careMode?: string;
  packagePlan?: string;
  packageShift?: string;
  requiredSpecialty?: string;
  address?: string;
  customerArea?: string;
  userPhone?: string;
  userEmail?: string;
  [key: string]: any;
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
  visitStatus?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  careMode?: string;
  packagePlan?: string;
  packageShift?: string;
  address?: string;
  patientName: string;
  staffName: string;
  staffPhone?: string;
  staffSpecialty?: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
}

const methodIcon: Record<string, React.ReactNode> = {
  "Tiền mặt": <Banknote className="w-4 h-4" />,
  "Chuyển khoản": <CreditCard className="w-4 h-4" />,
  "Ví điện tử": <Wallet className="w-4 h-4" />,
  "Thẻ tín dụng": <CreditCard className="w-4 h-4" />,
};

const PAYMENT_METHODS = ["Tiền mặt", "Chuyển khoản", "Ví điện tử", "Thẻ tín dụng"];

const formatBookingTime = (raw: any) => {
  if (!raw) return null;
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `${time} - ${date}`;
  } catch {
    return null;
  }
};

const getPackageDetails = (item: {
  amount?: string;
  paymentAmount?: string;
  careMode?: string;
  packagePlan?: string;
  packageShift?: string;
}) => {
  const isPackage = item.careMode === "package" || !!item.packagePlan;
  const plan = item.packagePlan;
  const days = plan === "30days" ? 30 : plan === "14days" ? 14 : plan === "7days" ? 7 : isPackage ? 30 : 1;
  const discountRate = plan === "30days" ? 0.25 : plan === "14days" ? 0.15 : plan === "7days" ? 0.10 : 0;
  const rawAmt = item.amount || item.paymentAmount || "0";
  const total = parseFloat(rawAmt);

  if (!isPackage || discountRate === 0 || total === 0) {
    return {
      isPackage,
      days,
      discountPercent: 0,
      originalTotal: total,
      total,
      savings: 0,
      dailyRate: days > 0 ? Math.round(total / days) : total,
      shift: item.packageShift || "Tiêu chuẩn",
    };
  }

  const originalTotal = Math.round(total / (1 - discountRate));
  const savings = originalTotal - total;
  const dailyRate = Math.round(originalTotal / days);

  return {
    isPackage: true,
    days,
    discountPercent: Math.round(discountRate * 100),
    originalTotal,
    total,
    savings,
    dailyRate,
    shift: item.packageShift || "Tiêu chuẩn",
  };
};

export default function AdminPayPage() {
  const { show, hide } = useLoading();
  const [pendingVisits, setPendingVisits] = React.useState<PaymentVisit[]>([]);
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [selectedVisitId, setSelectedVisitId] = React.useState("");
  const [pendingVisitPage, setPendingVisitPage] = React.useState(1);
  const [careFilter, setCareFilter] = React.useState<"all" | "hourly" | "package">("all");
  const [paymentMethod, setPaymentMethod] = React.useState("Tiền mặt");
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentNote, setPaymentNote] = React.useState("");
  const [loadingVisits, setLoadingVisits] = React.useState(true);
  const [loadingPayments, setLoadingPayments] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const selectedVisit = React.useMemo(() => {
    return pendingVisits.find((v) => v.id === selectedVisitId);
  }, [pendingVisits, selectedVisitId]);

  const [dateFilterMode, setDateFilterMode] = React.useState<"all" | "today" | "month" | "year" | "custom">("all");
  const [customDateFilter, setCustomDateFilter] = React.useState<string>("");

  const matchesDate = React.useCallback(
    (dateStr?: string, createdAtStr?: string, mode: string = "all", customDate: string = "") => {
      if (mode === "all") return true;
      const targetDate = dateStr || (createdAtStr ? createdAtStr.split("T")[0] : "");
      if (!targetDate) return true;

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const thisMonthStr = todayStr.slice(0, 7);
      const thisYearStr = todayStr.slice(0, 4);

      const cleanDate = targetDate.includes("T") ? targetDate.split("T")[0] : targetDate.trim();

      if (mode === "today") return cleanDate.startsWith(todayStr);
      if (mode === "month") return cleanDate.startsWith(thisMonthStr);
      if (mode === "year") return cleanDate.startsWith(thisYearStr);
      if (mode === "custom" && customDate) return cleanDate.startsWith(customDate);
      return true;
    },
    []
  );

  const filteredPendingVisits = React.useMemo(() => {
    let list = pendingVisits.filter((v) =>
      matchesDate(v.date, (v as any).createdAt, dateFilterMode, customDateFilter)
    );
    if (careFilter === "hourly") {
      return list.filter(
        (v) => v.careMode === "hourly" || (!v.careMode && !v.packagePlan)
      );
    }
    if (careFilter === "package") {
      return list.filter(
        (v) => v.careMode === "package" || !!v.packagePlan
      );
    }
    return list;
  }, [pendingVisits, careFilter, dateFilterMode, customDateFilter, matchesDate]);

  React.useEffect(() => {
    if (selectedVisit) {
      const amt = (selectedVisit as any).paymentAmount || (selectedVisit as any).price || (selectedVisit as any).amount;
      if (amt) {
        setPaymentAmount(formatCurrencyInput(String(amt)));
      } else {
        setPaymentAmount("");
      }
      if ((selectedVisit as any).paymentMethod) {
        setPaymentMethod((selectedVisit as any).paymentMethod);
      }
    }
  }, [selectedVisit]);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);
  const [activePrintPayment, setActivePrintPayment] = React.useState<PaymentRecord | null>(null);
  const [confirmPrintPayment, setConfirmPrintPayment] = React.useState<PaymentRecord | null>(null);
  const [printedPaymentIds, setPrintedPaymentIds] = React.useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("mintcare_printed_payments");
        return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  const markInvoiceAsPrinted = (id: string) => {
    if (!id) return;
    setPrintedPaymentIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("mintcare_printed_payments", JSON.stringify(Array.from(next)));
        } catch {}
      }
      return next;
    });
  };

  const [searchQuery, setSearchQuery] = React.useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = React.useState<"all" | "paid" | "cancelled">("all");
  const [paymentPage, setPaymentPage] = React.useState(1);
  const PAYMENTS_PER_PAGE = 4;

  const filteredPayments = React.useMemo(() => {
    // Ẩn các hóa đơn đã in khỏi trang Thanh toán (vẫn lưu đầy đủ ở trang Báo cáo)
    let result = payments.filter(
      (p) => !printedPaymentIds.has(p.id) && matchesDate(p.visitDate, p.createdAt, dateFilterMode, customDateFilter)
    );
    if (invoiceStatusFilter === "paid") {
      result = result.filter((p) => p.status !== "Đã hủy");
    } else if (invoiceStatusFilter === "cancelled") {
      result = result.filter((p) => p.status === "Đã hủy");
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return result;
    return result.filter((p) => {
      const patient = (p.patientName || p.userName || "").toLowerCase();
      const service = (p.visitType || "").toLowerCase();
      const staff = (p.staffName || "").toLowerCase();
      const note = (p.note || "").toLowerCase();
      const method = (p.method || "").toLowerCase();
      const status = (p.status || "").toLowerCase();
      const id = (p.id || "").toLowerCase();
      return (
        patient.includes(query) ||
        service.includes(query) ||
        staff.includes(query) ||
        note.includes(query) ||
        method.includes(query) ||
        status.includes(query) ||
        id.includes(query)
      );
    });
  }, [payments, searchQuery, invoiceStatusFilter, dateFilterMode, customDateFilter, matchesDate, printedPaymentIds]);

  React.useEffect(() => {
    setPaymentPage(1);
  }, [searchQuery, invoiceStatusFilter, dateFilterMode, customDateFilter]);

  const totalPaymentPages = Math.max(1, Math.ceil(filteredPayments.length / PAYMENTS_PER_PAGE));
  const paginatedPayments = React.useMemo(() => {
    const start = (paymentPage - 1) * PAYMENTS_PER_PAGE;
    return filteredPayments.slice(start, start + PAYMENTS_PER_PAGE);
  }, [filteredPayments, paymentPage]);
  
  const handlePrintInvoice = (payment: PaymentRecord) => {
    setActivePrintPayment(payment);
  };

  const triggerBrowserPrint = () => {
    if (!activePrintPayment) return;
    const targetPayment = activePrintPayment;
    setActivePrintPayment(null);
    setConfirmPrintPayment(targetPayment);
    const pkg = getPackageDetails(activePrintPayment);
    const rawAmount = (activePrintPayment.amount || "0").toString().replace(/[^0-9]/g, "");
    const amountNum = parseInt(rawAmount, 10) || 0;
    const isCancelled = activePrintPayment.status === "Đã hủy";
    const createdDate = activePrintPayment.createdAt
      ? new Date(activePrintPayment.createdAt).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleDateString("vi-VN");

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="vi">
          <head>
            <meta charset="UTF-8" />
            <title>Hóa đơn #${activePrintPayment.id}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

              @page {
                size: A4 portrait;
                margin: 12mm 15mm;
              }

              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }

              body {
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #1e293b;
                background-color: #ffffff;
                font-size: 13px;
                line-height: 1.5;
                padding: 24px;
              }

              /* Brand Header */
              .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding-bottom: 20px;
                border-bottom: 2px solid #059669;
                margin-bottom: 24px;
              }

              .brand-logo {
                font-size: 26px;
                font-weight: 900;
                letter-spacing: -0.5px;
                color: #059669;
                display: flex;
                align-items: center;
                gap: 6px;
              }

              .brand-logo span {
                color: #0284c7;
              }

              .brand-sub {
                font-size: 11px;
                font-weight: 600;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-top: 2px;
              }

              .company-info {
                text-align: right;
                font-size: 11px;
                color: #475569;
                line-height: 1.6;
              }

              /* Document Title & Status */
              .doc-title-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                background: #f8fafc;
                padding: 16px 20px;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
              }

              .doc-title-left h1 {
                font-size: 18px;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }

              .doc-title-left p {
                font-size: 11px;
                color: #64748b;
                font-weight: 600;
                margin-top: 2px;
              }

              .status-badge {
                font-size: 12px;
                font-weight: 800;
                padding: 6px 16px;
                border-radius: 9999px;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                display: inline-block;
              }

              .status-paid {
                background-color: #d1fae5;
                color: #047857;
                border: 1px solid #6ee7b7;
              }

              .status-cancelled {
                background-color: #ffe4e6;
                color: #be123c;
                border: 1px solid #fda4af;
              }

              /* 2 Columns Cards */
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 24px;
              }

              .info-card {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px;
              }

              .info-card-title {
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #059669;
                margin-bottom: 10px;
                padding-bottom: 6px;
                border-bottom: 1px dashed #cbd5e1;
              }

              .info-row {
                display: flex;
                margin-bottom: 6px;
                font-size: 12px;
              }

              .info-row:last-child {
                margin-bottom: 0;
              }

              .info-label {
                width: 110px;
                color: #64748b;
                font-weight: 600;
                flex-shrink: 0;
              }

              .info-value {
                color: #0f172a;
                font-weight: 700;
                flex-grow: 1;
              }

              /* Itemized Table */
              .table-container {
                margin-bottom: 24px;
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid #e2e8f0;
              }

              .invoice-table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
                font-size: 12px;
              }

              .invoice-table th {
                background: #f1f5f9;
                color: #334155;
                font-weight: 800;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding: 12px 14px;
                border-bottom: 2px solid #cbd5e1;
              }

              .invoice-table td {
                padding: 12px 14px;
                border-bottom: 1px solid #f1f5f9;
                color: #1e293b;
              }

              .invoice-table tr:nth-child(even) {
                background-color: #fafafa;
              }

              .nowrap {
                white-space: nowrap;
              }

              /* Financial Summary */
              .summary-section {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 32px;
                gap: 20px;
              }

              .notes-box {
                flex: 1;
                background: #f8fafc;
                border: 1px border-dashed #cbd5e1;
                border-radius: 12px;
                padding: 14px;
                font-size: 11px;
                color: #475569;
              }

              .notes-box strong {
                color: #0f172a;
                display: block;
                margin-bottom: 4px;
              }

              .total-box {
                width: 280px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px;
              }

              .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 12px;
                color: #475569;
              }

              .total-row.discount {
                color: #059669;
                font-weight: 600;
              }

              .total-grand {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 10px;
                border-top: 2px solid #059669;
                margin-top: 8px;
              }

              .total-grand-label {
                font-size: 12px;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
              }

              .total-grand-amount {
                font-size: 18px;
                font-weight: 900;
                color: ${isCancelled ? "#be123c" : "#059669"};
                ${isCancelled ? "text-decoration: line-through;" : ""}
              }

              /* Signatures */
              .signatures-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
              }

              .sig-title {
                font-size: 12px;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
              }

              .sig-subtitle {
                font-size: 10px;
                color: #64748b;
                margin-top: 2px;
              }

              .sig-space {
                height: 70px;
              }

              .sig-name {
                font-size: 13px;
                font-weight: 800;
                color: #0f172a;
              }

              /* Footer */
              .invoice-footer {
                margin-top: 40px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
                padding-top: 16px;
                font-size: 11px;
                color: #64748b;
              }

              @media print {
                body {
                  padding: 0;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <!-- Brand Header -->
            <div class="invoice-header">
              <div>
                <div class="brand-logo">💚 MINT<span>CARE</span></div>
                <div class="brand-sub">Hệ thống Y tế & Chăm sóc Sức khỏe Tại gia</div>
              </div>
              <div class="company-info">
                <p><strong>Hotline 24/7:</strong> 1900 6868</p>
                <p><strong>Website:</strong> www.mintcare.vn</p>
                <p><strong>Email:</strong> support@mintcare.vn</p>
              </div>
            </div>

            <!-- Document Title & Status Bar -->
            <div class="doc-title-bar">
              <div class="doc-title-left">
                <h1>Hóa Đơn Thanh Toán Dịch Vụ</h1>
                <p>Mã hóa đơn: <strong>HD-${activePrintPayment.id.slice(0, 10).toUpperCase()}</strong> • Ngày lập: ${createdDate}</p>
              </div>
              <div>
                <span class="status-badge ${isCancelled ? "status-cancelled" : "status-paid"}">
                  ${isCancelled ? "✕ Đã hủy" : "✓ Đã thanh toán"}
                </span>
              </div>
            </div>

            <!-- 2-Column Details -->
            <div class="info-grid">
              <!-- Customer Box -->
              <div class="info-card">
                <div class="info-card-title">👤 Thông tin khách hàng</div>
                <div class="info-row">
                  <div class="info-label">Khách hàng:</div>
                  <div class="info-value">${activePrintPayment.patientName || activePrintPayment.userName || "—"}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Điện thoại:</div>
                  <div class="info-value">${activePrintPayment.userPhone || "—"}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Email:</div>
                  <div class="info-value">${activePrintPayment.userEmail || "—"}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Địa chỉ khám:</div>
                  <div class="info-value">${activePrintPayment.address || "Tận nhà khách hàng"}</div>
                </div>
              </div>

              <!-- Specialist Box -->
              <div class="info-card">
                <div class="info-card-title">🩺 Đơn vị thực hiện</div>
                <div class="info-row">
                  <div class="info-label">Chuyên gia:</div>
                  <div class="info-value">${activePrintPayment.staffName || "Chuyên gia Y tế"}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Chuyên môn:</div>
                  <div class="info-value">${activePrintPayment.staffSpecialty || "Điều dưỡng / VLTL"}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Thời gian khám:</div>
                  <div class="info-value">${activePrintPayment.visitDate || ""} ${activePrintPayment.visitTime || ""}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Phương thức:</div>
                  <div class="info-value">${activePrintPayment.method || "Tiền mặt"}</div>
                </div>
              </div>
            </div>

            <!-- Itemized Invoice Table -->
            <div class="table-container">
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th class="nowrap" style="text-align: center; width: 45px;">STT</th>
                    <th class="nowrap" style="width: 26%;">Tên dịch vụ / Gói</th>
                    <th class="nowrap" style="width: 24%;">Hình thức & Ca trực</th>
                    <th class="nowrap" style="width: 28%;">Thời gian thực hiện</th>
                    <th class="nowrap" style="text-align: right; width: 22%;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="font-bold" style="text-align: center;">1</td>
                    <td class="nowrap">
                      <strong>${activePrintPayment.visitType || "Dịch vụ y tế tại nhà"}</strong>
                    </td>
                    <td class="nowrap font-medium">
                      ${
                        pkg.isPackage
                          ? `Gói ${pkg.days} ngày (Ca ${pkg.shift})`
                          : activePrintPayment.careMode === "hourly"
                          ? "Chăm sóc theo giờ"
                          : "Ca trực lẻ"
                      }
                    </td>
                    <td class="nowrap font-medium">${activePrintPayment.visitDate || ""} ${activePrintPayment.visitTime || ""}</td>
                    <td class="font-bold nowrap" style="text-align: right;">
                      ${
                        pkg.isPackage && pkg.discountPercent > 0
                          ? pkg.originalTotal.toLocaleString("vi-VN") + "đ"
                          : amountNum.toLocaleString("vi-VN") + "đ"
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Summary Section -->
            <div class="summary-section">
              <div class="notes-box">
                <strong>📝 Ghi chú thanh toán:</strong>
                <p>${activePrintPayment.note || "Không có ghi chú thêm."}</p>
              </div>

              <div class="total-box">
                ${
                  pkg.isPackage && pkg.discountPercent > 0
                    ? `
                  <div class="total-row">
                    <span>Tổng tiền gốc:</span>
                    <span>${pkg.originalTotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div class="total-row discount">
                    <span>Ưu đãi gói (${pkg.discountPercent}%):</span>
                    <span>-${pkg.savings.toLocaleString("vi-VN")}đ</span>
                  </div>
                `
                    : ""
                }
                <div class="total-row">
                  <span>Hình thức trả:</span>
                  <span><strong>${activePrintPayment.method || "Tiền mặt"}</strong></span>
                </div>
                <div class="total-grand">
                  <span class="total-grand-label">Tổng thực thu</span>
                  <span class="total-grand-amount">${amountNum.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
            </div>

            <!-- Signatures -->
            <div class="signatures-grid">
              <div>
                <div class="sig-title">Khách hàng / Bệnh nhân</div>
                <div class="sig-subtitle">(Ký và ghi rõ họ tên)</div>
                <div class="sig-space"></div>
                <div class="sig-name">${activePrintPayment.patientName || activePrintPayment.userName || "—"}</div>
              </div>
              <div>
                <div class="sig-title">Chuyên gia / Người lập phiếu</div>
                <div class="sig-subtitle">(Ký và ghi rõ họ tên)</div>
                <div class="sig-space"></div>
                <div class="sig-name">${activePrintPayment.staffName || "Bác sĩ / Điều dưỡng"}</div>
              </div>
            </div>

            <!-- Footer -->
            <div class="invoice-footer">
              <p>💚 Cảm ơn Quý khách đã tin tưởng và đồng hành cùng dịch vụ y tế MintCare!</p>
            </div>

            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 800);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    setActivePrintPayment(null);
  };

  const handleDownloadTxtInvoice = (p: PaymentRecord) => {
    const currentPayment = p;
    setActivePrintPayment(null);
    setConfirmPrintPayment(currentPayment);
    const content = `
=============================================
         HÓA ĐƠN THANH TOÁN DỊCH VỤ
                  MINTCARE
=============================================
Mã hóa đơn: HD-${p.id}
Thời gian in: ${new Date().toLocaleString("vi-VN")}
---------------------------------------------
Thông tin khách hàng:
- Họ tên: ${p.patientName || p.userName || "—"}
- Dịch vụ: ${p.visitType}
- Chuyên gia thực hiện: ${p.staffName}
- Thời gian khám: ${p.visitDate ? `${p.visitDate} ` : ""}${p.visitTime}
---------------------------------------------
Chi tiết thanh toán:
- Số tiền: ${parseFloat(p.amount).toLocaleString("vi-VN")} VNĐ
- Phương thức: ${p.method}
- Ghi chú: ${p.note || "Không có"}
=============================================
Cảm ơn quý khách đã tin dùng dịch vụ của MintCare!
    `.trim();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hoa-don-${p.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load visits chờ thanh toán (hiển thị tất cả ca chưa có hóa đơn, hỗ trợ thanh toán sớm & bình thường)
  const fetchPendingVisits = React.useCallback(async (silent = false) => {
    if (!silent) {
      setLoadingVisits(true);
      show("ĐANG TẢI CA CHỜ THANH TOÁN...");
    }
    try {
      const [resVisits, resPayments] = await Promise.all([
        authFetch(`${API_URL}/visits`),
        authFetch(`${API_URL}/payments`),
      ]);
      const visitsData = await resVisits.json();
      const paymentsData = await resPayments.json();

      const visitsList = Array.isArray(visitsData) ? visitsData : [];
      const paymentsList = Array.isArray(paymentsData) ? paymentsData : [];

      // Tập hợp các ID ca đã tạo hóa đơn (không tính hóa đơn đã hủy)
      const invoicedVisitIds = new Set(
        paymentsList.filter((p: any) => p.status !== "Đã hủy").map((p: any) => p.visitId)
      );

      // Hiển thị các ca chưa bị hủy và chưa lập hóa đơn (chưa có trong bảng payments).
      const pendingList = visitsList.filter((v: any) => {
        if (v.status === "Đã hủy" || v.paymentStatus === "Đã hủy" || invoicedVisitIds.has(v.id)) {
          return false;
        }
        return true;
      });

      setPendingVisits(pendingList);
      setSelectedVisitId((prev) =>
        prev && pendingList.some((v: any) => v.id === prev) ? prev : (pendingList[0]?.id || "")
      );
    } catch {
      if (!silent) {
        setPendingVisits([]);
        setSelectedVisitId("");
      }
    } finally {
      if (!silent) {
        setLoadingVisits(false);
        hide();
      }
    }
  }, [show, hide]);

  // Load lịch sử hóa đơn
  const fetchPayments = React.useCallback(async (silent = false) => {
    if (!silent) {
      setLoadingPayments(true);
      show("ĐANG TẢI LỊCH SỬ HÓA ĐƠN...");
    }
    try {
      const res = await authFetch(`${API_URL}/payments`);
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      if (!silent) setPayments([]);
    } finally {
      if (!silent) {
        setLoadingPayments(false);
        hide();
      }
    }
  }, [show, hide]);

  React.useEffect(() => {
    fetchPendingVisits(false);
    fetchPayments(false);

    const interval = setInterval(() => {
      fetchPendingVisits(true);
      fetchPayments(true);
    }, 10000);

    const handleFocus = () => {
      fetchPendingVisits(true);
      fetchPayments(true);
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
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
        setPaymentAmount(formatCurrencyInput(visit.paymentAmount || getPriceByVisitType(visit.type)));
        if (visit.paymentMethod) {
          setPaymentMethod(visit.paymentMethod);
        }
      }
    } else {
      setPaymentAmount("");
    }
  }, [selectedVisitId, pendingVisits]);

  const handleExportReport = () => {
    const reportData = payments.map((p) => ({
      "Mã Hóa Đơn": `HD-${p.id}`,
      "Dịch Vụ": p.visitType,
      "Bệnh Nhân / Khách Hàng": p.patientName || p.userName || "—",
      "Bác Sĩ / Chuyên Gia": p.staffName,
      "Số Tiền (VNĐ)": parseCurrencyNumber(p.amount).toLocaleString("vi-VN"),
      "Phương Thức": p.method,
      "Trạng Thái": p.status,
      "Ngày Tạo": p.createdAt ? new Date(p.createdAt).toLocaleDateString("vi-VN") : "—",
      "Ghi Chú": p.note || "Không có",
    }));
    exportToExcel(
      reportData,
      `Bao-Cao-Thu-Chi-${new Date().toISOString().split("T")[0]}.xls`,
      "BÁO CÁO THU CHI THỦ QUỸ & HÓA ĐƠN"
    );
  };

  const handleSubmit = async () => {
    if (!selectedVisitId || !paymentAmount) return;

    // Validate amount is a positive number
    const amountNum = parseCurrencyNumber(paymentAmount);
    if (amountNum <= 0) {
      return;

    }

    setSaving(true);
    show("ĐANG LƯU HÓA ĐƠN THANH TOÁN...");
    try {
      const res = await authFetch(`${API_URL}/payments`, {
        method: "POST",
        body: JSON.stringify({
          visitId: selectedVisitId,
          amount: String(amountNum),
          method: paymentMethod,
          note: paymentNote,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Lỗi lưu hóa đơn");
      }

      setPaymentAmount("");
      setPaymentNote("");
      setSelectedVisitId("");

      // Refresh danh sách ca chờ và lịch sử hóa đơn
      await Promise.all([fetchPendingVisits(true), fetchPayments(true)]);
    } catch (e: any) {

    } finally {
      setSaving(false);
      hide();
    }
  };

  const handleDelete = async (paymentId: string) => {
    setDeletingId(paymentId);
    show("ĐANG XÓA HÓA ĐƠN...");
    try {
      const res = await authFetch(`${API_URL}/payments/${paymentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa thất bại");

      await Promise.all([fetchPendingVisits(), fetchPayments()]);
    } catch (e: any) {

    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
      hide();
    }
  };

  const paidPayments = React.useMemo(() => payments.filter((p) => p.status !== "Đã hủy"), [payments]);
  const totalRevenue = React.useMemo(() => paidPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0), [paidPayments]);

  return (
    <AdminRoleGuard>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-10">

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
          Xử lý thanh toán và đối soát hóa đơn cho tất cả các ca khám. Mỗi lần giao dịch sẽ tự động tạo hóa đơn điện tử trên hệ thống.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Chờ thanh toán", value: loadingVisits ? "..." : pendingVisits.length, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
          { label: "Đã thanh toán", value: loadingPayments ? "..." : paidPayments.length, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Tổng doanh thu", value: loadingPayments ? "..." : totalRevenue.toLocaleString("vi-VN") + "đ", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-3xl border p-6", s.bg)}>
            <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1">{s.label}</p>
            <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="space-y-6">

        {/* Top Row: Form thanh toán (Left) + Ca chờ thanh toán (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Payment Form */}
          <div className="bg-white border border-hairline rounded-[32px] p-6 shadow-xs">
            <h2 className="text-base font-black text-foreground mb-5">Form thanh toán</h2>
            <div className="space-y-4">
              {selectedVisit && (
                <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      #{selectedVisit.id}
                    </span>
                    {selectedVisit.paymentStatus === "Đã thanh toán" ? (
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        ✓ Đã QR thanh toán
                      </span>
                    ) : (
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Chờ thanh toán
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                    {selectedVisit.type}
                  </h3>

                  <div className="text-[10px] space-y-1 text-slate-600 font-semibold pt-1 border-t border-primary/10">
                    <p>👤 Bệnh nhân: <span className="font-black text-slate-800">{selectedVisit.patientName || selectedVisit.userName || "—"}</span> {(selectedVisit as any).userPhone && `(SĐT: ${(selectedVisit as any).userPhone})`}</p>
                    <p>🛡️ Chuyên gia: <span className="font-black text-slate-800">{selectedVisit.staffName || "Chưa chọn"}</span></p>
                    <p>⏰ Thời gian khám: <span className="font-mono font-bold text-slate-800">{selectedVisit.date && `${selectedVisit.date} · `}{selectedVisit.time}</span></p>
                    {formatBookingTime((selectedVisit as any).bookedAt || (selectedVisit as any).assignedAt) && (
                      <p>🕐 Đặt lúc: <span className="font-mono font-bold text-blue-700">{formatBookingTime((selectedVisit as any).bookedAt || (selectedVisit as any).assignedAt)}</span></p>
                    )}
                    <p>📌 Hình thức: <span className="font-bold text-emerald-700">
                      {selectedVisit.careMode === "hourly"
                        ? "⏱️ Theo giờ / Theo ngày"
                        : selectedVisit.packagePlan === "30days"
                        ? "📦 Gói tháng (30 ngày)"
                        : selectedVisit.packagePlan === "14days"
                        ? "📦 Gói 14 ngày"
                        : selectedVisit.packagePlan === "7days"
                        ? "📦 Gói 7 ngày"
                        : "📦 Gói dài hạn"}
                      {selectedVisit.packageShift ? ` (Ca ${selectedVisit.packageShift})` : ""}
                    </span></p>
                    {selectedVisit.requiredSpecialty && (
                      <p>🩺 Yêu cầu chuyên môn: <span className="font-bold text-indigo-700">{selectedVisit.requiredSpecialty}</span></p>
                    )}
                    {(selectedVisit.address || (selectedVisit as any).customerArea) && (
                      <p className="truncate">📍 Địa chỉ: <span className="font-bold text-slate-800">{selectedVisit.address || (selectedVisit as any).customerArea}</span></p>
                    )}
                    {selectedVisit.paymentMethod && (
                      <p>💳 Phương thức: <span className="font-bold text-purple-700">{selectedVisit.paymentMethod}</span></p>
                    )}
                  </div>

                  {/* Chi tiết tính tiền gói */}
                  {(() => {
                    const pkg = getPackageDetails(selectedVisit);
                    if (!pkg.isPackage) return null;
                    return (
                      <div className="mt-3 rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3 space-y-1.5 text-[10px]">
                        <div className="flex items-center justify-between font-black text-emerald-800">
                          <span>📦 BẢNG TÍNH TIỀN GÓI ({pkg.days} NGÀY)</span>
                          {pkg.discountPercent > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[8px]">
                              Giảm {pkg.discountPercent}%
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between text-slate-600 font-semibold">
                          <span>Đơn giá ngày gốc:</span>
                          <span className="font-mono">{pkg.dailyRate.toLocaleString("vi-VN")}đ/ngày</span>
                        </div>
                        <div className="flex justify-between text-slate-600 font-semibold">
                          <span>Tổng giá niêm yết:</span>
                          <span className="font-mono line-through text-slate-400">{pkg.originalTotal.toLocaleString("vi-VN")}đ</span>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-700">
                          <span>Tiết kiệm (-{pkg.discountPercent}%):</span>
                          <span className="font-mono">-{pkg.savings.toLocaleString("vi-VN")}đ</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-emerald-200/60 font-black text-slate-900 text-xs">
                          <span>Thanh toán gói:</span>
                          <span className="font-mono text-emerald-700">{pkg.total.toLocaleString("vi-VN")}đ</span>
                        </div>
                      </div>
                    );
                  })()}
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
                  type="text"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(formatCurrencyInput(e.target.value))}
                  placeholder="VD: 500.000"
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
              {selectedVisit?.paymentStatus === "Đã thanh toán" && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-[10px] font-bold text-blue-700 text-center">
                    Khách hàng đã thanh toán qua QR. Bấm Tạo hóa đơn để ghi nhận.
                  </p>
                </div>
              )}
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

          {/* Pending visits list */}
          <div className="bg-white border border-hairline rounded-[32px] p-6 shadow-xs h-full flex flex-col justify-between">
            <div>
              <div className="flex flex-col gap-3 mb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black text-foreground">Ca chờ thanh toán</h2>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="inline-flex items-center p-1 rounded-full bg-slate-100/90 border border-slate-200/60 shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        setCareFilter("all");
                        setPendingVisitPage(1);
                      }}
                      className={cn(
                        "px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        careFilter === "all"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCareFilter("hourly");
                        setPendingVisitPage(1);
                      }}
                      className={cn(
                        "px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        careFilter === "hourly"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Theo giờ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCareFilter("package");
                        setPendingVisitPage(1);
                      }}
                      className={cn(
                        "px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        careFilter === "package"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Gói tháng
                    </button>
                  </div>
                  <button
                    onClick={() => fetchPendingVisits(false)}
                    suppressHydrationWarning
                    className="w-8.5 h-8.5 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer shrink-0 shadow-xs"
                    title="Làm mới"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5 text-slate-400", loadingVisits && "animate-spin")} />
                  </button>
                </div>
              </div>
              {(() => {
                const PENDING_PER_PAGE = 6;
                const totalPendingPages = Math.max(1, Math.ceil(filteredPendingVisits.length / PENDING_PER_PAGE));
                const currentPendingVisits = filteredPendingVisits.slice((pendingVisitPage - 1) * PENDING_PER_PAGE, pendingVisitPage * PENDING_PER_PAGE);

                return (
                  <>
                    <div className="space-y-2">
                      {loadingVisits ? (
                        Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                        ))
                      ) : filteredPendingVisits.length === 0 ? (
                        <div className="py-8 text-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-400">
                            {careFilter === "all" ? "Không có ca chờ thanh toán" : "Không có ca thuộc hình thức này"}
                          </p>
                        </div>
                      ) : (
                        currentPendingVisits.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            suppressHydrationWarning
                            onClick={() => setSelectedVisitId(v.id)}
                            className={cn(
                              "w-full text-left rounded-2xl border p-3.5 transition-all cursor-pointer relative",
                              v.id === selectedVisitId
                                ? "border-emerald-500 bg-emerald-50/50 shadow-xs shadow-emerald-500/10 ring-1 ring-emerald-400"
                                : "border-slate-100 bg-slate-50/70 hover:border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-black text-slate-900 truncate flex-1">{v.type}</p>
                              <div className="flex items-center gap-1 shrink-0">
                                {v.paymentMethod && (
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                    v.paymentMethod === "Chuyển khoản"
                                      ? "bg-purple-50 text-purple-700 border-purple-200"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  )}>
                                    💳 {v.paymentMethod}
                                  </span>
                                )}
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                                  v.status === "Đã hủy"
                                    ? "bg-red-100 text-red-600"
                                    : v.status === "Đang thực hiện"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-blue-100 text-blue-700"
                                )}>
                                  {v.status || "Chưa TT"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-1 space-y-0.5">
                              <p className="text-[10px] text-slate-700 font-bold flex items-center gap-1.5">
                                <User className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{v.patientName || v.userName || "—"}</span>
                                {((v as any).userPhone || (v as any).phone) && (
                                  <span className="text-[9px] text-slate-400 font-semibold ml-1">
                                    • SĐT: {(v as any).userPhone || (v as any).phone}
                                  </span>
                                )}
                              </p>

                              <p className="text-[10px] text-indigo-700 font-bold flex items-center gap-1.5">
                                <span>👨‍⚕️ CG:</span>
                                <span>{(v as any).staffName || "Chưa phân công"}</span>
                              </p>

                              <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                                <span>{v.date && `📅 ${v.date} · `}{v.time}</span>
                              </p>

                              {((v as any).address || (v as any).customerArea) && (
                                <p className="text-[9.5px] text-slate-400 font-medium truncate">
                                  📍 {(v as any).address || (v as any).customerArea}
                                </p>
                              )}

                              {formatBookingTime((v as any).bookedAt || (v as any).assignedAt) && (
                                <p className="text-[9.5px] font-black text-blue-600 flex items-center gap-1 pt-0.5">
                                  🕐 Đặt lúc: {formatBookingTime((v as any).bookedAt || (v as any).assignedAt)}
                                </p>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {/* Sleek Pill Pagination Control */}
                    {totalPendingPages > 1 && (
                      <div className="flex items-center justify-center gap-2.5 pt-4 mt-4 border-t border-slate-100">
                        <button
                          type="button"
                          disabled={pendingVisitPage === 1}
                          onClick={() => setPendingVisitPage((prev) => Math.max(1, prev - 1))}
                          className="w-10 h-10 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="px-5 py-2 rounded-2xl border border-slate-200/80 bg-white text-xs font-black shadow-xs flex items-center gap-1.5 min-w-[72px] justify-center">
                          <span className="text-emerald-600 font-extrabold text-sm">{pendingVisitPage}</span>
                          <span className="text-slate-300 font-normal">/</span>
                          <span className="text-slate-800 font-bold text-sm">{totalPendingPages}</span>
                        </div>

                        <button
                          type="button"
                          disabled={pendingVisitPage >= totalPendingPages}
                          onClick={() => setPendingVisitPage((prev) => Math.min(totalPendingPages, prev + 1))}
                          className="w-10 h-10 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-center text-emerald-600 hover:text-emerald-700 hover:border-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Bottom Row: Invoice history (Full width) */}
        <div className="w-full">
          <div className="bg-white border border-hairline rounded-[32px] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-foreground">Lịch sử hóa đơn</h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {searchQuery || invoiceStatusFilter !== "all" ? `${filteredPayments.length}/${payments.length} hóa đơn` : `${payments.length} hóa đơn đã lưu`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl ml-auto justify-end">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[330px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên, dịch vụ, ghi chú, trạng thái..."
                    className="pl-9 pr-8 h-9 text-xs font-semibold rounded-full border-slate-200 focus:border-blue-500 bg-slate-50/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Status Pills */}
                <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/60 shrink-0">
                  <button
                    onClick={() => setInvoiceStatusFilter("all")}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                      invoiceStatusFilter === "all"
                        ? "bg-white text-slate-800 shadow-xs border border-slate-200/50"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setInvoiceStatusFilter("paid")}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                      invoiceStatusFilter === "paid"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-emerald-700 hover:text-emerald-900"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", invoiceStatusFilter === "paid" ? "bg-white" : "bg-emerald-500")} />
                    Đã thanh toán
                  </button>
                  <button
                    onClick={() => setInvoiceStatusFilter("cancelled")}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                      invoiceStatusFilter === "cancelled"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-rose-600 hover:text-rose-800"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", invoiceStatusFilter === "cancelled" ? "bg-white" : "bg-rose-500")} />
                    Đã hủy
                  </button>
                </div>

                <button
                  onClick={handleExportReport}
                  className="w-8 h-8 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors shrink-0"
                  title="Xuất báo cáo CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                </button>
                <button
                  onClick={() => fetchPayments(false)}
                  suppressHydrationWarning
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0"
                  title="Làm mới"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 text-slate-400", loadingPayments && "animate-spin")} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-hairline [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {loadingPayments ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-5 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-slate-50 rounded w-1/3" />
                  </div>
                ))
              ) : filteredPayments.length === 0 ? (
                <div className="py-16 text-center">
                  <Receipt className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">
                    {searchQuery ? "Không tìm thấy hóa đơn phù hợp" : "Chưa có hóa đơn nào"}
                  </p>
                </div>
              ) : (
                paginatedPayments.map((p, i) => {
                  const isCancelled = p.status === "Đã hủy";
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      onClick={() => handlePrintInvoice(p)}
                      className={cn(
                        "p-5 transition-all group cursor-pointer relative",
                        isCancelled ? "bg-red-50/20 hover:bg-red-50/40" : "hover:bg-slate-50/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                              isCancelled
                                ? "bg-red-50 border border-red-100 text-red-500"
                                : "bg-emerald-50 border border-emerald-100 text-emerald-600"
                            )}
                          >
                            {methodIcon[p.method] ?? <Banknote className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-slate-800 truncate">{p.visitType}</p>
                              {isCancelled && (
                                <span className="px-2 py-0.5 text-[9px] font-black bg-red-100 text-red-600 rounded-full shrink-0">
                                  Đã hủy
                                </span>
                              )}
                            </div>
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
                              <p className={cn("text-[10px] italic mt-1 truncate", isCancelled ? "text-red-400 font-medium" : "text-slate-400")}>
                                "{p.note}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className={cn(
                              "text-base font-black",
                              isCancelled ? "text-red-500 line-through" : "text-emerald-600"
                            )}
                          >
                            {parseFloat(p.amount || "0").toLocaleString("vi-VN")}đ
                          </p>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.method}</span>
                          <div className="flex gap-1.5 justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                suppressHydrationWarning
                                onClick={(e) => { e.stopPropagation(); handlePrintInvoice(p); }}
                                className="w-7 h-7 rounded-xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-500 hover:text-blue-700 transition-all cursor-pointer"
                                title="In hóa đơn"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                suppressHydrationWarning
                                onClick={(e) => { e.stopPropagation(); setPendingDeleteId(p.id); }}
                                disabled={deletingId === p.id}
                                className="w-7 h-7 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-all disabled:opacity-50 cursor-pointer"
                                title="Xóa hóa đơn"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
            {filteredPayments.length > PAYMENTS_PER_PAGE && (
              <div className="p-4 border-t border-hairline bg-slate-50/50 flex justify-center">
                <Pagination
                  currentPage={paymentPage}
                  totalPages={totalPaymentPages}
                  onPageChange={setPaymentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {activePrintPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setActivePrintPayment(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-[812px] overflow-hidden border border-slate-100 flex flex-col"
            >
              {/* Gradient header band */}
              <div className={cn(
                "h-1 w-full",
                activePrintPayment.status === "Đã hủy"
                  ? "bg-gradient-to-r from-red-400 via-rose-400 to-pink-400"
                  : "bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500"
              )} />

              {/* Header */}
              <div className="flex justify-between items-start px-8 pt-6 pb-5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg tracking-wider">
                      #{activePrintPayment.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                      activePrintPayment.status === "Đã hủy"
                        ? "bg-red-50 text-red-500 border-red-200"
                        : "bg-violet-50 text-violet-600 border-violet-200"
                    )}>
                      {activePrintPayment.status === "Đã hủy" ? "✕ Đã hủy" : "✓ Đã thanh toán"}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-snug">{activePrintPayment.visitType || "Dịch vụ chăm sóc"}</h3>
                  {activePrintPayment.createdAt && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      Thanh toán lúc {new Date(activePrintPayment.createdAt).toLocaleString("vi-VN")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActivePrintPayment(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer shrink-0 mt-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Body */}
              <div id="printable-invoice-area" className="px-8 pb-6 space-y-0 overflow-y-auto max-h-[60vh] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

                {/* --- Row: 2 columns Khách hàng + Chuyên gia --- */}
                <div className="grid grid-cols-2 gap-6 py-5 border-b border-slate-100">
                  {/* Khách hàng */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Khách hàng</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <User className="w-4.5 h-4.5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{activePrintPayment.patientName || activePrintPayment.userName || "—"}</p>
                        {activePrintPayment.userPhone && (
                          <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" />{activePrintPayment.userPhone}
                          </p>
                        )}
                        {activePrintPayment.userEmail && (
                          <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" />{activePrintPayment.userEmail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Chuyên gia */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Chuyên gia thực hiện</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <BadgeCheck className="w-4.5 h-4.5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{activePrintPayment.staffName || "—"}</p>
                        {activePrintPayment.staffSpecialty && (
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{activePrintPayment.staffSpecialty}</p>
                        )}
                        {activePrintPayment.staffPhone && (
                          <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />{activePrintPayment.staffPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- Row: 2 columns Thông tin lịch hẹn + Chi tiết thanh toán --- */}
                <div className="grid grid-cols-2 gap-6 py-5 border-b border-slate-100">
                  {/* Thông tin lịch hẹn */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Thông tin lịch hẹn</p>
                    <div className="space-y-2">
                      {activePrintPayment.visitDate && (
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                          <CalendarDays className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{activePrintPayment.visitDate}</span>
                        </div>
                      )}
                      {activePrintPayment.visitTime && (
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{activePrintPayment.visitTime}{activePrintPayment.duration ? ` · ${activePrintPayment.duration}` : ""}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600">
                        <Package className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {activePrintPayment.careMode === "hourly"
                            ? "Theo giờ / Theo ngày"
                            : activePrintPayment.packagePlan === "30days"
                            ? "Gói tháng (30 ngày)"
                            : activePrintPayment.packagePlan === "14days"
                            ? "Gói 14 ngày"
                            : activePrintPayment.packagePlan === "7days"
                            ? "Gói 7 ngày"
                            : activePrintPayment.packagePlan
                            ? "Gói dài hạn"
                            : "Ca dịch vụ"}
                          {activePrintPayment.packageShift ? ` · Ca ${activePrintPayment.packageShift}` : ""}
                        </span>
                      </div>
                      {activePrintPayment.address && (
                        <div className="flex items-start gap-2 text-[11px] font-semibold text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{activePrintPayment.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chi tiết thanh toán */}
                  <div>
                    {(() => {
                      const pkg = getPackageDetails(activePrintPayment);
                      return (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500">
                              {pkg.isPackage ? "Bảng tính tiền gói" : "Chi tiết thanh toán"}
                            </p>
                            {pkg.isPackage && pkg.discountPercent > 0 && (
                              <span className="px-2 py-0.5 text-[8px] font-black bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                Ưu đãi -{pkg.discountPercent}%
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500 font-semibold">Hình thức & Ca:</span>
                              <span className="font-bold text-slate-800">
                                {pkg.isPackage ? `Gói ${pkg.days} ngày (Ca ${pkg.shift})` : "Theo giờ / Theo ca"}
                              </span>
                            </div>
                            {pkg.isPackage && pkg.discountPercent > 0 && (
                              <>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-500 font-semibold">Đơn giá ngày:</span>
                                  <span className="font-mono font-bold text-slate-700">{pkg.dailyRate.toLocaleString("vi-VN")}đ/ngày</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-500 font-semibold">Giá gốc:</span>
                                  <span className="font-mono text-slate-400 line-through">{pkg.originalTotal.toLocaleString("vi-VN")}đ</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-emerald-600 font-bold">
                                  <span>Ưu đãi (-{pkg.discountPercent}%):</span>
                                  <span className="font-mono">-{pkg.savings.toLocaleString("vi-VN")}đ</span>
                                </div>
                              </>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                              <span className="font-black text-slate-900 text-[10px] uppercase tracking-tight">Thực thu:</span>
                              <span className={cn(
                                "text-base font-black font-mono",
                                activePrintPayment.status === "Đã hủy" ? "text-red-500 line-through" : "text-indigo-600"
                              )}>
                                {parseFloat(activePrintPayment.amount || "0").toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                            {activePrintPayment.method && (
                              <p className="text-[10px] text-slate-400 font-semibold">Qua: {activePrintPayment.method}</p>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/60">
                <Button
                  onClick={() => handleDownloadTxtInvoice(activePrintPayment)}
                  variant="outline"
                  className="flex-1 rounded-2xl h-11 text-xs font-black uppercase tracking-wider border-slate-200 hover:bg-white"
                >
                  Tải file text
                </Button>
                <Button
                  onClick={triggerBrowserPrint}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl h-11 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In hóa đơn
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Delete Confirmation Dialog */}
      <Dialog open={!!pendingDeleteId} onOpenChange={(v) => { if (!v) setPendingDeleteId(null); }}>
        <DialogContent className="sm:max-w-[400px] rounded-[24px] border border-red-100 shadow-2xl p-0 overflow-hidden bg-white">
          <div className="h-1.5 w-full bg-gradient-to-r from-red-400 to-rose-500" />
          <div className="p-7">
            <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 mb-4 text-left">
              <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                  Xóa hóa đơn?
                </DialogTitle>
                <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">
                  Hóa đơn và lịch hẹn tương ứng sẽ bị hủy. Hành động này không thể hoàn tác.
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="bg-red-50/80 border border-red-100 rounded-xl p-4 space-y-1 mb-6 text-left">
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                Hóa đơn #{pendingDeleteId}
              </p>
              <p className="text-[10px] font-bold text-slate-500">
                Lịch hẹn sẽ bị hủy và không còn xuất hiện trong danh sách Ca chờ thanh toán.
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button
                onClick={() => pendingDeleteId && handleDelete(pendingDeleteId)}
                disabled={!!deletingId}
                className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-95 shadow-md shadow-red-200 border-b-2 border-white/10 active:border-b-0 active:translate-y-0.5"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                {deletingId ? "Đang xóa..." : "Xóa hóa đơn"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPendingDeleteId(null)}
                className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                Hủy bỏ
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Confirmation Dialog */}
      <Dialog open={!!confirmPrintPayment} onOpenChange={(v) => { if (!v) setConfirmPrintPayment(null); }}>
        <DialogContent className="sm:max-w-[420px] rounded-[24px] border border-blue-100 shadow-2xl p-0 overflow-hidden bg-white">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="p-7">
            <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 mb-4 text-left">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                  Xác nhận kết quả in
                </DialogTitle>
                <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold">
                  Bạn đã in hoặc lưu hóa đơn thành công chưa?
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1.5 mb-6 text-left">
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                Hóa đơn #{confirmPrintPayment?.id.slice(0, 10).toUpperCase()}
              </p>
              <p className="text-[11px] font-bold text-slate-600">
                Khách hàng: {confirmPrintPayment?.patientName || confirmPrintPayment?.userName || "—"}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">
                Nếu chọn &quot;Đã in thành công&quot;, hóa đơn sẽ được đánh dấu đã in. Nếu chọn &quot;Chưa in / Đã hủy&quot;, hóa đơn vẫn giữ nguyên trong danh sách.
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button
                onClick={() => {
                  if (confirmPrintPayment) {
                    markInvoiceAsPrinted(confirmPrintPayment.id);
                  }
                  setConfirmPrintPayment(null);
                }}
                className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-95 shadow-md shadow-emerald-200"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                Đã in thành công (Ẩn khỏi đây)
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmPrintPayment(null)}
                className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Chưa in / Đã hủy (Giữ lại)
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AdminRoleGuard>
  );
}
