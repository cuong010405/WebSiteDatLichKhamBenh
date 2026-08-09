"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Trash2, 
  Pencil, 
  Plus, 
  Mail, 
  Phone, 
  User,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  Check,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL, authFetch } from "@/lib/api";
import { useLoading } from "@/lib/loading-context";
import { cn } from "@/lib/utils";
import { AdminRoleGuard } from "@/components/auth/admin-role-guard";
import { Pagination } from "@/components/ui/pagination";

interface AccountUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "admin" | "vltl" | "dieu_duong" | "customer" | "chuyen_gia";
  age?: number | null;
  gender?: string | null;
  createdAt: string;
}

export default function AccountsPage() {
  const { show, hide } = useLoading();
  const [users, setUsers] = React.useState<AccountUser[]>([]);
  const [staffList, setStaffList] = React.useState<{ id: string; name: string; role: string; email: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("Tất cả");

  // Form states
  const [isOpenAdd, setIsOpenAdd] = React.useState(false);
  const [isOpenEdit, setIsOpenEdit] = React.useState(false);
  const [isOpenDelete, setIsOpenDelete] = React.useState(false);
  const [isOpenLink, setIsOpenLink] = React.useState(false);
  const [linkStaffId, setLinkStaffId] = React.useState("");
  const [linkMsg, setLinkMsg] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState<AccountUser | null>(null);

  // Input states
  const [email, setEmail] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [ageStr, setAgeStr] = React.useState("");
  const [gender, setGender] = React.useState("Nam");
  const [role, setRole] = React.useState<"admin" | "vltl" | "dieu_duong" | "customer" | "chuyen_gia">("customer");
  const [password, setPassword] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  // Password Criteria for Checklist
  const passwordCriteria = React.useMemo(() => {
    return {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-\\\/\[\]]/.test(password),
    };
  }, [password]);

  // Derived error string from criteria
  const passwordError = React.useMemo(() => {
    if (!password) return "";
    if (!passwordCriteria.hasMinLength) return "Mật khẩu phải có ít nhất 8 ký tự.";
    if (!passwordCriteria.hasUppercase) return "Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z).";
    if (!passwordCriteria.hasLowercase) return "Mật khẩu phải chứa ít nhất 1 chữ thường (a-z).";
    if (!passwordCriteria.hasNumber) return "Mật khẩu phải chứa số (0-9).";
    if (!passwordCriteria.hasSpecialChar) return "Mật khẩu phải chứa ký tự đặc biệt (!@#$...).";
    return "";
  }, [passwordCriteria, password]);

  const loadUsers = () => {
    setLoading(true);
    show("ĐANG TẢI DỮ LIỆU TÀI KHOẢN...");
    authFetch(`${API_URL}/users`)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải tài khoản:", err))
      .finally(() => {
        setLoading(false);
        hide();
      });
  };

  React.useEffect(() => {
    loadUsers();
    // Load staff list for linking
    fetch(`${API_URL}/staff`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStaffList(data.map((s: any) => ({ id: s.id, name: s.name, role: s.role, email: s.email || "" })));
        }
      })
      .catch(() => {});
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (passwordError) {
      setErrorMsg(passwordError);
      return;
    }
    show("ĐANG THÊM TÀI KHOẢN...");
    try {
      const res = await authFetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          phone,
          role,
          age: parseInt(ageStr) || null,
          gender: gender || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Thêm tài khoản thất bại");

      setUsers((prev) => [data, ...prev]);
      setIsOpenAdd(false);
      resetForm();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      hide();
    }
  };

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMsg("");
    if (password && passwordError) {
      setErrorMsg(passwordError);
      return;
    }
    show("ĐANG CẬP NHẬT TÀI KHOẢN...");
    try {
      const res = await authFetch(`${API_URL}/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName,
          phone,
          role,
          password: password || undefined,
          age: parseInt(ageStr) || null,
          gender: gender || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cập nhật thất bại");

      setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)));
      setIsOpenEdit(false);
      resetForm();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      hide();
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedUser) return;
    show("ĐANG XÓA TÀI KHOẢN...");
    try {
      const res = await authFetch(`${API_URL}/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setIsOpenDelete(false);
    } catch (err: any) {
      console.error(err);
    } finally {
      hide();
    }
  };

  const handleLinkStaff = async () => {
    if (!selectedUser || !linkStaffId) return;
    setLinkMsg("");
    show("ĐANG LIÊN KẾT...");
    try {
      const res = await authFetch(`${API_URL}/users/${selectedUser.id}/link-staff`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: linkStaffId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Liên kết thất bại");
      setLinkMsg(data.message || "Liên kết thành công!");
      setTimeout(() => { setIsOpenLink(false); setLinkMsg(""); setLinkStaffId(""); }, 1500);
    } catch (err: any) {
      setLinkMsg("❌ " + err.message);
    } finally {
      hide();
    }
  };

  const openLinkDialog = (u: AccountUser) => {
    setSelectedUser(u);
    setLinkMsg("");
    setIsOpenLink(true);

    const checkAndAutoSelect = (list: { id: string; name: string; role: string; email: string }[]) => {
      const uEmail = u.email?.toLowerCase().trim();
      const uName = u.fullName?.toLowerCase().trim();
      const matched = list.find((s) => 
        (uEmail && s.email && s.email.toLowerCase().trim() === uEmail) || 
        (uName && s.name && s.name.toLowerCase().trim() === uName)
      );

      if (matched) {
        setLinkStaffId(matched.id);
        setLinkMsg(`✅ Đã liên kết với hồ sơ: ${matched.name} (${matched.role})`);
      } else {
        setLinkStaffId("");
      }
    };

    fetch(`${API_URL}/staff`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const list = data.map((s: any) => ({ id: s.id, name: s.name, role: s.role, email: s.email || "" }));
          setStaffList(list);
          checkAndAutoSelect(list);
        }
      })
      .catch(() => {
        checkAndAutoSelect(staffList);
      });
  };

  const resetForm = () => {
    setEmail("");
    setFullName("");
    setPhone("");
    setAgeStr("");
    setGender("Nam");
    setRole("customer");
    setPassword("");
    setErrorMsg("");
    setShowPass(false);
  };

  const openEditDialog = (u: AccountUser) => {
    setSelectedUser(u);
    setEmail(u.email);
    setFullName(u.fullName);
    setPhone(u.phone || "");
    setAgeStr(u.age ? String(u.age) : "");
    setGender(u.gender || "Nam");
    setRole(u.role);
    setPassword("");
    setIsOpenEdit(true);
  };

  const openDeleteDialog = (u: AccountUser) => {
    setSelectedUser(u);
    setIsOpenDelete(true);
  };

  const [accountPage, setAccountPage] = React.useState(1);
  const USERS_PER_PAGE = 4;

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));
    
    const matchesRole = roleFilter === "Tất cả" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  React.useEffect(() => {
    setAccountPage(1);
  }, [searchQuery, roleFilter]);

  const totalAccountPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = React.useMemo(() => {
    const start = (accountPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, accountPage]);

  return (
    <AdminRoleGuard>
      <div className="p-10 max-w-7xl mx-auto w-full space-y-16 pb-32">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-surface-tinted px-3 py-1.5 rounded-full border border-primary/10 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="eyebrow text-[10px] font-black uppercase tracking-widest text-primary-strong">Hệ thống phân quyền</span>
            </div>
            <div className="w-px h-4 bg-hairline" />
            <span className="text-[10px] font-black text-on-surface-tertiary uppercase tracking-widest">{users.length} Tài khoản</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tight-tracking text-foreground leading-[1.1] uppercase text-left">Quản lý <br />Tài khoản</h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-2xl font-medium leading-relaxed antialiased text-left">
            Quản lý tài khoản khách hàng và phân quyền quản trị viên hệ thống. Đảm bảo an toàn thông tin và bảo mật dữ liệu y tế.
          </p>
        </motion.div>
        
        {/* Nút thêm tài khoản */}
        <Dialog open={isOpenAdd} onOpenChange={(val) => { setIsOpenAdd(val); if(!val) resetForm(); }}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary-strong text-white rounded-[24px] px-8 h-16 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-105 active:scale-95 transition-all">
              <Plus className="w-5 h-5 mr-2" /> Thêm tài khoản
            </Button>
          } />
          <DialogContent className="sm:max-w-[700px] rounded-[32px] border border-slate-200 bg-white p-8 text-slate-900">
            <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-slate-100 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-white flex items-center justify-center shadow-lg">
                <UserPlus className="w-6 h-6" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-lg font-black uppercase tracking-tight text-blue-950">Tạo tài khoản mới</DialogTitle>
                <DialogDescription className="text-slate-400 text-xs font-semibold">Tạo tài khoản phân quyền truy cập hệ thống.</DialogDescription>
              </div>
            </DialogHeader>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] font-bold text-red-600">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddAccount} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Họ và tên</Label>
                    <Input type="text" required placeholder="VD: Nguyễn Văn A" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Gmail</Label>
                    <Input type="email" required placeholder="ten@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>

                  {/* Password Requirements Checklist filling empty space */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-1.5 text-left mt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Yêu cầu mật khẩu:
                    </span>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${passwordCriteria.hasMinLength ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className={`text-[11px] font-medium transition-colors ${passwordCriteria.hasMinLength ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                          Ít nhất 8 ký tự
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${passwordCriteria.hasUppercase ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className={`text-[11px] font-medium transition-colors ${passwordCriteria.hasUppercase ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                          Có chữ hoa (A-Z)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${passwordCriteria.hasLowercase ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className={`text-[11px] font-medium transition-colors ${passwordCriteria.hasLowercase ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                          Có chữ thường (a-z)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${passwordCriteria.hasNumber ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className={`text-[11px] font-medium transition-colors ${passwordCriteria.hasNumber ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                          Có số (0-9)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 col-span-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${passwordCriteria.hasSpecialChar ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className={`text-[11px] font-medium transition-colors ${passwordCriteria.hasSpecialChar ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                          Có ký tự đặc biệt
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Số điện thoại</Label>
                    <Input type="tel" placeholder="0901234567" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2 text-left">
                      <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tuổi</Label>
                      <Input type="number" placeholder="VD: 35" value={ageStr} onChange={(e) => setAgeStr(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                    </div>

                    <div className="space-y-2 text-left">
                      <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Giới tính</Label>
                      <div className="relative">
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs text-slate-800 px-3 pr-8 appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer hover:border-slate-300"
                        >
                          <option value="Nam">👨 Nam</option>
                          <option value="Nữ">👩 Nữ</option>
                          <option value="Khác">🧑 Khác</option>
                        </select>
                        <svg className="w-3.5 h-3.5 text-blue-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Vai trò</Label>
                    <Select value={role} onValueChange={(val: any) => setRole(val)}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                        <SelectItem value="customer" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">👤 Khách hàng</SelectItem>
                        <SelectItem value="vltl" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">🦴 Vật lý trị liệu</SelectItem>
                        <SelectItem value="dieu_duong" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">💉 Điều dưỡng</SelectItem>
                        <SelectItem value="admin" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">🛡️ Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mật khẩu ban đầu</Label>
                <div className="relative">
                  <Input type={showPass ? "text" : "password"} required placeholder="Mật khẩu ít nhất 8 ký tự" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none pl-3 pr-10 text-slate-800 transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white">
                <Button type="button" variant="outline" onClick={() => setIsOpenAdd(false)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">
                  Hủy bỏ
                </Button>
                <Button type="submit" className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary-strong text-white transition-all shadow-md">
                  Tạo tài khoản
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-tertiary group-focus-within:text-primary transition-all duration-300" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tài khoản theo họ tên, email hoặc SĐT..." 
            className="pl-14 h-16 rounded-[24px] bg-white border-hairline focus:ring-8 focus:ring-primary/5 transition-all text-base font-bold shadow-xl shadow-black/[0.02] border-b-2 border-b-hairline placeholder:text-on-surface-tertiary"
          />
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex bg-slate-100 rounded-[20px] p-1 border border-hairline/60">
            {["Tất cả", "admin", "vltl", "dieu_duong", "customer"].map((roleVal) => (
              <button
                key={roleVal}
                onClick={() => setRoleFilter(roleVal)}
                className={cn(
                  "px-3.5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200",
                  roleFilter === roleVal
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {roleVal === "Tất cả" ? "Tất cả" : roleVal === "admin" ? "Admin" : roleVal === "vltl" ? "Vật lý trị liệu" : roleVal === "dieu_duong" ? "Điều dưỡng" : "Khách hàng"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white border border-hairline rounded-[48px] overflow-hidden shadow-2xl shadow-black/[0.04] relative">
        <div className="h-1.5 w-full bg-linear-to-r from-primary/10 via-primary to-primary/10 opacity-50" />
        
        <div className="w-full">
          {loading && users.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang đồng bộ dữ liệu hệ thống...</p>
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-surface-secondary/40 border-b border-hairline">
                  <TableHead className="px-5 py-5 text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">Họ và tên</TableHead>
                  <TableHead className="px-5 py-5 text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">Thông tin liên lạc</TableHead>
                  <TableHead className="px-5 py-5 text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">Vai trò</TableHead>
                  <TableHead className="px-5 py-5 text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em]">Ngày tạo</TableHead>
                  <TableHead className="px-5 py-5 text-[10px] font-black text-on-surface-tertiary uppercase tracking-[0.2em] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-hairline/40">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u) => (
                    <TableRow key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="px-5 py-4 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-surface-secondary flex items-center justify-center font-bold text-primary shrink-0 text-xs">
                            {u.fullName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-950 text-xs leading-none truncate">{u.fullName}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {(u.gender || u.age) && (
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                                  {[u.gender?.toUpperCase(), u.age ? `${u.age} TUỔI` : null].filter(Boolean).join(" • ")}
                                </span>
                              )}
                              <span className="text-[9px] text-slate-400 font-mono" title={u.id}>
                                ID: {u.id.length > 8 ? `${u.id.slice(0, 8)}...` : u.id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-left">
                        <div className="space-y-0.5">
                          <p className="text-xs text-slate-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 opacity-60 shrink-0" /> <span className="truncate max-w-[200px]">{u.email}</span></p>
                          <p className="text-xs text-slate-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 opacity-60 shrink-0" /> {u.phone || "--"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-left">
                        {(() => {
                          const linked = staffList.find((s) =>
                            (u.email && s.email && s.email.toLowerCase().trim() === u.email.toLowerCase().trim()) ||
                            (u.fullName && s.name && s.name.toLowerCase().trim() === u.fullName.toLowerCase().trim())
                          );
                          return (
                            <div className="space-y-1">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border whitespace-nowrap",
                                u.role === "admin"
                                  ? "bg-purple-50 text-purple-700 border-purple-100"
                                  : u.role === "vltl"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : u.role === "dieu_duong"
                                      ? "bg-teal-50 text-teal-700 border-teal-100"
                                      : u.role === "chuyen_gia"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                        : "bg-blue-50 text-blue-700 border-blue-100"
                              )}>
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full shrink-0",
                                  u.role === "admin" ? "bg-purple-600" : u.role === "vltl" || u.role === "chuyen_gia" ? "bg-emerald-600" : u.role === "dieu_duong" ? "bg-teal-600" : "bg-blue-600"
                                )} />
                                {u.role === "admin" ? "Quản trị viên" : u.role === "vltl" ? "Vật lý trị liệu" : u.role === "dieu_duong" ? "Điều dưỡng" : u.role === "chuyen_gia" ? "Chuyên gia" : "Khách hàng"}
                              </span>
                              {linked && (u.role === "dieu_duong" || u.role === "vltl") && (
                                <p className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span>Gán: {linked.name}</span>
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-left text-xs font-mono text-slate-500 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(u.role === "dieu_duong" || u.role === "vltl") && (
                            <Button
                              variant="outline"
                              size="icon"
                              title="Gán nhân viên y tế"
                              onClick={() => openLinkDialog(u)}
                              className="h-8 w-8 rounded-xl border-hairline bg-white hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button variant="outline" size="icon" onClick={() => openEditDialog(u)} className="h-8 w-8 rounded-xl border-hairline bg-white hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => openDeleteDialog(u)} className="h-8 w-8 rounded-xl border-hairline bg-white hover:bg-red-50 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center font-bold text-slate-400 uppercase text-xs tracking-widest">
                      Không tìm thấy tài khoản nào phù hợp
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        {filteredUsers.length > USERS_PER_PAGE && (
          <div className="p-4 border-t border-hairline bg-slate-50/50 flex justify-center">
            <Pagination
              currentPage={accountPage}
              totalPages={totalAccountPages}
              onPageChange={setAccountPage}
            />
          </div>
        )}
      </div>

      {/* Dialog Sửa tài khoản */}
      <Dialog open={isOpenEdit} onOpenChange={(val) => { setIsOpenEdit(val); if(!val) resetForm(); }}>
        <DialogContent className="sm:max-w-[700px] rounded-[32px] border border-slate-200 bg-white p-8 text-slate-900">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-slate-100 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shadow-lg">
              <Pencil className="w-5 h-5" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-lg font-black uppercase tracking-tight text-blue-950">Chỉnh sửa tài khoản</DialogTitle>
              <DialogDescription className="text-slate-400 text-xs font-semibold">Cập nhật thông tin chi tiết của tài khoản.</DialogDescription>
            </div>
          </DialogHeader>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] font-bold text-red-600">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleEditAccount} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Họ và tên</Label>
                  <Input type="text" required placeholder="VD: Nguyễn Văn A" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                </div>

                <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Gmail</Label>
                  <Input type="email" required placeholder="ten@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                </div>

                {/* Password Requirements Checklist filling empty space */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-1.5 text-left mt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Yêu cầu mật khẩu:
                  </span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${passwordCriteria.hasMinLength ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className={`text-[11px] font-medium transition-colors ${passwordCriteria.hasMinLength ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                        Ít nhất 8 ký tự
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${passwordCriteria.hasUppercase ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className={`text-[11px] font-medium transition-colors ${passwordCriteria.hasUppercase ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                        Có chữ hoa (A-Z)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${passwordCriteria.hasLowercase ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className={`text-[11px] font-medium transition-colors ${passwordCriteria.hasLowercase ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                        Có chữ thường (a-z)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${passwordCriteria.hasNumber ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className={`text-[11px] font-medium transition-colors ${passwordCriteria.hasNumber ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                        Có số (0-9)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 col-span-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${passwordCriteria.hasSpecialChar ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className={`text-[11px] font-medium transition-colors ${passwordCriteria.hasSpecialChar ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                        Có ký tự đặc biệt
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Số điện thoại</Label>
                  <Input type="tel" placeholder="0901234567" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tuổi</Label>
                    <Input type="number" placeholder="VD: 35" value={ageStr} onChange={(e) => setAgeStr(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Giới tính</Label>
                    <div className="relative">
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs text-slate-800 px-3 pr-8 appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer hover:border-slate-300"
                      >
                        <option value="Nam">👨 Nam</option>
                        <option value="Nữ">👩 Nữ</option>
                        <option value="Khác">🧑 Khác</option>
                      </select>
                      <svg className="w-3.5 h-3.5 text-blue-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Vai trò</Label>
                  <Select value={role} onValueChange={(val: any) => setRole(val)}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                      <SelectItem value="customer" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">👤 Khách hàng</SelectItem>
                      <SelectItem value="vltl" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">🦴 Vật lý trị liệu</SelectItem>
                      <SelectItem value="dieu_duong" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">💉 Điều dưỡng</SelectItem>
                      <SelectItem value="admin" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">🛡️ Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Đổi mật khẩu mới (Bỏ trống nếu không đổi)</Label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} placeholder="Nhập mật khẩu mới" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none pl-3 pr-10 text-slate-800 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex flex-row justify-end gap-3 bg-white">
              <Button type="button" variant="outline" onClick={() => setIsOpenEdit(false)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">
                Hủy bỏ
              </Button>
              <Button type="submit" className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-500 to-indigo-600 text-white transition-all shadow-md">
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Xóa tài khoản */}
      <Dialog open={isOpenDelete} onOpenChange={setIsOpenDelete}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] border border-slate-200 bg-white p-8 text-slate-900">
          <DialogHeader className="text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-blue-950">Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs font-semibold mt-1">
              Hành động này không thể hoàn tác. Tài khoản của <span className="font-bold text-slate-800">{selectedUser?.fullName}</span> sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsOpenDelete(false)} className="rounded-xl h-11 border-hairline font-bold text-xs uppercase tracking-wider">Hủy bỏ</Button>
            <Button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 font-black text-xs uppercase tracking-wider">Xác nhận xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Gán nhân viên y tế */}
      <Dialog open={isOpenLink} onOpenChange={(v) => { setIsOpenLink(v); if (!v) { setLinkMsg(""); setLinkStaffId(""); } }}>
        <DialogContent className="sm:max-w-[480px] rounded-[28px] border border-slate-200 bg-white p-0 overflow-hidden text-slate-900">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
          <div className="p-7 space-y-5">
            <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg shrink-0">
                <Link2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-sm font-black uppercase tracking-tight text-slate-900 leading-none">Gán hồ sơ nhân viên</DialogTitle>
                <DialogDescription className="text-slate-400 text-[11px] font-semibold mt-1">
                  Tài khoản: <span className="font-bold text-slate-700">{selectedUser?.fullName}</span> ({selectedUser?.email})
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Chọn nhân viên y tế trong hệ thống</label>
              <div className="relative">
                <select
                  value={linkStaffId}
                  onChange={(e) => setLinkStaffId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs text-slate-800 px-3 pr-8 appearance-none outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.role || "Nhân viên"}
                    </option>
                  ))}
                </select>
                <svg className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">Sau khi gán, tài khoản này sẽ thấy đúng bệnh nhân & lịch trực của nhân viên đó.</p>
            </div>

            {linkMsg && (
              <div className={cn(
                "rounded-xl px-4 py-3 text-xs font-bold border",
                linkMsg.startsWith("❌") ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
              )}>
                {linkMsg}
              </div>
            )}

            <DialogFooter className="flex flex-row justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsOpenLink(false)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50">Hủy</Button>
              <Button
                disabled={!linkStaffId}
                onClick={handleLinkStaff}
                className="rounded-xl h-10 px-6 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:opacity-95 disabled:opacity-40"
              >
                <Link2 className="w-3.5 h-3.5 mr-2" /> Xác nhận gán
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AdminRoleGuard>
  );
}
