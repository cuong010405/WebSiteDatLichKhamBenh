export type ResetStep = "select_method" | "otp_verification" | "reset_password" | "success";
export type ResetMethod = "email" | "phone";

export interface PasswordCriteria {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export type PasswordStrength = "weak" | "medium" | "strong";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
