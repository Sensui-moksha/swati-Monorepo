import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";
import { ApiError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

// ===== Helper Functions =====

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean,
) => {
  const accessTokenMaxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    : 15 * 60 * 1000; // 30 days : 15 min
  const refreshTokenMaxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    : 7 * 24 * 60 * 60 * 1000; // 30 days : 7 days

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: accessTokenMaxAge,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: refreshTokenMaxAge,
  });
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

// ===== Auth Controller =====

export const authController = {
  // POST /api/v1/auth/register
  register: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, username, password, fullName } = req.body;

      const result = await authService.register({
        email,
        username,
        password,
        fullName,
      });

      setAuthCookies(
        res,
        result.tokens.accessToken,
        result.tokens.refreshToken,
        false,
      );

      res.status(201).json({
        success: true,
        message: "Registration successful. Please verify your email.",
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/login
  login: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password, rememberMe } = req.body;

      const result = await authService.login(email, password);

      setAuthCookies(
        res,
        result.tokens.accessToken,
        result.tokens.refreshToken,
        rememberMe,
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/refresh
  refresh: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!refreshToken) {
        throw new ApiError("Refresh token is required", 401);
      }

      const tokens = await authService.refreshTokens(refreshToken);

      setAuthCookies(res, tokens.accessToken, tokens.refreshToken, false);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          tokens,
        },
      });
    } catch (error) {
      // Clear cookies on refresh failure
      clearAuthCookies(res);
      next(error);
    }
  },

  // POST /api/v1/auth/logout
  logout: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const revokeAllSessions = req.body?.revokeAllSessions;

      await authService.logout(userId);

      if (revokeAllSessions) {
        await authService.revokeAllSessions(userId);
      }

      clearAuthCookies(res);

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/auth/verify-email?token=xxx
  verifyEmail: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        throw new ApiError("Verification token is required", 400);
      }

      await authService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: "Email verified successfully. You can now log in.",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/resend-verification
  resendVerification: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email } = req.body;

      await authService.resendVerificationEmail(email);

      res.status(200).json({
        success: true,
        message: "If the email exists, a verification email has been sent.",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/forgot-password
  forgotPassword: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email } = req.body;

      await authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link has been sent.",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/reset-password
  resetPassword: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { token, password } = req.body;

      await authService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        message: "Password has been reset successfully. You can now log in.",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/change-password
  changePassword: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!._id.toString();

      await authService.changePassword(userId, currentPassword, newPassword);

      clearAuthCookies(res);

      res.status(200).json({
        success: true,
        message: "Password changed successfully. Please log in again.",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/send-email-verification-otp
  sendEmailVerificationOTP: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      await authService.sendEmailVerificationOTP(userId);

      res.status(200).json({
        success: true,
        message: "Verification code sent to your email.",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/verify-email-otp
  verifyEmailOTP: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { code } = req.body;
      const userId = req.user!._id.toString();

      await authService.verifyEmailOTP(userId, code);

      res.status(200).json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/send-password-reset-otp
  sendPasswordResetOTP: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email } = req.body;

      await authService.sendPasswordResetOTP(email);

      res.status(200).json({
        success: true,
        message: "If the email exists, a reset code has been sent.",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/verify-password-reset-otp
  verifyPasswordResetOTP: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, code } = req.body;

      const resetToken = await authService.verifyPasswordResetOTP(email, code);

      res.status(200).json({
        success: true,
        message: "Reset code verified. Use the token to reset your password.",
        data: {
          resetToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/reset-password-with-otp
  resetPasswordWithOTP: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { token, password } = req.body;

      await authService.resetPasswordWithOTP(token, password);

      res.status(200).json({
        success: true,
        message: "Password has been reset successfully. You can now log in.",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/enable-2fa
  enable2FA: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      const setupData = await authService.enable2FA(userId);

      res.status(200).json({
        success: true,
        message:
          "Scan the QR code with your authenticator app, then verify with a code.",
        data: {
          secret: setupData.secret,
          qrCodeUrl: setupData.qrCodeUrl,
          backupCodes: setupData.backupCodes,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/verify-2fa
  verify2FA: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { code } = req.body;
      const userId = req.user!._id.toString();

      const result = await authService.verify2FA(userId, code);

      res.status(200).json({
        success: true,
        message: result.valid
          ? "2FA verified successfully"
          : "Invalid 2FA code",
        data: {
          valid: result.valid,
          usedBackupCode: result.usedBackupCode,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/disable-2fa
  disable2FA: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { code } = req.body;
      const userId = req.user!._id.toString();

      await authService.disable2FA(userId, code);

      res.status(200).json({
        success: true,
        message: "2FA has been disabled.",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/regenerate-backup-codes
  regenerateBackupCodes: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      const backupCodes = await authService.regenerate2FABackupCodes(userId);

      res.status(200).json({
        success: true,
        message: "New backup codes generated. Save them securely.",
        data: {
          backupCodes,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/auth/2fa-status
  get2FAStatus: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      const status = await authService.get2FAStatus(userId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/auth/sessions
  getSessions: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      const sessions = await authService.getUserSessions(userId);

      res.status(200).json({
        success: true,
        data: { sessions },
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/auth/sessions/:sessionId
  revokeSession: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const { sessionId } = req.params;

      if (!sessionId) {
        throw new ApiError("Session ID is required", 400);
      }

      await authService.revokeSession(userId, sessionId);

      res.status(200).json({
        success: true,
        message: "Session revoked successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/auth/sessions
  revokeAllSessions: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      await authService.revokeAllSessions(userId);

      clearAuthCookies(res);

      res.status(200).json({
        success: true,
        message: "All sessions revoked. You have been logged out.",
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/auth/sessions/others
  revokeOtherSessions: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const currentSessionId = req.token; // from auth middleware

      if (!currentSessionId) {
        throw new ApiError("Current session token is missing", 401);
      }

      await authService.revokeOtherSessions(userId, currentSessionId);

      res.status(200).json({
        success: true,
        message: "All other sessions revoked.",
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/auth/me
  getMe: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      const user = await authService.getMe(userId);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },
};
