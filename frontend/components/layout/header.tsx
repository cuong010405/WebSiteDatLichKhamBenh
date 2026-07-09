import * as React from "react";
import {
  Search,
  Bell,
  Command,
  Settings,
  User,
  LogOut,
  Stethoscope,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function Header() {
  const { user, login, register, logout } = useAuth();
  const router = useRouter();

  // Auth Dialog state inside header
  const [isOpen, setIsOpen] = React.useState(false);
  const [authTab, setAuthTab] = React.useState<"login" | "register">("login");
  const [showPass, setShowPass] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const u = await login(email, password);
      setIsOpen(false);
      if (u.role === "admin") {
        router.push("/");
      } else {
        router.push("/booking");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Đăng nhập thất bại");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await register({ email, password, fullName, phone });
      setIsOpen(false);
      router.push("/booking");
    } catch (err: any) {
      setErrorMsg(err.message || "Đăng ký thất bại");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-hairline px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8 flex-1">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-tertiary group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Tìm kiếm nhanh... (⌘ + K)"
            className="w-full bg-surface-secondary border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-hidden rounded-2xl py-2 pl-11 pr-12 text-sm transition-all h-11 shadow-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white border border-hairline px-1.5 py-0.5 rounded-lg shadow-xs pointer-events-none">
            <Command className="w-2.5 h-2.5 text-on-surface-tertiary" />
            <span className="text-[10px] font-bold text-on-surface-tertiary uppercase">
              K
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden md:flex items-center gap-2.5 bg-surface-tinted/50 px-4 py-2 rounded-2xl border border-primary/10"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(24,190,102,0.5)]"></div>
          <span className="text-[11px] font-black text-primary-strong uppercase tracking-wider">
            Hệ thống ổn định
          </span>
        </motion.div>

        <div className="flex items-center gap-2">
          <button className="relative w-11 h-11 rounded-2xl hover:bg-surface-secondary flex items-center justify-center transition-colors group">
            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-white shadow-sm"></span>
          </button>

          <div className="h-6 w-px bg-hairline mx-3"></div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 p-1 rounded-2xl hover:bg-surface-secondary transition-all outline-hidden group cursor-pointer">
                <div className="relative">
                  <Avatar className="w-9 h-9 border border-hairline rounded-xl shadow-xs transition-transform group-hover:scale-105">
                    <AvatarImage
                      src={`https://i.pravatar.cc/150?u=${user.id}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="font-black text-xs bg-primary text-white uppercase">
                      {user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-sm" />
                </div>
                <div className="hidden lg:block text-left pr-2">
                  <p className="text-[11px] font-black text-foreground leading-none uppercase tracking-tight">
                    {user.fullName}
                  </p>
                  <p className="text-[9px] text-on-surface-tertiary font-bold uppercase tracking-[0.2em] mt-1">
                    {user.role}
                  </p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2 rounded-[24px] shadow-2xl border-hairline mt-3 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="px-3 py-3 mb-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 rounded-xl border border-hairline">
                      <AvatarImage
                        src={`https://i.pravatar.cc/150?u=${user.id}`}
                        className="object-cover"
                      />
                      <AvatarFallback className="font-black text-xs bg-primary text-white uppercase">
                        {user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-black text-foreground uppercase tracking-tight">
                        {user.fullName}
                      </p>
                      <p className="text-[10px] text-on-surface-tertiary font-bold uppercase tracking-[0.2em]">
                        {user.role}
                      </p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-hairline/50 my-1" />
                <DropdownMenuGroup>
                  <Link href="/admin/settings">
                    <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer px-3 py-3 focus:bg-surface-tinted focus:text-primary-strong transition-colors">
                      <User className="w-4 h-4" />{" "}
                      <span className="font-bold text-xs uppercase tracking-wider">
                        Hồ sơ & Cài đặt
                      </span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-hairline/50 my-1" />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    router.push("/booking");
                  }}
                  className="rounded-xl gap-3 cursor-pointer px-3 py-3 text-red-500 focus:bg-red-50 focus:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />{" "}
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Đăng xuất an toàn
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary-strong text-white rounded-2xl px-6 h-11 text-xs font-black uppercase tracking-widest shadow-md">
                    <LogIn className="w-4 h-4 mr-2" /> Đăng nhập
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[420px] rounded-[32px] border border-slate-200/80 shadow-2xl p-8 bg-white text-slate-900 overflow-hidden">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-strong rounded-2xl flex items-center justify-center shadow-lg text-white mb-3">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-blue-950">
                    MINTCARE PORTAL
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Xác thực hệ thống an toàn
                  </p>
                </div>

                <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
                  <button
                    onClick={() => {
                      setAuthTab("login");
                      setErrorMsg("");
                    }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${authTab === "login" ? "bg-white text-primary shadow-xs" : "text-slate-400"}`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => {
                      setAuthTab("register");
                      setErrorMsg("");
                    }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${authTab === "register" ? "bg-white text-primary shadow-xs" : "text-slate-400"}`}
                  >
                    Đăng ký
                  </button>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] font-bold text-red-600">
                    {errorMsg}
                  </div>
                )}

                {authTab === "login" ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Email
                      </Label>
                      <Input
                        type="email"
                        required
                        placeholder="admin@mintcare.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Mật khẩu
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPass ? "text" : "password"}
                          required
                          placeholder="••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="rounded-xl pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-strong text-white rounded-xl py-5 text-xs font-black uppercase tracking-widest mt-2"
                    >
                      Đăng nhập
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Họ và tên
                      </Label>
                      <Input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Email
                      </Label>
                      <Input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Số điện thoại
                      </Label>
                      <Input
                        type="tel"
                        placeholder="0901234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Mật khẩu
                      </Label>
                      <Input
                        type="password"
                        required
                        placeholder="Ít nhất 6 ký tự"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-strong text-white rounded-xl py-5 text-xs font-black uppercase tracking-widest mt-2"
                    >
                      Đăng ký tài khoản
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
}
