"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Check, X, ShieldAlert, KeyRound } from "lucide-react";
import { PasswordCriteria, PasswordStrength } from "./types";

interface ResetPasswordProps {
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showNewPassword: boolean;
  setShowNewPassword: (val: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (val: boolean) => void;
  passwordCriteria: PasswordCriteria;
  passwordStrength: PasswordStrength;
  passedCriteriaCount: number;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function ResetPassword({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordCriteria,
  passwordStrength,
  passedCriteriaCount,
  onSubmit,
  isSubmitting = false,
}: ResetPasswordProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const getStrengthLabel = () => {
    if (!newPassword) return "Chưa nhập";
    if (passwordStrength === "weak") return "Yếu";
    if (passwordStrength === "medium") return "Trung bình";
    return "Mạnh";
  };

  const getStrengthColor = () => {
    if (!newPassword) return "bg-slate-200 dark:bg-slate-800 text-slate-400";
    if (passwordStrength === "weak") return "bg-rose-500 text-rose-500";
    if (passwordStrength === "medium") return "bg-amber-500 text-amber-500";
    return "bg-emerald-500 text-emerald-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center border border-blue-100 dark:border-blue-800">
          <KeyRound className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Đặt mật khẩu mới
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Tạo mật khẩu an toàn có tính bảo mật cao.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Mật khẩu mới
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showNewPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-11 pr-11 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-11 pr-11 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Strength Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-400">Độ mạnh mật khẩu:</span>
            <span className={`font-black ${getStrengthColor().split(" ")[1]}`}>
              {getStrengthLabel()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                newPassword && passedCriteriaCount >= 1 ? getStrengthColor().split(" ")[0] : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                newPassword && passedCriteriaCount >= 3 ? getStrengthColor().split(" ")[0] : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                newPassword && passedCriteriaCount >= 5 ? getStrengthColor().split(" ")[0] : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
          </div>
        </div>

        {/* Realtime Security Checklist */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Yêu cầu mật khẩu:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <CheckItem satisfied={passwordCriteria.hasMinLength} label="Ít nhất 8 ký tự" />
            <CheckItem satisfied={passwordCriteria.hasUppercase} label="Có chữ hoa (A-Z)" />
            <CheckItem satisfied={passwordCriteria.hasLowercase} label="Có chữ thường (a-z)" />
            <CheckItem satisfied={passwordCriteria.hasNumber} label="Có số (0-9)" />
            <CheckItem satisfied={passwordCriteria.hasSpecialChar} label="Có ký tự đặc biệt" />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>Đang lưu...</span>
            </>
          ) : (
            <span>Đổi mật khẩu</span>
          )}
        </button>
      </form>
    </motion.div>
  );
}

function CheckItem({ satisfied, label }: { satisfied: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          satisfied ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
        }`}
      >
        <Check className="w-2.5 h-2.5 stroke-[3]" />
      </div>
      <span
        className={`font-medium transition-colors ${
          satisfied ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
