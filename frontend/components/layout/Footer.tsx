"use client";

import * as React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  Lock,
} from "lucide-react";

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#0099FF" }} className="text-white border-t border-white/20 pt-16 pb-12 relative overflow-hidden font-sans">
      {/* Subtle ambient overlays */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-14">

        {/* ── Main Footer Columns Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1: Brand & Contact Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-black tracking-tighter text-white uppercase">MintCare Portal</span>
                <p className="text-[9px] font-black text-white/70 uppercase tracking-widest leading-none mt-0.5">Đặt lịch trực tuyến</p>
              </div>
            </div>

            <p className="text-xs font-medium text-white/80 leading-relaxed">
              Nền tảng công nghệ y tế chuẩn mực, kết nối bệnh nhân với đội ngũ Bác sĩ, Y tá & Chuyên gia điều dưỡng hàng đầu tận gia.
            </p>

            <div className="space-y-2.5 text-xs text-white/80 font-medium pt-2">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                <span>123 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-white/60 shrink-0" />
                <span>Hotline: 1900 6789 - (028) 7300 6789</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-white/60 shrink-0" />
                <span>Email: support@mintcare.vn</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-white/60 shrink-0" />
                <span>Thời gian làm việc: 07:00 - 21:00 (Tất cả các ngày)</span>
              </p>
            </div>
          </div>

          {/* Column 2: Dịch vụ y tế tại gia */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-white border-l-2 border-white/50 pl-3">
              Dịch vụ y tế tại gia
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-white/80">
              {[
                "Kiểm tra sinh hiệu & Đo huyết áp",
                "Vật lý trị liệu & Phục hồi chức năng",
                "Chăm sóc vết thương & Thay băng tiệt trùng",
                "Truyền dịch y tế & Tiêm thuốc tại nhà",
                "Chăm sóc người cao tuổi & Bệnh nhân mạn tính",
                "Tư vấn chế độ dinh dưỡng lâm sàng",
              ].map((item) => (
                <li key={item}>
                  <Link href="/dich-vu" className="hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3 h-3 text-white/50 group-hover:translate-x-1 transition-transform" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Đội ngũ & Hỗ trợ */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-white border-l-2 border-white/50 pl-3">
              Đội ngũ & Hỗ trợ
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-white/80">
              {[
                { label: "Danh sách Bác sĩ & Y tá CCHN", href: "/doi-ngu" },
                { label: "Hướng dẫn các bước đặt lịch hẹn", href: "/dat-lich" },
                { label: "Quy trình dời & Hủy lịch hẹn", href: "/lich-hen" },
                { label: "Phương thức thanh toán Chuyển khoản / Tiền mặt", href: "/#faq-section" },
                { label: "Quy chuẩn vô khuẩn & An toàn y tế", href: "/#faq-section" },
                { label: "Giải đáp thắc mắc thường gặp (FAQ)", href: "/#faq-section" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3 h-3 text-white/50 group-hover:translate-x-1 transition-transform" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: An toàn & Chứng nhận */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-white border-l-2 border-white/50 pl-3">
              An toàn & Chứng nhận
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm p-2.5 rounded-xl border border-white/20">
                <ShieldCheck className="w-5 h-5 text-white shrink-0" />
                <div>
                  <p className="font-bold text-white text-[11px]">Tiêu chuẩn HIPAA & ISO 9001</p>
                  <p className="text-[10px] text-white/70">Bảo mật bệnh án tuyệt đối</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm p-2.5 rounded-xl border border-white/20">
                <Award className="w-5 h-5 text-white shrink-0" />
                <div>
                  <p className="font-bold text-white text-[11px]">Cấp phép bởi Bộ Y Tế</p>
                  <p className="text-[10px] text-white/70">Giấy phép số 1284/BYT-GPHĐ</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm p-2.5 rounded-xl border border-white/20">
                <Lock className="w-5 h-5 text-white shrink-0" />
                <div>
                  <p className="font-bold text-white text-[11px]">Mã hóa SSL / AES-256</p>
                  <p className="text-[10px] text-white/70">An toàn giao dịch 100%</p>
                </div>
              </div>
            </div>

            {/* Social logos */}
            <div className="pt-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Kết nối với MintCare</p>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <a href="#" aria-label="Facebook"
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 border border-white/30 flex items-center justify-center transition-all hover:scale-110">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* Zalo */}
                <a href="#" aria-label="Zalo"
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 border border-white/30 flex items-center justify-center transition-all hover:scale-110">
                  <svg viewBox="0 0 48 48" className="w-4 h-4 fill-white">
                    <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm-2.667 28H14v-1.333l6.222-8H14v-1.334h7.333v1.334l-6.222 8H21.333V32zm4 0h-1.333V19.333H25.333V32zm7.334 0h-6V19.333h1.333v11.334h4.667V32z"/>
                  </svg>
                </a>
                {/* YouTube */}
                <a href="#" aria-label="YouTube"
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 border border-white/30 flex items-center justify-center transition-all hover:scale-110">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a href="#" aria-label="TikTok"
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 border border-white/30 flex items-center justify-center transition-all hover:scale-110">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
