import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ForgotPasswordFlow } from "./forgot-password"

export function LoginDialog() {
  const [showForgotPassword, setShowForgotPassword] = React.useState(false)

  return (
    <Dialog onOpenChange={(open) => { if (!open) setShowForgotPassword(false); }}>
      <DialogTrigger 
        render={
          <Button className="rounded-full bg-action text-white hover:bg-action/90 px-6">
            Đăng nhập
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-hairline shadow-none p-0 overflow-hidden">
        {showForgotPassword ? (
          <ForgotPasswordFlow
            onBackToLogin={() => setShowForgotPassword(false)}
          />
        ) : (
          <div className="p-6">
            <DialogHeader>
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <DialogTitle className="text-2xl font-semibold tight-tracking">Chào mừng trở lại</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                Nhập thông tin đăng nhập để truy cập trung tâm điều hành chăm sóc.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">Địa chỉ Email</Label>
                <Input id="email" type="email" placeholder="alex.miller@mintcare.com" className="rounded-xl border-hairline focus:ring-primary focus:border-primary h-12" />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-primary-strong hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <Input id="password" type="password" className="rounded-xl border-hairline focus:ring-primary focus:border-primary h-12" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-action text-white rounded-full py-6 h-12 text-base font-semibold hover:bg-action/90">
                Đăng nhập vào Dashboard
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


