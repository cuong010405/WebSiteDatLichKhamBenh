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
  time: string;
  paymentMethod?: string;
  paymentAmount?: string;
  paymentNote?: string;
  status: string;
  paymentStatus?: string;
}

export default function ReportsPage() {
  const [stats, setStats] = React.useState<ReportStats | null>(null);
  const [staffList, setStaffList] = React.useState<StaffEntry[]>([]);
  const [pendingVisits, setPendingVisits] = React.useState<PaymentVisit[]>([]);
  const [allVisits, setAllVisits] = React.useState<PaymentVisit[]>([]);
  const [paymentTab, setPaymentTab] = React.useState<"pending" | "all">("pending");
  const [selectedPaymentVisitId, setSelectedPaymentVisitId] =
    React.useState<string>("");
  const [paymentMethod, setPaymentMethod] = React.useState("Tiền mặt");
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentNote, setPaymentNote] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [savingPayment, setSavingPayment] = React.useState(false);
  const [paymentMessage, setPaymentMessage] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchJson = async (url: string) => {
    const response = await authFetch(url);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.error || `Fetch failed: ${response.status}`);
    }
    return result;
  };

  const refreshReportData = React.useCallback(() => {
    setLoading(true);
    // URL-encode Vietnamese query params
    const visitParams = new URLSearchParams({
      status: "Đã xác nhận",
      paymentStatus: "Chưa thanh toán",
    });
    return Promise.all([
      fetchJson(`${API_URL}/reports`),
      fetchJson(`${API_URL}/staff`),
      fetchJson(`${API_URL}/visits?${visitParams.toString()}`),
      fetchJson(`${API_URL}/visits`),
    ])
      .then(([reportData, staff, pendingVs, allVs]) => {
        setStats(reportData);
        setStaffList(Array.isArray(staff) ? staff : []);
        setPendingVisits(Array.isArray(pendingVs) ? pendingVs : []);
        setAllVisits(Array.isArray(allVs) ? allVs : []);
        if (
          !selectedPaymentVisitId &&
          Array.isArray(pendingVs) &&
          pendingVs.length > 0
        ) {
          setSelectedPaymentVisitId(pendingVs[0].id);
        }
      })
      .catch((err) => console.error("[ReportsPage] Lỗi tải dữ liệu báo cáo:", err))
      .finally(() => setLoading(false));
  }, [selectedPaymentVisitId]);

  React.useEffect(() => {
    refreshReportData();
  }, [refreshReportData]);

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
      showToast(`Đã xuất ${data.length} lịch hẹn sang Excel thành công!`, "ok");
    } catch (e: any) {
      showToast(e?.message || "Không thể xuất báo cáo", "err");
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
      showToast(`Đã xuất ${data.length} lịch hẹn sang Word (.doc) thành công!`, "ok");
    } catch (e: any) {
      showToast(e?.message || "Không thể xuất báo cáo Word", "err");
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
    <div className="p-10 max-w-7xl mx-auto w-full space-y-12">
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
                : "bg-red-50 text-red-700 border-red-200"
            )}
          >
            {toast.type === "ok" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {toast.msg}
            <button onClick={() => setToast(null)} className="ml-1 opacity-50 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
              <ResponsiveContainer width="100%" height="100%">
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
                <ResponsiveContainer width="100%" height="100%">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="text-xs uppercase tracking-[0.2em] font-black text-slate-400">
                {paymentTab === "pending"
                  ? "Danh sách ca chờ thanh toán"
                  : "Danh sách tất cả các ca"}
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit">
                <button
                  onClick={() => setPaymentTab("pending")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    paymentTab === "pending"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Ca chờ thanh toán ({pendingVisits.length})
                </button>
                <button
                  onClick={() => setPaymentTab("all")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    paymentTab === "all"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Xem tất cả ({allVisits.length})
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-20 rounded-[24px] bg-slate-100 animate-pulse"
                  />
                ))
              ) : (paymentTab === "pending" ? pendingVisits : allVisits).length > 0 ? (
                (paymentTab === "pending" ? pendingVisits : allVisits).map((visit) => {
                  const isPaid = visit.paymentStatus === "Đã thanh toán";
                  return (
                    <div
                      key={visit.id}
                      className="rounded-[28px] border border-slate-200 p-4 bg-slate-50 hover:bg-white hover:shadow-sm transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">
                              {visit.patientName || "Chưa có tên BN"}
                            </p>
                            <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md">
                              #{visit.id?.slice(-6)}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {visit.staffName} • {visit.time} {visit.type ? `• ${visit.type}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center sm:items-end justify-between sm:justify-center flex-row sm:flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider",
                                visit.status === "Đã hủy"
                                  ? "bg-red-100 text-red-700"
                                  : visit.status === "Chờ duyệt"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-emerald-100 text-emerald-800"
                              )}
                            >
                              {visit.status}
                            </span>
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider",
                                isPaid
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-slate-200 text-slate-600"
                              )}
                            >
                              {visit.paymentStatus || "Chưa TT"}
                            </span>
                          </div>
                          {visit.paymentAmount && (
                            <p className="text-xs font-black text-slate-800 font-mono">
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
          </div>
        </Card>
      </div>


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
                        src={person.avatar}
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
  );
}
