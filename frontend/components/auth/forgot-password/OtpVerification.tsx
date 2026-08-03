"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, ShieldCheck, CheckCircle2 } from "lucide-react";

interface OtpVerificationProps {
  maskedContact: string;
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  countdown: number;
  isTimerActive: boolean;
  onResend: () => void;
  onVerify: () => void;
  onBack: () => void;
}

export function OtpVerification({
  maskedContact,
  otp,
  setOtp,
  countdown,
  isTimerActive,
  onResend,
  onVerify,
  onBack,
}: OtpVerificationProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto focus first input on render
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const lastChar = cleaned[cleaned.length - 1];
    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);

    // Auto next input focus
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      onVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || "";
      }
      setOtp(newOtp);
      const nextFocusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocusIndex]?.focus();
    }
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại</span>
      </button>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center border border-blue-100 dark:border-blue-800">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Nhập mã xác thực
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Mã xác thực đã được gửi đến
        </p>
        <div className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/60 rounded-full">
          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
            {maskedContact}
          </span>
        </div>
      </div>

      {/* 6 OTP Inputs */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-extrabold rounded-2xl border-2 transition-all outline-none ${
              digit
                ? "border-blue-600 bg-blue-50/50 text-blue-950 dark:bg-blue-950/40 dark:text-blue-200 shadow-sm shadow-blue-500/10"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-600 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30"
            }`}
          />
        ))}
      </div>

      {/* Countdown and Resend */}
      <div className="text-center pt-1">
        {isTimerActive && countdown > 0 ? (
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Gửi lại mã sau:{" "}
            <span className="font-extrabold text-blue-600 dark:text-blue-400">
              {countdown}s
            </span>
          </p>
        ) : (
          <button
            type="button"
            onClick={onResend}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Gửi lại mã</span>
          </button>
        )}
      </div>

      {/* Demo Tip Notice */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          💡 Mã xác thực Demo: <strong className="text-blue-600 dark:text-blue-400 font-bold">123456</strong>
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={onVerify}
        className={`w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
          isComplete
            ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-blue-600/25 cursor-pointer"
            : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none cursor-pointer hover:bg-slate-300"
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>Xác nhận</span>
      </button>
    </motion.div>
  );
}
