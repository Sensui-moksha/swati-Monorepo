import { Types } from "mongoose";
import { otpRepository } from "../repositories/OTPRepository";
import { userRepository } from "../repositories/UserRepository";
import { ApiError } from "../middleware/errorHandler";
import {
  generateOTP,
  generateTOTPSecret,
  hashOTP,
  verifyOTP,
  generateBackupCodes,
  verifyTOTP,
} from "../utils/otp";

export interface OTPFilter {
  userId?: Types.ObjectId;
  type?:
    | "email_verification"
    | "password_reset"
    | "login_2fa"
    | "disable_2fa"
    | "change_email";
  isUsed?: boolean;
}

export interface CreateOTPData {
  userId: Types.ObjectId;
  type:
    | "email_verification"
    | "password_reset"
    | "login_2fa"
    | "disable_2fa"
    | "change_email";
  code?: string;
  expiresAt: Date;
}

export interface VerifyOTPData {
  userId: Types.ObjectId;
  type:
    | "email_verification"
    | "password_reset"
    | "login_2fa"
    | "disable_2fa"
    | "change_email";
  code: string;
}

export class OTPService {
  /**
   * Generate and store a new OTP for a user
   */
  async createOTP(data: CreateOTPData): Promise<string> {
    const otpResult = data.code
      ? {
          otp: data.code,
          hashedOTP: hashOTP(data.code),
          expiresAt: data.expiresAt,
          otpId: "",
        }
      : generateOTP({
          length: 6,
          expiryMinutes: data.expiresAt
            ? Math.ceil((data.expiresAt.getTime() - Date.now()) / 60000)
            : 10,
        });
    const hashedCode = otpResult.hashedOTP;

    await otpRepository.setOTP(data.userId, {
      code: hashedCode,
      type: data.type,
      expiresAt: otpResult.expiresAt,
      attempts: 0,
    });

    return otpResult.otp;
  }

  /**
   * Verify an OTP code
   */
  async verifyOTP(data: VerifyOTPData): Promise<boolean> {
    const user = await userRepository.findById(data.userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const storedOTP = user.otpCode;
    const otpExpires = user.otpExpires;
    const otpType = user.otpType;

    if (!storedOTP || !otpExpires || otpType !== data.type) {
      return false;
    }

    if (otpExpires < new Date()) {
      await otpRepository.clearOTP(data.userId);
      return false;
    }

    const isValid = verifyOTP(data.code, storedOTP);

    if (isValid) {
      await otpRepository.clearOTP(data.userId);
    }

    return isValid;
  }

  /**
   * Clear OTP for a user
   */
  async clearOTP(userId: Types.ObjectId): Promise<void> {
    await otpRepository.clearOTP(userId);
  }

  /**
   * Generate and send email verification OTP
   */
  async sendEmailVerificationOTP(userId: Types.ObjectId): Promise<string> {
    await userRepository.findByIdOrThrow(userId);
    const code = await this.createOTP({
      userId,
      type: "email_verification",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // In a real app, you'd send this via email
    // For now, we just return the code (in production, send via email service)
    return code;
  }

  /**
   * Generate and send password reset OTP
   */
  async sendPasswordResetOTP(userId: Types.ObjectId): Promise<string> {
    await userRepository.findByIdOrThrow(userId);
    const code = await this.createOTP({
      userId,
      type: "password_reset",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    return code;
  }

  /**
   * Generate and send login verification OTP (2FA)
   */
  async sendLoginVerificationOTP(userId: Types.ObjectId): Promise<string> {
    await userRepository.findByIdOrThrow(userId);
    const code = await this.createOTP({
      userId,
      type: "login_2fa",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    return code;
  }

  /**
   * Verify login verification OTP (2FA)
   */
  async verifyLoginOTP(userId: Types.ObjectId, code: string): Promise<boolean> {
    return this.verifyOTP({ userId, type: "login_2fa", code });
  }

  /**
   * Verify password reset OTP
   */
  async verifyPasswordResetOTP(
    userId: Types.ObjectId,
    code: string,
  ): Promise<boolean> {
    return this.verifyOTP({ userId, type: "password_reset", code });
  }

  /**
   * Verify email verification OTP
   */
  async verifyEmailOTP(userId: Types.ObjectId, code: string): Promise<boolean> {
    return this.verifyOTP({ userId, type: "email_verification", code });
  }

  /**
   * Enable 2FA for a user
   */
  async enable2FA(
    userId: Types.ObjectId,
  ): Promise<{ secret: string; backupCodes: string[] }> {
    const user = await userRepository.findByIdOrThrow(userId);

    if (user.twoFactorEnabled) {
      throw ApiError.badRequest("2FA is already enabled");
    }

    const secret = generateTOTPSecret();
    const backupCodes = generateBackupCodes(10);

    await otpRepository.enable2FA(userId, secret, backupCodes);

    return { secret, backupCodes };
  }

  /**
   * Verify 2FA code (TOTP or backup code)
   */
  async verify2FA(userId: Types.ObjectId, code: string): Promise<boolean> {
    const user = await userRepository.findByIdOrThrow(userId);

    if (!user.twoFactorEnabled) {
      throw ApiError.badRequest("2FA is not enabled");
    }

    // First try TOTP verification
    const totpResult = verifyTOTP(code, user.twoFactorSecret!);
    if (totpResult.isValid) {
      return true;
    }

    // Then try backup codes
    const backupCodeUsed = await otpRepository.verifyBackupCode(userId, code);
    return backupCodeUsed !== null;
  }

  /**
   * Disable 2FA for a user
   */
  async disable2FA(userId: Types.ObjectId): Promise<void> {
    const user = await userRepository.findByIdOrThrow(userId);

    if (!user.twoFactorEnabled) {
      throw ApiError.badRequest("2FA is not enabled");
    }

    await otpRepository.disable2FA(userId);
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: Types.ObjectId): Promise<string[]> {
    const user = await userRepository.findByIdOrThrow(userId);

    if (!user.twoFactorEnabled) {
      throw ApiError.badRequest("2FA is not enabled");
    }

    const backupCodes = generateBackupCodes(10);
    await otpRepository.regenerateBackupCodes(userId, backupCodes);

    return backupCodes;
  }

  /**
   * Get 2FA status for a user
   */
  async get2FAStatus(userId: Types.ObjectId): Promise<{
    enabled: boolean;
    backupCodesRemaining: number;
  }> {
    const user = await userRepository.findByIdOrThrow(userId);

    return {
      enabled: user.twoFactorEnabled || false,
      backupCodesRemaining: user.twoFactorBackupCodes?.length || 0,
    };
  }

  /**
   * Clean up expired OTPs across all users
   */
  async cleanupExpiredOTPs(): Promise<number> {
    return otpRepository.cleanupExpiredOTPs();
  }

  /**
   * Get OTP statistics
   */
  async getOTPStats(): Promise<{
    totalOTPs: number;
    usedOTPs: number;
    expiredOTPs: number;
    active2FAUsers: number;
  }> {
    const stats = await otpRepository.getOTPStats();
    return {
      totalOTPs: stats.pendingOTPs,
      usedOTPs: 0, // Not tracked in current implementation
      expiredOTPs: stats.expiredOTPs,
      active2FAUsers: stats.totalUsersWith2FA,
    };
  }
}

export const otpService = new OTPService();
