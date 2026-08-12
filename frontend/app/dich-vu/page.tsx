"use client";

import * as React from "react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Clock,
  CalendarPlus,
  LogIn,
  LogOut,
  Stethoscope,
  Activity,
  Salad,
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Zap,
  Heart,
  Clock3,
  UserCog,
  Calendar,
  User,
  Lock,
  Save,
  KeyRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { API_URL, authFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

// ─── Default services fallback ────────────────────────────────────────────────
const DEFAULT_SERVICES = [
  { id: "s1", name: "Kiểm tra sức khỏe & Đo sinh hiệu", price: 200000, duration: "1h", type: "Clinical", description: "Đo nhiệt độ, huyết áp, nhịp tim, SpO2. Đánh giá tổng quát sức khỏe và lập hồ sơ y tế điện tử chuẩn mực." },
  { id: "s2", name: "Vật lý trị liệu & Phục hồi chức năng", price: 500000, duration: "1.5h", type: "Rehab", description: "Liệu pháp vận động, xoa bóp trị liệu, phục hồi chức năng vận động sau phẫu thuật hoặc tai biến." },
  { id: "s3", name: "Truyền dịch y tế tại gia", price: 400000, duration: "1h", type: "Clinical", description: "Truyền dịch bù nước, điện giải, truyền vitamin theo đúng quy trình vô khuẩn an toàn tại nhà." },
  { id: "s4", name: "Tư vấn dinh dưỡng chuyên sâu", price: 300000, duration: "1h", type: "Nutrition", description: "Lập kế hoạch dinh dưỡng cá nhân hoá theo tình trạng sức khỏe: tiểu đường, cao huyết áp, phục hồi sức khoẻ." },
];

const SERVICE_ICONS: Record<string, any> = { Clinical: Stethoscope, Rehab: Activity, Nutrition: Salad };
const SERVICE_COLORS: Record<string, { badge: string; card: string; glow: string; btn: string; iconBg: string }> = {
  Clinical: { badge: "bg-blue-50 text-blue-700 border-blue-100", card: "hover:border-blue-300 hover:shadow-blue-100", glow: "from-blue-500 to-sky-500", btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20", iconBg: "from-blue-500 to-sky-500" },
  Rehab: { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", card: "hover:border-emerald-300 hover:shadow-emerald-100", glow: "from-emerald-500 to-teal-500", btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20", iconBg: "from-emerald-500 to-teal-500" },
  Nutrition: { badge: "bg-orange-50 text-orange-700 border-orange-100", card: "hover:border-orange-300 hover:shadow-orange-100", glow: "from-orange-500 to-amber-500", btn: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20", iconBg: "from-orange-500 to-amber-500" },
};

const FAQ_LIST = [
  { q: "Dịch vụ có hoạt động vào cuối tuần không?", a: "Có. MintCare hoạt động 7 ngày/tuần từ 07:00 đến 21:00, kể cả ngày lễ." },
  { q: "Tôi có thể đặt nhiều dịch vụ cùng một lần không?", a: "Hiện tại mỗi lần đặt lịch chỉ áp dụng cho một dịch vụ. Bạn có thể đặt nhiều lịch riêng biệt." },
  { q: "Có thể huỷ hoặc dời lịch không?", a: "Có thể huỷ lịch hẹn trước 2 giờ so với giờ hẹn trong mục 'Lịch hẹn của tôi'." },
  { q: "Thanh toán được chấp nhận theo hình thức nào?", a: "Chúng tôi chấp nhận tiền mặt tại nhà, chuyển khoản ngân hàng và ví điện tử MoMo/ZaloPay." },
  { q: "Chuyên gia có chứng chỉ hành nghề không?", a: "100% chuyên gia của MintCare được cấp Chứng chỉ hành nghề (CCHN) chính thức theo quy định Bộ Y tế." },
];

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + " VNĐ";
}

// ─── Service Card (whileInView stagger — đồng bộ homepage) ───────────────────
const ServiceCard = React.memo(function ServiceCard({ service, onBook, isLoggedIn, index }: {
  service: any; onBook: (service?: any) => void; isLoggedIn: boolean; index: number;
}) {
  const type = service.type || "Clinical";
  const colors = SERVICE_COLORS[type] || SERVICE_COLORS.Clinical;
  const Icon = SERVICE_ICONS[type] || Stethoscope;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, delay: Math.min(index, 5) * 0.05 }}
      whileHover={{ y: -4 }}
      className={cn(
        "bg-white rounded-[24px] border-2 border-slate-100 shadow-md transition-shadow duration-200 overflow-hidden group relative flex flex-col h-full",
        colors.card
      )}
    >
      <div className={cn("h-1.5 bg-gradient-to-r shrink-0", colors.glow)} />
      <div className="py-5 px-6 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between mb-3.5">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md", colors.iconBg)}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <span className={cn("text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest", colors.badge)}>
              {type === "Clinical" ? "Lâm sàng" : type === "Rehab" ? "Phục hồi" : "Dinh dưỡng"}
            </span>
          </div>
          <h3 className="font-black text-base text-blue-950 leading-tight tracking-tight mb-2 min-h-[38px] flex items-center">
            {service.name}
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4 line-clamp-2 min-h-[36px]">
            {service.description || "Dịch vụ chuyên nghiệp được thực hiện bởi đội ngũ y tế có chứng chỉ hành nghề tại nhà."}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 pt-3 border-t border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Giá dịch vụ</span>
            <p className="text-base font-black text-blue-950">{formatPrice(service.price)}</p>
          </div>
          <ul className="space-y-1 mb-4">
            {["Chuyên gia có CCHN chính thức", "Thiết bị y tế đạt chuẩn", "Đảm bảo quy trình vô khuẩn"].map((feat) => (
              <li key={feat} className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{feat}
              </li>
            ))}
          </ul>
          <Button onClick={() => onBook(service)}
            className={cn("w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-md transition-all", colors.btn)}>
            <CalendarPlus className="w-4 h-4 mr-2" />
            {isLoggedIn ? "Đặt lịch ngay" : "Đăng nhập để đặt lịch"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
})

ServiceCard.displayName = "ServiceCard";

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.25, delay: Math.min(index, 4) * 0.04 }}
      className="border border-slate-100 rounded-2xl overflow-hidden bg-white"
    >
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors cursor-pointer">
        <span className="text-sm font-black text-blue-950 leading-snug">{q}</span>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 ml-4 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-slate-500 font-medium leading-relaxed">{a}</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DichVuPage() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const isLoggedIn = !!user;
  const isBackendUser = !!user?.id && !user.id.startsWith("CU-");

  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);

  // Profile modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [profileModalTab, setProfileModalTab] = React.useState<"profile" | "password">("profile");

  const [visitCount, setVisitCount] = React.useState<number | null>(null);

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

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(e.target as Node)) {
        setGenderDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenProfileEdit = () => {
    setEditName(user?.fullName || "");
    setEditPhone(user?.phone || "");
    setEditAddress(user?.address || "");
    setEditSummary(user?.medicalHistory || "");
    setEditAge(user?.age ? String(user.age) : "");
    setEditGender(user?.gender || "Nam");
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

  const displayName = (user?.fullName || user?.email?.split("@")[0] || "?").split(" ").slice(-1)[0];
  const initials = (user?.fullName || user?.email?.split("@")[0] || "?")
    .split(" ").map((n: string) => n[0]).join("").substring(0, 2);

  const [services, setServices] = React.useState<any[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`${API_URL}/services/active`, { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error("fail"); return res.json(); })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = [...data];
          DEFAULT_SERVICES.forEach((d) => { if (!merged.some((s) => s.name === d.name)) merged.push(d); });
          setServices(merged);
        }
      })
      .catch((err) => { if (err.name !== "AbortError") setServices(DEFAULT_SERVICES); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const handleBook = React.useCallback((service?: any) => {
    if (isLoggedIn) {
      if (service) {
        const svId = service.id || service.serviceId || "";
        const svName = service.name || service.serviceName || "";
        router.push(`/dat-lich?serviceId=${encodeURIComponent(svId)}&serviceName=${encodeURIComponent(svName)}`);
      } else {
        router.push("/dat-lich");
      }
    } else {
      router.push("/?action=login");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-white to-slate-50 text-slate-900">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-blue-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group cursor-pointer">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 transform -rotate-3 transition-transform group-hover:rotate-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black tracking-tighter text-blue-950 uppercase">MintCare Portal</span>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mt-0.5">Đặt lịch trực tuyến</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
            <Link href="/doi-ngu" className="hover:text-blue-600 transition-colors">Đội ngũ chuyên gia</Link>
            <span className="text-blue-600">Dịch vụ</span>
            {isLoggedIn && <Link href="/dat-lich" className="hover:text-blue-600 transition-colors">Đặt lịch khám</Link>}
            <Link href="/#contact-section" className="hover:text-blue-600 transition-colors">Liên hệ</Link>
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen((p) => !p)}
                  className="flex items-center gap-3 bg-blue-50/50 p-1.5 pl-4 rounded-full border border-blue-100 shadow-xs hover:bg-blue-100/60 transition-all cursor-pointer"
                >
                  <span className="text-xs font-black text-blue-950 uppercase hidden sm:block">{displayName}</span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 text-white font-black flex items-center justify-center text-xs uppercase shadow-md shadow-blue-500/20 ring-2 ring-white">
                    {initials}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-blue-400 transition-transform duration-200 mr-1 ${profileDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="absolute right-0 top-full mt-3 w-72 bg-white rounded-[24px] border border-blue-100 shadow-2xl shadow-blue-900/10 overflow-hidden z-50"
                    >
                      <div className="bg-gradient-to-br from-blue-600 to-sky-500 p-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-white/20 text-white font-black flex items-center justify-center text-lg uppercase border-2 border-white/30 shadow-xl">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-white text-sm leading-tight truncate">{user?.fullName || user?.email?.split("@")[0] || "Khách hàng"}</p>
                            <p className="text-blue-100 text-[10px] font-bold mt-0.5 truncate">{user?.email}</p>
                            <span className="inline-flex items-center gap-1 mt-1.5 bg-white/20 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Đã xác thực
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => { handleOpenProfileEdit(); setProfileDropdownOpen(false); }}
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
                        <button onClick={() => { router.push("/dat-lich"); setProfileDropdownOpen(false); }} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-blue-50 transition-all text-left group cursor-pointer">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                            <CalendarPlus className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">Đặt lịch khám</p>
                            <p className="text-[10px] text-slate-400 font-semibold">Điền phiếu thông tin khám</p>
                          </div>
                        </button>
                        <button onClick={() => { router.push("/lich-hen"); setProfileDropdownOpen(false); }} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-blue-50 transition-all text-left group cursor-pointer">
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
                        <button onClick={() => { logout(); setProfileDropdownOpen(false); }} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-orange-50 transition-all text-left group cursor-pointer">
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
            ) : (
              <Button onClick={() => router.push("/?action=login")} className="bg-blue-600 text-white rounded-full px-6 h-12 text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/15">
                <LogIn className="w-4 h-4 mr-2" /> Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden py-24 w-full bg-gradient-to-b from-blue-100/60 via-sky-50/30 to-slate-50">
        {/* Background Mesh & Light Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_0.8px,transparent_0.8px)] [background-size:24px_24px] opacity-20" />
          <div className="absolute -top-20 -left-20 w-[550px] h-[550px] bg-gradient-to-br from-blue-500/20 to-sky-400/15 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-gradient-to-bl from-purple-400/15 to-indigo-400/10 rounded-full blur-[150px]" />
          <div className="absolute -bottom-10 left-1/3 w-[400px] h-[400px] bg-gradient-to-t from-emerald-400/10 to-teal-300/15 rounded-full blur-[130px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-blue-200/80 shadow-xs">
              <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Dịch vụ y tế tại gia cao cấp</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-blue-950 leading-[1.05] tracking-tight">
              Danh mục<br />
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 bg-clip-text text-transparent">Dịch vụ MintCare.</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              Các dịch vụ chăm sóc sức khỏe chuyên nghiệp tại nhà, được cung cấp bởi đội ngũ y tế có chứng chỉ hành nghề và thiết bị đạt chuẩn y khoa.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={handleBook} className="bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full px-8 h-14 font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-blue-500/25 transition-all cursor-pointer">
                {isLoggedIn ? "Đặt lịch ngay" : "Đăng nhập & Đặt lịch"}
              </button>
              <Link href="/doi-ngu">
                <button className="rounded-full px-8 h-14 font-black text-xs uppercase tracking-widest border border-blue-200 text-blue-950 bg-white/90 hover:bg-white transition-all shadow-md backdrop-blur-sm cursor-pointer">
                  Xem đội ngũ chuyên gia
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/10 to-sky-400/10 rounded-[52px] blur-2xl" />
            <div className="relative border border-blue-200/60 rounded-[44px] bg-white/90 backdrop-blur-xl p-6 shadow-2xl shadow-blue-950/10">
              <div className="bg-gradient-to-b from-blue-50/80 via-white to-sky-50/30 rounded-[34px] p-7 space-y-6 border border-blue-100/60">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-blue-950 leading-none">Dịch vụ ưu việt</p>
                      <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-1">Chuẩn y khoa</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-gradient-to-r from-blue-600/10 to-sky-500/10 text-blue-700 px-3.5 py-1 rounded-full border border-blue-200/80">ISO 9001</span>
                </div>
                <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-blue-100/80">
                  {[
                    { val: `${services.length}+`, label: "Dịch vụ" },
                    { val: "98%", label: "Hài lòng" },
                    { val: "7/7", label: "Ngày / Tuần" },
                    { val: "5+", label: "Năm KN" },
                  ].map(({ val, label }) => (
                    <div key={label} className="bg-white/90 rounded-2xl p-3.5 text-center shadow-xs border border-blue-100/80">
                      <p className="text-xl font-black text-blue-600">{val}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                {[
                  "100% Chuyên gia được cấp chứng chỉ hành nghề chính thức.",
                  "Quy trình vô khuẩn, chuẩn đoán bệnh án kỹ thuật số an toàn.",
                  "Lộ trình theo dõi, cập nhật tiến trình điều trị thời gian thực.",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-3 bg-white/70 p-3 rounded-2xl border border-blue-50/80 shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 font-black text-[10px] flex items-center justify-center shrink-0 border border-emerald-200/60">✓</div>
                    <p className="text-xs text-slate-700 font-bold leading-snug">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Services grid (whileInView stagger) ── */}
      <section className="py-24 bg-white relative overflow-x-hidden border-t border-slate-100" id="services-grid">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-blue-50/40 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Danh mục dịch vụ</span>
            <h2 className="text-4xl font-black text-blue-950 uppercase tracking-tight">Tất cả dịch vụ</h2>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">
              Các dịch vụ y tế tại gia được thực hiện bởi chuyên gia có chứng chỉ, hoạt động 7 ngày/tuần.
            </p>
          </motion.div>

          <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}.shimmer{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;}`}</style>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="skeleton" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-[28px] border border-slate-100 p-7 overflow-hidden" style={{ animationDelay: `${i * 0.07}s` }}>
                    <div className="flex justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl shimmer" />
                      <div className="w-20 h-7 rounded-full shimmer" />
                    </div>
                    <div className="space-y-2.5 mb-5">
                      <div className="h-5 shimmer rounded-lg w-4/5" />
                      <div className="h-3 shimmer rounded w-full" />
                      <div className="h-3 shimmer rounded w-3/4" />
                    </div>
                    <div className="space-y-2 mb-5">
                      <div className="h-3 shimmer rounded w-full" />
                      <div className="h-3 shimmer rounded w-5/6" />
                      <div className="h-3 shimmer rounded w-4/6" />
                    </div>
                    <div className="h-11 shimmer rounded-xl" />
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                {(() => {
                  const SERVICES_PER_PAGE = 15; // 5 rows x 3 columns
                  const totalPages = Math.max(1, Math.ceil(services.length / SERVICES_PER_PAGE));
                  const currentPageClamped = Math.max(1, Math.min(currentPage, totalPages));
                  const paginatedServices = services.slice((currentPageClamped - 1) * SERVICES_PER_PAGE, currentPageClamped * SERVICES_PER_PAGE);

                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedServices.map((service, idx) => (
                          <ServiceCard key={service.id || service.serviceId || idx} service={service} onBook={handleBook} isLoggedIn={isLoggedIn} index={idx} />
                        ))}
                      </div>

                      <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400">
                          Hiển thị <span className="font-black text-blue-950">{services.length > 0 ? (currentPageClamped - 1) * SERVICES_PER_PAGE + 1 : 0}</span> - <span className="font-black text-blue-950">{Math.min(currentPageClamped * SERVICES_PER_PAGE, services.length)}</span> trên tổng số <span className="font-black text-blue-950">{services.length}</span> dịch vụ
                        </p>
                        <Pagination
                          currentPage={currentPageClamped}
                          totalPages={totalPages}
                          onPageChange={(page) => {
                            setCurrentPage(page);
                            document.getElementById("services-grid")?.scrollIntoView({ behavior: "smooth" });
                          }}
                        />
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Value props (whileInView stagger — đồng bộ homepage) ── */}
      <section className="py-24 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Vì sao chọn MintCare?</span>
            <h2 className="text-4xl font-black text-blue-950 uppercase tracking-tight">Quy trình chăm sóc tại gia tối ưu</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Heart, title: "Đặt lịch nhanh chóng", desc: "Tìm kiếm dịch vụ phù hợp theo đúng nhu cầu chuyên môn chỉ với vài lượt click đơn giản." },
              { icon: Clock, title: "Khung giờ linh hoạt", desc: "Đặt lịch theo khung giờ nhàn rỗi của gia đình. Nhân sự y khoa cam kết đến nhà đúng giờ hẹn." },
              { icon: ShieldCheck, title: "Bảo mật HIPAA", desc: "Toàn bộ thông tin hồ sơ y tế bệnh án được mã hóa AES-256 đầu cuối, tuân thủ nghiêm ngặt chuẩn bảo mật HIPAA." },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="bg-blue-50/40 border border-blue-100 rounded-[32px] p-8 hover:bg-white hover:shadow-xl hover:border-blue-200 transition-all text-center space-y-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-md border border-blue-50 mx-auto">
                  <card.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-blue-950 uppercase tracking-tight">{card.title}</h3>
                <p className="text-xs text-slate-600 font-bold leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ (whileInView) ── */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.8 }}
            className="text-center mb-12 space-y-4">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Hỗ trợ khách hàng</span>
            <h2 className="text-4xl font-black text-blue-950 uppercase tracking-tight">Câu hỏi thường gặp</h2>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">Giải đáp những thắc mắc phổ biến của khách hàng</p>
          </motion.div>
          <div className="space-y-3">
            {FAQ_LIST.map((item, idx) => (
              <FaqItem key={item.q} q={item.q} a={item.a} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner (whileInView) ── */}
      <section className="py-24 bg-slate-50 border-t border-blue-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.8 }}
            className="relative rounded-[40px] overflow-hidden bg-gradient-to-r from-blue-600 to-sky-500 p-10 md:p-16 text-white text-center shadow-2xl shadow-blue-600/20">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full border border-white/30 mb-6">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Bắt đầu ngay hôm nay</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">Sẵn sàng đặt lịch chăm sóc?</h2>
              <p className="text-blue-100 font-semibold mb-8 text-sm">Đăng ký ngay hôm nay và trải nghiệm dịch vụ y tế tại nhà cao cấp.</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button onClick={handleBook}
                  className="bg-white text-blue-700 hover:bg-blue-50 rounded-full px-8 h-14 font-black text-xs uppercase tracking-widest shadow-xl">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  {isLoggedIn ? "Đặt lịch ngay" : "Đăng nhập & Đặt lịch"}
                </Button>
                <Link href="/doi-ngu">
                  <button className="bg-white/15 hover:bg-white/25 text-white border border-white/40 backdrop-blur-sm rounded-full px-8 h-14 font-black text-xs uppercase tracking-widest inline-flex items-center justify-center transition-all cursor-pointer shadow-md">
                    Xem đội ngũ chuyên gia <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* ── Footer ── */}
      <Footer />
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
