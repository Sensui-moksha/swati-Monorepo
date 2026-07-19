import { Types } from "mongoose";
import { userRepository } from "../repositories/UserRepository";
import { otpRepository } from "../repositories/OTPRepository";
import { ApiError } from "../middleware/errorHandler";
import {
  generateTOTPSecret,
  generateBackupCodes,
  verifyTOTP,
  generateQRCodeURL,
} from "../utils/otp";

export interface TwoFactorSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyData {
  userId: Types.ObjectId;
  code: string;
}

export class TwoFactorService {
  /**
   * Generate 2FA setup data (secret, QR code, backup codes)
   */
  async generateSetupData(
    userId: Types.ObjectId,
    email: string,
    issuer: string = "Prototype",
  ): Promise<TwoFactorSetupData> {
    const user = await userRepository.findByIdOrThrow(userId);

    if (user.twoFactorEnabled) {
      throw ApiError.badRequest("2FA is already enabled");
    }

    const secret = generateTOTPSecret();
    const backupCodes = generateBackupCodes(10);
    const qrCodeUrl = generateQRCodeURL(email, secret, issuer);

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Enable 2FA after verifying the setup code
   */
  async enable2FA(
    userId: Types.ObjectId,
    code: string,
    setupData: TwoFactorSetupData,
  ): Promise<void> {
    const user = await userRepository.findByIdOrThrow(userId);

    if (user.twoFactorEnabled) {
      throw ApiError.badRequest("2FA is already enabled");
    }

    // Verify the TOTP code
    const isValid = verifyTOTP(code, setupData.secret);
    if (!isValid) {
      throw ApiError.badRequest("Invalid 2FA code");
    }

    // Enable 2FA with the secret and backup codes
    await otpRepository.enable2FA(
      userId,
      setupData.secret,
      setupData.backupCodes,
    );
  }

  /**
   * Verify 2FA code (TOTP or backup code)
   */
  async verify2FA(
    data: TwoFactorVerifyData,
  ): Promise<{ valid: boolean; usedBackupCode: boolean }> {
    const user = await userRepository.findByIdOrThrow(data.userId);

    if (!user.twoFactorEnabled) {
      throw ApiError.badRequest("2FA is not enabled");
    }

    // First try TOTP
    if (verifyTOTP(data.code, user.twoFactorSecret!)) {
      return { valid: true, usedBackupCode: false };
    }

    // Then try backup codes
    const backupCodeUsed = await otpRepository.verifyBackupCode(
      data.userId,
      data.code,
    );
    if (backupCodeUsed) {
      return { valid: true, usedBackupCode: true };
    }

    return { valid: false, usedBackupCode: false };
  }

  /**
   * Disable 2FA after verifying a code
   */
  async disable2FA(userId: Types.ObjectId, code: string): Promise<void> {
    const user = await userRepository.findByIdOrThrow(userId);

    if (!user.twoFactorEnabled) {
      throw ApiError.badRequest("2FA is not enabled");
    }

    // Verify the code before disabling
    const { valid } = await this.verify2FA({ userId, code });
    if (!valid) {
      throw ApiError.badRequest("Invalid 2FA code");
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
   * Get 2FA status
   */
  async get2FAStatus(userId: Types.ObjectId): Promise<{
    enabled: boolean;
    backupCodesRemaining: number;
    secret?: string;
  }> {
    const user = await userRepository.findByIdOrThrow(userId);

    return {
      enabled: user.twoFactorEnabled || false,
      backupCodesRemaining: user.twoFactorBackupCodes?.length || 0,
      secret: user.twoFactorSecret,
    };
  }

  /**
   * Generate QR code for existing 2FA secret (for re-displaying)
   */
  async getQRCode(
    userId: Types.ObjectId,
    email: string,
    issuer: string = "Prototype",
  ): Promise<string> {
    const user = await userRepository.findByIdOrThrow(userId);

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw ApiError.badRequest("2FA is not enabled");
    }

    return generateQRCodeURL(email, user.twoFactorSecret, issuer);
  }
}

export const twoFactorService = new TwoFactorService();
