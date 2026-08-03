"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Stethoscope } from "lucide-react";
import { useForgotPassword } from "./useForgotPassword";
import { SelectMethod } from "./SelectMethod";
import { OtpVerification } from "./OtpVerification";
import { ResetPassword } from "./ResetPassword";
import { SuccessReset } from "./SuccessReset";
import { ToastContainer } from "./ToastContainer";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessBackToLogin?: () => void;
  customAddToast?: (msg: string, type: "success" | "error" | "info") => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  onSuccessBackToLogin,
  customAddToast,
}: ForgotPasswordModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const {
    step,
    method,
    setMethod,
    contactValue,
    setContactValue,
    maskedContact,
    otp,
    setOtp,
    countdown,
    isTimerActive,
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
    isContactInputValid,
    toasts,
    removeToast,
    handleSelectMethodSubmit,
    handleResendOtp,
    handleVerifyOtp,
    handleResetPasswordSubmit,
    resetFlow,
  } = useForgotPassword(isOpen, customAddToast);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap / Focus modal on open
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  const handleBackToLogin = () => {
    resetFlow();
    onClose();
    if (onSuccessBackToLogin) {
      onSuccessBackToLogin();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Floating Toasts */}
          <ToastContainer toasts={toasts} onRemove={removeToast} />

          {/* Backdrop with animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Modal Đổi Mật Khẩu qua OTP"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            className="bg-white dark:bg-slate-950 rounded-[32px] shadow-2xl border border-blue-100 dark:border-slate-800 w-full max-w-md overflow-hidden relative z-10 p-6 sm:p-8 outline-none"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 p-2 rounded-full transition-all z-20"
              aria-label="Đóng dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step Body */}
            <AnimatePresence mode="wait">
              {step === "select_method" && (
                <SelectMethod
                  key="select_method"
                  method={method}
                  setMethod={setMethod}
                  contactValue={contactValue}
                  setContactValue={setContactValue}
                  onSubmit={handleSelectMethodSubmit}
                  isContactInputValid={isContactInputValid}
                />
              )}

              {step === "otp_verification" && (
                <OtpVerification
                  key="otp_verification"
                  maskedContact={maskedContact}
                  otp={otp}
                  setOtp={setOtp}
                  countdown={countdown}
                  isTimerActive={isTimerActive}
                  onResend={handleResendOtp}
                  onVerify={handleVerifyOtp}
                  onBack={() => resetFlow()}
                />
              )}

              {step === "reset_password" && (
                <ResetPassword
                  key="reset_password"
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  showNewPassword={showNewPassword}
                  setShowNewPassword={setShowNewPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  passwordCriteria={passwordCriteria}
                  passwordStrength={passwordStrength}
                  passedCriteriaCount={passedCriteriaCount}
                  onSubmit={handleResetPasswordSubmit}
                />
              )}

              {step === "success" && (
                <SuccessReset key="success" onBackToLogin={handleBackToLogin} />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
