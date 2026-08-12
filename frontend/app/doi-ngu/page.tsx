"use client";

import * as React from "react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  CalendarPlus,
  LogIn,
  LogOut,
  X,
  Users,
  BadgeCheck,
  Stethoscope,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Sparkles,
  Calendar,
  ChevronDown,
  UserCog,
  User,
  Lock,
  Save,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { staff as mockStaff } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { API_URL, authFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

// ─── Dữ liệu nhận xét (giống homepage) ───────────────────────────────────────
const SPECIALIST_REVIEWS: Record<
  string,
  { rating: number; text: string; author: string; date: string }[]
> = {
  "1": [
    { rating: 5, text: "Sandra chăm sóc vết thương sau phẫu thuật rất nhẹ nhàng và chu đáo.", author: "Nguyễn Thị Hoa", date: "10/06/2026" },
    { rating: 5, text: "Y tá có chuyên môn cao, hướng dẫn tận tình cách vệ sinh vết thương.", author: "Lê Văn Tám", date: "08/06/2026" },
  ],
  "2": [
    { rating: 5, text: "Bài tập phục hồi khớp gối rất hiệu quả, tôi đã có thể tự đi lại được sau 3 tuần.", author: "Trần Hữu Nghị", date: "11/06/2026" },
    { rating: 4, text: "Bác sĩ Marcus làm việc chuyên nghiệp, đúng giờ và nhiệt tình.", author: "Phạm Minh Trí", date: "05/06/2026" },
  ],
  "3": [
    { rating: 5, text: "Tiêm truyền rất êm, nhẹ tay, không đau. Rất an tâm khi chọn y tá Lara.", author: "Nguyễn Thu Thủy", date: "12/06/2026" },
    { rating: 5, text: "Rất sạch sẽ, tuân thủ đúng quy trình vô khuẩn. Đánh giá 5 sao.", author: "Vũ Hoàng Nam", date: "09/06/2026" },
  ],
  "4": [
    { rating: 5, text: "Chế độ dinh dưỡng của Peter giúp chỉ số đường huyết của tôi ổn định hẳn.", author: "Bùi Thị Mai", date: "11/06/2026" },
    { rating: 4, text: "Tư vấn chi tiết, dễ thực hiện cho người cao tuổi.", author: "Đặng Quốc Anh", date: "07/06/2026" },
  ],
};

const getDeptColor = (dept: string) => {
  switch (dept) {
    case "Ngoại khoa":
      return { badge: "bg-purple-50 text-purple-700 border-purple-100", glow: "from-purple-500 to-fuchsia-500", ring: "ring-purple-500/20", icon: "bg-purple-50 text-purple-600" };
    case "Phục hồi chức năng":
      return { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", glow: "from-emerald-500 to-teal-500", ring: "ring-emerald-500/20", icon: "bg-emerald-50 text-emerald-600" };
    default:
      return { badge: "bg-blue-50 text-blue-700 border-blue-100", glow: "from-blue-500 to-sky-500", ring: "ring-blue-500/20", icon: "bg-blue-50 text-blue-600" };
  }
};

// ─── Modal chi tiết chuyên gia ────────────────────────────────────────────────
function StaffDetailModal({
  person, isOpen, onClose, isLoggedIn, onBooking, onLoginRequest,
}: {
  person: any; isOpen: boolean; onClose: () => void;
  isLoggedIn: boolean; onBooking: (person?: any) => void; onLoginRequest: () => void;
}) {
  const [activeTab, setActiveTab] = React.useState<"info" | "reviews">("info");
  const reviews = SPECIALIST_REVIEWS[person?.id] || [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";
  const colors = getDeptColor(person?.department);

  if (!person) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[760px] rounded-[32px] border border-slate-200/80 shadow-2xl p-0 bg-white overflow-hidden text-slate-900">
        {/* Hero banner - height reduced to h-26 */}
        <div className={cn("relative h-26 bg-gradient-to-br", colors.glow)}>
          <div className="absolute inset-0 bg-black/10" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
          <div className="absolute -bottom-8 left-8">
            <div className="relative">
              <img
                src={person.avatar || `https://i.pravatar.cc/150?u=${person.id || encodeURIComponent(person.name)}`}
                alt={person.name}
                className="w-18 h-18 rounded-[18px] border-4 border-white shadow-xl object-cover"
              />
              <div className={cn("absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-white shadow", person.available ? "bg-emerald-500" : "bg-orange-400")} />
            </div>
          </div>
        </div>

        {/* Reduced top & bottom padding */}
        <div className="pt-10 px-8 pb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-blue-950 uppercase tracking-tight leading-tight">{person.name}</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{person.role}</p>
              <span className={cn("inline-block mt-1.5 text-[10px] font-black px-3 py-0.5 rounded-full border uppercase tracking-wider", colors.badge)}>{person.department}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-xl border border-yellow-200 shrink-0">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-xs font-black">{avgRating}</span>
              <span className="text-[10px] text-yellow-600">({reviews.length})</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
            {(["info", "reviews"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}>
                {tab === "info" ? "Thông tin" : `Nhận xét (${reviews.length})`}
              </button>
            ))}
          </div>

          {/* Tab Info - 2 column layout */}
          {activeTab === "info" && (
            <div className="space-y-2.5">
              {person.licenses?.length > 0 && (
                <div className="flex items-center gap-3 p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0"><Award className="w-3.5 h-3.5 text-rose-600" /></div>
                  <div><p className="text-[9px] font-black text-rose-500 uppercase tracking-wider">Chứng chỉ hành nghề</p><p className="text-xs font-bold text-rose-800">{person.licenses[0].licenseNumber}</p></div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { Icon: Phone, label: "Số điện thoại", value: person.phone, hidden: "•••• ••• •••" },
                  { Icon: Mail, label: "Email", value: person.email, hidden: "••••••••@mintcare.com" },
                  { Icon: MapPin, label: "Khu vực", value: person.location, hidden: "Đăng nhập để xem" },
                ].map(({ Icon, label, value, hidden }) => (
                  <div key={label} className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", colors.icon)}><Icon className="w-3.5 h-3.5" /></div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className={cn("text-xs font-bold truncate", isLoggedIn ? "text-slate-700" : "text-slate-400 tracking-widest")}>{isLoggedIn ? value : hidden}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", colors.icon)}><Clock className="w-3.5 h-3.5" /></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Trạng thái</p>
                    <p className={cn("text-xs font-bold", person.available ? "text-emerald-600" : "text-orange-500")}>{person.available ? "Sẵn sàng nhận lịch" : "Đang có ca / Bận"}</p>
                  </div>
                </div>
              </div>

              {!isLoggedIn && (
                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <p className="flex-1 text-[10px] font-black text-blue-800 uppercase tracking-wider">Đăng nhập để xem đầy đủ thông tin liên hệ</p>
                  <button onClick={onLoginRequest} className="text-[10px] font-black text-blue-600 hover:text-blue-800 underline whitespace-nowrap cursor-pointer">Đăng nhập</button>
                </div>
              )}
            </div>
          )}

          {/* Tab Reviews */}
          {activeTab === "reviews" && (
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {isLoggedIn ? (
                reviews.length > 0 ? reviews.map((rev, idx) => (
                  <div key={idx} className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/50 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-blue-950">{rev.author}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("w-3 h-3", i < rev.rating ? "fill-yellow-500 text-yellow-500" : "text-slate-200")} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">"{rev.text}"</p>
                    <p className="text-[10px] text-slate-400 font-bold text-right mt-1">{rev.date}</p>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 text-center py-6 font-semibold">Chưa có nhận xét nào.</p>
                )
              ) : (
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex flex-col items-center gap-3 text-center">
                  <ShieldCheck className="w-8 h-8 text-blue-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-black text-blue-950 uppercase tracking-wider">Đánh giá bị ẩn</p>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">Bạn cần đăng nhập để xem phản hồi chi tiết.</p>
                  </div>
                  <Button size="sm" onClick={onLoginRequest} className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-5 py-2 rounded-xl">Đăng nhập ngay</Button>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Button
              onClick={isLoggedIn ? onBooking : onLoginRequest}
              disabled={!person.available}
              className={cn("w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                person.available
                  ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/20 hover:brightness-110 cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
              )}
            >
              <CalendarPlus className="w-4 h-4 mr-2" />
              {!isLoggedIn ? "Đăng nhập để đặt lịch" : person.available ? "Đặt lịch hẹn ngay" : "Chuyên gia đang bận"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Staff Card ───────────────────────────────────────────────────────────────
const StaffCard = React.memo(function StaffCard({ person, index, onViewDetail }: {
  person: any; index: number; onViewDetail: (person: any) => void;
}) {
  const reviews = SPECIALIST_REVIEWS[person.id] || [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";
  const colors = getDeptColor(person.department);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, delay: Math.min(index, 7) * 0.04 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-[28px] border border-slate-100 shadow-lg hover:shadow-xl hover:shadow-blue-900/8 transition-shadow duration-200 overflow-hidden group flex flex-col h-full"
    >
      <div className={cn("h-1.5 bg-gradient-to-r shrink-0", colors.glow)} />
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <img
                src={person.avatar || `https://i.pravatar.cc/150?u=${person.id || encodeURIComponent(person.name)}`}
                alt={person.name}
                className={cn("w-16 h-16 rounded-[18px] object-cover border-2 border-white shadow-lg ring-4", colors.ring)}
              />
              <div className={cn("absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full border-2 border-white shadow", person.available ? "bg-emerald-500" : "bg-orange-400")} />
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 px-2.5 py-1.5 rounded-xl">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              <span className="text-[11px] font-black text-yellow-700">{avgRating}</span>
            </div>
          </div>

          <div className="mb-3">
            <span className={cn("text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider", colors.badge)}>{person.department}</span>
            <h3 className="font-black text-base text-blue-950 leading-tight uppercase tracking-tight mt-2 min-h-[40px] flex items-center">{person.name}</h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5 line-clamp-1 min-h-[16px]">{person.role}</p>
          </div>

          {person.licenses?.length > 0 ? (
            <div className="flex items-center gap-1.5 mb-3 min-h-[18px]">
              <Award className="w-3 h-3 text-rose-500 shrink-0" />
              <span className="text-[10px] font-bold text-rose-700 truncate">CCHN: {person.licenses[0].licenseNumber}</span>
            </div>
          ) : (
            <div className="min-h-[18px] mb-3" />
          )}

          <div className="flex items-center gap-1.5 mb-4">
            <div className={cn("w-2 h-2 rounded-full", person.available ? "bg-emerald-500 animate-pulse" : "bg-orange-400")} />
            <span className={cn("text-[10px] font-bold", person.available ? "text-emerald-600" : "text-orange-500")}>
              {person.available ? "Sẵn sàng nhận lịch" : "Đang có ca"}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-4 text-[10px] font-semibold text-slate-400">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="font-black text-slate-600">{avgRating}</span>
            <span>· {reviews.length} nhận xét</span>
          </div>

          <button
            onClick={() => onViewDetail(person)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 group-hover:shadow-md cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Xem chi tiết
          </button>
        </div>
      </div>
    </motion.div>
  );
})

StaffCard.displayName = "StaffCard";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DoiNguPage() {
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

  const [staff, setStaff] = React.useState<any[]>(mockStaff);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterDept, setFilterDept] = React.useState("all");
  const [selectedPerson, setSelectedPerson] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDept]);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`${API_URL}/staff`, { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error("fail"); return res.json(); })
      .then((data) => { if (Array.isArray(data) && data.length > 0) setStaff(data); })
      .catch((err) => { if (err.name !== "AbortError") setStaff(mockStaff); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const departments = ["all", ...Array.from(new Set(staff.map((s) => s.department)))];
  const filtered = staff.filter((s) => {
    const matchSearch = search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase()) || s.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "all" || s.department === filterDept;
    return matchSearch && matchDept;
  });

  const handleViewDetail = React.useCallback((person: any) => { setSelectedPerson(person); setIsModalOpen(true); }, []);
  const handleBooking = React.useCallback((person?: any) => {
    setIsModalOpen(false);
    const target = person || selectedPerson;
    if (target) {
      const stId = target.id || "";
      const stName = target.name || "";
      router.push(`/dat-lich?staffId=${encodeURIComponent(stId)}&staffName=${encodeURIComponent(stName)}`);
    } else {
      router.push("/dat-lich");
    }
  }, [selectedPerson, router]);
  const handleLoginRequest = React.useCallback(() => { setIsModalOpen(false); router.push("/?action=login"); }, [router]);

  const totalAvailable = staff.filter((s) => s.available).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-white to-slate-50 text-slate-900">
      {/* ── Navbar (đồng bộ với dat-lich) ── */}
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
            <span className="text-blue-600">Đội ngũ chuyên gia</span>
            <Link href="/dich-vu" className="hover:text-blue-600 transition-colors">Dịch vụ</Link>
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
              <Users className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Đội ngũ y tế chuyên nghiệp</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-blue-950 leading-[1.05] tracking-tight">
              Đội ngũ<br />
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 bg-clip-text text-transparent">Chuyên viên MintCare.</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              Gặp gỡ những chuyên gia y tế hàng đầu với chứng chỉ hành nghề chính thức, sẵn sàng chăm sóc sức khỏe của bạn tại nhà.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => { const el = document.getElementById("staff-grid"); el?.scrollIntoView({ behavior: "smooth" }); }}
                className="bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full px-8 h-14 font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-blue-500/25 transition-all cursor-pointer">
                Khám phá chuyên gia
              </button>
              {!isLoggedIn && (
                <button onClick={() => router.push("/?action=login")}
                  className="rounded-full px-8 h-14 font-black text-xs uppercase tracking-widest border border-blue-200 text-blue-950 bg-white/90 hover:bg-white transition-all shadow-md backdrop-blur-sm cursor-pointer">
                  Đăng nhập & Đặt lịch
                </button>
              )}
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
                      <p className="text-xs font-black uppercase text-blue-950 leading-none">Đội ngũ chuyên gia</p>
                      <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-1">Chuẩn y khoa</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-gradient-to-r from-blue-600/10 to-sky-500/10 text-blue-700 px-3.5 py-1 rounded-full border border-blue-200/80">ISO 9001</span>
                </div>
                <div className="grid grid-cols-3 gap-3.5 pt-4 border-t border-blue-100/80">
                  {[
                    { val: String(staff.length), label: "Chuyên gia" },
                    { val: String(totalAvailable), label: "Sẵn sàng" },
                    { val: "5.0★", label: "Đánh giá" },
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

      {/* ── Search & Filter (whileInView) ── */}
      <section className="py-24 bg-white relative overflow-x-hidden border-t border-slate-100" id="staff-grid">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-blue-50/40 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto mb-12 space-y-4"
          >
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Đội ngũ lâm sàng</span>
            <h2 className="text-4xl font-black text-blue-950 uppercase tracking-tight">Tất cả chuyên viên</h2>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">
              Những chuyên gia y tá, bác sĩ điều trị và chăm sóc sức khỏe hàng đầu luôn sẵn sàng hỗ trợ bạn.
            </p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 mb-10"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, vai trò, chuyên khoa..."
                className="pl-10 h-11 border-slate-200 rounded-xl text-sm font-semibold focus:border-blue-300" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              {departments.map((dept) => (
                <button key={dept} onClick={() => setFilterDept(dept)}
                  className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer",
                    filterDept === dept ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>
                  {dept === "all" ? "Tất cả" : dept}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Grid */}
          <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}.shimmer{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;}`}</style>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="skeleton" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-[28px] border border-slate-100 p-6 overflow-hidden">
                    <div className="flex justify-between mb-4">
                      <div className="w-16 h-16 rounded-[18px] shimmer" />
                      <div className="w-16 h-8 rounded-xl shimmer" />
                    </div>
                    <div className="space-y-2.5 mb-4">
                      <div className="h-3 shimmer rounded w-2/3" />
                      <div className="h-4 shimmer rounded w-4/5" />
                      <div className="h-3 shimmer rounded w-3/5" />
                    </div>
                    <div className="mt-4 h-11 shimmer rounded-2xl" />
                  </div>
                ))}
              </motion.div>
            ) : filtered.length > 0 ? (
              <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                {(() => {
                  const STAFF_PER_PAGE = 20; // 5 rows x 4 columns
                  const totalPages = Math.max(1, Math.ceil(filtered.length / STAFF_PER_PAGE));
                  const currentPageClamped = Math.max(1, Math.min(currentPage, totalPages));
                  const paginatedStaff = filtered.slice((currentPageClamped - 1) * STAFF_PER_PAGE, currentPageClamped * STAFF_PER_PAGE);

                  return (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedStaff.map((person, idx) => (
                          <StaffCard key={person.id} person={person} index={idx} onViewDetail={handleViewDetail} />
                        ))}
                      </div>

                      <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400">
                          Hiển thị <span className="font-black text-blue-950">{filtered.length > 0 ? (currentPageClamped - 1) * STAFF_PER_PAGE + 1 : 0}</span> - <span className="font-black text-blue-950">{Math.min(currentPageClamped * STAFF_PER_PAGE, filtered.length)}</span> trên tổng số <span className="font-black text-blue-950">{filtered.length}</span> chuyên gia
                        </p>
                        <Pagination
                          currentPage={currentPageClamped}
                          totalPages={totalPages}
                          onPageChange={(page) => {
                            setCurrentPage(page);
                            document.getElementById("staff-grid")?.scrollIntoView({ behavior: "smooth" });
                          }}
                        />
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-lg font-black text-slate-600 uppercase tracking-tight">Không tìm thấy</p>
                <p className="text-sm text-slate-400 font-semibold mt-1">Thử tìm với từ khoá khác</p>
                <button onClick={() => { setSearch(""); setFilterDept("all"); }} className="mt-4 text-xs font-black text-blue-600 hover:underline cursor-pointer">Xoá bộ lọc</button>
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
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Cam kết chất lượng</span>
            <h2 className="text-4xl font-black text-blue-950 uppercase tracking-tight">Tiêu chuẩn đội ngũ MintCare</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: BadgeCheck, title: "100% có CCHN", desc: "Mọi chuyên gia đều được cấp Chứng chỉ hành nghề chính thức theo quy định Bộ Y tế Việt Nam." },
              { icon: ShieldCheck, title: "Vô khuẩn tuyệt đối", desc: "Thiết bị và quy trình tuân thủ tiêu chuẩn vô khuẩn y khoa nghiêm ngặt, an toàn cho bệnh nhân tại nhà." },
              { icon: CheckCircle2, title: "Đúng giờ & Chuyên nghiệp", desc: "Đội ngũ cam kết đến đúng giờ hẹn, thông báo trước 30 phút qua số điện thoại đăng ký." },
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
      {/* ── Footer ── */}
      <Footer />

      {/* ── Staff Detail Modal ── */}
      {selectedPerson && (
        <StaffDetailModal
          person={selectedPerson} isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isLoggedIn={isLoggedIn} onBooking={handleBooking} onLoginRequest={handleLoginRequest}
        />
      )}
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
