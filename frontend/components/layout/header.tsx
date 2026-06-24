"use client"

import { Search, Bell, Command, Settings, User, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import Link from "next/link"

export function Header() {
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
             <span className="text-[10px] font-bold text-on-surface-tertiary uppercase">K</span>
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
          <span className="text-[11px] font-black text-primary-strong uppercase tracking-wider">Hệ thống ổn định</span>
        </motion.div>

        <div className="flex items-center gap-2">
          <button className="relative w-11 h-11 rounded-2xl hover:bg-surface-secondary flex items-center justify-center transition-colors group">
            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-white shadow-sm"></span>
          </button>
          
          <div className="h-6 w-px bg-hairline mx-3"></div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 p-1 rounded-2xl hover:bg-surface-secondary transition-all outline-hidden group cursor-pointer">
              <div className="relative">
                <Avatar className="w-9 h-9 border border-hairline rounded-xl shadow-xs transition-transform group-hover:scale-105">
                  <AvatarImage src="https://i.pravatar.cc/150?u=admin" className="object-cover" />
                  <AvatarFallback className="font-black text-xs bg-primary text-white uppercase">AM</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-sm" />
              </div>
              <div className="hidden lg:block text-left pr-2">
                 <p className="text-[11px] font-black text-foreground leading-none uppercase tracking-tight">Alex Miller</p>
                 <p className="text-[9px] text-on-surface-tertiary font-bold uppercase tracking-[0.2em] mt-1">Admin</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 rounded-[24px] shadow-2xl border-hairline mt-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-3 mb-1">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 rounded-xl border border-hairline">
                    <AvatarImage src="https://i.pravatar.cc/150?u=admin" className="object-cover" />
                    <AvatarFallback className="font-black text-xs bg-primary text-white uppercase">AM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-black text-foreground uppercase tracking-tight">Alex Miller</p>
                    <p className="text-[10px] text-on-surface-tertiary font-bold uppercase tracking-[0.2em]">Admin</p>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-hairline/50 my-1" />
              <DropdownMenuGroup>
                <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer px-3 py-3 focus:bg-surface-tinted focus:text-primary-strong transition-colors">
                  <User className="w-4 h-4" /> <span className="font-bold text-xs uppercase tracking-wider">Hồ sơ chuyên gia</span>
                </DropdownMenuItem>
                <Link href="/settings">
                  <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer px-3 py-3 focus:bg-surface-tinted focus:text-primary-strong transition-colors">
                    <Settings className="w-4 h-4" /> <span className="font-bold text-xs uppercase tracking-wider">Cấu hình hệ thống</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-hairline/50 my-1" />
              <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer px-3 py-3 text-red-500 focus:bg-red-50 focus:text-red-600 transition-colors">
                <LogOut className="w-4 h-4" /> <span className="font-bold text-xs uppercase tracking-wider">Đăng xuất an toàn</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
