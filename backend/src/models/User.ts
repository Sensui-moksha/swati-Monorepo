import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUserProfile {
  phone?: string;
  dateOfBirth?: Date;
  bio?: string;
  gender?: "male" | "female" | "other";
  location?: {
    country?: string;
    state?: string;
    city?: string;
  };
  website?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface IUserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  privacy: {
    profilePublic: boolean;
    showReadingStats: boolean;
    allowRecommendations: boolean;
  };
  readingPreferences: {
    fontSize: number;
    lineHeight: number;
    fontFamily: string;
  };
}

export interface IReadingStats {
  totalBooksRead: number;
  totalReadingTime: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  lastReadAt?: Date;
}

export interface ISubscription {
  tier: "free" | "basic" | "premium" | "enterprise";
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  autoRenew: boolean;
  cancelledAt?: Date;
}

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  fullName: string;
  avatar?: string;
  role: "user" | "editor" | "admin" | "publisher" | "support" | "reader";
  isActive: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Session fields
  sessions?: IUserSession[];
  activeSessionId?: string;

  // 2FA / OTP fields
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  otpCode?: string;
  otpExpires?: Date;
  otpType?:
    | "email_verification"
    | "login"
    | "password_reset"
    | "2fa_setup"
    | "2fa_disable";
  otpAttempts: number;

  // Profile and preferences
  profile: IUserProfile;
  preferences: IUserPreferences;
  readingStats: IReadingStats;
  subscription: ISubscription;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
  createEmailVerificationToken(): string;
}

export interface IUserSession {
  sessionId: string;
  ip: string;
  userAgent: string;
  device?: {
    deviceType?: string;
    browser?: string;
    os?: string;
  };
  location?: {
    country?: string;
    city?: string;
    coordinates?: [number, number];
  };
  createdAt: Date;
  lastActive: Date;
  expiresAt: Date;
  isCurrent?: boolean;
}

export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    avatar: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Avatar must be a valid URL"],
    },
    role: {
      type: String,
      enum: ["user", "editor", "admin", "publisher", "support", "reader"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    refreshToken: {
      type: String,
      select: false,
    },

    // Session fields
    sessions: [
      {
        sessionId: { type: String, required: true },
        deviceInfo: { type: String, required: true },
        ipAddress: { type: String, required: true },
        userAgent: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        lastActiveAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
      },
    ],
    activeSessionId: {
      type: String,
    },

    // 2FA / OTP fields
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    twoFactorBackupCodes: {
      type: [String],
      select: false,
    },
    otpCode: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    otpType: {
      type: String,
      enum: [
        "email_verification",
        "login",
        "password_reset",
        "2fa_setup",
        "2fa_disable",
      ],
      select: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    // Profile and preferences
    profile: {
      type: {
        phone: { type: String, trim: true },
        dateOfBirth: Date,
        bio: {
          type: String,
          maxlength: [500, "Bio cannot exceed 500 characters"],
        },
        gender: { type: String, enum: ["male", "female", "other"] },
        location: {
          country: String,
          state: String,
          city: String,
        },
        website: {
          type: String,
          match: [/^https?:\/\/.+/, "Website must be a valid URL"],
        },
        socialLinks: {
          twitter: String,
          facebook: String,
          instagram: String,
          linkedin: String,
        },
      },
      default: {},
    },

    preferences: {
      type: {
        theme: {
          type: String,
          enum: ["light", "dark", "system"],
          default: "system",
        },
        language: { type: String, default: "en" },
        notifications: {
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          inApp: { type: Boolean, default: true },
        },
        privacy: {
          profilePublic: { type: Boolean, default: false },
          showReadingStats: { type: Boolean, default: false },
          allowRecommendations: { type: Boolean, default: true },
        },
        readingPreferences: {
          fontSize: { type: Number, default: 16, min: 10, max: 32 },
          lineHeight: { type: Number, default: 1.5, min: 1, max: 2.5 },
          fontFamily: { type: String, default: "serif" },
        },
      },
      default: {},
    },

    readingStats: {
      type: {
        totalBooksRead: { type: Number, default: 0 },
        totalReadingTime: { type: Number, default: 0 }, // in minutes
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastReadAt: Date,
      },
      default: {},
    },

    subscription: {
      type: {
        tier: {
          type: String,
          enum: ["free", "basic", "premium", "enterprise"],
          default: "free",
        },
        startDate: Date,
        endDate: Date,
        isActive: { type: Boolean, default: false },
        autoRenew: { type: Boolean, default: false },
        cancelledAt: Date,
      },
      default: { tier: "free", isActive: false, autoRenew: false },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ "sessions.sessionId": 1 });
userSchema.index({ "sessions.expiresAt": 1 }, { expireAfterSeconds: 0 });
userSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

// Virtual for articles (populated)
userSchema.virtual("articles", {
  ref: "Article",
  localField: "_id",
  foreignField: "author",
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to update passwordChangedAt
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  // Password changed at is set to 1 second before now to ensure token is created after
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp: number,
): boolean {
  if (this.passwordResetExpires) {
    const changedTimestamp = this.passwordResetExpires.getTime() / 1000;
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Instance method to create email verification token
userSchema.methods.createEmailVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Static method to find by email
userSchema.statics.findByEmail = function (
  email: string,
): Promise<IUser | null> {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by username
userSchema.statics.findByUsername = function (
  username: string,
): Promise<IUser | null> {
  return this.findOne({ username: username.toLowerCase() });
};

export const User = mongoose.model<IUser, IUserModel>("User", userSchema);
