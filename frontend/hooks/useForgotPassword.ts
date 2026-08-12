import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ResetStep,
  ResetMethod,
  PasswordCriteria,
  PasswordStrength,
  ToastMessage,
} from "@/components/auth/forgot-password/types";
import { API_URL } from "@/lib/api";

export function useForgotPassword(
  isOpen: boolean,
  externalAddToast?: (msg: string, type: "success" | "error" | "info") => void
) {
  const [step, setStep] = useState<ResetStep>("select_method");
  const [method, setMethod] = useState<ResetMethod>("email");
  const [contactValue, setContactValue] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      if (externalAddToast) {
        externalAddToast(message, type);
      }
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    [externalAddToast]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, countdown]);

  // Masked contact display string
  const maskedContact = useMemo(() => {
    if (!contactValue) return method === "email" ? "e****@gmail.com" : "09******88";
    if (method === "email") {
      const parts = contactValue.split("@");
      if (parts.length === 2) {
        const name = parts[0];
        const domain = parts[1];
        const maskedName =
          name.length > 2 ? name[0] + "****" + name[name.length - 1] : name[0] + "****";
        return `${maskedName}@${domain}`;
      }
      return contactValue;
    } else {
      const cleaned = contactValue.replace(/\D/g, "");
      if (cleaned.length >= 7) {
        return `${cleaned.slice(0, 2)}******${cleaned.slice(-2)}`;
      }
      return contactValue;
    }
  }, [contactValue, method]);

  // Validations
  const isEmailValid = useCallback((email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, []);

  const isPhoneValid = useCallback((phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return /^(0[3|5|7|8|9])[0-9]{8}$/.test(cleaned) || /^0[0-9]{9,10}$/.test(cleaned);
  }, []);

  const isContactInputValid = useMemo(() => {
    if (!contactValue.trim()) return false;
    return method === "email" ? isEmailValid(contactValue) : isPhoneValid(contactValue);
  }, [contactValue, method, isEmailValid, isPhoneValid]);

  // Password criteria check
  const passwordCriteria: PasswordCriteria = useMemo(() => {
    return {
      hasMinLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-\\\/\[\]]/.test(newPassword),
    };
  }, [newPassword]);

  const passedCriteriaCount = useMemo(() => {
    return Object.values(passwordCriteria).filter(Boolean).length;
  }, [passwordCriteria]);

  const passwordStrength: PasswordStrength = useMemo(() => {
    if (passedCriteriaCount <= 2) return "weak";
    if (passedCriteriaCount <= 4) return "medium";
    return "strong";
  }, [passedCriteriaCount]);

  const [generatedOtp, setGeneratedOtp] = useState("123456");

  const generateRandomOtp = useCallback(() => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    return code;
  }, []);

  // Step 1 Submit
  const handleSelectMethodSubmit = useCallback(() => {
    if (!contactValue.trim()) return;
    if (method === "email" && !isEmailValid(contactValue)) {
      addToast("Email không hợp lệ.", "error");
      return;
    }
    if (method === "phone" && !isPhoneValid(contactValue)) {
      addToast("Số điện thoại không hợp lệ.", "error");
      return;
    }

    const newOtpCode = generateRandomOtp();
    addToast(`Mã xác thực đã được gửi: ${newOtpCode}`, "success");
    setStep("otp_verification");
    setOtp(Array(6).fill(""));
    setCountdown(60);
    setIsTimerActive(true);
  }, [contactValue, method, isEmailValid, isPhoneValid, addToast, generateRandomOtp]);

  // Resend OTP
  const handleResendOtp = useCallback(() => {
    const newOtpCode = generateRandomOtp();
    setCountdown(60);
    setIsTimerActive(true);
    setOtp(Array(6).fill(""));
    addToast(`Mã xác thực mới của bạn là: ${newOtpCode}`, "success");
  }, [addToast, generateRandomOtp]);

  // Verify OTP
  const handleVerifyOtp = useCallback(() => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      addToast("Vui lòng nhập đủ 6 chữ số mã xác thực.", "error");
      return;
    }
    if (countdown === 0 && !isTimerActive) {
      addToast("Mã xác thực đã hết hạn.", "error");
      return;
    }
    if (enteredOtp !== generatedOtp) {
      addToast("Mã xác thực không chính xác.", "error");
      return;
    }

    setStep("reset_password");
  }, [otp, countdown, isTimerActive, generatedOtp, addToast]);

  // Submit New Password — hỗ trợ đổi qua cả Email và Số điện thoại
  const handleResetPasswordSubmit = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      addToast("Hai mật khẩu chưa khớp.", "error");
      return;
    }
    if (passedCriteriaCount < 5) {
      addToast("Mật khẩu chưa đáp ứng yêu cầu bảo mật.", "error");
      return;
    }

    setIsSubmittingReset(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contactValue, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Đổi mật khẩu thất bại.", "error");
        return;
      }
      setStep("success");
    } catch {
      addToast("Không thể kết nối máy chủ. Vui lòng thử lại.", "error");
    } finally {
      setIsSubmittingReset(false);
    }
  }, [newPassword, confirmPassword, passedCriteriaCount, method, contactValue, addToast]);

  // Reset entire state
  const resetFlow = useCallback(() => {
    setStep("select_method");
    setMethod("email");
    setContactValue("");
    setOtp(Array(6).fill(""));
    setCountdown(60);
    setIsTimerActive(false);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsSubmittingReset(false);
  }, []);

  // Reset on modal close/open
  useEffect(() => {
    if (!isOpen) {
      resetFlow();
    }
  }, [isOpen, resetFlow]);

  return {
    step,
    setStep,
    method,
    setMethod,
    contactValue,
    setContactValue,
    maskedContact,
    generatedOtp,
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
    addToast,
    removeToast,
    handleSelectMethodSubmit,
    handleResendOtp,
    handleVerifyOtp,
    handleResetPasswordSubmit,
    resetFlow,
  };
}
