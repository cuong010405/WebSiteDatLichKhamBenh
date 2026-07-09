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
  UserPlus
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

interface AccountUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "admin" | "customer";
  createdAt: string;
}

export default function AccountsPage() {
  const { show, hide } = useLoading();
  const [users, setUsers] = React.useState<AccountUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("Tất cả");

  // Form states
  const [isOpenAdd, setIsOpenAdd] = React.useState(false);
  const [isOpenEdit, setIsOpenEdit] = React.useState(false);
  const [isOpenDelete, setIsOpenDelete] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<AccountUser | null>(null);

  // Input states
  const [email, setEmail] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState<"admin" | "customer">("customer");
  const [password, setPassword] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const loadUsers = () => {
    setLoading(true);
    authFetch(`${API_URL}/users`)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải tài khoản:", err))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    show("Đang thêm tài khoản...")
    try {
      const res = await authFetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, phone, role }),
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
    show("Đang cập nhật...")
    try {
      const res = await authFetch(`${API_URL}/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, phone, role, password: password || undefined }),
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
    show("Đang xóa tài khoản...")
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

  const resetForm = () => {
    setEmail("");
    setFullName("");
    setPhone("");
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
    setRole(u.role);
    setPassword("");
    setIsOpenEdit(true);
  };

  const openDeleteDialog = (u: AccountUser) => {
    setSelectedUser(u);
    setIsOpenDelete(true);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));
    
    const matchesRole = roleFilter === "Tất cả" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
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
                    <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Địa chỉ Email</Label>
                    <Input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Số điện thoại</Label>
                    <Input type="tel" placeholder="0901234567" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Vai trò</Label>
                    <Select value={role} onValueChange={(val: any) => setRole(val)}>
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                        <SelectItem value="customer" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">Khách hàng</SelectItem>
                        <SelectItem value="admin" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Mật khẩu ban đầu</Label>
                <div className="relative">
                  <Input type={showPass ? "text" : "password"} required placeholder="Mật khẩu ít nhất 6 ký tự" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none pl-3 pr-10 text-slate-800 transition-all" />
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
            {["Tất cả", "admin", "customer"].map((roleVal) => (
              <button
                key={roleVal}
                onClick={() => setRoleFilter(roleVal)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200",
                  roleFilter === roleVal
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {roleVal === "Tất cả" ? "Tất cả" : roleVal === "admin" ? "Admin" : "Khách hàng"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white border border-hairline rounded-[48px] overflow-hidden shadow-2xl shadow-black/[0.04] relative">
        <div className="h-1.5 w-full bg-linear-to-r from-primary/10 via-primary to-primary/10 opacity-50" />
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang đồng bộ dữ liệu hệ thống...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-secondary/40 border-b border-hairline">
                  <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em]">Họ và tên</TableHead>
                  <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em]">Thông tin liên lạc</TableHead>
                  <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em]">Vai trò</TableHead>
                  <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em]">Ngày tạo</TableHead>
                  <TableHead className="px-8 py-8 text-[11px] font-black text-on-surface-tertiary uppercase tracking-[0.25em] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-hairline/40">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="px-8 py-6 text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center font-bold text-primary">
                            {u.fullName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-950 text-sm leading-none">{u.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {u.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-left">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 opacity-60" /> {u.email}</p>
                          <p className="text-xs text-slate-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 opacity-60" /> {u.phone || "--"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-left">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                          u.role === "admin"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : "bg-blue-50 text-blue-700 border-blue-100"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", u.role === "admin" ? "bg-purple-600" : "bg-blue-600")} />
                          {u.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                        </span>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-left text-xs font-mono text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => openEditDialog(u)} className="h-9 w-9 rounded-xl border-hairline bg-white hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => openDeleteDialog(u)} className="h-9 w-9 rounded-xl border-hairline bg-white hover:bg-red-50 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
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
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Địa chỉ Email</Label>
                  <Input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Số điện thoại</Label>
                  <Input type="tel" placeholder="0901234567" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 h-11 bg-white font-bold text-xs shadow-none px-3 text-slate-800 transition-all" />
                </div>

                <div className="space-y-2 text-left">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Vai trò</Label>
                  <Select value={role} onValueChange={(val: any) => setRole(val)}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 !h-11 bg-white font-bold text-xs shadow-none text-slate-800">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white text-slate-800">
                      <SelectItem value="customer" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">Khách hàng</SelectItem>
                      <SelectItem value="admin" className="rounded-lg py-2.5 font-bold text-xs focus:bg-slate-50">Quản trị viên</SelectItem>
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
    </div>
  );
}
