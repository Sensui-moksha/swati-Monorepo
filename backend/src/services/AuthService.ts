import { userRepository } from "../repositories";
import { jwtConfig } from "../config/jwt";
import { emailConfig } from "../config/email";
import { ApiError } from "../middleware/errorHandler";
import { otpService } from "./OTPService";
import { sessionService } from "./SessionService";
import { twoFactorService, TwoFactorSetupData } from "./TwoFactorService";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Types } from "mongoose";

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Input types for AuthService methods
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// Re-export existing types
export type { TokenPayload, AuthTokens };

export class AuthService {
  private generateTokens(user: {
    id: string;
    email: string;
    role: string;
  }): AuthTokens {
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, jwtConfig.accessSecret, {
      expiresIn: jwtConfig.accessExpiry as jwt.SignOptions["expiresIn"],
    });

    const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiry as jwt.SignOptions["expiresIn"],
    });

    return { accessToken, refreshToken };
  }

  private verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, jwtConfig.refreshSecret) as TokenPayload;
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    if (!emailConfig.enabled) {
      console.log("Email sending disabled, skipping:", options.subject);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: emailConfig.auth,
    });

    await transporter.sendMail({
      from: emailConfig.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }

  private getEmailVerificationTemplate(
    token: string,
    name: string,
  ): { html: string; text: string } {
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;
    return {
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>Or copy this link: ${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
      `,
      text: `Welcome, ${name}! Please verify your email: ${verificationUrl}. This link expires in 24 hours.`,
    };
  }

  private getPasswordResetTemplate(
    token: string,
    name: string,
  ): { html: string; text: string } {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    return {
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `Hi ${name}, you requested a password reset. Reset your password: ${resetUrl}. This link expires in 10 minutes.`,
    };
  }

  async register(data: {
    email: string;
    username: string;
    password: string;
    fullName: string;
  }): Promise<{ user: any; tokens: AuthTokens }> {
    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw ApiError.conflict("Email already registered");
    }

    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw ApiError.conflict("Username already taken");
    }

    const user = await userRepository.create({
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      password: data.password,
      fullName: data.fullName,
      role: "user",
      isActive: true,
      emailVerified: false,
    });

    const emailVerificationToken = user.createEmailVerificationToken();
    await userRepository.updateById(user.id, {
      emailVerificationToken: user.emailVerificationToken,
      emailVerificationExpires: user.emailVerificationExpires,
    });

    const { html, text } = this.getEmailVerificationTemplate(
      emailVerificationToken,
      user.fullName,
    );
    await this.sendEmail({
      to: user.email,
      subject: "Verify your email address",
      html,
      text,
    });

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.emailVerificationExpires;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;
    delete userResponse.refreshToken;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;

    return { user: userResponse, tokens };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await userRepository.findByEmailOrUsername(email);
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (!user.isActive) {
      throw ApiError.forbidden("Account is deactivated");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await userRepository.incrementLoginAttempts(user.id);
      const updatedUser = await userRepository.findById(user.id);
      if (updatedUser && updatedUser.loginAttempts >= 5) {
        throw ApiError.tooManyRequests(
          "Too many failed attempts. Account temporarily locked.",
        );
      }
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (user.loginAttempts > 0) {
      await userRepository.resetLoginAttempts(user.id);
    }

    await userRepository.updateLastLogin(new Types.ObjectId(user.id));

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await userRepository.updateRefreshToken(
      new Types.ObjectId(user.id),
      tokens.refreshToken,
    );

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.emailVerificationExpires;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;
    delete userResponse.refreshToken;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;

    return { user: userResponse, tokens };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw ApiError.unauthorized("Refresh token required");
    }

    try {
      this.verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const user = await userRepository.findByRefreshToken(refreshToken);
    if (!user) {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    if (!user.isActive) {
      throw ApiError.forbidden("Account is deactivated");
    }

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await userRepository.updateRefreshToken(
      new Types.ObjectId(user.id),
      tokens.refreshToken,
    );

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(new Types.ObjectId(userId), null);
  }

  async verifyEmail(token: string): Promise<void> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userRepository.findByVerificationToken(hashedToken);

    if (!user) {
      throw ApiError.badRequest("Invalid or expired verification token");
    }

    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires < new Date()
    ) {
      throw ApiError.badRequest("Verification token has expired");
    }

    await userRepository.verifyEmail(new Types.ObjectId(user.id));
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.emailVerified) {
      throw ApiError.badRequest("Email already verified");
    }

    const emailVerificationToken = user.createEmailVerificationToken();
    await userRepository.updateById(user.id, {
      emailVerificationToken: user.emailVerificationToken,
      emailVerificationExpires: user.emailVerificationExpires,
    });

    const { html, text } = this.getEmailVerificationTemplate(
      emailVerificationToken,
      user.fullName,
    );
    await this.sendEmail({
      to: user.email,
      subject: "Verify your email address",
      html,
      text,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const resetToken = user.createPasswordResetToken();
    await userRepository.updateById(user.id, {
      passwordResetToken: user.passwordResetToken,
      passwordResetExpires: user.passwordResetExpires,
    });

    const { html, text } = this.getPasswordResetTemplate(
      resetToken,
      user.fullName,
    );
    await this.sendEmail({
      to: user.email,
      subject: "Password reset request",
      html,
      text,
    });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userRepository.findByPasswordResetToken(hashedToken);

    if (!user) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw ApiError.badRequest("Reset token has expired");
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await userRepository.updateRefreshToken(new Types.ObjectId(user.id), null);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await userRepository.findByIdOrThrow(
      new Types.ObjectId(userId),
    );
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    await userRepository.updateRefreshToken(new Types.ObjectId(userId), null);
  }

  // ===== OTP-based Email Verification =====
  async sendEmailVerificationOTP(userId: string): Promise<void> {
    const user = await userRepository.findByIdOrThrow(
      new Types.ObjectId(userId),
    );
    if (user.emailVerified) {
      throw ApiError.badRequest("Email already verified");
    }

    const code = await otpService.sendEmailVerificationOTP(
      new Types.ObjectId(userId),
    );

    // In production, send via email service
    // For now, we just return the code (in dev mode)
    console.log(`Email verification OTP for ${user.email}: ${code}`);
  }

  async verifyEmailOTP(userId: string, code: string): Promise<void> {
    const isValid = await otpService.verifyEmailOTP(
      new Types.ObjectId(userId),
      code,
    );
    if (!isValid) {
      throw ApiError.badRequest("Invalid or expired verification code");
    }

    await userRepository.verifyEmail(new Types.ObjectId(userId));
  }

  async resendEmailVerificationOTP(userId: string): Promise<void> {
    const user = await userRepository.findByIdOrThrow(
      new Types.ObjectId(userId),
    );
    if (user.emailVerified) {
      throw ApiError.badRequest("Email already verified");
    }

    await this.sendEmailVerificationOTP(userId);
  }

  // ===== OTP-based Password Reset =====
  async sendPasswordResetOTP(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const code = await otpService.sendPasswordResetOTP(
      new Types.ObjectId(user.id),
    );

    // In production, send via email service
    console.log(`Password reset OTP for ${user.email}: ${code}`);
  }

  async verifyPasswordResetOTP(email: string, code: string): Promise<string> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.badRequest("Invalid or expired reset code");
    }

    const isValid = await otpService.verifyPasswordResetOTP(
      new Types.ObjectId(user.id),
      code,
    );
    if (!isValid) {
      throw ApiError.badRequest("Invalid or expired reset code");
    }

    // Return a temporary token that can be used for password reset
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await userRepository.updateById(user.id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    return resetToken;
  }

  async resetPasswordWithOTP(token: string, password: string): Promise<void> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userRepository.findByPasswordResetToken(hashedToken);

    if (!user) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw ApiError.badRequest("Reset token has expired");
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await userRepository.updateRefreshToken(new Types.ObjectId(user.id), null);

    // Revoke all sessions for security
    await sessionService.revokeAllSessions(new Types.ObjectId(user.id));
  }

  // ===== OTP-based Login Verification =====
  async sendLoginVerificationOTP(userId: string): Promise<void> {
    const user = await userRepository.findByIdOrThrow(
      new Types.ObjectId(userId),
    );
    const code = await otpService.sendLoginVerificationOTP(
      new Types.ObjectId(userId),
    );

    // In production, send via email/SMS
    console.log(`Login verification OTP for ${user.email}: ${code}`);
  }

  async verifyLoginOTP(
    userId: string,
    code: string,
  ): Promise<{ user: any; tokens: AuthTokens }> {
    const isValid = await otpService.verifyLoginOTP(
      new Types.ObjectId(userId),
      code,
    );
    if (!isValid) {
      throw ApiError.badRequest("Invalid or expired login code");
    }

    const user = await userRepository.findByIdOrThrow(
      new Types.ObjectId(userId),
    );
    if (!user.isActive) {
      throw ApiError.forbidden("Account is deactivated");
    }

    await userRepository.updateLastLogin(new Types.ObjectId(user.id));

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await userRepository.updateRefreshToken(
      new Types.ObjectId(user.id),
      tokens.refreshToken,
    );

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.emailVerificationExpires;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;
    delete userResponse.refreshToken;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;

    return { user: userResponse, tokens };
  }

  // ===== 2FA Integration =====
  async enable2FA(
    userId: string,
  ): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    const user = await userRepository.findByIdOrThrow(
      new Types.ObjectId(userId),
    );
    if (user.twoFactorEnabled) {
      throw ApiError.badRequest("2FA is already enabled");
    }

    const setupData = await twoFactorService.generateSetupData(
      new Types.ObjectId(userId),
      user.email,
    );

    return setupData;
  }

  async verifyAndEnable2FA(
    userId: string,
    code: string,
    setupData: TwoFactorSetupData,
  ): Promise<void> {
    await twoFactorService.enable2FA(
      new Types.ObjectId(userId),
      code,
      setupData,
    );
  }

  async verify2FA(
    userId: string,
    code: string,
  ): Promise<{ valid: boolean; usedBackupCode: boolean }> {
    return twoFactorService.verify2FA({
      userId: new Types.ObjectId(userId),
      code,
    });
  }

  async disable2FA(userId: string, code: string): Promise<void> {
    await twoFactorService.disable2FA(new Types.ObjectId(userId), code);
  }

  async regenerate2FABackupCodes(userId: string): Promise<string[]> {
    return twoFactorService.regenerateBackupCodes(new Types.ObjectId(userId));
  }

  async get2FAStatus(
    userId: string,
  ): Promise<{ enabled: boolean; backupCodesRemaining: number }> {
    return twoFactorService.get2FAStatus(new Types.ObjectId(userId));
  }

  // ===== Session Management =====
  async getUserSessions(userId: string): Promise<any[]> {
    return sessionService.getUserSessions(new Types.ObjectId(userId));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await sessionService.revokeSession(new Types.ObjectId(userId), sessionId);
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await sessionService.revokeAllSessions(new Types.ObjectId(userId));
  }

  async revokeOtherSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<void> {
    await sessionService.revokeOtherSessions(
      new Types.ObjectId(userId),
      currentSessionId,
    );
  }

  async getMe(userId: string): Promise<any> {
    const user = await userRepository.findByIdOrThrow(
      new Types.ObjectId(userId),
    );
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.emailVerificationExpires;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;
    delete userResponse.refreshToken;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;
    return userResponse;
  }
}

export const authService = new AuthService();
