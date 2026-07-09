"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  CalendarPlus,
  Users,
  Activity,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  X,
  Trash2,
  Heart,
  Stethoscope,
  Clock3,
  Send,
  FileText,
  KeyRound,
  ChevronDown,
  Save,
  UserCog,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { staff as mockStaff } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { API_URL, authFetch } from "@/lib/api";

// Service pricing mapping (fallback if API unavailable)
const DEFAULT_SERVICES = [
  {
    id: "s1",
    name: "Kiểm tra sức khỏe & Đo sinh hiệu",
    price: 200000,
    duration: "1h",
    type: "Clinical",
  },
  {
    id: "s2",
    name: "Vật lý trị liệu & Phục hồi chức năng",
    price: 500000,
    duration: "1.5h",
    type: "Rehab",
  },
  {
    id: "s3",
    name: "Truyền dịch y tế tại gia",
    price: 400000,
    duration: "1h",
    type: "Clinical",
  },
  {
    id: "s4",
    name: "Tư vấn dinh dưỡng chuyên sâu",
    price: 300000,
    duration: "1h",
    type: "Nutrition",
  },
];

// Specialist Reviews Data
const SPECIALIST_REVIEWS: Record<
  string,
  { rating: number; text: string; author: string; date: string }[]
> = {
  "1": [
    {
      rating: 5,
      text: "Sandra chăm sóc vết thương sau phẫu thuật rất nhẹ nhàng và chu đáo.",
      author: "Nguyễn Thị Hoa",
      date: "10/06/2026",
    },
    {
      rating: 5,
      text: "Y tá có chuyên môn cao, hướng dẫn tận tình cách vệ sinh vết thương.",
      author: "Lê Văn Tám",
      date: "08/06/2026",
    },
  ],
  "2": [
    {
      rating: 5,
      text: "Bài tập phục hồi khớp gối rất hiệu quả, tôi đã có thể tự đi lại được sau 3 tuần.",
      author: "Trần Hữu Nghị",
      date: "11/06/2026",
    },
    {
      rating: 4,
      text: "Bác sĩ Marcus làm việc chuyên nghiệp, đúng giờ và nhiệt tình.",
      author: "Phạm Minh Trí",
      date: "05/06/2026",
    },
  ],
  "3": [
    {
      rating: 5,
      text: "Tiêm truyền rất êm, nhẹ tay, không đau. Rất an tâm khi chọn y tá Lara.",
      author: "Nguyễn Thu Thủy",
      date: "12/06/2026",
    },
    {
      rating: 5,
      text: "Rất sạch sẽ, tuân thủ đúng quy trình vô khuẩn. Đánh giá 5 sao.",
      author: "Vũ Hoàng Nam",
      date: "09/06/2026",
    },
  ],
  "4": [
    {
      rating: 5,
      text: "Chế độ dinh dưỡng của Peter giúp chỉ số đường huyết của tôi ổn định hẳn.",
      author: "Bùi Thị Mai",
      date: "11/06/2026",
    },
    {
      rating: 4,
      text: "Tư vấn chi tiết, dễ thực hiện cho người cao tuổi.",
      author: "Đặng Quốc Anh",
      date: "07/06/2026",
    },
  ],
};

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

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

// 3D Doctor Carousel Component
function Doctor3DCarousel({
  staff,
  isLoggedIn,
  selectSpecialistForBooking,
  reviewStaff,
  setReviewStaff,
  handleLogin,
}: {
  staff: any[];
  isLoggedIn: boolean;
  selectSpecialistForBooking: (id: string) => void;
  reviewStaff: any;
  setReviewStaff: (staff: any) => void;
  handleLogin: () => void;
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState<number | null>(null);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = React.useState(false);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + staff.length) % staff.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % staff.length);
  };

  // Autoplay functionality with hover pause
  React.useEffect(() => {
    if (isAutoPlayPaused || isHovered !== null) return;

    const interval = setInterval(() => {
      handleNext();
    }, 3000); // Transitions every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlayPaused, isHovered, staff.length]);

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      handlePrev();
    } else if (info.offset.x < -swipeThreshold) {
      handleNext();
    }
  };

  if (!staff || staff.length === 0) return null;

  return (
    <div 
      onMouseEnter={() => setIsAutoPlayPaused(true)}
      onMouseLeave={() => setIsAutoPlayPaused(false)}
      className="relative w-full py-16 flex flex-col items-center justify-center overflow-x-hidden"
    >
      {/* 3D Carousel Stage */}
      <div className="relative w-full max-w-5xl h-[520px] flex items-center justify-center perspective-[1200px] overflow-visible">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          type="button"
          suppressHydrationWarning
          className="absolute left-0 md:left-4 z-40 p-4 rounded-full bg-white/70 hover:bg-white/90 backdrop-blur-md border border-white/80 shadow-xl text-blue-600 transition-all hover:scale-110 active:scale-95 cursor-pointer hover:ring-4 hover:ring-blue-100/60"
          aria-label="Previous specialist"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={handleNext}
          type="button"
          suppressHydrationWarning
          className="absolute right-0 md:right-4 z-40 p-4 rounded-full bg-white/70 hover:bg-white/90 backdrop-blur-md border border-white/80 shadow-xl text-blue-600 transition-all hover:scale-110 active:scale-95 cursor-pointer hover:ring-4 hover:ring-blue-100/60"
          aria-label="Next specialist"
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* 3D Cards Container */}
        <motion.div
          className="relative w-[360px] h-[460px] flex items-center justify-center select-none"
          style={{ transformStyle: "preserve-3d" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          {staff.map((person, i) => {
            const diff = (i - currentIndex + staff.length) % staff.length;
            let offset = diff;
            if (offset > staff.length / 2) {
              offset -= staff.length;
            }

            const isActive = i === currentIndex;
            const absOffset = Math.abs(offset);

            // Layout calculations for a clean 3D carousel effect
            const rotateY = offset * 35; // degrees of Y-axis rotation
            const z = -absOffset * 150; // push depth
            const x = offset * 280; // slide left/right spacing
            const scale = 1 - absOffset * 0.12;
            const opacity = absOffset > 1 ? 0 : 1 - absOffset * 0.35;
            const zIndex = 20 - absOffset;

            const reviews = SPECIALIST_REVIEWS[person.id] || [];
            const avgRating =
              reviews.length > 0
                ? (
                    reviews.reduce((acc, r) => acc + r.rating, 0) /
                    reviews.length
                  ).toFixed(1)
                : "5.0";

            // Premium dynamic hover gradient matching specialist department (friendly light medical theme)
            const getOverlayGradient = (dept: string) => {
              switch (dept) {
                case "Ngoại khoa":
                  return "from-purple-50/98 via-white to-purple-50/98 border-purple-200/60 shadow-purple-500/5";
                case "Phục hồi chức năng":
                  return "from-emerald-50/98 via-white to-emerald-50/98 border-emerald-200/60 shadow-emerald-500/5";
                case "Nội khoa":
                  return "from-blue-50/98 via-white to-blue-50/98 border-blue-200/60 shadow-blue-500/5";
                default:
                  return "from-slate-50/98 via-white to-slate-50/98 border-slate-200/60 shadow-slate-500/5";
              }
            };

            const getAccentColor = (dept: string) => {
              switch (dept) {
                case "Ngoại khoa":
                  return "text-purple-600 bg-purple-100/60 border-purple-200/60";
                case "Phục hồi chức năng":
                  return "text-emerald-600 bg-emerald-100/60 border-emerald-200/60";
                case "Nội khoa":
                  return "text-blue-600 bg-blue-100/60 border-blue-200/60";
                default:
                  return "text-slate-600 bg-slate-100/60 border-slate-200/60";
              }
            };

            return (
              <motion.div
                key={person.id}
                style={{
                  position: "absolute",
                  width: "350px",
                  height: "460px",
                  zIndex: zIndex,
                  transformStyle: "preserve-3d",
                  cursor: isActive ? "grab" : "pointer",
                }}
                animate={{
                  x: x,
                  z: z,
                  rotateY: rotateY,
                  scale: scale,
                  opacity: opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                onClick={() => {
                  if (!isActive) setCurrentIndex(i);
                }}
                onMouseEnter={() => isActive && setIsHovered(i)}
                onMouseLeave={() => isActive && setIsHovered(null)}
                className={cn(
                  "bg-white border rounded-[40px] p-8 flex flex-col justify-between items-center transition-all duration-500 relative overflow-hidden",
                  isActive
                    ? "border-blue-200/80 shadow-[0_30px_70px_-15px_rgba(59,130,246,0.22),_0_0_35px_rgba(59,130,246,0.12)] ring-1 ring-blue-500/10"
                    : "border-slate-100 shadow-xl",
                )}
              >
                {/* Standard face card */}
                <div className="flex flex-col items-center text-center space-y-6 w-full mt-6">
                  {/* Glowing Profile Avatar */}
                  <div className="relative">
                    <div
                      className={cn(
                        "absolute -inset-1 rounded-[38px] blur-sm transition-all duration-700 opacity-0 bg-gradient-to-r",
                        isActive && "opacity-100 animate-pulse",
                        person.department === "Ngoại khoa"
                          ? "from-purple-500 to-fuchsia-500"
                          : person.department === "Phục hồi chức năng"
                            ? "from-emerald-500 to-teal-500"
                            : "from-blue-500 to-indigo-500",
                      )}
                    />
                    <img
                      src={person.avatar}
                      className="relative z-10 w-32 h-32 rounded-[36px] border-4 border-white shadow-2xl object-cover"
                      alt={person.name}
                    />
                    <div
                      className={cn(
                        "absolute -bottom-1 -right-1 w-7 h-7 border-4 border-white rounded-full shadow-lg z-20",
                        person.available ? "bg-blue-600" : "bg-orange-500",
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <span
                      className={cn(
                        "text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border",
                        person.department === "Ngoại khoa"
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : person.department === "Phục hồi chức năng"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-blue-50 text-blue-700 border-blue-100",
                      )}
                    >
                      {person.department}
                    </span>
                    <h3 className="font-black text-2xl text-blue-950 leading-tight uppercase tracking-tight pt-2">
                      {person.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {person.role}
                    </p>
                  </div>
                </div>

                {/* Stars review */}
                <div className="flex items-center gap-1.5 bg-yellow-50/70 text-yellow-700 px-3.5 py-1.5 rounded-2xl border border-yellow-200/60 mb-6">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs font-black">{avgRating}</span>
                  <span className="text-[10px] font-bold text-yellow-600/80">
                    ({reviews.length} đánh giá)
                  </span>
                </div>

                {/* Hover Details Overlay */}
                <AnimatePresence>
                  {isHovered === i && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className={cn(
                        "absolute inset-0 bg-gradient-to-b backdrop-blur-md rounded-[40px] p-8 flex flex-col justify-between text-slate-700 z-50 shadow-2xl border",
                        getOverlayGradient(person.department),
                      )}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={person.avatar}
                            className="w-14 h-14 rounded-2xl border border-slate-200 object-cover"
                            alt={person.name}
                          />
                          <div>
                            <h4 className="font-black text-lg text-blue-950 leading-tight uppercase tracking-wide">
                              {person.name}
                            </h4>
                            <p
                              className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border inline-block mt-1",
                                getAccentColor(person.department),
                              )}
                            >
                              {person.role.split("•")[0]}
                            </p>
                          </div>
                        </div>

                        <div className="h-px bg-slate-100 my-4" />

                        <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-blue-50/80 flex items-center justify-center">
                              <Phone className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span>
                              SĐT: {isLoggedIn ? person.phone : "•••• ••• •••"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-blue-50/80 flex items-center justify-center">
                              <Mail className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="truncate">
                              Email:{" "}
                              {isLoggedIn
                                ? person.email
                                : "••••••••@mintcare.com"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-blue-50/80 flex items-center justify-center">
                              <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span>
                              Khu vực:{" "}
                              {isLoggedIn
                                ? person.location
                                : "Đăng nhập để xem"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-blue-50/80 flex items-center justify-center">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span
                              className={cn(
                                "font-bold",
                                person.available
                                  ? "text-emerald-600"
                                  : "text-orange-500"
                              )}
                            >
                              {person.available
                                ? "Sẵn sàng nhận lịch"
                                : "Đang có ca"}
                            </span>
                          </div>
                        </div>

                        {!isLoggedIn && (
                          <div className="bg-blue-50/50 rounded-xl p-3 flex items-center gap-2 border border-blue-100/50 mt-2">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            <span className="text-[9px] font-black uppercase tracking-wider text-blue-700">
                              Đăng nhập để xem liên hệ
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2.5 mt-4">
                        <Dialog>
                          <DialogTrigger
                            render={
                              <Button
                                variant="outline"
                                className="w-full h-11 rounded-xl font-black text-[9px] uppercase tracking-widest border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-800 bg-white"
                              >
                                <Eye className="w-3.5 h-3.5 mr-2 text-blue-600" />{" "}
                                Nhận xét
                              </Button>
                            }
                            onClick={() => setReviewStaff(person)}
                          />
                          {reviewStaff && (
                            <DialogContent className="sm:max-w-[500px] rounded-[36px] border-blue-100 shadow-2xl p-10 bg-white text-slate-900">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-black tight-tracking text-blue-950 uppercase">
                                  Nhận xét về <br /> {reviewStaff.name}
                                </DialogTitle>
                                <DialogDescription className="text-slate-400 text-xs font-semibold mt-2">
                                  Ý kiến đánh giá xác thực từ những bệnh nhân
                                  trước đó.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-6 py-6 max-h-[350px] overflow-y-auto pr-1">
                                {isLoggedIn ? (
                                  (SPECIALIST_REVIEWS[reviewStaff.id] || [])
                                    .length > 0 ? (
                                    (
                                      SPECIALIST_REVIEWS[reviewStaff.id] || []
                                    ).map((rev, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 relative text-left"
                                      >
                                        <div className="flex items-center justify-between mb-3">
                                          <span className="text-xs font-black text-blue-950">
                                            {rev.author}
                                          </span>
                                          <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map(
                                              (_, i) => (
                                                <Star
                                                  key={i}
                                                  className={cn(
                                                    "w-3.5 h-3.5",
                                                    i < rev.rating
                                                      ? "fill-yellow-500 text-yellow-500"
                                                      : "text-blue-100",
                                                  )}
                                                />
                                              ),
                                            )}
                                          </div>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                                          "{rev.text}"
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-black text-right mt-2">
                                          {rev.date}
                                        </p>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs text-muted-foreground text-center py-6">
                                      Chưa có phản hồi nào.
                                    </p>
                                  )
                                ) : (
                                  <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center gap-4 text-center">
                                    <ShieldCheck className="w-10 h-10 text-blue-600 animate-pulse" />
                                    <div>
                                      <p className="text-xs font-black text-blue-950 uppercase tracking-wider">
                                        Đánh giá bị ẩn
                                      </p>
                                      <p className="text-[11px] font-bold text-slate-500 mt-1">
                                        Bạn cần đăng nhập để xem thông tin phản
                                        hồi chi tiết.
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={handleLogin}
                                      className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-6 py-2.5 rounded-xl"
                                    >
                                      Đăng nhập
                                    </Button>
                                  </div>
                                )}
                              </div>

                              <DialogFooter>
                                <Button className="w-full rounded-full h-12 bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-black uppercase tracking-widest shadow-none">
                                  Đóng
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          )}
                        </Dialog>

                        <Button
                          disabled={!person.available}
                          onClick={() => selectSpecialistForBooking(person.id)}
                          className={cn(
                            "w-full rounded-xl h-11 font-black text-[9px] uppercase tracking-widest border-none transition-all duration-300",
                            person.available
                              ? "bg-linear-to-r from-blue-500 to-sky-500 text-white shadow-lg shadow-blue-500/20 hover:brightness-110 cursor-pointer"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                          )}
                        >
                          <CalendarPlus className="w-3.5 h-3.5 mr-2" />
                          {person.available ? "Đặt lịch hẹn" : "Đang bận / Nghỉ phép"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Slide Indicators / Dots */}
      <div className="flex gap-2.5 mt-8">
        {staff.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            suppressHydrationWarning
            className={cn(
              "h-2.5 rounded-full transition-all duration-300 cursor-pointer",
              i === currentIndex
                ? "w-8 bg-blue-600"
                : "w-2.5 bg-blue-200 hover:bg-blue-300",
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { user, login, register, logout } = useAuth();
  const router = useRouter();
  const isLoggedIn = !!user;

  // Authentication Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authView, setAuthView] = React.useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = React.useState(false);

  // Auto-open login modal when ?action=login is present
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "login") {
      setIsAuthModalOpen(true);
      setAuthView("login");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // Login Form States
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");

  // Register Form States
  const [regName, setRegName] = React.useState("");
  const [regPhone, setRegPhone] = React.useState("");
  const [regEmail, setRegEmail] = React.useState("");
  const [regPassword, setRegPassword] = React.useState("");
  const [regConfirmPassword, setRegConfirmPassword] = React.useState("");

  const [staff, setStaff] = React.useState<any[]>(mockStaff);
  const [services, setServices] = React.useState(DEFAULT_SERVICES);

  // Fetch services from API (fallback to DEFAULT_SERVICES)
  React.useEffect(() => {
    fetch(`${API_URL}/services/active`)
      .then((res) => { if (!res.ok) throw new Error("fail"); return res.json() })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setServices(data);
      })
      .catch(() => {});
  }, []);

  // Specialist selection for reviews modal
  const [reviewStaff, setReviewStaff] = React.useState<any | null>(null);

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

  // Booking Form States
  const [bookingStaffId, setBookingStaffId] = React.useState("");
  const [bookingServiceId, setBookingServiceId] = React.useState("");
  const [bookingDate, setBookingDate] = React.useState("");
  const [bookingSlot, setBookingSlot] = React.useState("");
  const [bookingPayment, setBookingPayment] = React.useState("Tiền mặt");
  const [bookingNotes, setBookingNotes] = React.useState("");

  // Customer Bookings List State (Stored/Shared via LocalStorage)
  const [myBookings, setMyBookings] = React.useState<StoredVisit[]>([]);

  const getVisitStorageKey = (userId?: string) =>
    `mintcare_visits_${userId ? userId : "guest"}`;

  const isBackendUser = !!user?.id && !user.id.startsWith("CU-");

  // Alert system state
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  // Support Message state
  const [contactName, setContactName] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactMsg, setContactMsg] = React.useState("");

  // Profile Dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [profileModalTab, setProfileModalTab] = React.useState<"profile" | "password">("profile");
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);

  // Edit profile form
  const [editName, setEditName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editAddress, setEditAddress] = React.useState("");
  const [editSummary, setEditSummary] = React.useState("");
  const [editAge, setEditAge] = React.useState("");
  const [editGender, setEditGender] = React.useState("Nam");

  // Change password form
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [showCurrentPw, setShowCurrentPw] = React.useState(false);
  const [showNewPw, setShowNewPw] = React.useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
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
    setProfileDropdownOpen(false);
  };

  const handleOpenChangePassword = () => {
    setProfileModalTab("password");
    setIsProfileModalOpen(true);
    setProfileDropdownOpen(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let saveOk = true;

    // Save to backend if logged in
    if (isBackendUser && user?.id) {
      try {
        const res = await authFetch(`${API_URL}/users/${user.id}`, {
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
        
        // Update localStorage session
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
        console.error("Lỗi cập nhật user profile:", err);
        saveOk = false;
      }
    }

    if (!saveOk) {
      addToast("Cập nhật hồ sơ thất bại. Thử lại sau.", "error");
      return;
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
    
    // Silently refresh profile context or trigger page reload to update auth user state
    setTimeout(() => {
      window.location.reload();
    }, 1000);
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
    // Try backend update
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

  // Load staff list from backend API
  React.useEffect(() => {
    fetch(`${API_URL}/staff`)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStaff(data);
        } else {
          setStaff(mockStaff);
        }
      })
      .catch((err) => {
        console.warn("Lỗi fetch staff, sử dụng dữ liệu mẫu:", err);
        setStaff(mockStaff);
      });
  }, []);

  // Load and synchronize visits state with backend API
  const fetchMyVisits = React.useCallback(() => {
    const storageKey = getVisitStorageKey(user?.id);
    if (!isBackendUser) {
      const stored =
        typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
      if (stored) {
        setMyBookings(JSON.parse(stored));
      }
      return;
    }

    const queryParam = `?userId=${encodeURIComponent(user.id)}`;
    fetch(`${API_URL}/visits${queryParam}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("Visits API non-ok response:", res.status, text);
          throw new Error(`API error (${res.status}): ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        const formatted = Array.isArray(data)
          ? data.map((v: any) => {
              // Match visit type to service price, fallback to service list lookup
              const matchedService = services.find((s) => v.type?.includes(s.name) || s.name.includes(v.type || ""));
              const priceValue = matchedService?.price
                || (v.type?.includes("Vật lý") ? 500000
                  : v.type?.includes("Truyền") ? 400000
                  : 200000);
              return {
                id: v.id,
                staffId: v.staffId,
                staffName:
                  v.staffName ||
                  staff.find((s) => s.id === v.staffId)?.name ||
                  "Chuyên gia y tế",
                type: v.type,
                date: v.date || "2026-06-24",
                time: v.time,
                status: v.status,
                price: priceValue.toLocaleString("vi-VN") + " VNĐ",
                paymentMethod: v.paymentMethod || "Tiền mặt",
              };
            })
          : [];
        setMyBookings(formatted);
      })
      .catch((err) => {
        console.warn("Lỗi fetch visits, dùng localStorage fallback:", err);
        const stored =
          typeof window !== "undefined"
            ? localStorage.getItem(storageKey)
            : null;
        if (stored) {
          setMyBookings(JSON.parse(stored));
        }
      });
  }, [user]); // staff removed: API already returns staffName

  React.useEffect(() => {
    fetchMyVisits();
  }, [fetchMyVisits]);

  React.useEffect(() => {
    if (!isBackendUser) return;
    const interval = window.setInterval(() => {
      fetchMyVisits();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [fetchMyVisits, isBackendUser]);

  const saveBookingsToStorage = (updated: StoredVisit[]) => {
    setMyBookings(updated);
    localStorage.setItem(getVisitStorageKey(user?.id), JSON.stringify(updated));
  };

  const addToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Default users are seeded by auth-context (ensureLocalUsers)

  // Handle local registration
  const handleLocalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !regName.trim() ||
      !regPhone.trim() ||
      !regEmail.trim() ||
      !regPassword ||
      !regConfirmPassword
    ) {
      addToast("Vui lòng điền đầy đủ thông tin đăng ký.", "error");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      addToast("Mật khẩu xác nhận không khớp.", "error");
      return;
    }

    try {
      const u = await register({
        email: regEmail.trim(),
        password: regPassword,
        fullName: regName.trim(),
        phone: regPhone.trim(),
      });
      addToast(`Đăng ký thành công! Chào mừng ${u.fullName}.`, "success");
      setIsAuthModalOpen(false);

      // Reset fields
      setRegName("");
      setRegPhone("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");

      // Scroll to dashboard
      setTimeout(() => {
        document
          .getElementById("booking-workspace")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err: any) {
      addToast(err.message || "Đăng ký thất bại", "error");
    }
  };

  // Handle local login
  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      addToast("Vui lòng điền đầy đủ email và mật khẩu.", "error");
      return;
    }

    try {
      const u = await login(loginEmail.trim(), loginPassword);
      addToast(`Đăng nhập thành công! Chào mừng ${u.fullName}.`, "success");
      setIsAuthModalOpen(false);

      // Reset fields
      setLoginEmail("");
      setLoginPassword("");

      if (u.role === "admin") {
        router.push("/admin");
      } else {
        // Scroll to dashboard
        setTimeout(() => {
          document
            .getElementById("booking-workspace")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    } catch (err: any) {
      addToast(err.message || "Đăng nhập thất bại", "error");
    }
  };

  // Trigger login simulation
  const handleLogin = () => {
    setIsAuthModalOpen(true);
    setAuthView("login");
  };

  // Trigger logout
  const handleLogout = () => {
    logout();
    addToast("Đã đăng xuất khỏi tài khoản.", "info");
  };

  // Profile update — sync to backend for backend users, local state for others
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBackendUser && user?.id) {
      try {
        const res = await fetch(`${API_URL}/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: profile.name,
            phone: profile.phone,
          }),
        });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const storedUser = localStorage.getItem("mintcare_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          localStorage.setItem("mintcare_user", JSON.stringify({
            ...parsed,
            fullName: data.fullName,
            phone: data.phone,
          }));
        }
      } catch {
        addToast("Không thể lưu hồ sơ lên hệ thống. Thử lại sau.", "error");
        return;
      }
    }
    addToast("Cập nhật thông tin hồ sơ y tế thành công!", "success");
  };

  // Action: Select Specialist and scroll to Booking Form
  const selectSpecialistForBooking = (staffId: string) => {
    if (!isLoggedIn) {
      addToast("Vui lòng đăng nhập để tiến hành đặt lịch hẹn.", "info");
      setIsAuthModalOpen(true);
      setAuthView("login");
      return;
    }

    const staffMember = staff.find((s) => s.id === staffId);
    if (staffMember && !staffMember.available) {
      addToast("Chuyên gia hiện đang bận hoặc nghỉ phép. Vui lòng chọn người khác.", "error");
      return;
    }

    setBookingStaffId(staffId);

    // Auto-select first matching service
    if (staffMember) {
      if (staffMember.role.includes("Y tá")) {
        setBookingServiceId("s1");
      } else if (staffMember.role.includes("VLTL")) {
        setBookingServiceId("s2");
      } else if (staffMember.role.includes("dinh dưỡng")) {
        setBookingServiceId("s4");
      } else {
        setBookingServiceId("s1");
      }
    }

    // Scroll to form
    document
      .getElementById("booking-form-section")
      ?.scrollIntoView({ behavior: "smooth" });
    addToast(
      `Đã chọn chuyên gia ${staffMember?.name || ""}. Vui lòng nhập thông tin khám.`,
      "info",
    );
  };

  // Booking submit handler
  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingStaffId || !bookingServiceId || !bookingDate || !bookingSlot) {
      addToast("Vui lòng điền đầy đủ thông tin đặt lịch hẹn.", "error");
      return;
    }

    const selectedStaff = staff.find((s) => s.id === bookingStaffId);
    const selectedService = services.find((s) => s.id === bookingServiceId);

    if (!selectedStaff || !selectedService) return;

    const newId = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    const duration = selectedService.duration;
    const endTime = calculateEndTime(bookingSlot, duration);

    const visitUserId =
      user?.id && !user.id.startsWith("CU-") ? user.id : undefined;
    const visitPatientId =
      !isBackendUser && profile.id && profile.id.startsWith("BN-")
        ? profile.id
        : undefined;

    const newVisitObj = {
      id: newId,
      type: selectedService.name,
      date: bookingDate,
      patientId: visitPatientId,
      userId: visitUserId,
      staffId: bookingStaffId,
      time: `${bookingSlot} - ${endTime}`,
      startTime: bookingSlot,
      endTime: endTime,
      duration: duration,
      status: "Chờ duyệt",
    };

    const postVisit = isBackendUser
      ? authFetch(`${API_URL}/visits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newVisitObj),
        })
      : Promise.reject(new Error("Offline or local fallback user"));

    postVisit
      .then(async (res) => {
        if (!isBackendUser) {
          throw new Error("Offline or local fallback user");
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API post error ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then((createdVisit) => {
        const uiBooking = {
          id: createdVisit.id,
          staffId: createdVisit.staffId,
          staffName: selectedStaff.name,
          type: createdVisit.type,
          date: bookingDate,
          time: createdVisit.time,
          status: createdVisit.status,
          price: selectedService.price.toLocaleString("vi-VN") + " VNĐ",
          paymentMethod: bookingPayment,
        };

        const updated = [uiBooking, ...myBookings];
        saveBookingsToStorage(updated);
        if (isBackendUser) {
          fetchMyVisits();
        }
        addToast(
          "Gửi yêu cầu thành công! Lịch hẹn đang chờ Admin phê duyệt.",
          "success",
        );
      })
      .catch((err) => {
        console.warn("Lỗi API, lưu tạm vào bộ nhớ offline:", err);
        const fallbackBooking = {
          id: newId,
          staffId: bookingStaffId,
          staffName: selectedStaff.name,
          type: selectedService.name,
          date: bookingDate,
          time: `${bookingSlot} - ${endTime}`,
          status: "Chờ duyệt",
          price: selectedService.price.toLocaleString("vi-VN") + " VNĐ",
          paymentMethod: bookingPayment,
        };
        const updated = [fallbackBooking, ...myBookings];
        saveBookingsToStorage(updated);
        addToast("Đã lưu lịch hẹn tạm thời (Offline).", "success");
      });

    // Reset Form
    setBookingDate("");
    setBookingSlot("");
    setBookingNotes("");

    // Scroll to history list
    setTimeout(() => {
      document
        .getElementById("my-appointments-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const calculateEndTime = (start: string, durationStr: string) => {
    const [h, m] = start.split(":").map(Number);
    const duration = parseFloat(durationStr.replace("h", ""));
    const totalMinutes = h * 60 + m + duration * 60;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
  };

  // Cancel Booking handler
  const handleCancelBooking = async (id: string) => {
    if (isBackendUser) {
      try {
        const res = await authFetch(`${API_URL}/visits/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("API error");
      } catch {
        addToast("Không thể hủy lịch hẹn. Thử lại sau.", "error");
        return;
      }
    }
    const updated = myBookings.filter((b) => b.id !== id);
    saveBookingsToStorage(updated);
    addToast(`Đã hủy thành công ca hẹn #${id}`, "success");
  };

  // Download booking slip
  const handleDownloadSlip = (booking: StoredVisit) => {
    const content = `
=============================================
             PHIẾU XÁC NHẬN ĐẶT LỊCH HẸN
                    MINTCARE
=============================================
Mã lịch hẹn: LH-${booking.id}
Thời gian tạo phiếu: ${new Date().toLocaleString()}
Trạng thái duyệt: ${booking.status}
---------------------------------------------
Thông tin bệnh nhân:
- Họ tên: ${profile.name}
- Điện thoại: ${profile.phone}
- Địa chỉ khám: ${profile.address}
- Tiền sử bệnh: ${profile.summary}
---------------------------------------------
Thông tin dịch vụ:
- Chuyên gia y tế: ${booking.staffName}
- Dịch vụ đặt: ${booking.type}
- Ngày hẹn: ${booking.date}
- Thời gian: ${booking.time}
---------------------------------------------
Chi phí & Thanh toán:
- Tổng chi phí: ${booking.price}
- Phương thức: ${booking.paymentMethod}
=============================================
Cảm ơn quý khách đã tin dùng dịch vụ y tế của MintCare!
    `;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MintCare-Booking-Receipt-LH-${booking.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    addToast("Đã tải xuống phiếu xác nhận lịch hẹn.", "success");
  };

  // Support Message submit
  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) {
      addToast("Vui lòng nhập đầy đủ thông tin liên hệ.", "error");
      return;
    }
    addToast(
      "Gửi lời nhắn thành công! Đội ngũ tư vấn sẽ phản hồi lại sớm nhất.",
      "success",
    );
    setContactName("");
    setContactEmail("");
    setContactMsg("");
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={cn(
                "p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md pointer-events-auto",
                toast.type === "success"
                  ? "bg-white border-blue-200 text-blue-900 shadow-blue-50"
                  : toast.type === "error"
                    ? "bg-orange-50 border-orange-200 text-orange-700 shadow-orange-50"
                    : "bg-white border-blue-100 text-slate-800",
              )}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              ) : toast.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-blue-500 shrink-0 animate-pulse" />
              )}
              <span className="text-xs font-black tracking-tight">
                {toast.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Customer Header/Navbar */}
      <header
        id="booking-navbar"
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-blue-100 shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3.5 group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 transform -rotate-3 transition-transform group-hover:rotate-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black tracking-tighter text-blue-950 uppercase">
                MintCare Portal
              </span>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mt-0.5">
                Đặt lịch trực tuyến
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-slate-500">
            <a
              href="#booking-navbar"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Trang chủ
            </a>
            <a
              href="#specialists-section"
              className="hover:text-blue-600 transition-colors"
            >
              Đội ngũ chuyên gia
            </a>
            {isLoggedIn && (
              <>
                <a
                  href="#booking-form-section"
                  className="hover:text-blue-600 transition-colors"
                >
                  Đặt lịch khám
                </a>
                <a
                  href="#my-appointments-section"
                  className="hover:text-blue-600 transition-colors"
                >
                  Hồ sơ & Lịch hẹn
                </a>
              </>
            )}
            <a
              href="#contact-section"
              className="hover:text-blue-600 transition-colors"
            >
              Liên hệ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative" ref={profileDropdownRef}>
                {/* Avatar Button */}
                <button
                  onClick={() => setProfileDropdownOpen((p) => !p)}
                  suppressHydrationWarning
                  className="flex items-center gap-3 bg-blue-50/50 p-1.5 pl-4 rounded-full border border-blue-100 shadow-xs hover:bg-blue-100/60 transition-all group cursor-pointer"
                >
                  <span className="text-xs font-black text-blue-950 uppercase hidden sm:block">
                    {profile.name.split(" ").slice(-1)[0]}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 text-white font-black flex items-center justify-center text-xs uppercase shadow-md shadow-blue-500/20 ring-2 ring-white">
                    {profile.name
                      ? profile.name.split(" ").map((n) => n[0]).join("").substring(0, 2)
                      : "EG"}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-blue-400 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Panel */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="absolute right-0 top-full mt-3 w-72 bg-white rounded-[24px] border border-blue-100 shadow-2xl shadow-blue-900/10 overflow-hidden z-50"
                    >
                      {/* Header */}
                      <div className="bg-gradient-to-br from-blue-600 to-sky-500 p-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm text-white font-black flex items-center justify-center text-lg uppercase border-2 border-white/30 shadow-xl">
                            {profile.name ? profile.name.split(" ").map((n) => n[0]).join("").substring(0, 2) : "EG"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-white text-sm leading-tight truncate">{profile.name}</p>
                            <p className="text-blue-100 text-[10px] font-bold mt-0.5 truncate">{user?.email}</p>
                            <span className="inline-flex items-center gap-1 mt-1.5 bg-white/20 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                              Đã xác thực
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={handleOpenProfileEdit}
                          suppressHydrationWarning
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

                        <button
                          onClick={() => { document.getElementById("my-appointments-section")?.scrollIntoView({ behavior: "smooth" }); setProfileDropdownOpen(false); }}
                          suppressHydrationWarning
                          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-blue-50 transition-all text-left group cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">Lịch hẹn của tôi</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{myBookings.length} lịch đặt</p>
                          </div>
                        </button>

                        <div className="h-px bg-blue-50 mx-2 my-1" />

                        <button
                          onClick={() => { handleLogout(); setProfileDropdownOpen(false); }}
                          suppressHydrationWarning
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
            ) : (
              <Button
                onClick={handleLogin}
                className="bg-blue-600 text-white rounded-full px-6 h-12 text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/15"
              >
                <LogIn className="w-4 h-4 mr-2" /> Đăng nhập
              </Button>
            )}
          </div>


        </div>
      </header>

      {/* --- View 1: Guest Landing Page (Intro view) --- */}
      <section className="relative overflow-hidden py-24 w-full bg-gradient-to-b from-blue-50/60 via-white to-slate-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[140px]" />
          <div className="absolute bottom-[20%] right-[-5%] w-[45%] h-[45%] bg-blue-50/50 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-blue-600/10 px-4 py-2 rounded-full border border-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">
                Y tế thông minh tại gia
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-blue-950 leading-[1.05] tracking-tight">
              Chăm sóc y tế <br />
              <span className="text-blue-600 bg-linear-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                Tận tâm tại nhà.
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              MintCare Portal mang đến giải pháp kết nối trực tiếp khách hàng
              với đội ngũ điều dưỡng và chuyên gia phục hồi chức năng có trình
              độ chuyên môn cao. Xem lý lịch công khai và đăng ký lịch hẹn chăm
              sóc ngay tức thì.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#specialists-section">
                <Button className="bg-blue-600 text-white rounded-full px-8 h-14 font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20">
                  Khám phá chuyên gia
                </Button>
              </a>
              {!isLoggedIn && (
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="rounded-full px-8 h-14 font-black text-xs uppercase tracking-widest border-blue-200 text-blue-900 bg-white hover:bg-blue-50 transition-all shadow-sm"
                >
                  Đăng nhập & Đặt lịch
                </Button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            {/* Visual Frame Decorator */}
            <div className="absolute -inset-4 bg-blue-600/5 rounded-[40px] blur-3xl" />
            <div className="relative border border-blue-100 rounded-[48px] bg-white p-6 shadow-2xl">
              <div className="bg-blue-50 rounded-[38px] p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Stethoscope className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-blue-950 leading-none">
                        Dịch vụ ưu việt
                      </p>
                      <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-1">
                        Chuẩn y khoa
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-blue-600/10 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                    ISO 9001
                  </span>
                </div>

                <div className="space-y-4 pt-4 border-t border-blue-100">
                  <div className="flex gap-4">
                    <div className="w-5 h-5 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    <p className="text-xs text-slate-600 font-bold">
                      100% Chuyên gia được cấp chứng chỉ hành nghề chính thức.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-5 h-5 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    <p className="text-xs text-slate-600 font-bold">
                      Quy trình vô khuẩn, chuẩn đoán bệnh án kỹ thuật số an
                      toàn.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-5 h-5 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    <p className="text-xs text-slate-600 font-bold">
                      Lộ trình theo dõi, cập nhật tiến trình điều trị thời gian
                      thực.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Specialists Carousel Section (3D Rotate Showcase) --- */}
      <section
        id="specialists-section"
        className="py-24 bg-white relative overflow-x-hidden border-t border-slate-100"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-blue-50/40 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">
              Đội ngũ lâm sàng
            </span>
            <h2 className="text-4xl font-black text-blue-950 uppercase tracking-tight">
              Giới thiệu bác sĩ của tôi
            </h2>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">
              Những chuyên gia y tá, bác sĩ điều trị và chăm sóc sức khỏe hàng
              đầu luôn sẵn sàng hỗ trợ bạn.
            </p>
          </div>

          <Doctor3DCarousel
            staff={staff}
            isLoggedIn={isLoggedIn}
            selectSpecialistForBooking={selectSpecialistForBooking}
            reviewStaff={reviewStaff}
            setReviewStaff={setReviewStaff}
            handleLogin={handleLogin}
          />
        </div>
      </section>

      {/* --- Value propositions section (Scroll Reveal Animation) --- */}
      <section className="py-24 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-16 space-y-4"
          >
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">
              Vì sao chọn MintCare?
            </span>
            <h2 className="text-4xl font-black text-blue-950 uppercase tracking-tight">
              Quy trình khám bệnh tại gia tối ưu
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: Heart,
                title: "Đặt lịch nhanh chóng",
                desc: "Tìm kiếm bác sĩ, y tá điều dưỡng phù hợp theo đúng nhu cầu chuyên môn chỉ với vài lượt click đơn giản.",
              },
              {
                icon: Clock3,
                title: "Khung giờ linh hoạt",
                desc: "Đặt lịch khám theo khung giờ nhàn rỗi của gia đình. Nhân sự y khoa cam kết đến nhà đúng giờ hẹn.",
              },
              {
                icon: ShieldCheck,
                title: "Bảo mật HIPAA",
                desc: "Toàn bộ thông tin hồ sơ y tế bệnh án được mã hóa AES-256 đầu cuối, tuân thủ nghiêm ngặt chuẩn bảo mật HIPAA.",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="bg-blue-50/40 border border-blue-100 rounded-[32px] p-8 hover:bg-white hover:shadow-xl hover:border-blue-200 transition-all text-center space-y-6"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-md border border-blue-50 mx-auto">
                  <card.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-blue-950 uppercase tracking-tight">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-600 font-bold leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- View 2: Logged-in Customer Booking Workspace & History --- */}
      {isLoggedIn && (
        <section
          id="booking-workspace"
          className="py-24 bg-white border-t border-blue-100 relative"
        >
          <div className="max-w-7xl mx-auto px-6 space-y-24">
            {/* Header section */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">
                Thủ tục đặt lịch
              </span>
              <h2 className="text-4xl font-black text-blue-950 uppercase tracking-tight">
                Khai báo thông tin khám
              </h2>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                Sau khi đặt lịch, thông tin sẽ được gửi đến Admin để điều phối
                lịch trực chính thức.
              </p>
            </div>

            {/* Booking Form section */}
            <div
              id="booking-form-section"
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start scroll-mt-24"
            >
              <form
                onSubmit={handleCreateBooking}
                className="lg:col-span-8 bg-white border border-blue-100 rounded-[36px] p-10 shadow-2xl shadow-blue-950/[0.02] space-y-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-50/60 rounded-bl-[120px] -mr-8 -mt-8 pointer-events-none" />

                <div>
                  <h3 className="text-2xl font-black text-blue-950 uppercase">
                    Phiếu thông tin khám
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">
                    Vui lòng điền đủ chi tiết ngày, giờ và tình trạng vết
                    thương.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Chuyên gia y khoa
                    </Label>
                    <Select
                      value={bookingStaffId}
                      onValueChange={(val) => setBookingStaffId(val || "")}
                    >
                      <SelectTrigger className="w-full rounded-2xl border-blue-100 h-14 bg-slate-50 focus:bg-white transition-all font-bold text-sm shadow-none text-blue-950">
                        <SelectValue placeholder="Chọn chuyên gia" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-blue-100 shadow-2xl p-2 bg-white">
                        {staff.map((s) => (
                          <SelectItem
                            key={s.id}
                            value={s.id}
                            disabled={!s.available}
                            className={cn(
                              "rounded-xl py-3 font-bold text-xs uppercase tracking-widest",
                              !s.available && "opacity-45"
                            )}
                          >
                            {s.name} ({s.department}) {!s.available && "— [ĐANG BẬN / NGHỈ]"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Dịch vụ chăm sóc
                    </Label>
                    <Select
                      value={bookingServiceId}
                      onValueChange={(val) => setBookingServiceId(val || "")}
                    >
                      <SelectTrigger className="w-full rounded-2xl border-blue-100 h-14 bg-slate-50 focus:bg-white transition-all font-bold text-sm shadow-none text-blue-950">
                        <SelectValue placeholder="Chọn loại dịch vụ" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-blue-100 shadow-2xl p-2 bg-white">
                        {services.map((serv) => (
                          <SelectItem
                            key={serv.id}
                            value={serv.id}
                            className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest"
                          >
                            {serv.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Chọn ngày khám
                    </Label>
                    <Input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="rounded-2xl border-blue-100 h-14 bg-slate-50 focus:bg-white transition-all font-bold text-sm uppercase shadow-none text-blue-950"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Khung giờ rảnh rỗi
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["08:00", "10:00", "14:00", "16:00", "18:00"].map(
                        (time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setBookingSlot(time)}
                            className={cn(
                              "py-3 border text-xs font-black rounded-xl transition-all",
                              bookingSlot === time
                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20 scale-105"
                                : "bg-slate-50 border-blue-100 hover:bg-white hover:border-blue-300 text-slate-800",
                            )}
                          >
                            {time}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Địa chỉ khám bệnh tại nhà
                    </Label>
                    <Input
                      value={profile.address}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      className="rounded-2xl border-blue-100 h-14 bg-slate-50 focus:bg-white transition-all font-bold text-sm shadow-none text-blue-950"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Thanh toán
                    </Label>
                    <Select
                      value={bookingPayment}
                      onValueChange={(val) =>
                        setBookingPayment(val || "Tiền mặt")
                      }
                    >
                      <SelectTrigger className="w-full rounded-2xl border-blue-100 h-14 bg-slate-50 focus:bg-white transition-all font-bold text-sm shadow-none text-blue-950">
                        <SelectValue placeholder="Hình thức" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-blue-100 shadow-2xl p-2 bg-white">
                        <SelectItem
                          value="Tiền mặt"
                          className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest"
                        >
                          Tiền mặt tại gia
                        </SelectItem>
                        <SelectItem
                          value="Chuyển khoản"
                          className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest"
                        >
                          Chuyển khoản ngân hàng
                        </SelectItem>
                        <SelectItem
                          value="Ví điện tử"
                          className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest"
                        >
                          Ví điện tử MoMo/ZaloPay
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Mô tả triệu chứng lâm sàng
                  </Label>
                  <Textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Mô tả cụ thể triệu chứng, lịch sử dùng thuốc hoặc các vấn đề cần lưu ý..."
                    className="rounded-2xl border-blue-100 bg-slate-50 focus:bg-white transition-all min-h-[100px] shadow-none font-semibold leading-relaxed text-sm text-blue-950"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 text-white rounded-full py-9 h-14 text-base font-black uppercase tracking-[0.2em] hover:bg-blue-700 shadow-2xl shadow-blue-600/10 transition-all border-b-4 border-white/10 active:border-b-0 active:translate-y-1 group"
                  >
                    Gửi yêu cầu đặt lịch hẹn{" "}
                    <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
                  </Button>
                </div>
              </form>

              {/* Hóa đơn xem trước */}
              <div className="lg:col-span-4 bg-slate-50 border border-blue-100 rounded-[36px] p-8 flex flex-col h-full relative overflow-hidden">
                <h4 className="text-base font-black uppercase tracking-wider text-blue-950 mb-6">
                  Chi tiết thanh toán
                </h4>

                {bookingServiceId ? (
                  <div className="flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-slate-500 font-bold">
                          Dịch vụ:
                        </span>
                        <span className="text-xs font-black text-right max-w-[180px] leading-tight text-blue-950">
                          {
                            services.find((s) => s.id === bookingServiceId)
                              ?.name
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-bold">
                          Thời lượng phiên:
                        </span>
                        <span className="text-xs font-black text-blue-950">
                          {
                            services.find((s) => s.id === bookingServiceId)
                              ?.duration
                          }
                        </span>
                      </div>
                      {bookingStaffId && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold">
                            Chuyên gia:
                          </span>
                          <span className="text-xs font-black text-blue-950">
                            {staff.find((s) => s.id === bookingStaffId)?.name}
                          </span>
                        </div>
                      )}
                      {bookingDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold">
                            Ngày khám:
                          </span>
                          <span className="text-xs font-black text-blue-950 uppercase">
                            {bookingDate}
                          </span>
                        </div>
                      )}
                      {bookingSlot && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold">
                            Bắt đầu:
                          </span>
                          <span className="text-xs font-black text-blue-950">
                            {bookingSlot}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-blue-100 pt-6 space-y-4 mt-auto">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Chi phí tạm tính
                          </p>
                          <p className="text-3xl font-black text-blue-950 tracking-tighter mt-1">
                            {(
                              services.find((s) => s.id === bookingServiceId)
                                ?.price || 0
                            ).toLocaleString("vi-VN")}
                            <span className="text-xs text-slate-400 ml-1">
                              đ
                            </span>
                          </p>
                        </div>
                        <div className="bg-blue-50 text-blue-700 text-[9px] font-black px-3 py-1 rounded-xl uppercase border border-blue-200">
                          Đã bao gồm VAT
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                        * Chi phí đã bao gồm các trang thiết bị y tế đi kèm và
                        chi phí di chuyển đến nhà.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-4">
                    <CreditCard className="w-12 h-12 text-slate-300 opacity-60" />
                    <p className="text-xs font-bold text-slate-400">
                      Vui lòng chọn Dịch vụ để bắt đầu tính toán chi phí.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Appointments list and profile */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start pt-16 border-t border-blue-100">
              {/* Lịch sử đặt lịch */}
              <div
                id="my-appointments-section"
                className="xl:col-span-8 space-y-10 scroll-mt-24"
              >
                <div>
                  <h3 className="text-2xl font-black text-blue-950 uppercase">
                    Lịch hẹn của bạn
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">
                    Theo dõi tiến trình phê duyệt của Admin và trạng thái di
                    chuyển của nhân sự.
                  </p>
                </div>

                <div className="space-y-8">
                  {myBookings.length > 0 ? (
                    myBookings.map((booking) => {
                      const isPending = booking.status === "Chờ duyệt";
                      const isOngoing = booking.status === "Đang thực hiện";
                      const isConfirmed = booking.status === "Đã xác nhận";

                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-blue-100 rounded-[36px] p-8 shadow-xs hover:border-blue-200 transition-all flex flex-col gap-6 relative overflow-hidden"
                        >
                          {isOngoing && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.6)]" />
                          )}

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <span
                                className={cn(
                                  "font-mono text-[9px] font-black px-2.5 py-1.5 rounded-xl border shadow-xs",
                                  isPending
                                    ? "bg-slate-100 text-slate-700 border-slate-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200",
                                )}
                              >
                                #LH-{booking.id}
                              </span>
                              <div>
                                <h4 className="text-sm font-black uppercase text-blue-950 leading-none">
                                  {booking.type}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">
                                  {booking.staffName}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <Button
                                variant="outline"
                                onClick={() => handleDownloadSlip(booking)}
                                className="h-11 px-4 rounded-xl border-blue-100 bg-white font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-xs"
                              >
                                <Download className="w-3.5 h-3.5 text-blue-600" />{" "}
                                Xuất phiếu
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleCancelBooking(booking.id)}
                                className="h-11 px-4 rounded-xl border-blue-100 bg-white hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-xs text-slate-500"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-orange-500" />{" "}
                                Hủy lịch
                              </Button>
                            </div>
                          </div>

                          {/* Progress Stepper Timeline */}
                          <div className="pt-4 border-t border-blue-50">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                              Trạng thái điều phối
                            </p>

                            <div className="grid grid-cols-4 gap-2 relative">
                              {/* Horizontal Line background */}
                              <div className="absolute top-4 left-[12.5%] right-[12.5%] h-1 bg-slate-100 -z-10" />
                              <div
                                className={cn(
                                  "absolute top-4 left-[12.5%] h-1 bg-blue-600 -z-10 transition-all duration-1000",
                                  isOngoing
                                    ? "w-[75%]"
                                    : isConfirmed
                                      ? "w-[37.5%]"
                                      : isPending
                                        ? "w-[0%]"
                                        : "w-[0%]",
                                )}
                              />

                              {[
                                {
                                  label: "Gửi yêu cầu",
                                  done: true,
                                  pulse: false,
                                },
                                {
                                  label: "Phê duyệt",
                                  done: !isPending,
                                  pulse: isPending,
                                },
                                {
                                  label: "Đang di chuyển",
                                  done: isOngoing,
                                  pulse: isConfirmed,
                                },
                                {
                                  label: "Hoàn tất",
                                  done: false,
                                  pulse: isOngoing,
                                },
                              ].map((step, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-col items-center text-center"
                                >
                                  <div
                                    className={cn(
                                      "w-9 h-9 rounded-full flex items-center justify-center border-4 border-white shadow-md text-xs font-black transition-colors duration-500",
                                      step.done
                                        ? "bg-blue-600 text-white"
                                        : step.pulse
                                          ? "bg-blue-600 animate-pulse text-white"
                                          : "bg-slate-100 text-slate-400",
                                    )}
                                  >
                                    {idx + 1}
                                  </div>
                                  <span
                                    className={cn(
                                      "text-[8px] font-black uppercase tracking-widest mt-2 block",
                                      step.done || step.pulse
                                        ? "text-blue-950"
                                        : "text-slate-400 opacity-70",
                                    )}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-blue-50 text-[10px] font-bold text-slate-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span>{booking.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span>{booking.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-blue-600" />
                              <span>
                                Chi phí: {booking.price} (
                                {booking.paymentMethod})
                              </span>
                            </div>
                            <div>
                              <span
                                className={cn(
                                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                  isPending
                                    ? "bg-slate-50 text-slate-600 border-slate-200 animate-pulse"
                                    : isOngoing
                                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                      : "bg-blue-50 text-blue-700 border-blue-200",
                                )}
                              >
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="bg-slate-50 rounded-[32px] border border-blue-100 p-16 text-center">
                      <p className="text-xs font-bold text-slate-400">
                        Bạn chưa có lịch hẹn nào sắp tới.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hồ sơ bệnh nhân - Health Profile Editor */}
              <div className="xl:col-span-4 space-y-10">
                <div>
                  <h3 className="text-2xl font-black text-blue-950 uppercase">
                    Hồ sơ y khoa
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">
                    Vui lòng cập nhật tiền sử bệnh án để hỗ trợ y tá chuẩn đoán
                    lâm sàng chính xác.
                  </p>
                </div>

                <form
                  onSubmit={handleUpdateProfile}
                  className="bg-white border border-blue-100 rounded-[36px] p-8 shadow-2xl shadow-blue-950/[0.01] space-y-6"
                >
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Họ tên bệnh nhân
                    </Label>
                    <Input
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="rounded-2xl border-blue-100 h-12 bg-slate-50 focus:bg-white transition-all font-bold text-sm shadow-none text-blue-950"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Số điện thoại liên hệ
                    </Label>
                    <Input
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="rounded-2xl border-blue-100 h-12 bg-slate-50 focus:bg-white transition-all font-bold text-sm shadow-none text-blue-950"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Địa chỉ phục vụ
                    </Label>
                    <Input
                      value={profile.address}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      className="rounded-2xl border-blue-100 h-12 bg-slate-50 focus:bg-white transition-all font-bold text-sm shadow-none text-blue-950"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Ghi chú lâm sàng / Tiền sử bệnh án
                    </Label>
                    <Textarea
                      value={profile.summary}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          summary: e.target.value,
                        }))
                      }
                      className="rounded-2xl border-blue-100 bg-slate-50 focus:bg-white transition-all min-h-[140px] shadow-none font-semibold leading-relaxed text-xs text-blue-950"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 h-12 text-xs font-black uppercase tracking-widest shadow-md shadow-blue-600/10"
                  >
                    Lưu hồ sơ bệnh nhân
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- View 3: Contact & Support (Scroll Reveal Animation) --- */}
      <section
        id="contact-section"
        className="py-24 bg-slate-50 border-t border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">
                Hỗ trợ khẩn cấp
              </span>
              <h2 className="text-4xl font-black text-blue-950 uppercase tracking-tight">
                Kênh tư vấn trực tuyến
              </h2>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                Đội ngũ điều hành của MintCare luôn túc trực 24/7 để tiếp nhận
                các yêu cầu khẩn cấp của bệnh nhân.
              </p>
            </div>

            <div className="bg-white border border-blue-100 rounded-[36px] p-8 shadow-xs flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <Phone className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Hotline khẩn cấp
                </p>
                <p className="text-2xl font-black text-blue-600 tracking-tighter mt-1">
                  1900 8198
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 text-xs font-semibold text-slate-600">
                <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Email: support@mintcare.com</span>
              </div>
              <div className="flex gap-4 text-xs font-semibold text-slate-600">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  Trung tâm điều phối: 42 Cống Quỳnh, Phạm Ngũ Lão, Quận 1, TP.
                  HCM
                </span>
              </div>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSendSupport}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 bg-white border border-blue-100 rounded-[36px] p-10 shadow-xs space-y-6"
          >
            <h3 className="text-xl font-black text-blue-950 uppercase tracking-tight">
              Gửi tin nhắn phản hồi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Họ tên của bạn
                </Label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="rounded-2xl border-blue-100 h-12 bg-slate-50 focus:bg-white transition-all font-bold text-sm shadow-none text-blue-950"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Địa chỉ Email liên hệ
                </Label>
                <Input
                  value={contactEmail}
                  type="email"
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="rounded-2xl border-blue-100 h-12 bg-slate-50 focus:bg-white transition-all font-bold text-sm shadow-none text-blue-950"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Lời nhắn hỗ trợ
              </Label>
              <Textarea
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                placeholder="Nhập câu hỏi hoặc yêu cầu tư vấn cụ thể của bạn..."
                className="rounded-2xl border-blue-100 bg-slate-50 focus:bg-white transition-all min-h-[140px] shadow-none font-semibold leading-relaxed text-sm text-blue-950"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 h-12 text-xs font-black uppercase tracking-widest shadow-md shadow-blue-600/10 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Gửi lời nhắn hỗ trợ
            </Button>
          </motion.form>
        </div>
      </section>

      {/* --- Footer (Blue & White) --- */}
      <footer className="bg-white border-t border-blue-100 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-blue-950 uppercase">
                MintCare Portal
              </span>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Hệ thống cốt lõi &copy; 2026
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 text-xs font-bold text-slate-500">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Điều khoản dịch vụ
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Chính sách bảo mật
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Hỗ trợ kỹ thuật
            </a>
          </div>
        </div>
      </footer>

      {/* Authentication Modal - Sliding Login & Register */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-blue-950/60 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-[32px] shadow-2xl border border-blue-100 w-full max-w-md overflow-hidden relative z-10 flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-full transition-all z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="p-8 pb-4 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm text-blue-600">
                  <Stethoscope className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-blue-950">
                    Chào mừng tới MintCare
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                    Đăng nhập hoặc đăng ký tài khoản chăm sóc
                  </p>
                </div>

                {/* Sliding Tabs Indicator */}
                <div className="relative flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 mt-4">
                  <motion.div
                    className="absolute top-1 bottom-1 left-1 bg-white rounded-xl shadow-xs border border-blue-100"
                    layoutId="activeTabBg"
                    style={{
                      width: "calc(50% - 4px)",
                    }}
                    animate={{
                      x: authView === "login" ? 0 : "100%",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAuthView("login");
                      setShowPassword(false);
                    }}
                    className={cn(
                      "relative z-10 w-1/2 text-center py-2.5 text-xs font-black uppercase tracking-wider transition-colors duration-200",
                      authView === "login" ? "text-blue-600" : "text-slate-500",
                    )}
                  >
                    Đăng nhập
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthView("register");
                      setShowPassword(false);
                    }}
                    className={cn(
                      "relative z-10 w-1/2 text-center py-2.5 text-xs font-black uppercase tracking-wider transition-colors duration-200",
                      authView === "register"
                        ? "text-blue-600"
                        : "text-slate-500",
                    )}
                  >
                    Đăng ký
                  </button>
                </div>
              </div>

              {/* Sliding Form Container */}
              <div className="overflow-hidden relative w-full">
                <motion.div
                  className="flex w-[200%]"
                  animate={{ x: authView === "login" ? "0%" : "-50%" }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                >
                  {/* Left Form: Login */}
                  <form
                    onSubmit={handleLocalLogin}
                    className="w-1/2 px-8 pb-8 pt-2 space-y-5 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Email Input */}
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                          Địa chỉ Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type="email"
                            required
                            placeholder="evelyn.green@gmail.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="rounded-2xl border-blue-100 pl-11 h-12 bg-slate-50 focus:bg-white transition-all font-semibold text-sm shadow-none text-blue-950"
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                          Mật khẩu
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="rounded-2xl border-blue-100 pl-11 pr-11 h-12 bg-slate-50 focus:bg-white transition-all font-semibold text-sm shadow-none text-blue-950"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() =>
                            addToast(
                              "Mẹo: Mật khẩu mặc định của Evelyn Green là '123456'",
                              "info",
                            )
                          }
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Quên mật khẩu?
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-6 h-12 text-xs font-black uppercase tracking-widest shadow-md shadow-blue-600/10 flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" /> Đăng nhập
                      </Button>

                      {/* Social Login Divider */}
                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-100"></div>
                        <span className="flex-shrink mx-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                          Hoặc
                        </span>
                        <div className="flex-grow border-t border-slate-100"></div>
                      </div>

                      {/* Google/Facebook buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={async () => {
                            const emailStr = "evelyn.green@gmail.com";
                            try {
                              await login(emailStr, "123456");
                              addToast(
                                "Đăng nhập nhanh Google thành công!",
                                "success",
                              );
                              setIsAuthModalOpen(false);
                              setTimeout(() => {
                                document
                                  .getElementById("booking-workspace")
                                  ?.scrollIntoView({ behavior: "smooth" });
                              }, 150);
                            } catch {
                              try {
                                await register({
                                  email: emailStr,
                                  password: "123456",
                                  fullName: "Evelyn Green",
                                  phone: "0909876543",
                                });
                                addToast(
                                  "Đăng ký & Đăng nhập Google thành công!",
                                  "success",
                                );
                                setIsAuthModalOpen(false);
                                setTimeout(() => {
                                  document
                                    .getElementById("booking-workspace")
                                    ?.scrollIntoView({ behavior: "smooth" });
                                }, 150);
                              } catch (err: any) {
                                addToast(
                                  "Không thể đăng nhập nhanh: " + err.message,
                                  "error",
                                );
                              }
                            }
                          }}
                          className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl py-2 text-[10px] font-bold text-slate-600"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="#EA4335"
                              d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.76 14.93 1 12 1 7.35 1 3.4 3.65 1.48 7.5l3.8 2.95C6.18 7.28 8.87 5.04 12 5.04z"
                            />
                            <path
                              fill="#4285F4"
                              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.65 2.84c2.14-1.97 3.38-4.87 3.38-8.5z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.28 10.45A7.19 7.19 0 0112 7.15c1.11 0 2.16.26 3.1.72l3.65-2.84C16.92 3.66 14.59 3.04 12 3.04 8.21 3.04 4.88 5.16 3.08 8.3l2.2 2.15z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 18.96c-3.13 0-5.82-2.24-6.72-5.41L1.48 16.5C3.4 20.35 7.35 23 12 23c2.93 0 5.39-.97 7.18-2.64l-3.65-2.84c-1 .67-2.28 1.44-3.53 1.44z"
                            />
                          </svg>
                          Google
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const emailStr = "facebook.user@mintcare.vn";
                            try {
                              await login(emailStr, "123456");
                              addToast(
                                "Đăng nhập nhanh Facebook thành công!",
                                "success",
                              );
                              setIsAuthModalOpen(false);
                              setTimeout(() => {
                                document
                                  .getElementById("booking-workspace")
                                  ?.scrollIntoView({ behavior: "smooth" });
                              }, 150);
                            } catch {
                              try {
                                await register({
                                  email: emailStr,
                                  password: "123456",
                                  fullName: "Khách Hàng Facebook",
                                  phone: "0901112222",
                                });
                                addToast(
                                  "Đăng ký & Đăng nhập Facebook thành công!",
                                  "success",
                                );
                                setIsAuthModalOpen(false);
                                setTimeout(() => {
                                  document
                                    .getElementById("booking-workspace")
                                    ?.scrollIntoView({ behavior: "smooth" });
                                }, 150);
                              } catch (err: any) {
                                addToast(
                                  "Không thể đăng nhập nhanh: " + err.message,
                                  "error",
                                );
                              }
                            }
                          }}
                          className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl py-2 text-[10px] font-bold text-slate-600"
                        >
                          <svg
                            className="w-4 h-4 fill-blue-600"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Right Form: Register */}
                  <form
                    onSubmit={handleLocalRegister}
                    className="w-1/2 px-8 pb-8 pt-2 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Name Input */}
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                          Họ và tên
                        </Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type="text"
                            required
                            placeholder="VD: Nguyễn Văn A"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="rounded-2xl border-blue-100 pl-11 h-11 bg-slate-50 focus:bg-white transition-all font-semibold text-sm shadow-none text-blue-950"
                          />
                        </div>
                      </div>

                      {/* Phone Input */}
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                          Số điện thoại
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type="tel"
                            required
                            placeholder="VD: 091 234 5678"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="rounded-2xl border-blue-100 pl-11 h-11 bg-slate-50 focus:bg-white transition-all font-semibold text-sm shadow-none text-blue-950"
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                          Địa chỉ Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="rounded-2xl border-blue-100 pl-11 h-11 bg-slate-50 focus:bg-white transition-all font-semibold text-sm shadow-none text-blue-950"
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                            Mật khẩu
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              required
                              placeholder="••••••"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              className="rounded-2xl border-blue-100 pl-9.5 h-11 bg-slate-50 focus:bg-white transition-all font-semibold text-sm shadow-none text-blue-950"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                            Xác nhận
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              required
                              placeholder="••••••"
                              value={regConfirmPassword}
                              onChange={(e) =>
                                setRegConfirmPassword(e.target.value)
                              }
                              className="rounded-2xl border-blue-100 pl-9.5 h-11 bg-slate-50 focus:bg-white transition-all font-semibold text-sm shadow-none text-blue-950"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-1">
                        <input
                          type="checkbox"
                          id="terms"
                          required
                          defaultChecked
                          className="w-3.5 h-3.5 rounded text-blue-600 border-blue-200 focus:ring-blue-500 cursor-pointer"
                        />
                        <label
                          htmlFor="terms"
                          className="text-[10px] text-slate-400 font-bold select-none cursor-pointer"
                        >
                          Tôi đồng ý với các điều khoản dịch vụ y tế.
                        </label>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-6 h-12 text-xs font-black uppercase tracking-widest shadow-md shadow-blue-600/10 flex items-center justify-center gap-2"
                      >
                        <User className="w-4 h-4" /> Đăng ký tài khoản
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
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
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-100/80"
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
                          <Select value={editGender} onValueChange={(val) => setEditGender(val || "Nam")}>
                            <SelectTrigger className="w-full rounded-xl border border-slate-200 h-11 bg-white font-semibold text-sm shadow-none text-slate-800">
                              <SelectValue placeholder="Chọn giới tính..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800 z-[70]">
                              <SelectItem value="Nam" className="rounded-lg py-2.5 font-semibold text-sm focus:bg-slate-50">Nam</SelectItem>
                              <SelectItem value="Nữ" className="rounded-lg py-2.5 font-semibold text-sm focus:bg-slate-50">Nữ</SelectItem>
                            </SelectContent>
                          </Select>
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
                              className="rounded-xl border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 h-11 text-sm font-semibold pr-11 transition-all"
                              placeholder="••••••••"
                            />
                            <button 
                              type="button" 
                              suppressHydrationWarning 
                              onClick={() => setShowCurrentPw((p) => !p)} 
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5 col-span-1">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mật khẩu mới</Label>
                          <div className="relative">
                            <Input
                              type={showNewPw ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="rounded-xl border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 h-11 text-sm font-semibold pr-11 transition-all"
                              placeholder="Tối thiểu 6 ký tự"
                            />
                            <button 
                              type="button" 
                              suppressHydrationWarning 
                              onClick={() => setShowNewPw((p) => !p)} 
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5 col-span-1">
                          <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Xác nhận mật khẩu mới</Label>
                          <Input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className={cn(
                              "rounded-xl border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 h-11 text-sm font-semibold transition-all", 
                              confirmNewPassword && newPassword !== confirmNewPassword ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20" : ""
                            )}
                            placeholder="Nhập lại mật khẩu mới"
                          />
                          {confirmNewPassword && newPassword !== confirmNewPassword && (
                            <p className="text-[10px] font-bold text-red-500 mt-1">Mật khẩu không khớp</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsProfileModalOpen(false)} 
                          className="rounded-xl h-11 px-6 font-black text-xs border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
                        >
                          Hủy
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl h-11 px-8 font-black text-xs uppercase tracking-widest shadow-md shadow-violet-500/10 hover:shadow-lg transition-all"
                        >
                          <Lock className="w-3.5 h-3.5 mr-2" /> Xác nhận
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
