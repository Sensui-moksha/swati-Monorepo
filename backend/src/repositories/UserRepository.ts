import { Types, FilterQuery, UpdateQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { User, IUser, IUserSession } from "../models/User";

export interface UserFilter extends FilterQuery<IUser> {
  search?: string;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return this.model.findOne({ username: username.toLowerCase() }).exec();
  }

  async findByEmailOrUsername(identifier: string): Promise<IUser | null> {
    const lower = identifier.toLowerCase();
    return this.model
      .findOne({
        $or: [{ email: lower }, { username: lower }],
      })
      .exec();
  }

  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    return this.model.findOne({ refreshToken }).exec();
  }

  async findByVerificationToken(token: string): Promise<IUser | null> {
    return this.model.findOne({ emailVerificationToken: token }).exec();
  }

  async findByPasswordResetToken(token: string): Promise<IUser | null> {
    return this.model
      .findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      })
      .exec();
  }

  async findWithPagination(
    filter: UserFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IUser>> {
    const { search, role, isActive, isVerified, ...restFilter } = filter;
    const query: FilterQuery<IUser> = { ...restFilter };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (typeof isActive === "boolean") {
      query.isActive = isActive;
    }

    if (typeof isVerified === "boolean") {
      query.emailVerified = isVerified;
    }

    return super.findWithPagination(query, options);
  }

  async updateRefreshToken(
    userId: Types.ObjectId,
    refreshToken: string | null,
  ): Promise<IUser | null> {
    return this.updateById(userId, { refreshToken } as UpdateQuery<IUser>);
  }

  async updateVerificationToken(
    userId: Types.ObjectId,
    token: string | null,
    expires: Date | null,
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    } as UpdateQuery<IUser>);
  }

  async updatePasswordResetToken(
    userId: Types.ObjectId,
    token: string | null,
    expires: Date | null,
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      passwordResetToken: token,
      passwordResetExpires: expires,
    } as UpdateQuery<IUser>);
  }

  async findByIdOrThrow(id: Types.ObjectId): Promise<IUser> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async verifyEmail(userId: Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    } as UpdateQuery<IUser>);
  }

  async updateLastLogin(userId: Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, {
      lastLoginAt: new Date(),
    } as UpdateQuery<IUser>);
  }

  async incrementLoginAttempts(userId: Types.ObjectId): Promise<IUser | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    const attempts = (user.loginAttempts || 0) + 1;
    const update: UpdateQuery<IUser> = { loginAttempts: attempts };

    if (attempts >= 5) {
      update.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    }

    return this.updateById(userId, update);
  }

  async resetLoginAttempts(userId: Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, {
      loginAttempts: 0,
      lockUntil: null,
    } as UpdateQuery<IUser>);
  }

  async getUsersByRole(role: string): Promise<IUser[]> {
    return this.model.find({ role }).sort({ createdAt: -1 }).exec();
  }

  async getActiveUsersCount(): Promise<number> {
    return this.model.countDocuments({ isActive: true }).exec();
  }

  async getVerifiedUsersCount(): Promise<number> {
    return this.model.countDocuments({ emailVerified: true }).exec();
  }

  async getRecentUsers(limit: number = 10): Promise<IUser[]> {
    return this.model
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  // Session management methods
  async addSession(
    userId: Types.ObjectId,
    session: IUserSession,
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      $push: { sessions: session },
      activeSessionId: session.sessionId,
    } as UpdateQuery<IUser>);
  }

  async updateSession(
    userId: Types.ObjectId,
    sessionId: string,
    updates: Partial<IUserSession>,
  ): Promise<IUser | null> {
    const update: UpdateQuery<IUser> = {};
    Object.keys(updates).forEach((key) => {
      update[`sessions.$[elem].${key}`] = (updates as any)[key];
    });
    return this.model
      .findOneAndUpdate(
        { _id: userId, "sessions.sessionId": sessionId },
        { $set: update },
        { arrayFilters: [{ "elem.sessionId": sessionId }], new: true },
      )
      .exec();
  }

  async removeSession(
    userId: Types.ObjectId,
    sessionId: string,
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      $pull: { sessions: { sessionId } },
      $set: { activeSessionId: null },
    } as UpdateQuery<IUser>);
  }

  async removeAllSessions(userId: Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, {
      $set: { sessions: [], activeSessionId: null },
    } as UpdateQuery<IUser>);
  }

  async removeExpiredSessions(userId: Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, {
      $pull: { sessions: { expiresAt: { $lt: new Date() } } },
    } as UpdateQuery<IUser>);
  }

  async getActiveSessions(userId: Types.ObjectId): Promise<IUserSession[]> {
    const user = await this.findById(userId);
    if (!user || !user.sessions) return [];
    return user.sessions.filter((s) => s.expiresAt > new Date());
  }

  async setActiveSession(
    userId: Types.ObjectId,
    sessionId: string,
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      activeSessionId: sessionId,
    } as UpdateQuery<IUser>);
  }

  // OTP / 2FA methods
  async setOTP(
    userId: Types.ObjectId,
    code: string,
    expires: Date,
    type: string,
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      otpCode: code,
      otpExpires: expires,
      otpType: type,
    } as UpdateQuery<IUser>);
  }

  async verifyOTP(userId: Types.ObjectId, code: string): Promise<IUser | null> {
    const user = await this.findById(userId);
    if (!user || !user.otpCode || !user.otpExpires) return null;
    if (user.otpCode !== code) return null;
    if (user.otpExpires < new Date()) return null;
    return user;
  }

  async clearOTP(userId: Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, {
      otpCode: null,
      otpExpires: null,
      otpType: null,
    } as UpdateQuery<IUser>);
  }

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

  async disableTwoFactor(userId: Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
    } as UpdateQuery<IUser>);
  }

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

  async updateTwoFactorSecret(
    userId: Types.ObjectId,
    secret: string,
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      twoFactorSecret: secret,
    } as UpdateQuery<IUser>);
  }
}

export const userRepository = new UserRepository();
