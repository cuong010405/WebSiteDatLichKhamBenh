"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useForgotPassword } from "./useForgotPassword";
import { SelectMethod } from "./SelectMethod";
import { OtpVerification } from "./OtpVerification";
import { ResetPassword } from "./ResetPassword";
import { SuccessReset } from "./SuccessReset";
import { ToastContainer } from "./ToastContainer";

interface ForgotPasswordFlowProps {
  onBackToLogin: () => void;
  customAddToast?: (msg: string, type: "success" | "error" | "info") => void;
}

export function ForgotPasswordFlow({
  onBackToLogin,
  customAddToast,
}: ForgotPasswordFlowProps) {
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
    isSubmittingReset,
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
  } = useForgotPassword(true, customAddToast);

  const handleReturnToLogin = () => {
    resetFlow();
    onBackToLogin();
  };

  return (
    <div className="p-6 sm:p-8 w-full relative">
      {/* Floating Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

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
            isSubmitting={isSubmittingReset}
          />
        )}

        {step === "success" && (
          <SuccessReset key="success" onBackToLogin={handleReturnToLogin} />
        )}
      </AnimatePresence>

      {/* Back to Login link at bottom if not in success step */}
      {step !== "success" && (
        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
          <button
            type="button"
            onClick={handleReturnToLogin}
            className="text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
          >
            Quay lại Đăng nhập
          </button>
        </div>
      )}
    </div>
  );
}
