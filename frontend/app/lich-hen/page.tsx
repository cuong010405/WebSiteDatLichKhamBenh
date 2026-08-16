"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  Download,
  Trash2,
  Search,
  CalendarPlus,
  ChevronRight,
  ChevronDown,
  X,
  RefreshCw,
  Activity,
  UserCog,
  Home,
  LogOut,
  KeyRound,
  User,
  Lock,
  Save,
  MapPin,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { API_URL, authFetch } from "@/lib/api";
import { Pagination } from "@/components/ui/pagination";

interface StoredVisit {
  id: string;
  staffId: string;
  staffName: string;
  type: string;
  date: string;
  time: string;
  status: string;
  price: string;
  paymentMethod: string;
  paymentStatus?: string;
  address?: string;
  notes?: string;
  paymentNote?: string;
  userPhone?: string;
  careMode?: string | null;
  packagePlan?: string | null;
  packageShift?: string | null;
  duration?: string | null;
  requiredSpecialty?: string | null;
  bookedAt?: string | null;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "Chờ duyệt": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  "Đã xác nhận": {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-400",
  },
  "Đang thực hiện": {
    bg: "bg-blue-600",
    text: "text-white",
    border: "border-blue-600",
    dot: "bg-white",
  },
  "Đã hoàn tất": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  "Đã hủy": {
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

function getEstimatedPrice(type?: string | null, careMode?: string | null, packagePlan?: string | null): string {
  if (careMode === "package" || packagePlan) {
    if (packagePlan === "7days") return "2500000";
    if (packagePlan === "14days") return "4800000";
    if (packagePlan === "30days") return "9500000";
    return "2500000";
  }
  if (!type) return "200000";
  const t = type.toLowerCase();
  if (t.includes("vật lý") || t.includes("phục hồi")) return "500000";
  if (t.includes("truyền") || t.includes("dịch")) return "400000";
  if (t.includes("chăm sóc") || t.includes("điều dưỡng")) return "300000";
  if (t.includes("nội khoa") || t.includes("khám")) return "1200000";
  return "200000";
}

function formatPrice(val: any, fallbackType?: string, careMode?: string | null, packagePlan?: string | null): string {
  const str = val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : "";
  const digitsOnly = str.replace(/[^0-9]/g, "");
  const num = parseInt(digitsOnly, 10);
  if (!isNaN(num) && num > 0) {
    return num.toLocaleString("vi-VN") + " VNĐ";
  }
  const est = getEstimatedPrice(fallbackType, careMode, packagePlan);
  const estNum = parseInt(est, 10) || 200000;
  return estNum.toLocaleString("vi-VN") + " VNĐ";
}

function NavUserMenu({ user, logout, onOpenSettings }: { user: any; logout: () => void; onOpenSettings?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [visitCount, setVisitCount] = React.useState<number | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => {
    if (!user?.id) return;
    authFetch(`${API_URL}/visits?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVisitCount(data.length);
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2)
    : (user?.email?.[0] ?? "?").toUpperCase();

  const displayName = user?.fullName?.split(" ").slice(-1)[0] ?? user?.email ?? "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-3 bg-blue-50/50 p-1.5 pl-4 rounded-full border border-blue-100 shadow-xs hover:bg-blue-100/60 transition-all cursor-pointer"
      >
        <span className="text-xs font-black text-blue-950 uppercase hidden sm:block">
          {displayName}
        </span>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 text-white font-black flex items-center justify-center text-xs uppercase shadow-md shadow-blue-500/20 ring-2 ring-white">
          {initials}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-blue-400 transition-transform duration-200 mr-1 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute right-0 top-full mt-3 w-72 bg-white rounded-[24px] border border-blue-100 shadow-2xl shadow-blue-900/10 overflow-hidden z-50"
          >
            <div className="bg-gradient-to-br from-blue-600 to-sky-500 p-5">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm text-white font-black flex items-center justify-center text-lg uppercase border-2 border-white/30 shadow-xl">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white text-sm leading-tight truncate">{user?.fullName ?? "Bệnh nhân"}</p>
                  <p className="text-blue-100 text-[10px] font-bold mt-0.5 truncate">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5 bg-white/20 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Đã xác thực
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2">
              {onOpenSettings && (
                <button
                  onClick={() => { onOpenSettings(); setOpen(false); }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-blue-50 transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <UserCog className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">Cài đặt tài khoản</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Hồ sơ, bảo mật & mật khẩu</p>
                  </div>
                </button>
              )}

              <button
                onClick={() => { router.push("/dat-lich"); setOpen(false); }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-blue-50 transition-all text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                  <CalendarPlus className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">Đặt lịch khám</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Điền phiếu thông tin khám</p>
                </div>
              </button>

              <button
                onClick={() => { router.push("/lich-hen"); setOpen(false); }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-blue-50 transition-all text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors shrink-0">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">Lịch hẹn của tôi</p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {visitCount !== null ? `${visitCount} lịch đặt` : "Xem lịch sử đặt khám"}
                  </p>
                </div>
              </button>

              <div className="h-px bg-blue-50 mx-2 my-1" />

              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-orange-50 transition-all text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                  <LogOut className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-orange-600">Đăng xuất</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Thoát khỏi tài khoản</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LichHenPage() {
  const { user, loading, updateUser, logout } = useAuth();
  const router = useRouter();

  const isBackendUser = !!user?.id && !user.id.startsWith("CU-");

  // Health Profile State
  const [profile, setProfile] = React.useState<{
    id?: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    summary: string;
    age?: number;
    gender?: string;
  }>({
    id: "BN-0842",
    name: "Evelyn Green",
    phone: "090 987 6543",
    email: "evelyn.green@gmail.com",
    address: "Hẻm 42 Cống Quỳnh, Quận 1, TP. HCM",
    summary:
      "Bệnh nhân có tiền sử cao huyết áp và tiểu đường type 2. Đang trong lộ trình phục hồi sau phẫu thuật thay khớp gối trái.",
    age: 35,
    gender: "Nữ",
  });

  React.useEffect(() => {
    if (user) {
      setProfile({
        id: user.id,
        name: user.fullName,
        phone: user.phone || "Chưa cập nhật",
        email: user.email,
        address: user.address || "",
        summary: user.medicalHistory || "",
        age: user.age ?? 35,
        gender: user.gender ?? "Nam",
      });
    }
  }, [user]);

  // Profile modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [profileModalTab, setProfileModalTab] = React.useState<"profile" | "password">("profile");

  // Edit profile form
  const [editName, setEditName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editAddress, setEditAddress] = React.useState("");
  const [editSummary, setEditSummary] = React.useState("");
  const [editAge, setEditAge] = React.useState("");
  const [editGender, setEditGender] = React.useState("Nam");
  const [genderDropdownOpen, setGenderDropdownOpen] = React.useState(false);
  const genderDropdownRef = React.useRef<HTMLDivElement>(null);

  // Change password form
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");

  // Close gender custom dropdown when clicking outside
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(e.target as Node)) {
        setGenderDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpenProfileEdit = () => {
    setEditName(profile.name);
    setEditPhone(profile.phone);
    setEditAddress(profile.address);
    setEditSummary(profile.summary);
    setEditAge(profile.age ? String(profile.age) : "");
    setEditGender(profile.gender || "Nam");
    setProfileModalTab("profile");
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBackendUser && user?.id) {
      try {
        const res = await authFetch(`${API_URL}/auth/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: editName,
            phone: editPhone,
            age: parseInt(editAge) || null,
            gender: editGender,
            address: editAddress,
            medicalHistory: editSummary,
          }),
        });
        if (!res.ok) throw new Error("Cập nhật thất bại");
        const data = await res.json();
        const storedUser = localStorage.getItem("mintcare_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          localStorage.setItem("mintcare_user", JSON.stringify({
            ...parsed,
            fullName: data.fullName,
            phone: data.phone,
            age: data.age,
            gender: data.gender,
            address: data.address,
            medicalHistory: data.medicalHistory,
          }));
        }
      } catch (err) {
        console.warn("Backend update failed, saving locally:", err);
      }
    }
    if (updateUser) {
      updateUser({
        fullName: editName,
        phone: editPhone,
        age: parseInt(editAge) || null,
        gender: editGender,
        address: editAddress,
        medicalHistory: editSummary,
      });
    }
    setProfile((prev) => ({
      ...prev,
      name: editName,
      phone: editPhone,
      address: editAddress,
      summary: editSummary,
      age: parseInt(editAge) || 35,
      gender: editGender,
    }));
    setIsProfileModalOpen(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) return;
    if (newPassword !== confirmNewPassword) return;
    if (newPassword.length < 6) return;
    if (isBackendUser && user?.id) {
      try {
        const res = await authFetch(`${API_URL}/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        });
        if (!res.ok) throw new Error("API error");
      } catch {
        return;
      }
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsProfileModalOpen(false);
  };

  const [bookings, setBookings] = React.useState<StoredVisit[]>([]);
  const [loadingVisits, setLoadingVisits] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("Tất cả");
  const [page, setPage] = React.useState(1);
  const PER_PAGE = 4;

  const [cancelId, setCancelId] = React.useState<string | null>(null);
  const [cancelReason, setCancelReason] = React.useState("Bận công tác đột xuất");
  const [cancelNote, setCancelNote] = React.useState("");
  const [isCanceling, setIsCanceling] = React.useState(false);
  const [selectedVisit, setSelectedVisit] = React.useState<StoredVisit | null>(null);

  const CANCEL_REASONS = [
    "Bận công tác đột xuất",
    "Thay đổi kế hoạch cá nhân",
    "Sức khỏe đã ổn định",
    "Muốn đổi ngày/giờ khám khác",
    "Lý do khác",
  ];

  // Redirect if not logged in
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/?action=login");
    }
  }, [user, loading, router]);

  const fetchVisits = React.useCallback(async () => {
    if (!user?.id) return;
    setLoadingVisits(true);
    try {
      const res = await authFetch(`${API_URL}/visits?userId=${user.id}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const formatted: StoredVisit[] = list.map((v: any) => {
        const isCancelled = v.status === "Đã hủy" || v.paymentStatus === "Đã hủy";
        return {
          id: v.id,
          staffId: v.staffId,
          staffName: v.staffName || "Chuyên gia y tế",
          type: v.type,
          date: v.date || "",
          time: v.time,
          status: isCancelled ? "Đã hủy" : v.status === "Đã xác nhận" ? "Đang thực hiện" : v.status,
          price: formatPrice(v.price || v.paymentAmount, v.type, v.careMode, v.packagePlan),
          paymentMethod: v.paymentMethod || "Tiền mặt",
          paymentStatus: isCancelled ? "Đã hủy" : v.paymentStatus,
          address: v.address,
          notes: v.notes,
          paymentNote: v.paymentNote,
          userPhone: v.userPhone,
          careMode: v.careMode ?? null,
          packagePlan: v.packagePlan ?? null,
          packageShift: v.packageShift ?? null,
          duration: v.duration ?? null,
          requiredSpecialty: v.requiredSpecialty ?? null,
          bookedAt: (() => {
            const raw = v.bookedAt || v.assignedAt;
            if (!raw) return null;
            try {
              const d = new Date(raw);
              if (isNaN(d.getTime())) return null;
              const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
              const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
              return `${time} - ${date}`;
            } catch { return null; }
          })(),
        };
      });
      setBookings(formatted);
    } catch {
      const stored = localStorage.getItem(`mintcare_visits_${user?.id}`);
      if (stored) setBookings(JSON.parse(stored));
    } finally {
      setLoadingVisits(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchVisits();
    const handleFocus = () => fetchVisits();
    const handleVisitCreated = () => fetchVisits();
    window.addEventListener("focus", handleFocus);
    window.addEventListener("mintcare-visit-created", handleVisitCreated);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("mintcare-visit-created", handleVisitCreated);
    };
  }, [fetchVisits]);

  // Reset page when filter changes
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const totalSpent = React.useMemo(() => {
    return bookings.reduce((sum, b) => {
      // Bỏ qua các ca Đã hủy
      if (b.status === "Đã hủy" || b.paymentStatus === "Đã hủy") return sum;
      const isPaid = b.paymentStatus === "Đã thanh toán" || b.status === "Đã hoàn tất";
      if (!isPaid) return sum;
      const digitsOnly = String(b.price || "").replace(/[^0-9]/g, "");
      const num = parseInt(digitsOnly, 10) || 0;
      return sum + num;
    }, 0);
  }, [bookings]);

  const filteredBookings = React.useMemo(() => {
    const indexed = bookings.map((b, idx) => ({ ...b, _origIdx: idx }));

    const list = indexed.filter((b) => {
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        b.type.toLowerCase().includes(q) ||
        b.staffName.toLowerCase().includes(q) ||
        b.date.includes(q) ||
        b.id.toLowerCase().includes(q);
      const matchStatus = statusFilter === "Tất cả" || b.status === statusFilter;
      return matchQuery && matchStatus;
    });

    // Sort: Mới nhất vừa đặt lên trên cùng (Index nhỏ hơn = Lịch hẹn mới hơn từ API)
    return list.sort((a, b) => a._origIdx - b._origIdx);
  }, [bookings, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PER_PAGE));
  const paginatedBookings = filteredBookings.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDownloadSlip = (booking: StoredVisit) => {
    const content = `
PHIẾU ĐẶT LỊCH KHÁM - MINTCARE
================================
Mã lịch hẹn: #LH-${booking.id}
Dịch vụ: ${booking.type}
Chuyên gia: ${booking.staffName}
Ngày khám: ${booking.date}
Khung giờ: ${booking.time}
Chi phí: ${booking.price}
Phương thức: ${booking.paymentMethod}
Trạng thái: ${booking.status}
================================
    `.trim();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phieu-dat-lich-${booking.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelId) return;
    setIsCanceling(true);
    try {
      await authFetch(`${API_URL}/visits/${cancelId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason, note: cancelNote }),
      });
      setCancelId(null);
      setSelectedVisit(null);
      fetchVisits();
    } catch {
      // silent
    } finally {
      setIsCanceling(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-white to-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-lg" />
      </div>
    );
  }

  const statuses = ["Tất cả", "Chờ duyệt", "Đã xác nhận", "Đang thực hiện", "Đã hoàn tất", "Đã hủy"];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50/60 via-white to-slate-50 text-slate-900 font-sans">
      {/* Header — mirrors homepage navbar exactly */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-blue-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3.5 group cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 transform -rotate-3 transition-transform group-hover:rotate-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black tracking-tighter text-blue-950 uppercase">MintCare Portal</span>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mt-0.5">
                Đặt lịch trực tuyến
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Trang chủ
            </Link>
            <Link href="/doi-ngu" className="hover:text-blue-600 transition-colors">
              Đội ngũ chuyên gia
            </Link>
            <Link href="/dich-vu" className="hover:text-blue-600 transition-colors">
              Dịch vụ
            </Link>
            <Link href="/dat-lich" className="hover:text-blue-600 transition-colors">
              Đặt lịch khám
            </Link>
            <Link href="/#contact-section" className="hover:text-blue-600 transition-colors">
              Liên hệ
            </Link>
          </nav>

          {/* User menu pill */}
          <NavUserMenu user={user} logout={logout} onOpenSettings={handleOpenProfileEdit} />
        </div>
      </header>

      {/* Ambient BG blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[45%] h-[45%] bg-blue-50/50 rounded-full blur-[120px]" />
      </div>

      <main className="relative max-w-7xl mx-auto px-6 py-12 space-y-10">
        {/* Page Header — Thống kê Tổng tiền đã sử dụng & Tổng ca khám */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-4 max-w-xl">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 bg-blue-600/10 px-4 py-2 rounded-full border border-blue-200">
              <Calendar className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">
                Quản lý lịch hẹn trực tuyến
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-blue-950 leading-[1.05] tracking-tight">
              Danh sách <br />
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                Lịch hẹn của bạn.
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
              Theo dõi chi tiết trạng thái, phiếu khám và thông tin các ca hẹn đã đặt.
            </p>
          </div>

          {/* Thẻ Thống kê Tổng Tiền Đã Sử Dụng */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-5 rounded-[28px] shadow-xl shadow-blue-500/20 border border-blue-400/30 flex items-center gap-4 min-w-[230px]">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-100/90 block">
                  Tổng tiền đã sử dụng
                </span>
                <p className="text-xl font-black tracking-tight text-white mt-0.5">
                  {totalSpent.toLocaleString("vi-VN")} VNĐ
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-[28px] border border-blue-100 shadow-lg shadow-blue-900/5 flex items-center gap-4 min-w-[150px]">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Tổng ca khám
                </span>
                <p className="text-xl font-black tracking-tight text-slate-900 mt-0.5">
                  {bookings.filter(b => b.status !== "Đã hủy").length} ca
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search + Filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo dịch vụ, chuyên gia, ngày..."
              className="w-full pl-11 pr-4 h-12 rounded-2xl border border-blue-100 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all shadow-xs"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                  statusFilter === s
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                    : "bg-white text-slate-500 border-blue-100 hover:border-blue-300 hover:text-blue-600"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white border border-blue-100 rounded-[40px] overflow-hidden shadow-xl shadow-blue-900/5"
        >
          {loadingVisits ? (
            <div className="p-10 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 rounded-[28px] bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-blue-200" />
              </div>
              <p className="text-sm font-black text-slate-400">
                {searchQuery || statusFilter !== "Tất cả" ? "Không tìm thấy lịch hẹn phù hợp" : "Bạn chưa có lịch hẹn nào."}
              </p>
              <button
                onClick={() => router.push("/dat-lich")}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest transition-colors"
              >
                <CalendarPlus className="w-4 h-4" /> Đặt lịch ngay
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-blue-50">
                {paginatedBookings.map((booking, i) => {
                    const isPending = booking.status === "Chờ duyệt";
                    const isOngoing = booking.status === "Đang thực hiện";
                    const isCancelled = booking.status === "Đã hủy";
                    const statusCfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG["Đã hủy"];

                    return (
                      <div
                        key={booking.id}
                        onClick={() => setSelectedVisit(booking)}
                        className={cn(
                          "relative px-8 py-6 transition-all hover:bg-blue-50/50 cursor-pointer group",
                          isCancelled && "opacity-60"
                        )}
                      >

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          {/* Left: info */}
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                              <Activity className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[9px] font-black bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md">
                                  #LH-{booking.id}
                                </span>
                                {booking.bookedAt && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100/80">
                                    <Clock className="w-2.5 h-2.5 text-blue-500" />
                                    <span>Đặt lúc: {booking.bookedAt}</span>
                                  </span>
                                )}
                                <span className={cn(
                                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                  statusCfg.bg, statusCfg.text, statusCfg.border
                                )}>
                                  <span className={cn("w-1 h-1 rounded-full", statusCfg.dot)} />
                                  {isCancelled ? "Đã hủy" : booking.status}
                                </span>
                                {booking.paymentStatus === "Đã thanh toán" && !isCancelled && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border bg-green-50 text-green-600 border-green-200">
                                    ✓ Đã thanh toán
                                  </span>
                                )}
                              </div>
                              <h3 className="text-sm font-black text-blue-950 mt-1">{booking.type}</h3>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                {booking.staffName}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-[10px] font-bold text-slate-400">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-400" /> {booking.date}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-400" /> {booking.time}</span>
                                <span className="flex items-center gap-1"><CreditCard className="w-3 h-3 text-blue-400" /> {booking.price}</span>
                              </div>
                              {booking.address && (
                                <p className="flex items-center gap-1 mt-1 text-[10px] font-bold text-blue-600">
                                  <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                                  <span>Địa chỉ: {booking.address}</span>
                                </p>
                              )}
                              {(booking.notes || (booking.paymentNote && !isCancelled)) && (
                                <p className="flex items-start gap-1 mt-1 text-[10px] font-semibold text-slate-600 bg-blue-50/50 p-2 rounded-xl border border-blue-100/60">
                                  <FileText className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                                  <span>Ghi chú/Triệu chứng: {booking.notes || booking.paymentNote}</span>
                                </p>
                              )}
                              {isCancelled && (
                                <div className="mt-2.5 flex items-start gap-2 bg-rose-50 p-3 rounded-2xl border border-rose-200 text-rose-700">
                                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-black text-rose-800 uppercase tracking-widest text-[9px]">Lịch hẹn bị từ chối / hủy bỏ</p>
                                    <p className="mt-0.5 text-[11px] font-medium leading-snug">
                                      {booking.paymentNote || "Lịch hẹn này đã bị hủy hoặc từ chối thực hiện."}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleDownloadSlip(booking)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-100 bg-white text-[9px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-50 transition-colors"
                            >
                              <Download className="w-3 h-3" /> Phiếu
                            </button>
                            {isPending ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); setCancelId(booking.id); setCancelReason("Bận công tác đột xuất"); setCancelNote(""); }}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-white text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" /> Hủy
                              </button>
                            ) : !isCancelled ? (
                              <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-[9px] font-black uppercase tracking-widest text-emerald-600">
                                <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                              </span>
                            ) : null}
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedVisit(booking); }}
                              className="w-8 h-8 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-400 hover:text-blue-600 transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              {filteredBookings.length > PER_PAGE && (
                <div className="p-5 border-t border-blue-50 bg-blue-50/20 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <Footer />

      {/* Cancel Modal — compact, floats above Visit Detail */}
      <AnimatePresence>
        {cancelId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setCancelId(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white rounded-[24px] shadow-2xl shadow-black/20 w-full max-w-[400px] overflow-hidden border border-slate-100"
            >
              {/* Top color bar */}
              <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-pink-400" />

              {/* Header */}
              <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">Hủy lịch hẹn</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Chọn lý do hủy lịch của bạn</p>
                  </div>
                </div>
                <button
                  onClick={() => setCancelId(null)}
                  className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 mt-0.5"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 mx-5" />

              {/* Body */}
              <form onSubmit={handleConfirmCancel}>
                <div className="px-5 py-3 space-y-1.5">
                  {CANCEL_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setCancelReason(r)}
                      className={cn(
                        "w-full text-left px-3.5 py-2.5 rounded-[14px] border text-[11px] font-bold transition-all",
                        cancelReason === r
                          ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                          : "bg-slate-50/80 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      {cancelReason === r && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 mr-2 mb-0.5" />
                      )}
                      {r}
                    </button>
                  ))}
                  {cancelReason === "Lý do khác" && (
                    <textarea
                      value={cancelNote}
                      onChange={(e) => setCancelNote(e.target.value)}
                      placeholder="Nhập lý do cụ thể..."
                      className="w-full rounded-[14px] border border-slate-200 px-3.5 py-2.5 text-[11px] font-semibold resize-none min-h-[64px] focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 mt-1"
                    />
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 pb-4 pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCancelId(null)}
                    className="flex-1 h-9 rounded-[14px] border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Giữ lịch hẹn
                  </button>
                  <button
                    type="submit"
                    disabled={isCanceling}
                    className="flex-1 h-9 rounded-[14px] bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-60 transition-colors shadow-md shadow-rose-200/60"
                  >
                    {isCanceling ? "Đang hủy..." : "Xác nhận hủy"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visit Detail Modal */}
      <AnimatePresence>
        {selectedVisit && (() => {
          const sv = selectedVisit;
          const isCancelledSv = sv.status === "Đã hủy" || sv.paymentStatus === "Đã hủy";
          const scfg = STATUS_CONFIG[isCancelledSv ? "Đã hủy" : sv.status] ?? STATUS_CONFIG["Đã hủy"];
          const isPaid = sv.paymentStatus === "Đã thanh toán" && !isCancelledSv;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedVisit(null); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={cn(
                  "bg-white rounded-[32px] shadow-2xl w-full max-w-[800px] overflow-hidden border border-slate-100 transition-opacity duration-200",
                  cancelId && "opacity-40 pointer-events-none"
                )}
              >
                {/* Top color bar */}
                <div className={cn("h-1.5 w-full", isCancelledSv ? "bg-slate-300" : "bg-gradient-to-r from-blue-600 to-sky-400")} />

                {/* Header */}
                <div className="px-8 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-mono text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">#LH-{sv.id}</span>
                        <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border", scfg.bg, scfg.text, scfg.border)}>
                          <span className={cn("w-1 h-1 rounded-full", scfg.dot)} />
                          {isCancelledSv ? "Đã hủy" : sv.status}
                        </span>
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border bg-green-50 text-green-600 border-green-200">
                            ✓ Đã thanh toán
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-blue-950">{sv.type}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVisit(null)}
                    className="w-8 h-8 rounded-2xl hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 mt-0.5"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-8 py-3.5 space-y-2.5">
                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-blue-50/60 rounded-2xl p-3 border border-blue-100/80">
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Chuyên gia</p>
                      <p className="text-sm font-black text-blue-950 truncate">{sv.staffName}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ngày khám</p>
                      <p className="text-sm font-black text-slate-800">{sv.date || "—"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Khung giờ</p>
                      <p className="text-sm font-black text-slate-800">{sv.time || "—"}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Chi phí</p>
                      <p className="text-sm font-black text-emerald-700">{sv.price}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Hình thức / Gói</p>
                      <p className="text-sm font-bold text-slate-800">
                        {sv.careMode || (sv.packagePlan ? "Theo gói" : "Theo ca / Giờ")}
                        {sv.packagePlan ? ` (${sv.packagePlan})` : ""}
                      </p>
                    </div>
                    {sv.packageShift && (
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ca đăng ký gói</p>
                        <p className="text-sm font-bold text-slate-800">{sv.packageShift}</p>
                      </div>
                    )}
                    {sv.duration && (
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Thời lượng ca</p>
                        <p className="text-sm font-bold text-slate-800">{sv.duration}</p>
                      </div>
                    )}
                    {sv.requiredSpecialty && (
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Yêu cầu chuyên khoa</p>
                        <p className="text-sm font-bold text-slate-800">{sv.requiredSpecialty}</p>
                      </div>
                    )}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Thanh toán</p>
                      <p className="text-sm font-bold text-slate-700">{sv.paymentMethod || "Tiền mặt"}</p>
                    </div>
                    {sv.userPhone && (
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Số điện thoại</p>
                        <p className="text-sm font-bold text-slate-700">{sv.userPhone}</p>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {sv.address && (
                    <div className="flex items-start gap-3 bg-blue-50/50 rounded-2xl p-3 border border-blue-100">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Địa chỉ khám</p>
                        <p className="text-sm font-semibold text-blue-800">{sv.address}</p>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {(sv.notes || (sv.paymentNote && !sv.paymentNote.startsWith("Lý do hủy:"))) && (
                    <div className="flex items-start gap-3 bg-amber-50/50 rounded-2xl p-3 border border-amber-100">
                      <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Ghi chú / Triệu chứng</p>
                        <p className="text-sm font-semibold text-slate-700 leading-relaxed">{sv.notes || sv.paymentNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Cancel reason */}
                  {isCancelledSv && (
                    <div className="flex items-start gap-3 bg-rose-50 rounded-2xl p-3 border border-rose-200">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-0.5">Lịch hẹn bị hủy</p>
                        <p className="text-sm font-semibold text-rose-700 leading-relaxed">
                          {sv.paymentNote?.startsWith("Lý do hủy:") ? sv.paymentNote : "Yêu cầu đặt lịch này không thể thực hiện do chuyên viên bận hoặc không trùng khung giờ phục vụ."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div className="px-8 pb-4 flex gap-3">
                  <button
                    onClick={() => { handleDownloadSlip(sv); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-blue-100 bg-white text-xs font-black uppercase tracking-widest text-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Tải phiếu
                  </button>
                  {sv.status === "Chờ duyệt" && (
                    <button
                      onClick={() => { setCancelId(sv.id); setCancelReason("Bận công tác đột xuất"); setCancelNote(""); }}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-rose-200 bg-white text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Hủy lịch
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedVisit(null)}
                    className="ml-auto flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest transition-colors shadow-md shadow-blue-200"
                  >
                    Đóng
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Consolidated Settings Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] overflow-y-auto flex items-center justify-center p-4 sm:p-6"
            onClick={(e) => { if (e.target === e.currentTarget) setIsProfileModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-100/80 text-slate-800"
            >
              {/* Dynamic Top Indicator Line */}
              <div className={cn(
                "h-1.5 w-full transition-all duration-500 ease-out shrink-0",
                profileModalTab === "profile" 
                  ? "bg-gradient-to-r from-blue-500 to-sky-400" 
                  : "bg-gradient-to-r from-violet-500 to-purple-400"
              )} />

              {/* Header & Tabs */}
              <div className="px-8 pt-7 pb-5 shrink-0 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg transition-all duration-500 ease-out shrink-0",
                    profileModalTab === "profile" 
                      ? "bg-gradient-to-br from-blue-500 to-sky-500 shadow-blue-500/20" 
                      : "bg-gradient-to-br from-violet-500 to-purple-500 shadow-purple-500/20"
                  )}>
                    {profileModalTab === "profile" ? (
                      <UserCog className="w-5 h-5" />
                    ) : (
                      <KeyRound className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                      {profileModalTab === "profile" ? "Hồ sơ cá nhân" : "Đổi mật khẩu"}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                      {profileModalTab === "profile" ? "Cập nhật thông tin tài khoản của bạn" : "Bảo mật tài khoản của bạn"}
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsProfileModalOpen(false)} 
                    className="ml-auto w-8 h-8 rounded-full bg-white border border-slate-100 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer shadow-sm shrink-0"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* Sliding Pill Tab Switcher */}
                <div className="flex bg-slate-100 p-1.5 rounded-[20px] relative max-w-xs">
                  <button
                    type="button"
                    onClick={() => setProfileModalTab("profile")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-black transition-all z-10 cursor-pointer relative",
                      profileModalTab === "profile" ? "text-blue-600 shadow-md bg-white" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    <User className="w-3.5 h-3.5" />
                    Hồ Sơ
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileModalTab("password")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-black transition-all z-10 cursor-pointer relative",
                      profileModalTab === "password" ? "text-violet-600 shadow-md bg-white" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Mật Khẩu
                  </button>
                </div>
              </div>

              {/* Form Container */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {profileModalTab === "profile" ? (
                    <motion.form
                      key="profile-form"
                      onSubmit={handleSaveProfile}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Họ và tên</Label>
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 h-11 text-sm font-semibold transition-all" placeholder="Nguyễn Văn A" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Số điện thoại</Label>
                          <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 h-11 text-sm font-semibold transition-all" placeholder="090 xxx xxxx" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Email</Label>
                          <Input value={user?.email || ""} disabled className="rounded-xl border-slate-100 h-11 text-sm font-semibold bg-slate-50/80 text-slate-400 cursor-not-allowed border" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Địa chỉ</Label>
                          <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 h-11 text-sm font-semibold transition-all" placeholder="Số nhà, đường, quận..." />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tuổi</Label>
                          <Input type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 h-11 text-sm font-semibold transition-all" placeholder="VD: 35" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Giới tính</Label>
                          <div ref={genderDropdownRef} className="relative">
                            <button
                              type="button"
                              onClick={() => setGenderDropdownOpen((o) => !o)}
                              className={`w-full rounded-xl border h-11 bg-white font-bold text-sm text-slate-800 px-4 pr-10 text-left flex items-center transition-all cursor-pointer ${genderDropdownOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300"}`}
                            >
                              <span className="flex-1">
                                {editGender === "Nam" ? "👨 Nam" : editGender === "Nữ" ? "👩 Nữ" : "🧑 Khác"}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-blue-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-200 ${genderDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                              {genderDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                  transition={{ duration: 0.15, ease: "easeOut" }}
                                  className="absolute z-[80] top-[calc(100%+6px)] left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-1.5"
                                >
                                  {[
                                    { value: "Nam", label: "👨 Nam", desc: "Giới tính nam" },
                                    { value: "Nữ", label: "👩 Nữ", desc: "Giới tính nữ" },
                                    { value: "Khác", label: "🧑 Khác", desc: "Giới tính khác" },
                                  ].map((opt) => (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() => { setEditGender(opt.value); setGenderDropdownOpen(false); }}
                                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${editGender === opt.value ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
                                    >
                                      <span className="text-base leading-none">{opt.label.split(" ")[0]}</span>
                                      <div className="flex-1">
                                        <span className="block text-xs font-bold">{opt.value}</span>
                                        <span className="block text-[10px] text-slate-400 font-medium">{opt.desc}</span>
                                      </div>
                                      {editGender === opt.value && (
                                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                                      )}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tiền sử bệnh lý</Label>
                          <Textarea value={editSummary} onChange={(e) => setEditSummary(e.target.value)} className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm font-semibold resize-none transition-all" rows={3} placeholder="Mô tả tình trạng sức khỏe..." />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-2">
                        <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)} className="rounded-xl h-11 px-6 font-black text-xs border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
                          Hủy
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white rounded-xl h-11 px-8 font-black text-xs uppercase tracking-widest shadow-md shadow-blue-500/10 hover:shadow-lg transition-all">
                          <Save className="w-3.5 h-3.5 mr-2" /> Lưu thay đổi
                        </Button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="password-form"
                      onSubmit={handleChangePassword}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mật khẩu hiện tại</Label>
                          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="rounded-xl border-slate-200 h-11 text-sm font-semibold" placeholder="••••••••" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mật khẩu mới</Label>
                          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl border-slate-200 h-11 text-sm font-semibold" placeholder="Phải có ít nhất 6 ký tự" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Xác nhận mật khẩu mới</Label>
                          <Input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="rounded-xl border-slate-200 h-11 text-sm font-semibold" placeholder="Nhập lại mật khẩu mới" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-2">
                        <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)} className="rounded-xl h-11 px-6 font-black text-xs border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
                          Hủy
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 text-white rounded-xl h-11 px-8 font-black text-xs uppercase tracking-widest shadow-md shadow-purple-500/10 hover:shadow-lg transition-all">
                          <Save className="w-3.5 h-3.5 mr-2" /> Đổi Mật Khẩu
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
