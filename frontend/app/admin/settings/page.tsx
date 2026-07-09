"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
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
  Camera,
  Save,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { API_URL, authFetch } from "@/lib/api"
import { useLoading } from "@/lib/loading-context"

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
  const { show, hide } = useLoading()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [toast, setToast] = React.useState<{ msg: string; type: "ok" | "err" } | null>(null)

  // Password change state
  const [pwDialogOpen, setPwDialogOpen] = React.useState(false)
  const [currentPw, setCurrentPw] = React.useState("")
  const [newPw, setNewPw] = React.useState("")
  const [confirmPw, setConfirmPw] = React.useState("")
  const [showCurrentPw, setShowCurrentPw] = React.useState(false)
  const [showNewPw, setShowNewPw] = React.useState(false)
  const [pwSaving, setPwSaving] = React.useState(false)

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName || "")
      setEmail(user.email || "")
      setPhone((user as any).phone || "")
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!user?.id) return
    setSaving(true)
    show("Đang lưu dữ liệu...")
    try {
      const res = await authFetch(`${API_URL}/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ fullName, phone }),
      })
      if (!res.ok) throw new Error("API error")
      const data = await res.json()
      const stored = localStorage.getItem("mintcare_user")
      if (stored) {
        const parsed = JSON.parse(stored)
        localStorage.setItem("mintcare_user", JSON.stringify({
          ...parsed,
          fullName: data.fullName,
          phone: data.phone,
        }))
      }
      showToast("Cập nhật hồ sơ thành công!")
      setTimeout(() => window.location.reload(), 800)
    } catch {
      showToast("Không thể cập nhật. Thử lại sau.", "err")
    } finally {
      setSaving(false)
      hide()
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      showToast("Vui lòng điền đầy đủ thông tin.", "err")
      return
    }
    if (newPw !== confirmPw) {
      showToast("Mật khẩu xác nhận không khớp.", "err")
      return
    }
    if (newPw.length < 6) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự.", "err")
      return
    }
    if (!user?.id) return

    setPwSaving(true)
    show("Đang cập nhật...")
    try {
      const res = await authFetch(`${API_URL}/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ password: newPw }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Đổi mật khẩu thất bại")
      }
      showToast("Đổi mật khẩu thành công!")
      setPwDialogOpen(false)
      setCurrentPw("")
      setNewPw("")
      setConfirmPw("")
    } catch (err: any) {
      showToast(err.message || "Không thể đổi mật khẩu. Thử lại sau.", "err")
    } finally {
      setPwSaving(false)
      hide()
    }
  }

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "AM"

  return (
    <div className="p-10 max-w-4xl mx-auto w-full space-y-12 pb-20">
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-lg border",
          toast.type === "ok"
            ? "bg-white text-green-700 border-green-200 shadow-green-50"
            : "bg-white text-red-600 border-red-200 shadow-red-50"
        )}>
          {toast.msg}
        </div>
      )}

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
        <SettingSection title="Hồ sơ cá nhân" subtitle="Cập nhật thông tin công khai của bạn.">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-2 border-hairline rounded-[40px] shadow-sm overflow-hidden">
                  <AvatarImage src="https://i.pravatar.cc/150?u=admin" className="object-cover" />
                  <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-on-surface-tertiary">Họ và tên</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl border-hairline h-11 focus:border-primary shadow-none bg-surface-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-on-surface-tertiary">Email</Label>
                <Input
                  value={email}
                  disabled
                  className="rounded-xl border-hairline h-11 focus:border-primary shadow-none bg-surface-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-on-surface-tertiary">Số điện thoại</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Chưa cập nhật"
                  className="rounded-xl border-hairline h-11 focus:border-primary shadow-none bg-surface-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-on-surface-tertiary">Vai trò</Label>
                <Input
                  defaultValue={user?.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                  disabled
                  className="rounded-xl border-hairline h-11 bg-surface-secondary/50 shadow-none font-medium"
                />
              </div>
              <div className="md:col-span-2 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-primary text-white rounded-full px-8 h-11 text-sm font-bold hover:bg-primary-strong transition-all shadow-lg shadow-primary/10"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
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
              description="Thay đổi mật khẩu định kỳ để bảo mật tài khoản."
            >
              <Button
                variant="outline"
                className="rounded-full h-9 text-xs font-bold border-hairline px-4 hover:bg-surface-secondary"
                onClick={() => setPwDialogOpen(true)}
              >
                Đổi mật khẩu
              </Button>
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

        {/* Password Change Dialog */}
        <Dialog open={pwDialogOpen} onOpenChange={(v) => {
          setPwDialogOpen(v)
          if (!v) { setCurrentPw(""); setNewPw(""); setConfirmPw(""); setShowCurrentPw(false); setShowNewPw(false) }
        }}>
          <DialogContent className="sm:max-w-[420px] rounded-[28px] border border-slate-200/80 shadow-2xl p-0 overflow-hidden bg-white">
            <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-purple-500" />
            <div className="p-8">
              <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-5 border-b border-slate-100 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                    Đổi mật khẩu
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 mt-1.5 text-[11px] font-semibold leading-tight">
                    Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi.
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="••••••••"
                      className="rounded-xl border-slate-200 h-11 bg-white font-bold text-xs shadow-none pr-10"
                    />
                    <button type="button" onClick={() => setShowCurrentPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      type={showNewPw ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="rounded-xl border-slate-200 h-11 bg-white font-bold text-xs shadow-none pr-10"
                    />
                    <button type="button" onClick={() => setShowNewPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Xác nhận mật khẩu mới</Label>
                  <Input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className={cn(
                      "rounded-xl border-slate-200 h-11 bg-white font-bold text-xs shadow-none",
                      confirmPw && newPw !== confirmPw ? "border-red-300 bg-red-50" : ""
                    )}
                  />
                  {confirmPw && newPw !== confirmPw && (
                    <p className="text-[10px] font-bold text-red-500">Mật khẩu không khớp</p>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-5 mt-5 border-t border-slate-100 flex flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPwDialogOpen(false)}
                  className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={pwSaving || !currentPw || !newPw || !confirmPw || newPw !== confirmPw}
                  className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-md transition-all"
                >
                  {pwSaving ? "Đang lưu..." : "Xác nhận"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preferences Section */}
        <SettingSection title="Tùy chỉnh" subtitle="Cài đặt ngôn ngữ và giao diện hiển thị.">
          <div className="divide-y divide-hairline">
            <SettingItem
              icon={Globe}
              title="Ngôn ngữ"
              description="Chọn ngôn ngữ hiển thị chính của hệ thống."
              noBorder
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-secondary rounded-full border border-hairline">
                <span className="text-xs font-bold">Tiếng Việt</span>
                <ChevronRight className="w-3 h-3 opacity-50 rotate-90" />
              </div>
            </SettingItem>
          </div>
        </SettingSection>

        <div className="pt-6 flex justify-between items-center">
          <p className="text-[10px] text-on-surface-tertiary font-mono font-bold tracking-widest uppercase">PHIÊN BẢN HỆ THỐNG: 2.4.0-STABLE</p>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-red-500 hover:text-white hover:bg-red-500 rounded-full px-6 font-bold flex items-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  )
}
