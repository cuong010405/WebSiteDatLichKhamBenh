"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, LogIn } from "lucide-react";

interface SuccessResetProps {
  onBackToLogin: () => void;
}

export function SuccessReset({ onBackToLogin }: SuccessResetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="text-center space-y-6 py-4"
    >
      {/* Animated Green Check Icon */}
      <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
        {/* Pulsing ring background */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-emerald-500/20"
        />
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 z-10"
        >
          <Check className="w-9 h-9 stroke-[3]" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Đổi mật khẩu thành công
        </h3>
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-2xl max-w-xs mx-auto">
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            Đây là phiên bản Demo.
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
            Mật khẩu chưa được thay đổi trên hệ thống.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onBackToLogin}
        className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
      >
        <LogIn className="w-4 h-4" />
        <span>Quay lại đăng nhập</span>
      </button>
    </motion.div>
  );
}
