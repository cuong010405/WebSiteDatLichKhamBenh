"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Stethoscope,
  ChevronRight,
  Bot,
  User,
  RefreshCw,
  Calendar,
  Users,
  ShieldCheck,
  Zap,
  PhoneCall,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  actions?: { label: string; url: string; icon?: any }[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "init-1",
    sender: "bot",
    text: "Xin chào! Trợ lý Y tế AI MintCare có thể giúp gì cho bạn hôm nay? Bạn có thể đặt câu hỏi về dịch vụ, đội ngũ chuyên gia hoặc cách đặt lịch khám tại gia.",
    timestamp: "Vừa xong",
    actions: [
      { label: "Đặt lịch khám", url: "/dat-lich", icon: Calendar },
      { label: "Đội ngũ chuyên gia", url: "/doi-ngu", icon: Users },
      { label: "Danh mục dịch vụ", url: "/dich-vu", icon: Zap },
    ],
  },
];

const SUGGESTIONS = [
  "Bảng giá dịch vụ",
  "Đội ngũ chuyên gia",
  "Hướng dẫn các bước đặt lịch",
  "Khung giờ & Ca khám",
  "Hình thức thanh toán QR/Tiền mặt",
  "Hotline hỗ trợ khẩn cấp",
];

export function ChatbotWidget() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const widgetRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  React.useEffect(() => {
    const checkModal = () => {
      const hasAuthModal = !!document.querySelector(
        '[data-auth-modal="true"], [role="dialog"], [data-state="open"]'
      );
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const hasAuthParam = urlParams?.get("action") === "login" || urlParams?.get("action") === "register";

      setIsModalOpen(hasAuthModal || hasAuthParam);
    };

    checkModal();

    const observer = new MutationObserver(() => {
      checkModal();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "data-state", "data-auth-modal"],
    });

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      setUnreadCount(0);
    }
  }, [isOpen, messages, isTyping]);

  // Do not render chatbot on admin routes or when authentication modal is open
  if (pathname?.startsWith("/admin") || isModalOpen) {
    return null;
  }

  const generateBotReply = (userQuery: string): { text: string; actions?: any[] } => {
    const q = userQuery.toLowerCase().trim();

    // 🛡️ 1. STRICT TOXIC & PROFANITY FILTER
    const toxicPatterns = [
      "đm", "dm", "dmm", "đmm", "đcm", "dcm", "vkl", "vcl", "vl", "đĩ", "chó", "súc vật", "con mẹ",
      "ngu", "óc chó", "bố láo", "mất dạy", "mẹ kiếp", "đụ", "fuck", "shit", "bitch", "asshole",
      "scam", "lừa đảo", "lừa tiền", "đồ chó", "hèn", "xấu xa", "khùng", "điên", "mẹ mày", "clm", "cmn"
    ];

    const isToxic = toxicPatterns.some((pattern) => {
      const regex = new RegExp(`\\b${pattern}\\b`, "i");
      return regex.test(q) || q.includes(pattern);
    });

    if (isToxic) {
      return {
        text: "🛡️ MintCare AI cam kết duy trì môi trường giao tiếp văn minh & chuẩn mực y tế.\n\nVui lòng sử dụng ngôn từ lịch sự để tôi có thể hỗ trợ tư vấn dịch vụ chăm sóc sức khỏe cho bạn một cách tốt nhất nhé!",
        actions: [
          { label: "Xem danh mục dịch vụ", url: "/dich-vu", icon: Zap },
          { label: "Hướng dẫn đặt lịch", url: "/dat-lich", icon: Calendar },
        ],
      };
    }

    // 📚 2. COMPREHENSIVE KNOWLEDGE DATA ENGINE

    // Dịch vụ & Bảng giá
    if (q.includes("giá") || q.includes("chi phí") || q.includes("bao nhiêu") || q.includes("bảng giá") || q.includes("gói")) {
      return {
        text: "💰 BẢNG GIÁ DỊCH VỤ NÊM YẾT MINTCARE:\n• Khám sức khỏe định kỳ & sinh hiệu: 100.000 VNĐ\n• Kiểm tra răng tổng quát: 300.000 VNĐ\n• Khám nội khoa tại nhà: 300.000 VNĐ\n• Khám đau đầu & Chuyên khoa: 400.000 VNĐ\n• Phục hồi chức năng / VLTL: 350.000 - 500.000 VNĐ\n• Tư vấn dinh dưỡng cá nhân: 300.000 VNĐ\n• Chăm sóc người cao tuổi: 300.000 VNĐ / 4h",
        actions: [{ label: "Xem chi tiết dịch vụ", url: "/dich-vu", icon: Zap }],
      };
    }

    // Các loại dịch vụ y tế
    if (q.includes("dịch vụ") || q.includes("gồm những gì") || q.includes("có những gì") || q.includes("chăm sóc")) {
      return {
        text: "🏥 MINTCARE CUNG CẤP CÁC DỊCH VỤ Y TẾ TẠI GIA:\n1️⃣ Chăm sóc Lâm sàng: Khám tổng quát, đo sinh hiệu, nội khoa, ngoại khoa.\n2️⃣ Phục hồi chức năng: Tập vật lý trị liệu sau phẫu thuật, phục hồi vận động.\n3️⃣ Dinh dưỡng: Tư vấn chế độ ăn uống chuyên biệt cho bệnh nhân.\n4️⃣ Chăm sóc tại nhà: Hỗ trợ người cao tuổi & bệnh nhân 24/7.",
        actions: [{ label: "Khám phá dịch vụ", url: "/dich-vu", icon: Zap }],
      };
    }

    // Khung giờ & Ca chăm sóc
    if (q.includes("mấy giờ") || q.includes("giờ") || q.includes("ca") || q.includes("thời gian") || q.includes("khung giờ") || q.includes("ca đêm")) {
      return {
        text: "⏰ KHUNG GIỜ VÀ CA CHĂM SÓC:\n• Ca theo giờ linh hoạt: 2 giờ (ngắn), 4 giờ (nửa ngày), 8 giờ (cả ngày), 12 giờ (ca đêm).\n• Giờ hoạt động: Bắt đầu ca từ 08:00 và kết thúc trước 20:00 hàng ngày.\n• Gói dài hạn ưu đãi: 7 ngày (giảm 5%), 14 ngày (giảm 10%), 30 ngày (giảm 15%).",
        actions: [{ label: "Đặt lịch theo khung giờ", url: "/dat-lich", icon: Calendar }],
      };
    }

    // Đặt lịch & Hướng dẫn
    if (q.includes("đặt lịch") || q.includes("đăng ký") || q.includes("các bước") || q.includes("làm sao") || q.includes("quy trình")) {
      return {
        text: "📝 QUY TRÌNH ĐẶT LỊCH KHÁM TẠI GIA (4 BƯỚC):\n1️⃣ Vào mục 'Đặt lịch khám'\n2️⃣ Chọn Dịch vụ & Chuyên gia y tế\n3️⃣ Chọn Ngày & Khung giờ phù hợp\n4️⃣ Điền Địa chỉ nhà & Xác nhận thanh toán.",
        actions: [{ label: "Đặt lịch khám ngay", url: "/dat-lich", icon: Calendar }],
      };
    }

    // Đội ngũ chuyên gia & Bác sĩ
    if (q.includes("chuyên gia") || q.includes("bác sĩ") || q.includes("y tá") || q.includes("chứng chỉ") || q.includes("cchn") || q.includes("trình độ")) {
      return {
        text: "👨‍⚕️ ĐỘI NGŨ Y TẾ CHUYÊN NGHIỆP MINTCARE:\n• 100% Chuyên gia có Chứng chỉ hành nghề (CCHN) chính thức do Bộ Y tế cấp (ví dụ: Bác sĩ Lê Văn Răng - CCHN 012345/BYT...).\n• Quy trình chẩn đoán kỹ thuật số an toàn, thiết bị y tế đạt chuẩn ISO 9001.",
        actions: [{ label: "Xem danh sách chuyên gia", url: "/doi-ngu", icon: Users }],
      };
    }

    // Thanh toán & Chuyển khoản QR
    if (q.includes("thanh toán") || q.includes("chuyển khoản") || q.includes("tiền mặt") || q.includes("stk") || q.includes("ngân hàng") || q.includes("qr")) {
      return {
        text: "💳 PHƯƠNG THỨC THANH TOÁN:\n1️⃣ Tiền mặt: Thanh toán trực tiếp cho chuyên gia sau ca khám.\n2️⃣ Chuyển khoản QR code: Ngân hàng Vietcombank (STK: 1234567890 - CONG TY TNHH MINTCARE). Hệ thống tự động xác nhận sau khi quét QR.",
        actions: [{ label: "Đến trang Đặt lịch", url: "/dat-lich", icon: Calendar }],
      };
    }

    // Hủy lịch & Quản lý lịch hẹn
    if (q.includes("hủy") || q.includes("xóa lịch") || q.includes("xem lịch") || q.includes("lịch hẹn của tôi") || q.includes("trạng thái")) {
      return {
        text: "📅 QUẢN LÝ LỊCH HẸN:\n• Bạn có thể xem danh sách và trạng thái các ca khám tại mục 'Lịch hẹn của tôi'.\n• Hỗ trợ hủy lịch dễ dàng kèm lý do bận việc đột xuất trước ca khám.",
        actions: [{ label: "Xem lịch hẹn của tôi", url: "/lich-hen", icon: Calendar }],
      };
    }

    // Bảo mật & An toàn HIPAA
    if (q.includes("bảo mật") || q.includes("an toàn") || q.includes("hipaa") || q.includes("hồ sơ")) {
      return {
        text: "🔒 CAM KẾT BẢO MẬT & CHẤT LƯỢNG:\n• Mã hóa thông tin bệnh án theo chuẩn bảo mật HIPAA & AES-256 đầu cuối.\n• Đảm bảo quy trình vô khuẩn 100% đối với thiết bị y tế tại gia.",
        actions: [{ label: "Cam kết chất lượng", url: "/doi-ngu", icon: ShieldCheck }],
      };
    }

    // Hotline & Địa chỉ liên hệ
    if (q.includes("hotline") || q.includes("địa chỉ") || q.includes("ở đâu") || q.includes("liên hệ") || q.includes("sđt") || q.includes("cấp cứu")) {
      return {
        text: "📞 THÔNG TIN LIÊN HỆ MINTCARE:\n• Hotline hỗ trợ 24/7: 1900 6789\n• Email: support@mintcare.com\n• Địa chỉ: 123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh.\n🚨 Trường hợp nguy cấp tính mạng, vui lòng gọi 115 ngay lập tức!",
        actions: [{ label: "Trang liên hệ", url: "/#contact-section", icon: PhoneCall }],
      };
    }

    // 2.15. Chăm sóc vết thương & Thay băng
    if (q.includes("vết thương") || q.includes("thay băng") || q.includes("cắt chỉ") || q.includes("rửa vết thương") || q.includes("mổ")) {
      return {
        text: "🩹 CHĂM SÓC VẾT THƯƠNG & KHÁM NGOẠI KHOA:\n• Rửa, thay băng gạc tiệt trùng vô khuẩn cho vết mổ sau phẫu thuật.\n• Cắt chỉ chuẩn kỹ thuật y tế tại gia.\n• Xử lý & phòng ngừa vết loét tì đè cho bệnh nhân nằm lâu năm.\n👨‍⚕️ Thực hiện bởi Điều dưỡng có Chứng chỉ hành nghề chính thức.",
        actions: [{ label: "Đặt lịch chăm sóc vết thương", url: "/dat-lich", icon: Calendar }],
      };
    }

    // 2.16. Vật lý trị liệu & Phục hồi chức năng
    if (q.includes("vật lý trị liệu") || q.includes("vltl") || q.includes("tập đi") || q.includes("tai biến") || q.includes("đột quỵ") || q.includes("xương khớp") || q.includes("cột sống")) {
      return {
        text: "🏃 VẬT LÝ TRỊ LIỆU & PHỤC HỒI CHỨC NĂNG:\n• Tập vận động cho bệnh nhân sau tai biến / đột quỵ / phẫu thuật.\n• Phục hồi chức năng cột sống, vai cổ đĩa đệm & khớp gối.\n• Kỹ thuật viên mang trang thiết bị trị liệu tận nhà.\n💰 Giá gói: 350.000 VNĐ - 500.000 VNĐ / ca",
        actions: [{ label: "Khám phá dịch vụ VLTL", url: "/dich-vu", icon: Zap }],
      };
    }

    // 2.17. Dinh dưỡng cá nhân hóa
    if (q.includes("dinh dưỡng") || q.includes("ăn uống") || q.includes("thực đơn") || q.includes("tiểu đường") || q.includes("gút") || q.includes("béo phì")) {
      return {
        text: "🥗 TƯ VẤN DINH DƯỠNG BỆNH LÝ:\n• Xây dựng thực đơn dinh dưỡng riêng cho người đái tháo đường, tăng huyết áp, gút, suy thận.\n• Tư vấn dinh dưỡng tăng/giảm cân an toàn & chăm sóc sức khỏe người già.\n💰 Giá gói: 300.000 VNĐ",
        actions: [{ label: "Tư vấn dinh dưỡng ngay", url: "/dat-lich?serviceId=SV-006", icon: Calendar }],
      };
    }

    // 2.18. Tài khoản & Đăng nhập / Quên mật khẩu
    if (q.includes("tài khoản") || q.includes("đăng nhập") || q.includes("mật khẩu") || q.includes("quên mật khẩu") || q.includes("đăng ký")) {
      return {
        text: "🔐 QUẢN LÝ TÀI KHOẢN KHÁCH HÀNG:\n• Đăng nhập / Đăng ký nhanh bằng Email.\n• Quên mật khẩu: Bấm 'Quên mật khẩu' tại màn hình đăng nhập để nhận mã xác minh OTP gửi trực tiếp về Email của bạn.",
        actions: [{ label: "Mở màn hình Đăng nhập", url: "/?action=login", icon: User }],
      };
    }

    // Default friendly response
    return {
      text: "MintCare AI sẵn sàng tư vấn cho bạn! Tôi có thể giải đáp đầy đủ về:\n1️⃣ Bảng giá & Dịch vụ y tế tại gia (100k - 500k)\n2️⃣ Đội ngũ Bác sĩ / Y tá có chứng chỉ hành nghề\n3️⃣ Hướng dẫn 4 bước đặt lịch & thanh toán QR\n4️⃣ Hotline hỗ trợ khẩn cấp 24/7: 1900 6789",
      actions: [
        { label: "Đặt lịch khám", url: "/dat-lich", icon: Calendar },
        { label: "Đội ngũ chuyên gia", url: "/doi-ngu", icon: Users },
        { label: "Danh mục dịch vụ", url: "/dich-vu", icon: Zap },
      ],
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateBotReply(query);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: reply.text,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        actions: reply.actions,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-[600] font-sans pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ transformOrigin: "bottom right", willChange: "transform, opacity" }}
            className="absolute bottom-0 right-0 w-[90vw] sm:w-[380px] h-[540px] bg-white border border-blue-100 rounded-[32px] shadow-[0_20px_50px_-12px_rgba(30,58,138,0.15)] flex flex-col overflow-hidden ring-1 ring-blue-500/10 origin-bottom-right pointer-events-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 p-4 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-blue-700 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-sm uppercase tracking-tight">MintCare AI</h3>
                    <span className="bg-white/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">Assistant</span>
                  </div>
                  <p className="text-[10px] text-blue-100 font-semibold flex items-center gap-1 mt-0.5">
                    ● Trực tuyến · Tư vấn y tế 24/7
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="Đặt lại hội thoại"
                  className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer text-blue-100 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Đóng chat"
                  className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer text-blue-100 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-blue-50/30 via-white to-slate-50/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={cn(
                    "flex flex-col gap-1 max-w-[85%]",
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 px-1">
                    {msg.sender === "bot" ? (
                      <>
                        <Bot className="w-3 h-3 text-blue-600" /> MintCare AI
                      </>
                    ) : (
                      <>
                        Bạn <User className="w-3 h-3 text-slate-500" />
                      </>
                    )}
                    <span>· {msg.timestamp}</span>
                  </div>

                  <div
                    className={cn(
                      "p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs whitespace-pre-line",
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-br-xs"
                        : "bg-white border border-blue-100/80 text-slate-800 rounded-bl-xs shadow-slate-900/5"
                    )}
                  >
                    {msg.text}
                  </div>

                  {/* Actions buttons inside message */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {msg.actions.map((act, i) => {
                        const IconComp = act.icon || ChevronRight;
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              router.push(act.url);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200/80 text-[10px] font-black uppercase tracking-wider transition-all shadow-2xs cursor-pointer group"
                          >
                            <IconComp className="w-3.5 h-3.5 text-blue-600 group-hover:text-white" />
                            {act.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="flex flex-col gap-1 items-start max-w-[85%]">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 px-1">
                    <Bot className="w-3 h-3 text-blue-600" /> MintCare AI đang trả lời...
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-blue-100 text-slate-400 rounded-bl-xs flex items-center gap-1.5 shadow-2xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="p-2 bg-slate-50/80 border-t border-blue-50 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
              {SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 border border-blue-100 text-[10px] font-bold text-slate-600 hover:text-blue-700 whitespace-nowrap transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  💡 {sug}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-blue-100 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white flex items-center justify-center disabled:opacity-40 disabled:hover:opacity-40 hover:brightness-110 transition-all shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button (Ẩn khi khung chat đang mở) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="toggle-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="absolute bottom-0 right-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-sky-500 text-white flex items-center justify-center shadow-xl shadow-blue-600/35 border-2 border-white/80 cursor-pointer overflow-hidden pointer-events-auto"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageSquare className="w-6 h-6" />
            <Sparkles className="w-3 h-3 text-sky-200 absolute -top-1 -right-1 animate-pulse" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
