import { Types, FilterQuery, UpdateQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { User, IUser } from "../models/User";

export interface OTPFilter extends FilterQuery<IUser> {
  userId?: Types.ObjectId;
  type?: string;
  isUsed?: boolean;
}

export interface OTPData {
  code: string;
  type:
    | "email_verification"
    | "password_reset"
    | "login_2fa"
    | "disable_2fa"
    | "change_email";
  expiresAt: Date;
  attempts?: number;
  maxAttempts?: number;
}

export class OTPRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  /**
   * Store an OTP for a user
   */
  async setOTP(userId: Types.ObjectId, otp: OTPData): Promise<IUser | null> {
    return this.updateById(userId, {
      otpCode: otp.code,
      otpExpires: otp.expiresAt,
      otpType: otp.type,
    } as UpdateQuery<IUser>);
  }

  /**
   * Verify an OTP for a user
   */
  async verifyOTP(
    userId: Types.ObjectId,
    code: string,
    type: string,
  ): Promise<IUser | null> {
    const user = await this.findById(userId);
    if (!user || !user.otpCode || !user.otpExpires || !user.otpType)
      return null;

    if (user.otpType !== type) return null;
    if (user.otpCode !== code) return null;
    if (user.otpExpires < new Date()) return null;

    return user;
  }

  /**
   * Clear OTP after successful verification
   */
  async clearOTP(userId: Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, {
      otpCode: null,
      otpExpires: null,
      otpType: null,
    } as UpdateQuery<IUser>);
  }

  /**
   * Check if OTP exists and is valid (without consuming it)
   */
  async checkOTP(
    userId: Types.ObjectId,
    type: string,
  ): Promise<{ valid: boolean; expiresAt?: Date }> {
    const user = await this.findById(userId);
    if (!user || !user.otpCode || !user.otpExpires || !user.otpType) {
      return { valid: false };
    }

    if (user.otpType !== type) {
      return { valid: false };
    }

    if (user.otpExpires < new Date()) {
      return { valid: false };
    }

    return { valid: true, expiresAt: user.otpExpires };
  }

  /**
   * Increment OTP attempt counter
   */
  async incrementOTPAttempts(userId: Types.ObjectId): Promise<IUser | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    const attempts = (user.otpAttempts || 0) + 1;
    return this.updateById(userId, {
      otpAttempts: attempts,
    } as UpdateQuery<IUser>);
  }

  /**
   * Reset OTP attempts
   */
  async resetOTPAttempts(userId: Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, { otpAttempts: 0 } as UpdateQuery<IUser>);
  }

  /**
   * Get OTP attempts count
   */
  async getOTPAttempts(userId: Types.ObjectId): Promise<number> {
    const user = await this.findById(userId);
    return user?.otpAttempts || 0;
  }

  // ==================== 2FA Methods ====================

  /**
   * Enable 2FA for a user
   */
  async enableTwoFactor(
    userId: Types.ObjectId,
    secret: string,
    backupCodes: string[],
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      twoFactorBackupCodes: backupCodes,
    } as UpdateQuery<IUser>);
  }

  /**
   * Disable 2FA for a user
   */
  async disableTwoFactor(userId: Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
    } as UpdateQuery<IUser>);
  }

  /**
   * Verify a backup code and remove it if valid
   */
  async verifyBackupCode(
    userId: Types.ObjectId,
    code: string,
  ): Promise<IUser | null> {
    const user = await this.findById(userId);
    if (!user || !user.twoFactorBackupCodes) return null;

    const index = user.twoFactorBackupCodes.indexOf(code);
    if (index === -1) return null;

    // Remove used backup code
    const updatedCodes = [...user.twoFactorBackupCodes];
    updatedCodes.splice(index, 1);

    return this.updateById(userId, {
      twoFactorBackupCodes: updatedCodes,
    } as UpdateQuery<IUser>);
  }

  /**
   * Get remaining backup codes count
   */
  async getBackupCodesCount(userId: Types.ObjectId): Promise<number> {
    const user = await this.findById(userId);
    return user?.twoFactorBackupCodes?.length || 0;
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(
    userId: Types.ObjectId,
    backupCodes: string[],
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      twoFactorBackupCodes: backupCodes,
    } as UpdateQuery<IUser>);
  }

  /**
   * Update 2FA secret (for re-enrollment)
   */
  async updateTwoFactorSecret(
    userId: Types.ObjectId,
    secret: string,
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      twoFactorSecret: secret,
    } as UpdateQuery<IUser>);
  }

  /**
   * Check if 2FA is enabled for user
   */
  async isTwoFactorEnabled(userId: Types.ObjectId): Promise<boolean> {
    const user = await this.findById(userId);
    return user?.twoFactorEnabled === true;
  }

  /**
   * Get 2FA secret for user
   */
  async getTwoFactorSecret(userId: Types.ObjectId): Promise<string | null> {
    const user = await this.findById(userId);
    return user?.twoFactorSecret || null;
  }

  /**
   * Get all backup codes for user (admin only)
   */
  async getBackupCodes(userId: Types.ObjectId): Promise<string[]> {
    const user = await this.findById(userId);
    return user?.twoFactorBackupCodes || [];
  }

  /**
   * Enable 2FA for a user (alias for enableTwoFactor)
   */
  async enable2FA(
    userId: Types.ObjectId,
    secret: string,
    backupCodes: string[],
  ): Promise<IUser | null> {
    return this.enableTwoFactor(userId, secret, backupCodes);
  }

  /**
   * Disable 2FA for a user (alias for disableTwoFactor)
   */
  async disable2FA(userId: Types.ObjectId): Promise<IUser | null> {
    return this.disableTwoFactor(userId);
  }

  // ==================== Admin/Analytics Methods ====================

  /**
   * Find users with 2FA enabled
   */
  async findUsersWith2FA(
    filter: OTPFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IUser>> {
    const { userId, type: _type, isUsed: _isUsed, ...restFilter } = filter;
    const query: FilterQuery<IUser> = { ...restFilter, twoFactorEnabled: true };

    if (userId) {
      query._id = userId;
    }

    return this.findWithPagination(query, options);
  }

  /**
   * Find users with pending OTP
   */
  async findUsersWithPendingOTP(
    filter: OTPFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IUser>> {
    const { userId, type: _type, isUsed: _isUsed, ...restFilter } = filter;
    const query: FilterQuery<IUser> = {
      ...restFilter,
      otpCode: { $ne: null },
      otpExpires: { $gt: new Date() },
    };

    if (userId) {
      query._id = userId;
    }

    if (_type) {
      query.otpType = _type;
    }

    return this.findWithPagination(query, options);
  }

  /**
   * Clean up expired OTPs (can be run as a cron job)
   */
  async cleanupExpiredOTPs(): Promise<number> {
    const result = await this.model
      .updateMany(
        { otpExpires: { $lt: new Date() } },
        {
          $set: {
            otpCode: null,
            otpExpires: null,
            otpType: null,
            otpAttempts: 0,
          },
        },
      )
      .exec();
    return result.modifiedCount;
  }

  /**
   * Get OTP statistics
   */
  async getOTPStats(): Promise<{
    totalUsersWith2FA: number;
    pendingOTPs: number;
    expiredOTPs: number;
  }> {
    const [totalUsersWith2FA, pendingOTPs, expiredOTPs] = await Promise.all([
      this.model.countDocuments({ twoFactorEnabled: true }).exec(),
      this.model
        .countDocuments({
          otpCode: { $ne: null },
          otpExpires: { $gt: new Date() },
        })
        .exec(),
      this.model
        .countDocuments({
          otpCode: { $ne: null },
          otpExpires: { $lt: new Date() },
        })
        .exec(),
    ]);

    return { totalUsersWith2FA, pendingOTPs, expiredOTPs };
  }
}

export const otpRepository = new OTPRepository();
