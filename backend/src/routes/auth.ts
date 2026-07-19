import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  sendEmailVerificationOTPSchema,
  verifyEmailOTPSchema,
  sendPasswordResetOTPSchema,
  verifyPasswordResetOTPSchema,
  resetPasswordWithOTPSchema,
  enable2FASchema,
  verify2FASchema,
  disable2FASchema,
  regenerateBackupCodesSchema,
  revokeSessionSchema,
} from "../validators/auth";

const router = Router();

// ===== Public Routes (No Auth Required) =====

// POST /api/v1/auth/register
router.post("/register", validate(registerSchema), authController.register);

// POST /api/v1/auth/login
router.post("/login", validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh
router.post("/refresh", validate(refreshTokenSchema), authController.refresh);

// GET /api/v1/auth/verify-email?token=xxx
router.get(
  "/verify-email",
  validate(verifyEmailSchema),
  authController.verifyEmail,
);

// POST /api/v1/auth/resend-verification
router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  authController.resendVerification,
);

// POST /api/v1/auth/forgot-password
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

// POST /api/v1/auth/reset-password
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword,
);

// POST /api/v1/auth/send-password-reset-otp
router.post(
  "/send-password-reset-otp",
  validate(sendPasswordResetOTPSchema),
  authController.sendPasswordResetOTP,
);

// POST /api/v1/auth/verify-password-reset-otp
router.post(
  "/verify-password-reset-otp",
  validate(verifyPasswordResetOTPSchema),
  authController.verifyPasswordResetOTP,
);

// POST /api/v1/auth/reset-password-with-otp
router.post(
  "/reset-password-with-otp",
  validate(resetPasswordWithOTPSchema),
  authController.resetPasswordWithOTP,
);

// ===== Protected Routes (Auth Required) =====

// POST /api/v1/auth/logout
router.post(
  "/logout",
  authenticate,
  validate(logoutSchema),
  authController.logout,
);

// POST /api/v1/auth/change-password
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

// POST /api/v1/auth/send-email-verification-otp
router.post(
  "/send-email-verification-otp",
  authenticate,
  validate(sendEmailVerificationOTPSchema),
  authController.sendEmailVerificationOTP,
);

// POST /api/v1/auth/verify-email-otp
router.post(
  "/verify-email-otp",
  authenticate,
  validate(verifyEmailOTPSchema),
  authController.verifyEmailOTP,
);

// 2FA Routes
// POST /api/v1/auth/enable-2fa
router.post(
  "/enable-2fa",
  authenticate,
  validate(enable2FASchema),
  authController.enable2FA,
);

// POST /api/v1/auth/verify-2fa
router.post(
  "/verify-2fa",
  authenticate,
  validate(verify2FASchema),
  authController.verify2FA,
);

// POST /api/v1/auth/disable-2fa
router.post(
  "/disable-2fa",
  authenticate,
  validate(disable2FASchema),
  authController.disable2FA,
);

// POST /api/v1/auth/regenerate-backup-codes
router.post(
  "/regenerate-backup-codes",
  authenticate,
  validate(regenerateBackupCodesSchema),
  authController.regenerateBackupCodes,
);

// GET /api/v1/auth/2fa-status
router.get("/2fa-status", authenticate, authController.get2FAStatus);

// Session Management Routes
// GET /api/v1/auth/sessions
router.get("/sessions", authenticate, authController.getSessions);

// DELETE /api/v1/auth/sessions/:sessionId
router.delete(
  "/sessions/:sessionId",
  authenticate,
  validate(revokeSessionSchema),
  authController.revokeSession,
);

// DELETE /api/v1/auth/sessions
router.delete("/sessions", authenticate, authController.revokeAllSessions);

// DELETE /api/v1/auth/sessions/others
router.delete(
  "/sessions/others",
  authenticate,
  authController.revokeOtherSessions,
);

// GET /api/v1/auth/me
router.get("/me", authenticate, authController.getMe);

export default router;
