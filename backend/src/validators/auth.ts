import { z } from "zod";

// ===== Auth Input Schemas =====

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase(),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      )
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(100, "Full name too long")
      .trim(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase(),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
  }),
});

export const refreshTokenSchema = z
  .object({
    cookies: z
      .object({
        refreshToken: z.string().optional(),
      })
      .optional(),
    body: z
      .object({
        refreshToken: z.string().optional(),
      })
      .optional(),
  })
  .refine((data) => data.cookies?.refreshToken || data.body?.refreshToken, {
    message: "Refresh token is required",
    path: ["refreshToken"],
  });

export const logoutSchema = z.object({
  cookies: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
  body: z
    .object({
      refreshToken: z.string().optional(),
      revokeAllSessions: z.boolean().optional(),
    })
    .optional(),
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
  }),
});

// ===== OTP Schemas =====

export const sendEmailVerificationOTPSchema = z.object({
  // userId comes from authenticated request
});

export const verifyEmailOTPSchema = z.object({
  body: z.object({
    code: z
      .string()
      .length(6, "Verification code must be 6 digits")
      .regex(/^\d{6}$/, "Invalid code format"),
  }),
});

export const sendPasswordResetOTPSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase(),
  }),
});

export const verifyPasswordResetOTPSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase(),
    code: z
      .string()
      .length(6, "Reset code must be 6 digits")
      .regex(/^\d{6}$/, "Invalid code format"),
  }),
});

export const resetPasswordWithOTPSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
  }),
});

// ===== 2FA Schemas =====

export const enable2FASchema = z.object({
  // userId from authenticated request
});

export const verify2FASchema = z.object({
  body: z.object({
    code: z
      .string()
      .length(6, "2FA code must be 6 digits")
      .regex(/^\d{6}$/, "Invalid code format"),
  }),
});

export const disable2FASchema = z.object({
  body: z.object({
    code: z
      .string()
      .length(6, "2FA code must be 6 digits")
      .regex(/^\d{6}$/, "Invalid code format"),
  }),
});

export const regenerateBackupCodesSchema = z.object({
  // userId from authenticated request
});

// ===== Session Schemas =====

export const getSessionsSchema = z.object({
  // userId from authenticated request
});

export const revokeSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, "Session ID is required"),
  }),
});

export const revokeOtherSessionsSchema = z.object({
  // userId from authenticated request, currentSessionId from token
});

// ===== Type Exports =====

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"] & {
  cookies?: { refreshToken?: string };
};
export type LogoutInput = z.infer<typeof logoutSchema>["body"] & {
  cookies?: { refreshToken?: string };
};
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>["query"];
export type ResendVerificationInput = z.infer<
  typeof resendVerificationSchema
>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
export type VerifyEmailOTPInput = z.infer<typeof verifyEmailOTPSchema>["body"];
export type SendPasswordResetOTPInput = z.infer<
  typeof sendPasswordResetOTPSchema
>["body"];
export type VerifyPasswordResetOTPInput = z.infer<
  typeof verifyPasswordResetOTPSchema
>["body"];
export type ResetPasswordWithOTPInput = z.infer<
  typeof resetPasswordWithOTPSchema
>["body"];
export type Verify2FAInput = z.infer<typeof verify2FASchema>["body"];
export type Disable2FAInput = z.infer<typeof disable2FASchema>["body"];
export type RevokeSessionInput = z.infer<typeof revokeSessionSchema>["params"];
