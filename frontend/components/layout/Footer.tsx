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

            {/* Social badges */}
            <div className="pt-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Kết nối với MintCare</p>
              <div className="flex items-center gap-2">
                {["Facebook", "Zalo", "YouTube", "TikTok"].map((net) => (
                  <span key={net} className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white hover:text-[#0099FF] text-white text-[10px] font-bold transition-all cursor-pointer border border-white/30">
                    {net}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
