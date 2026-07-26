"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Download,
  Trash2,
  Search,
  LogOut,
  Home,
  X,
  CalendarPlus,
  ChevronRight,
  ChevronDown,
  Activity,
  Users,
  Stethoscope,
  AlertCircle,
  UserCog,
  KeyRound,
  User,
  Lock,
  Save,
  Eye,
  EyeOff,
  Award,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { API_URL, authFetch } from "@/lib/api";
import { Pagination } from "@/components/ui/pagination";
import { staff as mockStaff } from "@/lib/mock-data";

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
}

interface StaffMember {
  id?: string;
  staffId?: string;
  name?: string;
  fullName?: string;
  role?: string;
  department?: string;
  available?: boolean;
}

interface ServiceItem {
  id?: string;
  serviceId?: string;
  name?: string;
  serviceName?: string;
  price?: number;
  duration?: string;
}

const PAYMENT_METHODS = [
  { value: "Tiền mặt", label: "Tiền mặt tại gia" },
  { value: "Chuyển khoản", label: "Chuyển khoản ngân hàng" },
  { value: "Ví điện tử", label: "Ví điện tử MoMo/ZaloPay" },
];

const TIME_SLOTS = ["08:00", "10:00", "14:00", "16:00", "18:00"];

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: "SV-01", name: "Chăm sóc & Khám bệnh tổng quát tại nhà", price: 200000, duration: "1-2h" },
  { id: "SV-02", name: "Chăm sóc vết thương & Thay băng y tế", price: 250000, duration: "1h" },
  { id: "SV-03", name: "Vật lý trị liệu & Phục hồi chức năng", price: 350000, duration: "1.5h" },
  { id: "SV-04", name: "Chăm sóc người cao tuổi & Bệnh nhân tại gia", price: 300000, duration: "4h" },
];

// ─── User pill + dropdown (mirrors homepage exactly) ────────────────────────
function NavUserMenu({ user, logout, onOpenSettings }: { user: any; logout: () => void; onOpenSettings?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2)
    : (user?.email?.[0] ?? "?").toUpperCase();

  const displayName = user?.fullName?.split(" ").slice(-1)[0] ?? user?.email ?? "?";

  return (
    <div className="relative" ref={ref}>
      {/* Pill button */}
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

      {/* Dropdown panel — same as homepage */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute right-0 top-full mt-3 w-72 bg-white rounded-[24px] border border-blue-100 shadow-2xl shadow-blue-900/10 overflow-hidden z-50"
          >
            {/* Header gradient */}
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

            {/* Menu items */}
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
                <div className="w-9 h-9 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">Lịch hẹn của bạn</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Xem lịch sử đặt khám</p>
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

export default function DatLichPage() {
  const { user, loading, updateUser, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [staff, setStaff] = React.useState<any[]>(mockStaff);
  const [myBookings, setMyBookings] = React.useState<StoredVisit[]>([]);
  const [bookingPage, setBookingPage] = React.useState(1);
  const BOOKINGS_PER_PAGE = 4;

  const [bookingStaffId, setBookingStaffId] = React.useState("");
  const [bookingServiceId, setBookingServiceId] = React.useState("");
  const [bookingDate, setBookingDate] = React.useState("");
  const [bookingSlot, setBookingSlot] = React.useState("");
  const [bookingAddress, setBookingAddress] = React.useState("");
  const [bookingPayment, setBookingPayment] = React.useState("Tiền mặt");
  const [bookingNotes, setBookingNotes] = React.useState("");
  const [qrConfirmed, setQrConfirmed] = React.useState(false);
  // Dispatch: customer tells us what specialty they need & where they are
  const [requiredSpecialty, setRequiredSpecialty] = React.useState("");
  const [customerArea, setCustomerArea] = React.useState("");

  // Hourly vs Long-term Package care mode state
  const [careMode, setCareMode] = React.useState<"hourly" | "package">("hourly");
  const [hourlyHours, setHourlyHours] = React.useState<number>(4);
  const [packagePlan, setPackagePlan] = React.useState<"7days" | "14days" | "30days">("7days");
  const [packageShift, setPackageShift] = React.useState<"4h" | "8h" | "12h" | "24h">("4h");

  // Helper for closing time limit (20:00)
  const getSlotStartHour = (slot: string) => {
    if (!slot || !slot.includes(":")) return 8;
    return parseInt(slot.split(":")[0], 10) || 8;
  };

  const currentSlotHour = bookingSlot ? getSlotStartHour(bookingSlot) : null;

  const handleSelectBookingSlot = (slotTime: string) => {
    setBookingSlot(slotTime);
    const startH = getSlotStartHour(slotTime);
    const maxH = Math.max(0, 20 - startH);

    if (careMode === "hourly" && hourlyHours > maxH) {
      const validOptions = [2, 4, 8, 12].filter((h) => h <= maxH);
      const newH = validOptions.length > 0 ? Math.max(...validOptions) : 2;
      setHourlyHours(newH);
      addToast(
        `Khung giờ ${slotTime} giới hạn tối đa ${maxH}h (hệ thống nghỉ lúc 20:00). Đã tự động chuyển sang ca ${newH}h!`,
        "info"
      );
    }
  };

  const [toasts, setToasts] = React.useState<{ id: number; msg: string; type: "success" | "error" | "info" }[]>([]);

  const addToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  // Cancel Booking Modal state & handler
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [cancelBookingId, setCancelBookingId] = React.useState<string | null>(null);
  const [cancelReason, setCancelReason] = React.useState("Bận công tác đột xuất");
  const [cancelNote, setCancelNote] = React.useState("");
  const [isCanceling, setIsCanceling] = React.useState(false);

  const CANCEL_REASONS = [
    "Bận công tác đột xuất",
    "Thay đổi kế hoạch cá nhân",
    "Sức khỏe đã ổn định",
    "Muốn đổi ngày/giờ khám khác",
    "Lý do khác",
  ];

  const openCancelModal = (bookingId: string) => {
    setCancelBookingId(bookingId);
    setCancelReason("Bận công tác đột xuất");
    setCancelNote("");
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelBookingId) return;

    setIsCanceling(true);
    try {
      const res = await authFetch(`${API_URL}/visits/${cancelBookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: cancelReason,
          note: cancelNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hủy lịch hẹn thất bại");

      addToast("Hủy lịch hẹn thành công! Đã gửi thông báo đến Admin.", "success");
      setIsCancelModalOpen(false);
      fetchMyVisits();
    } catch (err: any) {
      addToast(err.message || "Lỗi hủy lịch hẹn. Vui lòng thử lại.", "error");
    } finally {
      setIsCanceling(false);
    }
  };

  const isBackendUser = !!user?.id && !user.id.startsWith("CU-");

  // Health Profile State (Defaulting to simulated patient Evelyn Green)
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
      if (user.address) {
        setBookingAddress(user.address);
      }
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
  const [showCurrentPw, setShowCurrentPw] = React.useState(false);
  const [showNewPw, setShowNewPw] = React.useState(false);

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

    // Attempt backend update via /auth/profile (non-blocking, no admin required)
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
        // Backend failed – proceed with local update anyway
        console.warn("Backend update failed, saving locally:", err);
      }
    }

    // Always update local state and auth context
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
    addToast("Cập nhật hồ sơ cá nhân thành công!", "success");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      addToast("Vui lòng điền đầy đủ thông tin.", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast("Mật khẩu xác nhận không khớp.", "error");
      return;
    }
    if (newPassword.length < 6) {
      addToast("Mật khẩu mới phải có ít nhất 6 ký tự.", "error");
      return;
    }
    if (isBackendUser && user?.id) {
      try {
        const res = await authFetch(`${API_URL}/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        });
        if (!res.ok) throw new Error("API error");
        addToast("Đổi mật khẩu thành công!", "success");
      } catch {
        addToast("Không thể đổi mật khẩu lúc này. Thử lại sau.", "error");
        return;
      }
    } else {
      addToast("Đổi mật khẩu thành công!", "success");
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsProfileModalOpen(false);
  };

  React.useEffect(() => {
    fetch(`${API_URL}/services/active`)
      .then((r) => r.json())
      .then((servicesData) => {
        const list = Array.isArray(servicesData) && servicesData.length > 0 ? servicesData : DEFAULT_SERVICES;
        setServices(list);
        setBookingServiceId((prev) => prev || (list[0].id || list[0].serviceId || "SV-01"));
      })
      .catch(() => {
        setServices(DEFAULT_SERVICES);
        setBookingServiceId((prev) => prev || "SV-01");
      });

    fetch(`${API_URL}/staff`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setStaff(data);
      })
      .catch(() => {});
  }, []);

  const fetchMyVisits = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await authFetch(`${API_URL}/visits?userId=${user.id}`);
      if (!res.ok) {
        throw new Error(`API error (${res.status})`);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const formatted: StoredVisit[] = list.map((v: any) => {
        const svc = services.find((s: any) => (s.id || s.serviceId) === v.type);
        const priceValue = svc?.price || 0;
        return {
          id: v.id,
          staffId: v.staffId,
          staffName: v.staffName || (v.staffId === "PENDING" ? "⏳ Chờ phân công" : "Chuyên gia y tế"),
          type: v.type,
          date: v.date || "",
          time: v.time,
          status: v.status,
          price: priceValue.toLocaleString("vi-VN") + " VNĐ",
          paymentMethod: v.paymentMethod || "Tiền mặt",
          paymentStatus: v.paymentStatus,
          address: v.address,
          notes: v.notes,
          paymentNote: v.paymentNote,
          userPhone: v.userPhone,
        };
      });
      setMyBookings(formatted);
    } catch {
      const stored = localStorage.getItem(`mintcare_visits_${user?.id}`);
      if (stored) setMyBookings(JSON.parse(stored));
    }
  }, [user, services]);

  React.useEffect(() => {
    fetchMyVisits();
  }, [fetchMyVisits]);

  React.useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(fetchMyVisits, 15000);
    return () => clearInterval(interval);
  }, [fetchMyVisits, user]);

  const calculateEndTime = (start: string, duration: string): string => {
    if (!start || !duration) return "";
    const [h, m] = start.split(":").map(Number);
    const hours = parseFloat(duration.replace("h", ""));
    const totalMinutes = h * 60 + m + hours * 60;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
  };

  const calculatePricing = React.useCallback(() => {
    const activeService = services.find((s) => (s.id || s.serviceId) === bookingServiceId) || services[0];
    const baseServicePrice = activeService?.price || 200000;
    
    if (careMode === "hourly") {
      const hourlyRate = baseServicePrice;
      const total = hourlyRate * hourlyHours;
      return {
        total,
        originalTotal: total,
        discountText: null,
        labelText: `${hourlyHours} giờ chăm sóc`,
        subText: `${hourlyRate.toLocaleString("vi-VN")}đ/h × ${hourlyHours} giờ`,
        modeTitle: `⏱️ Theo giờ (${hourlyHours}h)`,
      };
    } else {
      const days = packagePlan === "7days" ? 7 : packagePlan === "14days" ? 14 : 30;
      const discountRate = packagePlan === "7days" ? 0.10 : packagePlan === "14days" ? 0.15 : 0.25;
      const shiftMult = packageShift === "4h" ? 1.0 : packageShift === "8h" ? 1.8 : packageShift === "12h" ? 2.5 : 4.0;
      
      const dailyRate = Math.round(baseServicePrice * 2 * shiftMult);
      const originalTotal = dailyRate * days;
      const total = Math.round(originalTotal * (1 - discountRate));
      const savings = originalTotal - total;
      
      return {
        total,
        originalTotal,
        discountText: `Tiết kiệm ${Math.round(discountRate * 100)}% (-${savings.toLocaleString("vi-VN")}đ)`,
        labelText: `Gói ${days} ngày (Ca ${packageShift})`,
        subText: `${dailyRate.toLocaleString("vi-VN")}đ/ngày × ${days} ngày`,
        modeTitle: `📦 Gói ${days} ngày (Ca ${packageShift})`,
      };
    }
  }, [careMode, hourlyHours, packagePlan, packageShift, bookingServiceId, services]);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingServiceId || !bookingDate || !bookingSlot) {
      addToast("Vui lòng điền đầy đủ thông tin đặt lịch hẹn.", "error");
      return;
    }
    if (bookingPayment === "Chuyển khoản" && !qrConfirmed) {
      addToast("Vui lòng quét QR và xác nhận đã chuyển khoản.", "error");
      return;
    }

    const selectedService = services.find((s) => (s.id || s.serviceId) === bookingServiceId);
    if (!selectedService) {
      addToast("Dịch vụ không hợp lệ. Vui lòng chọn lại.", "error");
      return;
    }

    const pricing = calculatePricing();
    const newId = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    const duration = careMode === "hourly" ? `${hourlyHours}h` : `Gói ${packagePlan === "7days" ? "7 ngày" : packagePlan === "14days" ? "14 ngày" : "30 ngày"}`;
    const endTime = calculateEndTime(bookingSlot, careMode === "hourly" ? `${hourlyHours}h` : "4h");
    const effectiveArea = customerArea || bookingAddress || user?.address || "";

    const newVisitObj: Record<string, any> = {
      id: newId,
      type: selectedService.name || selectedService.serviceName || "Khám bệnh tại nhà",
      date: bookingDate,
      userId: user?.id,
      // staffId intentionally omitted — backend dispatch engine assigns it
      time: `${bookingSlot} - ${endTime}`,
      startTime: bookingSlot,
      endTime: endTime,
      duration,
      careMode,
      packagePlan: careMode === "package" ? packagePlan : null,
      packageShift: careMode === "package" ? packageShift : null,
      paymentAmount: String(pricing.total),
      status: "Chờ duyệt",
      paymentMethod: bookingPayment,
      address: bookingAddress,
      notes: bookingNotes,
      // Dispatch metadata
      customerArea: effectiveArea,
      requiredSpecialty: requiredSpecialty || null,
    };

    if (bookingAddress && bookingAddress !== user?.address) {
      authFetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: bookingAddress }),
      }).catch(() => {});
      if (updateUser) {
        updateUser({ address: bookingAddress });
      }
    }

    if (bookingPayment === "Chuyển khoản" && qrConfirmed) {
      newVisitObj.paymentStatus = "Đã thanh toán";
      newVisitObj.paymentAmount = String(selectedService.price);
    }

    authFetch(`${API_URL}/visits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVisitObj),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Lỗi khi đặt lịch. Vui lòng thử lại.");
        }
        return data;
      })
      .then((data) => {
        const assigned = data?.staffName && data.staffName !== "⏳ Chờ phân công";
        addToast(
          assigned
            ? `Đặt lịch thành công! Chuyên gia ${data.staffName} sẽ đến chăm sóc bạn.`
            : "Gửi yêu cầu thành công! Hệ thống đang điều phối chuyên gia phù hợp.",
          "success"
        );
        setBookingDate("");
        setBookingSlot("");
        setBookingNotes("");
        setRequiredSpecialty("");
        setQrConfirmed(false);
        fetchMyVisits();
      })
      .catch((err: any) => {
        addToast(err?.message || "Lỗi khi đặt lịch. Vui lòng thử lại.", "error");
      });
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Bạn có chắc muốn hủy lịch hẹn này?")) return;
    try {
      await authFetch(`${API_URL}/visits/${id}`, { method: "DELETE" });
      addToast("Đã hủy lịch hẹn.", "success");
      fetchMyVisits();
    } catch {
      addToast("Lỗi khi hủy lịch.", "error");
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-white to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-600/20" />
          <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const activeService = services.find((s) => (s.id || s.serviceId) === bookingServiceId) || services[0];
  const selectedService = activeService;
  const selectedStaff = staff.find((s) => (s.id || s.staffId) === bookingStaffId);

  const formProgress = [
    bookingStaffId ? 1 : 0,
    bookingServiceId ? 1 : 0,
    bookingDate ? 1 : 0,
    bookingSlot ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50/60 via-white to-slate-50 text-slate-900 font-sans">
      {/* Toast - Error: hình tròn X giữa màn hình */}
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center pointer-events-none">
        <AnimatePresence>
          {toasts.filter(t => t.type === "error").map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="flex flex-col items-center gap-4 pointer-events-auto"
            >
              <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-2xl shadow-red-500/40">
                <XCircle className="w-14 h-14 text-white" strokeWidth={2} />
              </div>
              <p className="text-base font-bold text-slate-800 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg border border-red-100 text-center max-w-xs">
                {t.msg}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Toast - Success & Info: góc phải dưới */}
      <div className="fixed bottom-6 right-6 z-[150] flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.filter(t => t.type !== "error").map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={cn(
                "p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md pointer-events-auto",
                t.type === "success"
                  ? "bg-white border-blue-200 text-blue-900"
                  : "bg-white border-blue-100 text-slate-800",
              )}
            >
              {t.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-blue-500 shrink-0 animate-pulse" />
              )}
              <span className="text-xs font-black tracking-tight">{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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

          <nav className="hidden md:flex items-center gap-8 text-slate-500">
            <button
              onClick={() => router.push("/")}
              className="text-xs font-black uppercase tracking-wider hover:text-blue-600 transition-colors cursor-pointer"
            >
              Trang chủ
            </button>
            <button
              onClick={() => router.push("/#specialists-section")}
              className="text-xs font-black uppercase tracking-wider hover:text-blue-600 transition-colors cursor-pointer"
            >
              Đội ngũ chuyên gia
            </button>
            <span className="text-xs font-black uppercase tracking-wider text-blue-600">
              Đặt lịch khám
            </span>
            <button
              onClick={() => router.push("/#contact-section")}
              className="text-xs font-black uppercase tracking-wider hover:text-blue-600 transition-colors cursor-pointer"
            >
              Liên hệ
            </button>
          </nav>

          {/* User pill + dropdown — same as homepage */}
          <NavUserMenu user={user} logout={logout} onOpenSettings={handleOpenProfileEdit} />
        </div>
      </header>

      {/* Ambient BG blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[45%] h-[45%] bg-blue-50/50 rounded-full blur-[120px]" />
      </div>

      <main className="relative max-w-7xl mx-auto px-6 py-12 space-y-10">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-5"
        >
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-blue-600/10 px-4 py-2 rounded-full border border-blue-200">
            <CalendarPlus className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">
              Đặt lịch khám trực tuyến
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-blue-950 leading-[1.05] tracking-tight">
            Phiếu thông tin <br />
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
              Khám bệnh tại nhà.
            </span>
          </h1>
          <p className="text-base text-slate-500 max-w-xl font-medium leading-relaxed">
            Điền đầy đủ thông tin để đặt lịch hẹn. Sau khi gửi, Admin sẽ phê duyệt và điều phối lịch trực.
          </p>

          {/* Progress indicator */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    step <= formProgress ? "w-8 bg-blue-600" : "w-4 bg-blue-100"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              {formProgress}/4 hoàn chỉnh
            </span>
          </div>
        </motion.div>

        {/* Form + Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Booking Form */}
          <motion.form
            onSubmit={handleCreateBooking}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-[40px] p-8 shadow-xl shadow-blue-900/5 space-y-6"
          >
            {/* Form header */}
            <div className="flex items-center gap-3 pb-2 border-b border-blue-50">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <CalendarPlus className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black text-blue-950 uppercase tracking-wider">Thông tin đặt lịch</h2>
                <p className="text-[10px] text-slate-400 font-semibold">Lựa chọn hình thức dịch vụ & thời gian bên dưới</p>
              </div>
            </div>

            {/* Mode Switcher: Theo Giờ vs Gói Dài Hạn */}
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-400">
                Hình thức chăm sóc y tế
              </Label>
              <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setCareMode("hourly")}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
                    careMode === "hourly"
                      ? "bg-white text-blue-600 shadow-md shadow-blue-900/5 ring-1 ring-black/5 scale-[1.02]"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                  )}
                >
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>⏱️ Chăm sóc theo giờ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCareMode("package")}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
                    careMode === "package"
                      ? "bg-white text-emerald-600 shadow-md shadow-emerald-900/5 ring-1 ring-black/5 scale-[1.02]"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                  )}
                >
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>📦 Gói dài hạn (Tuần / Tháng)</span>
                </button>
              </div>
            </div>



            {/* Chuyên môn mong muốn */}
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-400">
                Chuyên môn mong muốn <span className="text-slate-400 font-normal normal-case">(tuỳ chọn)</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "Điều dưỡng", label: "💉 Điều dưỡng viên" },
                  { value: "Vật lý trị liệu", label: "🏃 Vật lý trị liệu" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRequiredSpecialty(requiredSpecialty === opt.value ? "" : opt.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-200 cursor-pointer",
                      requiredSpecialty === opt.value
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25 scale-[1.03]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:bg-blue-50/50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 1: Service only */}
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-400">
                Dịch vụ chăm sóc
              </Label>
              <Select value={bookingServiceId} onValueChange={(val) => setBookingServiceId(val || "")}>
                <SelectTrigger className="w-full rounded-2xl border-blue-100 h-12 bg-white font-bold text-sm shadow-none text-slate-800 focus:ring-2 focus:ring-blue-600/20 hover:border-blue-200 transition-colors">
                  <SelectValue placeholder="Chọn loại dịch vụ">
                    {bookingServiceId
                      ? (() => { const sv = services.find((x) => String(x.id || x.serviceId) === String(bookingServiceId)); return sv ? (sv.name || sv.serviceName || bookingServiceId) : bookingServiceId; })()
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-blue-100 shadow-2xl shadow-blue-900/10 p-2 bg-white">
                  {services.map((serv) => {
                    const svid = String(serv.id || serv.serviceId || "");
                    const svname = serv.name || serv.serviceName || svid;
                    return (
                      <SelectItem key={svid} value={svid} className="rounded-xl py-2.5 font-bold text-xs focus:bg-blue-50 cursor-pointer">
                        {svname}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>


            {/* Conditional Options: Hourly Care vs Long-term Package */}
            {careMode === "hourly" ? (
              <div className="space-y-2.5 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/80">
                <div className="flex items-center justify-between">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Số giờ chăm sóc tại nhà
                  </Label>
                  <span className="text-xs font-black text-blue-950 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                    {hourlyHours} giờ / ca
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { hours: 2, label: "2 giờ", desc: "Ca ngắn" },
                    { hours: 4, label: "4 giờ", desc: "Nửa ngày" },
                    { hours: 8, label: "8 giờ", desc: "Cả ngày" },
                    { hours: 12, label: "12 giờ", desc: "Ca đêm" },
                  ].map((item) => {
                    const isExceeding20h = currentSlotHour !== null && item.hours > (20 - currentSlotHour);
                    return (
                      <button
                        key={item.hours}
                        type="button"
                        disabled={isExceeding20h}
                        onClick={() => {
                          if (isExceeding20h) {
                            addToast(`Khung giờ ${bookingSlot} bắt đầu lúc ${bookingSlot}, ca ${item.hours}h sẽ vượt quá 20:00 giờ nghỉ!`, "error");
                            return;
                          }
                          setHourlyHours(item.hours);
                        }}
                        className={cn(
                          "p-3 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-center relative",
                          isExceeding20h
                            ? "bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                            : hourlyHours === item.hours
                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.03] cursor-pointer"
                              : "bg-white border-blue-100 text-slate-700 hover:border-blue-300 hover:bg-white cursor-pointer"
                        )}
                      >
                        <span className="text-xs font-black">{item.label}</span>
                        <span className={cn(
                          "text-[9px] font-bold mt-0.5",
                          isExceeding20h
                            ? "text-rose-500 font-black"
                            : hourlyHours === item.hours
                              ? "text-blue-100"
                              : "text-slate-400"
                        )}>
                          {isExceeding20h ? "Vượt quá 20:00" : item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
                {/* Package Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-700 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" /> Lựa chọn Gói chăm sóc dài hạn
                    </Label>
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      Tiết kiệm đến 25%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { plan: "7days", name: "Gói 7 Ngày", sub: "Gói Tuần", badge: "-10%" },
                      { plan: "14days", name: "Gói 14 Ngày", sub: "2 Tuần", badge: "-15%" },
                      { plan: "30days", name: "Gói 30 Ngày", sub: "Gói Tháng", badge: "-25% Best" },
                    ].map((item) => (
                      <button
                        key={item.plan}
                        type="button"
                        onClick={() => setPackagePlan(item.plan as any)}
                        className={cn(
                          "relative p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between",
                          packagePlan === item.plan
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.03]"
                            : "bg-white border-emerald-200/80 text-slate-700 hover:border-emerald-300"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black">{item.name}</span>
                          </div>
                          <p className={cn("text-[9px] font-bold mt-0.5", packagePlan === item.plan ? "text-emerald-100" : "text-slate-400")}>
                            {item.sub}
                          </p>
                        </div>
                        <span className={cn(
                          "mt-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-md inline-block text-center w-fit",
                          packagePlan === item.plan ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                        )}>
                          {item.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shift Selection */}
                <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-700">
                    Khung Ca làm việc mỗi ngày
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { shift: "4h", label: "Ca 4h", desc: "Nửa ngày" },
                      { shift: "8h", label: "Ca 8h", desc: "Hành chính" },
                      { shift: "12h", label: "Ca 12h", desc: "Ca đêm" },
                      { shift: "24h", label: "Ca 24/7", desc: "Toàn thời gian" },
                    ].map((item) => (
                      <button
                        key={item.shift}
                        type="button"
                        onClick={() => setPackageShift(item.shift as any)}
                        className={cn(
                          "p-2.5 rounded-xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center",
                          packageShift === item.shift
                            ? "bg-emerald-700 border-emerald-700 text-white shadow-sm"
                            : "bg-white border-emerald-200 text-slate-700 hover:bg-emerald-50"
                        )}
                      >
                        <span className="text-xs font-black">{item.label}</span>
                        <span className={cn("text-[8px] font-bold mt-0.5", packageShift === item.shift ? "text-emerald-200" : "text-slate-400")}>
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Row 2: Date + Time Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-400">
                  Chọn ngày khám
                </Label>
                <Input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-2xl border-blue-100 h-12 bg-white font-bold text-sm shadow-none text-slate-800 focus:ring-2 focus:ring-blue-600/20 hover:border-blue-200 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-400">
                  Khung giờ rảnh rỗi
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((time) => {
                    const slotH = getSlotStartHour(time);
                    const maxH = Math.max(0, 20 - slotH);
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleSelectBookingSlot(time)}
                        className={cn(
                          "py-2.5 border text-xs font-black rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer",
                          bookingSlot === time
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105"
                            : "bg-white border-blue-100 hover:border-blue-300 hover:bg-blue-50 text-slate-700"
                        )}
                      >
                        <span>{time}</span>
                        {careMode === "hourly" && maxH < 12 && (
                          <span className={cn(
                            "text-[8px] font-extrabold leading-none",
                            bookingSlot === time ? "text-blue-100" : "text-blue-600/80"
                          )}>
                            (Tối đa {maxH}h)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 3: Address + Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-400">
                  Địa chỉ khám bệnh tại nhà
                </Label>
                <Input
                  value={bookingAddress}
                  onChange={(e) => setBookingAddress(e.target.value)}
                  placeholder="Nhập địa chỉ khám tại nhà (số nhà, đường, quận/huyện...)"
                  className="w-full rounded-2xl border-blue-100 h-12 bg-white font-bold text-sm shadow-none text-slate-800 focus:ring-2 focus:ring-blue-600/20 hover:border-blue-200 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-400">
                  Phương thức thanh toán
                </Label>
                <Select
                  value={bookingPayment}
                  onValueChange={(val) => {
                    setBookingPayment(val || "Tiền mặt");
                    setQrConfirmed(false);
                  }}
                >
                  <SelectTrigger className="w-full rounded-2xl border-blue-100 h-12 bg-white font-bold text-sm shadow-none text-slate-800 focus:ring-2 focus:ring-blue-600/20 hover:border-blue-200 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-blue-100 shadow-2xl shadow-blue-900/10 p-2 bg-white">
                    {PAYMENT_METHODS.map((pm) => (
                      <SelectItem key={pm.value} value={pm.value} className="rounded-xl py-2.5 font-bold text-xs focus:bg-blue-50 cursor-pointer">
                        {pm.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-400">
                Mô tả triệu chứng lâm sàng
              </Label>
              <Textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Mô tả cụ thể triệu chứng, lịch sử dùng thuốc hoặc các vấn đề cần lưu ý..."
                className="rounded-2xl border-blue-100 bg-white focus:bg-white transition-all min-h-[100px] shadow-none font-semibold leading-relaxed text-sm text-slate-800 focus:ring-2 focus:ring-blue-600/20 resize-none hover:border-blue-200"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-2xl h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gửi yêu cầu đặt lịch hẹn
            </Button>
          </motion.form>

          {/* Payment Preview Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-5 space-y-5"
          >
            {/* Summary Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-[40px] p-8 shadow-xl shadow-blue-900/5">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-50">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-sm font-black text-blue-950 uppercase tracking-wider">Chi tiết thanh toán</h4>
              </div>

              {(bookingServiceId || services.length > 0 || careMode === "package") ? (
                (() => {
                  const pricing = calculatePricing();
                  return (
                    <div className="space-y-4">
                      {/* Detail rows */}
                      {[
                        { label: "Dịch vụ", value: selectedService?.name || "" },
                        { label: "Hình thức", value: careMode === "hourly" ? "⏱️ Chăm sóc theo giờ" : "📦 Gói dài hạn" },
                        { label: "Chi tiết ca", value: pricing.labelText },
                        bookingStaffId ? { label: "Chuyên gia", value: selectedStaff?.name || "" } : null,
                        { label: "Ngày khám", value: bookingDate || "Chưa chọn ngày" },
                        { label: "Khung giờ", value: bookingSlot || "Chưa chọn giờ" },
                        { label: "Địa chỉ", value: bookingAddress || profile?.address || "Chưa nhập địa chỉ" },
                        { label: "Thanh toán", value: PAYMENT_METHODS.find((p) => p.value === bookingPayment)?.label || bookingPayment },
                      ].filter(Boolean).map((item: any) => (
                        <div key={item.label} className="flex justify-between items-center py-1 border-b border-blue-50/50">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.label}:</span>
                          <span className="text-xs font-black text-blue-950">{item.value}</span>
                        </div>
                      ))}

                      {/* QR Transfer */}
                      {bookingPayment === "Chuyển khoản" && (
                        <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-100 space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-center">Quét QR để chuyển khoản</p>
                          <div className="flex justify-center">
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-50">
                              <svg viewBox="0 0 200 200" className="w-36 h-36" xmlns="http://www.w3.org/2000/svg">
                                <rect width="200" height="200" fill="white" />
                                <rect x="20" y="20" width="40" height="40" fill="#1D4ED8" />
                                <rect x="25" y="25" width="30" height="30" fill="white" />
                                <rect x="30" y="30" width="20" height="20" fill="#1D4ED8" />
                                <rect x="140" y="20" width="40" height="40" fill="#1D4ED8" />
                                <rect x="145" y="25" width="30" height="30" fill="white" />
                                <rect x="150" y="30" width="20" height="20" fill="#1D4ED8" />
                                <rect x="20" y="140" width="40" height="40" fill="#1D4ED8" />
                                <rect x="25" y="145" width="30" height="30" fill="white" />
                                <rect x="30" y="150" width="20" height="20" fill="#1D4ED8" />
                                <rect x="70" y="20" width="10" height="10" fill="#1D4ED8" />
                                <rect x="90" y="20" width="10" height="10" fill="#1D4ED8" />
                                <rect x="110" y="20" width="10" height="10" fill="#1D4ED8" />
                                <rect x="70" y="70" width="60" height="60" fill="#1D4ED8" />
                                <rect x="75" y="75" width="50" height="50" fill="white" />
                                <rect x="80" y="80" width="40" height="40" fill="#1D4ED8" />
                                <rect x="85" y="85" width="30" height="30" fill="white" />
                                <rect x="90" y="90" width="20" height="20" fill="#1D4ED8" />
                              </svg>
                            </div>
                          </div>
                          <div className="text-center space-y-1.5">
                            <p className="text-[11px] font-bold text-slate-600">Ngân hàng: <span className="text-blue-600 font-black">Vietcombank</span></p>
                            <p className="text-[11px] font-bold text-slate-600">Số TK: <span className="text-blue-600 font-black">1234567890</span></p>
                            <p className="text-[11px] font-bold text-slate-600">Chủ TK: <span className="text-blue-600 font-black">CONG TY TNHH MINTCARE</span></p>
                          </div>
                          {!qrConfirmed ? (
                            <button
                              type="button"
                              onClick={() => setQrConfirmed(true)}
                              className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-blue-700 hover:to-sky-600 transition-all shadow-lg shadow-blue-600/20"
                            >
                              ✓ Xác nhận đã chuyển khoản
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-2 py-3 bg-blue-50 rounded-xl border border-blue-200">
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Đã xác nhận chuyển khoản</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Price Calculation breakdown */}
                      <div className="border-t border-blue-100 pt-5 mt-4 space-y-2">
                        <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold">
                          <span>Đơn giá cơ sở:</span>
                          <span>{pricing.subText}</span>
                        </div>
                        {pricing.discountText && (
                          <div className="flex justify-between items-center text-emerald-600 text-[10px] font-black">
                            <span>Ưu đãi gói:</span>
                            <span>{pricing.discountText}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng chi phí gói chăm sóc</p>
                          <p className="text-3xl font-black text-blue-950 tracking-tighter">
                            {pricing.total.toLocaleString("vi-VN")}
                            <span className="text-sm text-slate-400 ml-1">đ</span>
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">* Đã bao gồm VAT và toàn bộ phí di chuyển của chuyên gia</p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 rounded-[28px] bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-7 h-7 text-blue-200" />
                  </div>
                  <p className="text-sm font-black text-slate-400">Chọn dịch vụ để xem chi phí</p>
                  <p className="text-[10px] text-slate-300 font-bold mt-1">Điền form bên trái để bắt đầu</p>
                </div>
              )}
            </div>

            {/* Quick Info Card */}
            <div className="bg-gradient-to-br from-blue-600 to-sky-500 rounded-[32px] p-6 text-white space-y-3 shadow-xl shadow-blue-600/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Thông tin bệnh nhân</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm text-white font-black flex items-center justify-center text-lg uppercase border-2 border-white/30">
                  {(user.fullName || user.email || "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-white text-sm">{user.fullName || "Bệnh nhân"}</p>
                  <p className="text-blue-100 text-[10px] font-bold">{user.email}</p>
                </div>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Tài khoản đã xác thực</span>
              </div>
            </div>
          </motion.div>
        </div>

      </main>

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
                    suppressHydrationWarning 
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                        <div className="space-y-1.5 md:col-span-2">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mật khẩu hiện tại</Label>
                          <div className="relative">
                            <Input
                              type={showCurrentPw ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 h-11 text-sm font-semibold pr-10"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPw(!showCurrentPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mật khẩu mới</Label>
                          <div className="relative">
                            <Input
                              type={showNewPw ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 h-11 text-sm font-semibold pr-10"
                              placeholder="Tối thiểu 6 ký tự"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPw(!showNewPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Xác nhận mật khẩu</Label>
                          <Input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 h-11 text-sm font-semibold"
                            placeholder="Nhập lại mật khẩu mới"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-2">
                        <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)} className="rounded-xl h-11 px-6 font-black text-xs border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
                          Hủy
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 text-white rounded-xl h-11 px-8 font-black text-xs uppercase tracking-widest shadow-md shadow-violet-500/10 hover:shadow-lg transition-all">
                          <Lock className="w-3.5 h-3.5 mr-2" /> Đổi mật khẩu
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
      {/* Cancel Booking Popup Modal */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden p-7 text-slate-900"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Hủy lịch hẹn</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã phiếu: #{cancelBookingId}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmCancel} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vui lòng chọn lý do hủy <span className="text-rose-500">*</span></Label>
                  <div className="relative">
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs text-slate-800 px-3.5 pr-8 appearance-none outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
                    >
                      {CANCEL_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ghi chú bổ sung (nếu có)</Label>
                  <Textarea
                    value={cancelNote}
                    onChange={(e) => setCancelNote(e.target.value)}
                    placeholder="Nhập thêm chi tiết lý do hủy..."
                    className="rounded-2xl border-slate-200 text-xs font-semibold resize-none h-20"
                  />
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-[10px] font-bold text-amber-800 leading-relaxed flex items-start gap-2">
                  <span className="text-base leading-none">⚠️</span>
                  <span>Thông báo lý do hủy sẽ được gửi trực tiếp đến hệ thống Ban Quản Trị phòng khám.</span>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCancelModalOpen(false)}
                    className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-wider border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    Quay lại
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCanceling}
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 px-6 text-xs font-black uppercase tracking-wider shadow-md shadow-rose-500/20"
                  >
                    {isCanceling ? "Đang xử lý..." : "Xác nhận hủy"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
