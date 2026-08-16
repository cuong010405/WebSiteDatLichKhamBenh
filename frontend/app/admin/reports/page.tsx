"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  Calendar as CalendarIcon,
  Users,
  Activity,
  Heart,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { API_URL, authFetch } from "@/lib/api";
import { exportToExcel, exportToWord } from "@/lib/utils/export";
import { formatCurrencyInput, parseCurrencyNumber } from "@/lib/utils/format";
import { Pagination } from "@/components/ui/pagination";
import { AdminRoleGuard } from "@/components/auth/admin-role-guard";

const DEPT_COLORS = ["#18BE66", "#16A34A", "#18181B", "#E4E4E7"];

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ElementType;
  delay?: number;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  delay,
  loading,
}: StatCardProps) {
  const isPositive = trend?.startsWith("+");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="bg-white border-hairline rounded-3xl p-6 shadow-xs hover:border-primary/20 transition-all group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-surface-tinted/50 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-surface-tinted transition-colors" />

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-surface-secondary flex items-center justify-center text-primary shadow-sm">
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                isPositive
                  ? "bg-surface-tinted text-primary-strong"
                  : "bg-orange-50 text-orange-600",
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {trend}
            </div>
          )}
        </div>
        <p className="eyebrow text-[10px] mb-1 relative z-10">{title}</p>
        {loading ? (
          <div className="h-9 w-20 bg-surface-secondary animate-pulse rounded-xl" />
        ) : (
          <p className="text-3xl font-bold tight-tracking text-foreground relative z-10">
            {value}
          </p>
        )}
      </Card>
    </motion.div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { color: string; name: string; value: number | string }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-hairline p-4 rounded-2xl shadow-lg">
        <p className="text-xs font-bold text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map(
            (
              entry: { color: string; name: string; value: number | string },
              index: number,
            ) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[11px] text-muted-foreground font-medium">
                  {entry.name}:
                </span>
                <span className="text-[11px] font-bold text-foreground">
                  {entry.value}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    );
  }
  return null;
};

interface ReportStats {
  totalVisits: number;
  totalPatients: number;
  totalStaff: number;
  totalPaidVisits: number;
  totalRevenue: number;
  pendingPayments: number;
  patientInflow: { label: string; value: number }[];
  bedOccupancy: number;
  staffHours: { label: string; value: number }[];
  deptBreakdown: { name: string; value: number }[];
}

interface StaffEntry {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface DeletedPaymentLog {
  id: string;
  title: string;
  desc: string;
  time: string;
  createdAt?: string;
}

const recentReports = [
  {
    id: "RP-092",
    name: "Hiệu suất Quý 2/2024",
    type: "PDF",
    date: "12/06/2024",
    size: "2.4 MB",
  },
  {
    id: "RP-091",
    name: "Khảo sát Hài lòng BN",
    type: "Excel",
    date: "10/06/2024",
    size: "1.2 MB",
  },
  {
    id: "RP-090",
    name: "Phân bổ Nhân sự Tháng 5",
    type: "PDF",
    date: "01/06/2024",
    size: "3.1 MB",
  },
];

export interface PaymentVisit {
  id: string;
  type?: string;
  patientName: string;
  staffName: string;
  date?: string;
  time: string;
  paymentMethod?: string;
  paymentAmount?: string;
  paymentNote?: string;
  status: string;
  paymentStatus?: string;
}

const formatReportTimestamp = (raw: any) => {
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

export default function ReportsPage() {
  const [stats, setStats] = React.useState<ReportStats | null>(null);
  const [staffList, setStaffList] = React.useState<StaffEntry[]>([]);
  const [pendingVisits, setPendingVisits] = React.useState<PaymentVisit[]>([]);
  const [allVisits, setAllVisits] = React.useState<PaymentVisit[]>([]);
  const [deletedLogs, setDeletedLogs] = React.useState<DeletedPaymentLog[]>([]);
  const [loadingDeletedLogs, setLoadingDeletedLogs] = React.useState(true);
  const [deletedLogsPage, setDeletedLogsPage] = React.useState(1);
  const DELETED_LOGS_PER_PAGE = 4;

  const totalDeletedLogsPages = Math.max(1, Math.ceil(deletedLogs.length / DELETED_LOGS_PER_PAGE));
  const paginatedDeletedLogs = React.useMemo(() => {
    const start = (deletedLogsPage - 1) * DELETED_LOGS_PER_PAGE;
    return deletedLogs.slice(start, start + DELETED_LOGS_PER_PAGE);
  }, [deletedLogs, deletedLogsPage]);

  const [paymentTab, setPaymentTab] = React.useState<"all" | "pending" | "paid" | "cancelled">("all");
  const [reportsDateMode, setReportsDateMode] = React.useState<"all" | "today" | "month" | "year" | "custom">("all");
  const [reportsCustomDate, setReportsCustomDate] = React.useState<string>("");
  const [dateDropdownOpen, setDateDropdownOpen] = React.useState(false);
  const [dateDropdownPos, setDateDropdownPos] = React.useState({ top: 0, left: 0 });
  const dateBtnRef = React.useRef<HTMLButtonElement>(null);

  const matchesDate = React.useCallback(
    (dateStr?: string, mode: string = "all", customDate: string = "") => {
      if (mode === "all") return true;
      if (!dateStr) return true;

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const thisMonthStr = todayStr.slice(0, 7);
      const thisYearStr = todayStr.slice(0, 4);

      const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.trim();

      if (mode === "today") return cleanDate.startsWith(todayStr);
      if (mode === "month") return cleanDate.startsWith(thisMonthStr);
      if (mode === "year") return cleanDate.startsWith(thisYearStr);
      if (mode === "custom" && customDate) return cleanDate.startsWith(customDate);
      return true;
    },
    []
  );

  const fmtDate = (d?: string) => {
    if (!d) return "";
    const clean = d.includes("T") ? d.split("T")[0] : d.trim();
    const parts = clean.split("-");
    if (parts.length === 3) return parts[2] + "/" + parts[1] + "/" + parts[0];
    return clean;
  };

  const [currentPage, setCurrentPage] = React.useState(1);
  const VISITS_PER_PAGE = 4;
  const [selectedPaymentVisitId, setSelectedPaymentVisitId] =
    React.useState<string>("");
  const [paymentMethod, setPaymentMethod] = React.useState("Tiền mặt");
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentNote, setPaymentNote] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [savingPayment, setSavingPayment] = React.useState(false);
  const [paymentMessage, setPaymentMessage] = React.useState<string | null>(null);

  const fetchJson = async (url: string) => {
    const response = await authFetch(url);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.error || `Fetch failed: ${response.status}`);
    }
    return result;
  };

  // Load deleted invoice logs
  const fetchDeletedLogs = React.useCallback(async () => {
    setLoadingDeletedLogs(true);
    try {
      const res = await authFetch(`${API_URL}/logs`);
      const data = await res.json();
      const logs = Array.isArray(data)
        ? data.filter((l: any) => l.status === "deleted")
        : [];
      setDeletedLogs(
        logs.map((l: any) => ({
          id: l.id,
          title: l.title ?? "",
          desc: l.desc ?? "",
          time: l.time ?? "",
          createdAt: l.createdAt,
        }))
      );
    } catch {
      setDeletedLogs([]);
    } finally {
      setLoadingDeletedLogs(false);
    }
  }, []);

  const refreshReportData = React.useCallback(() => {
    setLoading(true);
    return Promise.all([
      fetchJson(`${API_URL}/reports`),
      fetchJson(`${API_URL}/staff`),
      fetchJson(`${API_URL}/visits`),
      fetchJson(`${API_URL}/payments`),
    ])
      .then(([reportData, staff, allVs, paymentsData]) => {
        const normalizedAll = Array.isArray(allVs) ? allVs : [];
        const paymentsList = Array.isArray(paymentsData) ? paymentsData : [];
        const paymentMap = new Map<string, string>();
        paymentsList.forEach((p: any) => {
          if (p.visitId && p.createdAt) {
            paymentMap.set(p.visitId, p.createdAt);
          }
        });

        const enrichedAll = normalizedAll.map((v: any) => ({
          ...v,
          paymentCreatedAt: paymentMap.get(v.id) || (v.paymentStatus === "Đã thanh toán" ? (v.updatedAt || v.createdAt) : null),
        }));

        const computedPending = enrichedAll.filter(
          (v: any) => {
            // Bỏ qua ca đã hủy
            if (v.status === "Đã hủy" || v.paymentStatus === "Đã hủy") return false;
            // Bỏ qua ca đã hoàn tất
            if (v.status === "Đã hoàn tất") return false;
            // Bỏ qua ca đã thanh toán
            if (v.paymentStatus === "Đã thanh toán") return false;
            // Bỏ qua ca bị admin xóa hóa đơn
            if (v.paymentNote && v.paymentNote.includes("bị xóa/hủy bởi quản trị viên")) return false;
            return true;
          }
        );
        setStats({
          ...reportData,
          pendingPayments: computedPending.length,
        });
        setStaffList(Array.isArray(staff) ? staff : []);
        setPendingVisits(computedPending);
        setAllVisits(enrichedAll);
        if (
          !selectedPaymentVisitId &&
          computedPending.length > 0
        ) {
          setSelectedPaymentVisitId(computedPending[0].id);
        }
      })
      .catch((err) => console.error("[ReportsPage] Lỗi tải dữ liệu báo cáo:", err))
      .finally(() => setLoading(false));
  }, [selectedPaymentVisitId]);

  React.useEffect(() => {
    refreshReportData();
    fetchDeletedLogs();
  }, [refreshReportData, fetchDeletedLogs]);

  const handleExportVisits = () => {
    try {
      const source = allVisits.length > 0 ? allVisits : pendingVisits;
      const data = source.map((v) => ({
        "Mã lịch hẹn": v.id || "—",
        "Bệnh Nhân": v.patientName || "—",
        "Chuyên Gia": v.staffName || "—",
        "Khung Giờ": v.time || "—",
        "Dịch Vụ": v.type || v.status || "—",
        "Phương Thức TT": v.paymentMethod || "—",
        "Số Tiền (VNĐ)": v.paymentAmount
          ? parseCurrencyNumber(v.paymentAmount).toLocaleString("vi-VN")
          : "—",
        "Ghi Chú": v.paymentNote || "Không có",
        "Trạng Thái lịch hẹn": v.status || "—",
        "Trạng Thái TT": v.paymentStatus || "—",
      }));
      exportToExcel(
        data,
        `Bao-Cao-Lich-Hen-${new Date().toISOString().split("T")[0]}.xls`,
        "BÁO CÁO VẬN HÀNH LÂM SÀNG & QUẢN LÝ LỊCH HẸN"
      );

    } catch (e: any) {

    }
  };

  const handleExportWord = () => {
    try {
      const source = allVisits.length > 0 ? allVisits : pendingVisits;
      const data = source.map((v) => ({
        "Mã lịch": v.id || "—",
        "Bệnh Nhân": v.patientName || "—",
        "Chuyên Gia": v.staffName || "—",
        "Khung Giờ": v.time || "—",
        "Dịch Vụ": v.type || v.status || "—",
        "Phương Thức": v.paymentMethod || "—",
        "Số Tiền": v.paymentAmount
          ? parseCurrencyNumber(v.paymentAmount).toLocaleString("vi-VN") + "đ"
          : "—",
        "Ghi Chú": v.paymentNote || "Không có",
        "Trạng Thái": v.status || "—",
        "Thanh Toán": v.paymentStatus || "—",
      }));
      exportToWord(
        data,
        `Bao-Cao-Lam-Sang-${new Date().toISOString().split("T")[0]}.doc`,
        "BÁO CÁO VẬN HÀNH LÂM SÀNG & LỊCH HẸN"
      );

    } catch (e: any) {

    }
  };

  // Build chart data from real stats
  const visitData =
    stats?.patientInflow?.map((item) => ({
      name: item.label,
      visits: item.value,
      previous: Math.round(item.value * 0.85),
    })) ?? [];

  // Dept breakdown from SQL Server data
  const deptData = stats?.deptBreakdown?.map((item, idx) => ({
    name: item.name,
    value: item.value,
    color: DEPT_COLORS[idx % DEPT_COLORS.length],
  })) ?? [
    { name: "Nội khoa", value: 0, color: DEPT_COLORS[0] },
    { name: "Ngoại khoa", value: 0, color: DEPT_COLORS[1] },
    { name: "Phục hồi chức năng", value: 0, color: DEPT_COLORS[2] },
    { name: "Cấp cứu tại gia", value: 0, color: DEPT_COLORS[3] },
  ];

  // Top staff from real data (show first 3 with mock scores)
  const topStaff = staffList.slice(0, 3).map((s, i) => ({
    name: s.name,
    role: s.role,
    score: 98 - i * 3,
    trend: i === 2 ? "-0.5%" : `+${2.4 - i * 0.6}%`,
    avatar: s.avatar || `https://i.pravatar.cc/150?u=${s.id}`,
  }));

  const pendingPaymentOptions = Array.isArray(pendingVisits)
    ? pendingVisits.map((visit) => ({
        value: visit.id,
        label: `${visit.patientName} • ${visit.staffName} • ${visit.time}`,
      }))
    : [];

  const selectedPaymentVisit = pendingVisits.find(
    (visit) => visit.id === selectedPaymentVisitId,
  );

  return (
    <AdminRoleGuard>
      <div className="p-10 max-w-7xl mx-auto w-full space-y-12">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-surface-tinted px-3 py-1.5 rounded-full border border-primary/10 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="eyebrow text-[10px] font-black uppercase tracking-widest text-primary-strong">
                Thống kê vận hành lâm sàng
              </span>
            </div>
            <div className="w-px h-4 bg-hairline" />
            <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-widest">
              Dữ liệu thời gian thực
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tight-tracking text-foreground leading-[1.1] uppercase text-left">
            Báo cáo <br />
            Vận hành
          </h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-2xl font-medium leading-relaxed antialiased text-left">
            Phân tích chuyên sâu về hiệu suất đội ngũ y tế, lưu lượng bệnh nhân và các chỉ số hài lòng trong thời gian thực.
          </p>
        </motion.div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            className="rounded-full px-4 border-hairline bg-white h-11 text-xs font-semibold flex items-center gap-2 shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
          >
            <CalendarIcon className="w-4 h-4 text-primary" /> Hôm nay{" "}
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
          <Button
            onClick={handleExportVisits}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 h-11 text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" /> Xuất Excel (.csv)
          </Button>
          <Button
            onClick={handleExportWord}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 h-11 text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer shrink-0"
          >
            <FileText className="w-4 h-4" /> Xuất Word (.doc)
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Tổng lượt thăm khám"
          value={stats?.totalVisits ?? "..."}
          trend="+12.5%"
          icon={Activity}
          delay={0.1}
          loading={loading}
        />
        <StatCard
          title="Bệnh nhân đang quản lý"
          value={stats?.totalPatients ?? "..."}
          trend="+8%"
          icon={Users}
          delay={0.2}
          loading={loading}
        />
        <StatCard
          title="Chỉ số Hài lòng (CSAT)"
          value="98.2%"
          trend="+0.4%"
          icon={Heart}
          delay={0.3}
          loading={loading}
        />
        <StatCard
          title="Nhân viên y tế"
          value={stats?.totalStaff ?? "..."}
          trend={`${stats?.totalStaff ? "+" + stats.totalStaff : "..."}`}
          icon={Clock}
          delay={0.4}
          loading={loading}
        />
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visit Trends Chart */}
        <Card className="lg:col-span-2 bg-white border-hairline rounded-[40px] p-10 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-center mb-12 relative z-10">
            <div>
              <h3 className="text-xl font-bold tight-tracking">
                Lưu lượng Thăm khám
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                So sánh số lượt khám thực tế với tuần trước
              </p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-on-surface-tertiary uppercase tracking-wider">
                  Tuần này
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-hairline" />
                <span className="text-[10px] font-bold text-on-surface-tertiary uppercase tracking-wider">
                  Tuần trước
                </span>
              </div>
            </div>
          </div>

          <div
            className="h-[380px] w-full relative z-10 min-w-0"
            style={{ minWidth: 0 }}
          >
            {loading ? (
              <div className="w-full h-full bg-surface-secondary/40 animate-pulse rounded-3xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                <AreaChart
                  data={visitData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorVisits"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#18BE66"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#18BE66" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#F1F1F4"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#A1A1AA", fontWeight: 600 }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#A1A1AA", fontWeight: 600 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    name="Tuần này"
                    type="monotone"
                    dataKey="visits"
                    stroke="#18BE66"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorVisits)"
                    animationDuration={1500}
                  />
                  <Area
                    name="Tuần trước"
                    type="monotone"
                    dataKey="previous"
                    stroke="#E4E4E7"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="transparent"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Dept Breakdown Pie */}
        <Card className="bg-white border-hairline rounded-[40px] p-10 shadow-xs flex flex-col h-full">
          <div className="mb-10">
            <h3 className="text-xl font-bold tight-tracking">
              Cơ cấu Chuyên khoa
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Phân bổ khối lượng công việc
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div
              className="h-[240px] w-full relative min-w-0"
              style={{ minWidth: 0 }}
            >
              {loading ? (
                <div className="w-full h-full bg-surface-secondary/40 animate-pulse rounded-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                  <PieChart>
                    <Pie
                      data={deptData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={100}
                      paddingAngle={10}
                      dataKey="value"
                      animationDuration={1500}
                      animationBegin={200}
                    >
                      {deptData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold tight-tracking">100%</span>
                <span className="text-[10px] uppercase font-bold text-on-surface-tertiary tracking-widest mt-1">
                  Tổng cộng
                </span>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              {deptData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between group cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold font-mono">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="bg-white border-hairline rounded-[40px] p-10 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl font-bold tight-tracking">
                Tóm tắt thanh toán
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Kiểm tra danh sách ca thanh toán chờ và hoàn tất thanh toán tại
                đây.
              </p>
            </div>
            <Button
              onClick={() => refreshReportData()}
              variant="outline"
              className="rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.18em]"
            >
              Làm mới báo cáo
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-slate-50 border border-slate-200 p-6 rounded-[32px] shadow-none">
              <p className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 mb-3">
                Số ca đã thanh toán
              </p>
              <p className="text-3xl font-bold text-foreground">
                {stats?.totalPaidVisits ?? "..."}
              </p>
            </Card>
            <Card className="bg-slate-50 border border-slate-200 p-6 rounded-[32px] shadow-none">
              <p className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 mb-3">
                Doanh thu
              </p>
              <p className="text-3xl font-bold text-foreground">
                {stats
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(stats.totalRevenue)
                  : "..."}
              </p>
            </Card>
            <Card className="bg-slate-50 border border-slate-200 p-6 rounded-[32px] shadow-none">
              <p className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 mb-3">
                Thanh toán chờ
              </p>
              <p className="text-3xl font-bold text-foreground">
                {stats?.pendingPayments ?? "..."}
              </p>
            </Card>
          </div>

          <div className="mt-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] font-black text-slate-400">
                  {paymentTab === "pending"
                    ? "Danh sách ca chờ thanh toán"
                    : paymentTab === "paid"
                    ? "Danh sách ca đã thanh toán"
                    : paymentTab === "cancelled"
                    ? "Danh sách ca đã hủy"
                    : "Danh sách tất cả các ca"}
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Lọc thời gian: {reportsDateMode === "today" ? "Hôm nay" : reportsDateMode === "month" ? "Tháng này" : reportsDateMode === "year" ? "Năm nay" : reportsDateMode === "custom" && reportsCustomDate ? `Ngày ${reportsCustomDate}` : "Tất cả"}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-nowrap py-1">
                {/* Custom Combobox Lọc Thời Gian */}
                <div className="relative shrink-0">
                  <button
                    ref={dateBtnRef}
                    onClick={() => {
                      if (!dateDropdownOpen && dateBtnRef.current) {
                        const r = dateBtnRef.current.getBoundingClientRect();
                        setDateDropdownPos({ top: r.bottom + 6, left: r.left });
                      }
                      setDateDropdownOpen(o => !o);
                    }}
                    className="h-9 flex items-center gap-2 px-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs font-bold cursor-pointer shadow-xs hover:border-emerald-300 hover:bg-emerald-50/40 transition-all focus:outline-none"
                  >
                    <span className="text-emerald-600">📅</span>
                    <span>
                      {reportsDateMode === "today" ? "Hôm nay"
                        : reportsDateMode === "month" ? "Tháng này"
                        : reportsDateMode === "year" ? "Năm nay"
                        : reportsDateMode === "custom" && reportsCustomDate ? fmtDate(reportsCustomDate)
                        : "Tất cả thời gian"}
                    </span>
                    <svg className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", dateDropdownOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {dateDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDateDropdownOpen(false)} />
                      <div
                        className="fixed z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden min-w-[170px] py-1"
                        style={{ top: dateDropdownPos.top, left: dateDropdownPos.left }}
                      >
                        {([
                          { value: "all", label: "Tất cả thời gian", icon: "🗓️" },
                          { value: "today", label: "Hôm nay", icon: "☀️" },
                          { value: "month", label: "Tháng này", icon: "📆" },
                          { value: "year", label: "Năm nay", icon: "📊" },
                        ] as { value: "all"|"today"|"month"|"year"; label: string; icon: string }[]).map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setReportsDateMode(opt.value);
                              setReportsCustomDate("");
                              setCurrentPage(1);
                              setDateDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-left transition-colors cursor-pointer",
                              reportsDateMode === opt.value
                                ? "bg-emerald-50 text-emerald-700 font-bold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                          >
                            <span className="text-base leading-none">{opt.icon}</span>
                            {opt.label}
                            {reportsDateMode === opt.value && (
                              <span className="ml-auto text-emerald-500">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Custom Date Input */}
                <input
                  type="date"
                  value={reportsCustomDate}
                  onChange={(e) => {
                    setReportsCustomDate(e.target.value);
                    setReportsDateMode(e.target.value ? "custom" : "all");
                    setCurrentPage(1);
                  }}
                  className="h-9 text-xs font-semibold px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-xs shrink-0"
                  title="Chọn ngày cụ thể"
                />

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shadow-inner shrink-0">
                  <button
                    onClick={() => {
                      setPaymentTab("all");
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                      paymentTab === "all"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    Tất cả ({allVisits.filter(v => matchesDate(v.date || (v as any).createdAt, reportsDateMode, reportsCustomDate)).length})
                  </button>
                  <button
                    onClick={() => {
                      setPaymentTab("pending");
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                      paymentTab === "pending"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    Ca chờ ({pendingVisits.filter(v => matchesDate(v.date || (v as any).createdAt, reportsDateMode, reportsCustomDate)).length})
                  </button>
                  <button
                    onClick={() => {
                      setPaymentTab("paid");
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                      paymentTab === "paid"
                        ? "bg-white text-emerald-700 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    Đã thanh toán ({allVisits.filter(v => (v.paymentStatus === "Đã thanh toán" || v.status === "Đã hoàn tất") && matchesDate(v.date || (v as any).createdAt, reportsDateMode, reportsCustomDate)).length})
                  </button>
                  <button
                    onClick={() => {
                      setPaymentTab("cancelled");
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                      paymentTab === "cancelled"
                        ? "bg-white text-red-600 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    Đã hủy ({allVisits.filter(v => (v.status === "Đã hủy" || v.paymentStatus === "Đã hủy") && matchesDate(v.date || (v as any).createdAt, reportsDateMode, reportsCustomDate)).length})
                  </button>
                </div>
              </div>
            </div>

            {(() => {
              const rawList =
                paymentTab === "pending"
                  ? pendingVisits
                  : paymentTab === "paid"
                  ? allVisits.filter((v) => v.paymentStatus === "Đã thanh toán" || v.status === "Đã hoàn tất")
                  : paymentTab === "cancelled"
                  ? allVisits.filter((v) => v.status === "Đã hủy" || v.paymentStatus === "Đã hủy")
                  : allVisits;
              const activeList = rawList.filter(v => matchesDate(v.date || (v as any).createdAt, reportsDateMode, reportsCustomDate));
              const totalPages = Math.ceil(activeList.length / VISITS_PER_PAGE) || 1;
              const paginatedVisits = activeList.slice(
                (currentPage - 1) * VISITS_PER_PAGE,
                currentPage * VISITS_PER_PAGE
              );

              return (
                <>
                  <div className="space-y-3">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="h-20 rounded-[24px] bg-slate-100 animate-pulse"
                        />
                      ))
                    ) : paginatedVisits.length > 0 ? (
                      paginatedVisits.map((visit) => {
                        const isPaid = visit.paymentStatus === "Đã thanh toán" || visit.status === "Đã hoàn tất";
                        const isCancelled = visit.status === "Đã hủy";
                        const phone = (visit as any).userPhone || (visit as any).phone;
                        const address = (visit as any).address || (visit as any).customerArea;
                        const note = (visit as any).cancelReason || (visit as any).notes || (visit as any).paymentNote;

                        return (
                          <div
                            key={visit.id}
                            className={cn(
                              "rounded-[24px] border p-4 transition-all",
                              isCancelled
                                ? "border-red-200 bg-red-50/30 hover:bg-red-50/50"
                                : "border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-sm"
                            )}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-black text-slate-900">
                                    {visit.patientName || "Chưa có tên BN"}
                                  </p>
                                  <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md">
                                    #{visit.id?.slice(-8).toUpperCase()}
                                  </span>
                                  {phone && (
                                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                      📞 {phone}
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] font-semibold text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <span className="text-emerald-700 font-bold">👨‍⚕️ {visit.staffName || "Chưa phân công"}</span>
                                  {visit.date && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
                                        📅 {fmtDate(visit.date)}
                                      </span>
                                    </>
                                  )}
                                  {visit.time && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">⏰ {visit.time}</span>
                                    </>
                                  )}
                                  {visit.type && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <span className="text-slate-800 font-bold">🩺 {visit.type}</span>
                                    </>
                                  )}
                                </p>

                                {address && (
                                  <p className="text-[10px] font-medium text-slate-500 truncate">
                                    📍 {address}
                                  </p>
                                )}

                                <div className="flex items-center gap-2 flex-wrap pt-1">
                                  {formatReportTimestamp((visit as any).bookedAt || (visit as any).assignedAt || (visit as any).createdAt) && (
                                    <span className="text-[9.5px] font-black text-blue-700 bg-blue-50/90 px-2 py-0.5 rounded-md border border-blue-100/80">
                                      🕐 Đặt lúc: {formatReportTimestamp((visit as any).bookedAt || (visit as any).assignedAt || (visit as any).createdAt)}
                                    </span>
                                  )}
                                  {isPaid && formatReportTimestamp((visit as any).paymentCreatedAt || (visit as any).updatedAt) && (
                                    <span className="text-[9.5px] font-black text-emerald-700 bg-emerald-50/90 px-2 py-0.5 rounded-md border border-emerald-100/80">
                                      💳 Thanh toán lúc: {formatReportTimestamp((visit as any).paymentCreatedAt || (visit as any).updatedAt)}
                                    </span>
                                  )}
                                </div>

                                {isCancelled && note && (
                                  <p className="text-[10px] font-semibold text-red-500 italic mt-0.5">
                                    Lý do hủy: {note}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-end sm:items-end justify-between sm:justify-center flex-row sm:flex-col gap-2 shrink-0">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={cn(
                                      "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider",
                                      isCancelled
                                        ? "bg-red-100 text-red-700 border border-red-200"
                                        : visit.status === "Chờ duyệt"
                                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    )}
                                  >
                                    {visit.status}
                                  </span>
                                  <span
                                    className={cn(
                                      "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider",
                                      isPaid
                                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                                        : "bg-slate-200 text-slate-600"
                                    )}
                                  >
                                    {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                                  </span>
                                </div>
                                {visit.paymentAmount && (
                                  <p className={cn(
                                    "text-sm font-black font-mono",
                                    isCancelled ? "text-red-500 line-through" : "text-emerald-600"
                                  )}>
                                    {parseCurrencyNumber(visit.paymentAmount).toLocaleString("vi-VN")}đ
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-xs text-slate-500 uppercase tracking-[0.2em] py-12">
                        {paymentTab === "pending"
                          ? "Không có ca chờ thanh toán"
                          : "Không có ca khám nào"}
                      </p>
                    )}
                  </div>

                  {activeList.length > VISITS_PER_PAGE && (
                    <div className="mt-4 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                      />
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </Card>
      </div>

      {/* Lịch sử xóa hóa đơn */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-white border-hairline rounded-[40px] p-10 shadow-xs">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold tight-tracking">Lịch sử xóa hóa đơn</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Ghi nhận các trường hợp hóa đơn bị xóa bởi quản trị viên</p>
              </div>
            </div>
            <button
              onClick={fetchDeletedLogs}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300"
            >
              Làm mới
            </button>
          </div>

          {loadingDeletedLogs ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : deletedLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                <ShieldAlert className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">Chưa có hóa đơn nào bị xóa</p>
              <p className="text-[10px] text-slate-300 mt-1">Mọi thao tác xóa hóa đơn sẽ được ghi lại tại đây</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedDeletedLogs.map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-2xl border border-red-100 bg-red-50/40 hover:bg-red-50/70 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-black text-slate-800 leading-snug">{log.title}</p>
                        <span className="text-[9px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider">Đã xóa</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed break-all">{log.desc}</p>
                      <p className="text-[9px] text-slate-400 mt-1.5 font-semibold">🕐 {log.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {deletedLogs.length > DELETED_LOGS_PER_PAGE && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={deletedLogsPage}
                    totalPages={totalDeletedLogsPages}
                    onPageChange={(page) => setDeletedLogsPage(page)}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </motion.div>

      {/* Bottom Section: Staff Rank & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Top Staff Table/List */}
        <Card className="lg:col-span-6 bg-white border-hairline rounded-[40px] p-10 shadow-xs">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold tight-tracking">
                Nhân viên Xuất sắc
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Dựa trên kết quả điều trị và phản hồi BN
              </p>
            </div>
            <Button
              variant="ghost"
              className="text-primary-strong text-xs font-bold hover:bg-surface-tinted rounded-full px-5 transition-all"
            >
              Tất cả bảng xếp hạng
            </Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-surface-secondary/40 animate-pulse rounded-[24px]"
                />
              ))
            ) : topStaff.length > 0 ? (
              topStaff.map((person, i) => (
                <motion.div
                  key={person.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-[24px] border border-transparent hover:border-hairline hover:bg-surface-secondary/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={
                          person.avatar ||
                          `https://i.pravatar.cc/150?u=${encodeURIComponent(person.name)}`
                        }
                        className="w-12 h-12 rounded-2xl object-cover border border-hairline"
                        alt={person.name}
                      />
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-white rounded-full border border-hairline flex items-center justify-center text-[10px] font-bold shadow-sm">
                        {i + 1}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold group-hover:text-primary transition-colors">
                        {person.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                        {person.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-on-surface-tertiary uppercase mb-0.5">
                        Hài lòng
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {person.score}%
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold min-w-[70px] justify-center",
                        person.trend.startsWith("+")
                          ? "bg-surface-tinted text-primary-strong"
                          : "bg-orange-50 text-orange-600",
                      )}
                    >
                      {person.trend.startsWith("+") ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {person.trend}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-400 uppercase tracking-widest py-8">
                Chưa có dữ liệu nhân sự
              </p>
            )}
          </div>
        </Card>

        {/* Recent Downloads/Reports */}
        <Card className="lg:col-span-4 bg-surface-secondary/40 border-hairline border-dashed rounded-[40px] p-10 flex flex-col">
          <div className="mb-10">
            <h3 className="text-xl font-bold tight-tracking">
              Báo cáo Gần đây
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Truy cập nhanh các tập tin đã tạo
            </p>
          </div>

          <div className="flex-1 space-y-4">
            {recentReports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-white border border-hairline rounded-3xl p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-on-surface-tertiary group-hover:bg-primary group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold truncate pr-4">
                        {report.name}
                      </p>
                      <span className="text-[9px] font-bold bg-surface-secondary px-1.5 py-0.5 rounded uppercase tracking-widest">
                        {report.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium">
                      <span>ID: {report.id}</span>
                      <span>{report.date}</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Button
            variant="outline"
            className="mt-10 w-full rounded-full border-hairline bg-white h-12 text-sm font-bold hover:bg-white/80"
          >
            Xem kho lưu trữ
          </Button>
        </Card>
      </div>
    </div>
    </AdminRoleGuard>
  );
}
