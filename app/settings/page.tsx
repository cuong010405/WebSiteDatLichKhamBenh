"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  Bell, 
  Lock, 
  Globe, 
  Moon, 
  Sun, 
  Shield, 
  Mail,
  Smartphone,
  ChevronRight,
  LogOut,
  Camera
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface SettingSectionProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

function SettingSection({ title, subtitle, children }: SettingSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tight-tracking">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <Card className="bg-white border-hairline rounded-[32px] p-8 shadow-xs">
        {children}
      </Card>
    </div>
  )
}

interface SettingItemProps {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
  noBorder?: boolean
}

function SettingItem({ icon: Icon, title, description, children, noBorder }: SettingItemProps) {
  return (
    <div className={cn(
      "flex items-center justify-between py-5 gap-6",
      !noBorder && "border-b border-hairline"
    )}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-on-surface-tertiary">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="p-10 max-w-4xl mx-auto w-full space-y-12 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="eyebrow mb-2 block">Cấu hình hệ thống</span>
        <h1 className="text-4xl font-semibold tight-tracking text-foreground leading-tight">Cài đặt</h1>
        <p className="text-muted-foreground mt-2">Quản lý tài khoản và tùy chỉnh trải nghiệm làm việc của bạn.</p>
      </motion.div>

      <div className="space-y-12">
        {/* Profile Section */}
        <SettingSection title="Hồ sơ cá nhân" subtitle="Cập nhật thông tin công khai và ảnh đại diện của bạn.">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-2 border-hairline rounded-[40px] shadow-sm overflow-hidden">
                  <AvatarImage src="https://i.pravatar.cc/150?u=admin" className="object-cover" />
                  <AvatarFallback className="text-2xl font-bold">AM</AvatarFallback>
                </Avatar>
                <button className="absolute inset-0 bg-black/40 rounded-[40px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <Button variant="outline" className="rounded-full h-9 text-xs font-bold border-hairline px-4">Thay đổi ảnh</Button>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-on-surface-tertiary">Họ và tên</Label>
                <Input defaultValue="Alex Miller" className="rounded-xl border-hairline h-11 focus:border-primary shadow-none bg-surface-secondary/20" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-on-surface-tertiary">Email</Label>
                <Input defaultValue="alex.miller@mintcare.io" className="rounded-xl border-hairline h-11 focus:border-primary shadow-none bg-surface-secondary/20" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-on-surface-tertiary">Vai trò</Label>
                <Input defaultValue="Bác sĩ Chuyên khoa - Quản trị viên" disabled className="rounded-xl border-hairline h-11 bg-surface-secondary/50 shadow-none font-medium" />
              </div>
              <div className="md:col-span-2 pt-4">
                <Button className="bg-primary text-white rounded-full px-8 h-11 text-sm font-bold hover:bg-primary-strong transition-all shadow-lg shadow-primary/10">Lưu thay đổi</Button>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Notifications Section */}
        <SettingSection title="Thông báo" subtitle="Chọn cách bạn muốn nhận thông tin về ca trực và bệnh nhân.">
          <div className="divide-y divide-hairline">
            <SettingItem 
              icon={Bell} 
              title="Thông báo đẩy" 
              description="Nhận thông báo tức thì trên trình duyệt."
            >
              <Switch defaultChecked />
            </SettingItem>
            <SettingItem 
              icon={Mail} 
              title="Email hàng ngày" 
              description="Bản tin tổng hợp các ca trực trong ngày qua email."
            >
              <Switch defaultChecked />
            </SettingItem>
            <SettingItem 
              icon={Smartphone} 
              title="SMS khẩn cấp" 
              description="Gửi tin nhắn khi có ca cấp cứu hoặc thay đổi lịch đột xuất."
              noBorder
            >
              <Switch />
            </SettingItem>
          </div>
        </SettingSection>

        {/* Security Section */}
        <SettingSection title="Bảo mật" subtitle="Bảo vệ tài khoản và dữ liệu lâm sàng của bạn.">
          <div className="divide-y divide-hairline">
            <SettingItem 
              icon={Lock} 
              title="Mật khẩu" 
              description="Đã cập nhật 3 tháng trước."
            >
              <Button variant="outline" className="rounded-full h-9 text-xs font-bold border-hairline px-4 hover:bg-surface-secondary">Thay đổi</Button>
            </SettingItem>
            <SettingItem 
              icon={Shield} 
              title="Xác thực 2 yếu tố" 
              description="Thêm một lớp bảo mật cho tài khoản của bạn."
            >
              <Button variant="outline" className="rounded-full h-9 text-xs font-bold border-hairline px-4 text-primary-strong bg-surface-tinted border-primary/20">Đã bật</Button>
            </SettingItem>
            <SettingItem 
              icon={Globe} 
              title="Lịch sử đăng nhập" 
              description="Xem danh sách các thiết bị đã truy cập."
              noBorder
            >
              <Button variant="ghost" size="icon" className="text-on-surface-tertiary hover:bg-surface-secondary rounded-full">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </SettingItem>
          </div>
        </SettingSection>

        {/* Preferences Section */}
        <SettingSection title="Tùy chỉnh" subtitle="Cài đặt ngôn ngữ và giao diện hiển thị.">
          <div className="divide-y divide-hairline">
            <SettingItem 
              icon={Sun} 
              title="Chế độ giao diện" 
              description="Chuyển đổi giữa chế độ sáng và tối."
            >
              <div className="flex bg-surface-secondary rounded-full p-1 border border-hairline">
                <button className="p-1.5 rounded-full bg-white shadow-sm text-primary">
                  <Sun className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-full text-muted-foreground hover:text-foreground px-2">
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </SettingItem>
            <SettingItem 
              icon={Globe} 
              title="Ngôn ngữ" 
              description="Chọn ngôn ngữ hiển thị chính của hệ thống."
              noBorder
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-secondary rounded-full border border-hairline cursor-pointer hover:bg-hairline transition-colors">
                <span className="text-xs font-bold">Tiếng Việt</span>
                <ChevronRight className="w-3 h-3 opacity-50 rotate-90" />
              </div>
            </SettingItem>
          </div>
        </SettingSection>

        <div className="pt-6 flex justify-between items-center">
          <p className="text-[10px] text-on-surface-tertiary font-mono font-bold tracking-widest uppercase">PHIÊN BẢN HỆ THỐNG: 2.4.0-STABLE</p>
          <Button variant="ghost" className="text-red-500 hover:text-white hover:bg-red-500 rounded-full px-6 font-bold flex items-center gap-2 transition-all">
            <LogOut className="w-4 h-4" /> Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  )
}
