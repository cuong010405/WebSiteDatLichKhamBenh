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
                onClick={() => { router.push("/"); setOpen(false); }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-blue-50 transition-all text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <Home className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">Trang chủ</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Quay về trang chính</p>
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

  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [myBookings, setMyBookings] = React.useState<StoredVisit[]>([]);

  const [bookingStaffId, setBookingStaffId] = React.useState("");
  const [bookingServiceId, setBookingServiceId] = React.useState("");
  const [bookingDate, setBookingDate] = React.useState("");
  const [bookingSlot, setBookingSlot] = React.useState("");
  const [bookingPayment, setBookingPayment] = React.useState("Tiền mặt");
  const [bookingNotes, setBookingNotes] = React.useState("");
  const [qrConfirmed, setQrConfirmed] = React.useState(false);

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
        address: "Hẻm 42 Cống Quỳnh, Quận 1, TP. HCM",
        summary: "Hồ sơ cá nhân tự động đồng bộ từ tài khoản hệ thống.",
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
    Promise.all([
      fetch(`${API_URL}/staff`).then((r) => r.json()),
      fetch(`${API_URL}/services/active`).then((r) => r.json()),
    ])
      .then(([staffData, servicesData]) => {
        setStaff(Array.isArray(staffData) ? staffData : []);
        setServices(Array.isArray(servicesData) ? servicesData : []);
      })
      .catch(() => {});
  }, []);

  const fetchMyVisits = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await authFetch(`${API_URL}/visits?userId=${user.id}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const formatted: StoredVisit[] = list.map((v: any) => {
        const svc = services.find((s: any) => (s.id || s.serviceId) === v.type);
        const priceValue = svc?.price || 0;
        return {
          id: v.id,
          staffId: v.staffId,
          staffName: v.staffName || staff.find((s) => s.id === v.staffId)?.name || "Chuyên gia y tế",
          type: v.type,
          date: v.date || "",
          time: v.time,
          status: v.status,
          price: priceValue.toLocaleString("vi-VN") + " VNĐ",
          paymentMethod: v.paymentMethod || "Tiền mặt",
        };
      });
      setMyBookings(formatted);
    } catch {
      const stored = localStorage.getItem(`mintcare_visits_${user?.id}`);
      if (stored) setMyBookings(JSON.parse(stored));
    }
  }, [user, services, staff]);

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

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingStaffId || !bookingServiceId || !bookingDate || !bookingSlot) {
      addToast("Vui lòng điền đầy đủ thông tin đặt lịch hẹn.", "error");
      return;
    }
    if (bookingPayment === "Chuyển khoản" && !qrConfirmed) {
      addToast("Vui lòng quét QR và xác nhận đã chuyển khoản.", "error");
      return;
    }

    const selectedStaff = staff.find((s) => (s.id || s.staffId) === bookingStaffId);
    const selectedService = services.find((s) => (s.id || s.serviceId) === bookingServiceId);
    if (!selectedStaff || !selectedService) {
      addToast("Chuyên gia hoặc dịch vụ không hợp lệ.", "error");
      return;
    }

    const newId = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    const duration = selectedService.duration || "1h";
    const endTime = calculateEndTime(bookingSlot, duration);

    const newVisitObj: Record<string, any> = {
      id: newId,
      type: selectedService.name,
      date: bookingDate,
      userId: user?.id,
      staffId: bookingStaffId,
      time: `${bookingSlot} - ${endTime}`,
      startTime: bookingSlot,
      endTime: endTime,
      duration,
      status: "Chờ duyệt",
      paymentMethod: bookingPayment,
    };

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
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then(() => {
        addToast("Gửi yêu cầu thành công! Đang chờ Admin phê duyệt.", "success");
        setBookingDate("");
        setBookingSlot("");
        setBookingNotes("");
        setQrConfirmed(false);
        fetchMyVisits();
      })
      .catch(() => {
        addToast("Lỗi khi đặt lịch. Vui lòng thử lại.", "error");
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

  const selectedService = services.find((s) => (s.id || s.serviceId) === bookingServiceId);
  const selectedStaff = staff.find((s) => (s.id || s.staffId) === bookingStaffId);

  const formProgress = [
    bookingStaffId ? 1 : 0,
    bookingServiceId ? 1 : 0,
    bookingDate ? 1 : 0,
    bookingSlot ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50/60 via-white to-slate-50 text-slate-900 font-sans">
      {/* Toast */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={cn(
                "p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md pointer-events-auto",
                t.type === "success"
                  ? "bg-white border-blue-200 text-blue-900 shadow-blue-50"
                  : t.type === "error"
                    ? "bg-orange-50 border-orange-200 text-orange-700"
                    : "bg-white border-blue-100 text-slate-800"
              )}
            >
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />}
              {t.type === "info" && <Sparkles className="w-5 h-5 text-blue-500 shrink-0 animate-pulse" />}
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

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { icon: Users, label: "Chuyên gia", value: `${staff.length}+`, color: "blue" },
            { icon: Activity, label: "Dịch vụ", value: `${services.length}`, color: "sky" },
            { icon: Stethoscope, label: "Lịch của tôi", value: `${myBookings.length}`, color: "indigo" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className={cn(
                "bg-white/80 backdrop-blur-sm border rounded-[24px] p-5 flex items-center gap-4 shadow-sm",
                color === "blue" ? "border-blue-100" : color === "sky" ? "border-sky-100" : "border-indigo-100"
              )}
            >
              <div className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                color === "blue" ? "bg-blue-50" : color === "sky" ? "bg-sky-50" : "bg-indigo-50"
              )}>
                <Icon className={cn("w-5 h-5", color === "blue" ? "text-blue-600" : color === "sky" ? "text-sky-600" : "text-indigo-600")} />
              </div>
              <div>
                <p className="text-xl font-black text-blue-950">{value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
              </div>
            </div>
          ))}
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
                <p className="text-[10px] text-slate-400 font-semibold">Điền các trường bắt buộc bên dưới</p>
              </div>
            </div>

            {/* Row 1: Staff + Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-400">
                  Chuyên gia y khoa
                </Label>
                <Select value={bookingStaffId} onValueChange={(val) => setBookingStaffId(val || "")}>
                  <SelectTrigger className="w-full rounded-2xl border-blue-100 h-12 bg-white font-bold text-sm shadow-none text-slate-800 focus:ring-2 focus:ring-blue-600/20 hover:border-blue-200 transition-colors">
                    <SelectValue placeholder="Chọn chuyên gia">
                      {bookingStaffId
                        ? (() => { const s = staff.find((x) => String(x.id || x.staffId) === String(bookingStaffId)); return s ? (s.name || s.fullName || bookingStaffId) : bookingStaffId; })()
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-blue-100 shadow-2xl shadow-blue-900/10 p-2 bg-white">
                    {staff.map((s) => {
                      const sid = String(s.id || s.staffId || "");
                      const sname = s.name || s.fullName || sid;
                      return (
                        <SelectItem key={sid} value={sid} disabled={!s.available} className="rounded-xl py-2.5 font-bold text-xs focus:bg-blue-50 cursor-pointer">
                          {sname} {s.department ? `• ${s.department}` : ""} {!s.available && "(Bận)"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

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
            </div>

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
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setBookingSlot(time)}
                      className={cn(
                        "py-2.5 border text-xs font-black rounded-xl transition-all duration-200",
                        bookingSlot === time
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105"
                          : "bg-white border-blue-100 hover:border-blue-300 hover:bg-blue-50 text-slate-700"
                      )}
                    >
                      {time}
                    </button>
                  ))}
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
                  value={user.fullName ? "Hẻm 42 Công Quỳnh, Quận 1, TP. HCM" : ""}
                  readOnly
                  className="w-full rounded-2xl border-blue-100 h-12 bg-blue-50/40 font-bold text-sm shadow-none text-slate-600"
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

              {bookingServiceId ? (
                <div className="space-y-4">
                  {/* Detail rows */}
                  {[
                    { label: "Dịch vụ", value: selectedService?.name || "" },
                    { label: "Thời lượng", value: selectedService?.duration || "1h" },
                    bookingStaffId ? { label: "Chuyên gia", value: selectedStaff?.name || "" } : null,
                    bookingDate ? { label: "Ngày khám", value: bookingDate } : null,
                    bookingSlot ? { label: "Bắt đầu", value: bookingSlot } : null,
                    { label: "Thanh toán", value: PAYMENT_METHODS.find((p) => p.value === bookingPayment)?.label || bookingPayment },
                  ].filter(Boolean).map((item: any) => (
                    <div key={item.label} className="flex justify-between items-center py-1">
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

                  {/* Price */}
                  <div className="border-t border-blue-50 pt-5 mt-5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Chi phí tạm tính</p>
                    <p className="text-3xl font-black text-blue-950 tracking-tighter">
                      {(selectedService?.price || 0).toLocaleString("vi-VN")}
                      <span className="text-sm text-slate-400 ml-1">đ</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">* Đã bao gồm VAT và chi phí di chuyển</p>
                  </div>
                </div>
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

        {/* Appointments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-[40px] p-8 shadow-xl shadow-blue-900/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-blue-950 uppercase tracking-wider">Lịch hẹn của bạn</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{myBookings.length} lịch đã đặt</p>
                </div>
              </div>
              <button
                onClick={fetchMyVisits}
                className="w-9 h-9 rounded-2xl border border-blue-100 flex items-center justify-center hover:bg-blue-50 transition-colors group"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>

            <div className="space-y-3">
              {myBookings.length > 0 ? (
                myBookings.map((booking, i) => {
                  const isPending = booking.status === "Chờ duyệt";
                  const isOngoing = booking.status === "Đang thực hiện";
                  const isConfirmed = booking.status === "Đã xác nhận";
                  const isCompleted = booking.status === "Đã hoàn tất";

                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "relative border rounded-[24px] p-5 transition-all duration-200",
                        isOngoing
                          ? "bg-white border-blue-200 ring-4 ring-blue-600/5 shadow-sm"
                          : "bg-white/60 border-blue-50 hover:bg-white hover:border-blue-100 hover:shadow-sm"
                      )}
                    >
                      {isOngoing && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-sky-500 rounded-t-[24px] shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                      )}

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "font-mono text-[9px] font-black px-2.5 py-1 rounded-lg border",
                            isPending
                              ? "bg-slate-50 text-slate-500 border-slate-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          )}>
                            #LH-{booking.id}
                          </span>
                          <div>
                            <h4 className="text-sm font-black text-blue-950">{booking.type}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">{booking.staffName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadSlip(booking)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-100 text-[9px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <Download className="w-3 h-3" /> Phiếu
                          </button>
                          {isPending ? (
                            <button
                              onClick={() => openCancelModal(booking.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Hủy
                            </button>
                          ) : booking.status === "Đã hủy" ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                              Đã hủy
                            </span>
                          ) : (
                            <span
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-[9px] font-black uppercase tracking-widest text-emerald-600 cursor-not-allowed opacity-80"
                              title="Lịch hẹn đã được Admin duyệt, không thể hủy"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Đã duyệt (Không thể hủy)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-blue-50 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-blue-400" /> {booking.date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-blue-400" /> {booking.time}</span>
                        <span className="flex items-center gap-1.5"><CreditCard className="w-3 h-3 text-blue-400" /> {booking.price}</span>
                        <span className={cn(
                          "ml-auto px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                          isPending ? "bg-amber-50 text-amber-600 border border-amber-200" :
                          isOngoing ? "bg-blue-600 text-white" :
                          isConfirmed ? "bg-sky-50 text-sky-600 border border-sky-200" :
                          "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        )}>
                          {booking.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 rounded-[28px] bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-7 h-7 text-blue-200" />
                  </div>
                  <p className="text-sm font-black text-slate-400">Bạn chưa có lịch hẹn nào.</p>
                  <p className="text-[10px] text-slate-300 font-bold mt-1">Hãy đặt lịch ngay để được tư vấn.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
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
