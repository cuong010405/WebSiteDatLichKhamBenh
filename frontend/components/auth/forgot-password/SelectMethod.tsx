"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Check, ArrowRight } from "lucide-react";
import { ResetMethod } from "./types";

interface SelectMethodProps {
  method: ResetMethod;
  setMethod: (method: ResetMethod) => void;
  contactValue: string;
  setContactValue: (val: string) => void;
  onSubmit: () => void;
  isContactInputValid: boolean;
}

export function SelectMethod({
  method,
  setMethod,
  contactValue,
  setContactValue,
  onSubmit,
  isContactInputValid,
}: SelectMethodProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isContactInputValid) {
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Step Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Đặt lại mật khẩu
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
          Chọn phương thức nhận mã xác thực để đổi mật khẩu.
        </p>
      </div>

      {/* 2 Method Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Email Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setMethod("email");
          }}
          className={`cursor-pointer relative p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-3 ${
            method === "email"
              ? "border-blue-600 bg-blue-50/90 dark:bg-blue-950/40 shadow-lg shadow-blue-500/10"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                method === "email"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Mail className="w-5 h-5" />
            </div>
            {method === "email" && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 dark:text-white block">
              Email
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Nhận mã xác thực qua Email.
            </span>
          </div>
        </motion.div>

        {/* Phone Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setMethod("phone");
          }}
          className={`cursor-pointer relative p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-3 ${
            method === "phone"
              ? "border-blue-600 bg-blue-50/90 dark:bg-blue-950/40 shadow-lg shadow-blue-500/10"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                method === "phone"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Phone className="w-5 h-5" />
            </div>
            {method === "phone" && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 dark:text-white block">
              Số điện thoại
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Nhận mã xác thực qua SMS.
            </span>
          </div>
        </motion.div>
      </div>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {method === "email" ? "Địa chỉ Email" : "Số điện thoại"}
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {method === "email" ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            </div>
            <input
              type={method === "email" ? "email" : "tel"}
              autoFocus
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={
                method === "email" ? "evelyn.green@gmail.com" : "0912345678"
              }
              className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-11 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isContactInputValid}
          className={`w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
            isContactInputValid
              ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-blue-600/25 cursor-pointer"
              : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed"
          }`}
        >
          <span>Tiếp tục</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}
