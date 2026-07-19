import { z } from "zod";
import { ApiError } from "../middleware/errorHandler";

/**
 * Validation utilities using Zod schemas
 * Provides reusable validation schemas and middleware helpers
 */

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // MongoDB ObjectId
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),

  // UUID
  uuid: z.string().uuid("Invalid UUID format"),

  // Email
  email: z.string().email("Invalid email format").toLowerCase().trim(),

  // Password
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character",
    ),

  // Optional password (for updates)
  optionalPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character",
    )
    .optional(),

  // Name
  name: z.string().min(1, "Name is required").max(100, "Name too long").trim(),

  // Optional name
  optionalName: z.string().max(100, "Name too long").trim().optional(),

  // Phone number (E.164 format)
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format (use E.164)"),

  // Optional phone
  optionalPhone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),

  // URL
  url: z.string().url("Invalid URL format"),

  // Optional URL
  optionalUrl: z.string().url("Invalid URL format").optional(),

  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // Sort
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),

  // Date range
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
};

/**
 * Auth validation schemas
 */
export const authSchemas = {
  // Register
  register: z.object({
    body: z.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      name: commonSchemas.name,
      phone: commonSchemas.optionalPhone,
    }),
  }),

  // Login
  login: z.object({
    body: z.object({
      email: commonSchemas.email,
      password: z.string().min(1, "Password is required"),
      rememberMe: z.boolean().optional(),
    }),
  }),

  // Refresh token
  refreshToken: z.object({
    body: z.object({
      refreshToken: z.string().min(1, "Refresh token is required"),
    }),
    cookies: z
      .object({
        refreshToken: z.string().optional(),
      })
      .optional(),
  }),

  // Forgot password
  forgotPassword: z.object({
    body: z.object({
      email: commonSchemas.email,
    }),
  }),

  // Reset password
  resetPassword: z.object({
    body: z
      .object({
        token: z.string().min(1, "Reset token is required"),
        password: commonSchemas.password,
        confirmPassword: z.string().min(1, "Confirm password is required"),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }),
    params: z
      .object({
        token: z.string().min(1, "Token is required"),
      })
      .optional(),
  }),

  // Verify email
  verifyEmail: z.object({
    body: z.object({
      token: z.string().min(1, "Verification token is required"),
      email: commonSchemas.email.optional(),
    }),
    params: z
      .object({
        token: z.string().min(1, "Token is required"),
      })
      .optional(),
    query: z
      .object({
        token: z.string().min(1, "Token is required"),
        email: commonSchemas.email.optional(),
      })
      .optional(),
  }),

  // Resend verification
  resendVerification: z.object({
    body: z.object({
      email: commonSchemas.email,
    }),
  }),

  // Change password
  changePassword: z.object({
    body: z
      .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: commonSchemas.password,
        confirmPassword: z.string().min(1, "Confirm password is required"),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }),
  }),

  // Update profile
  updateProfile: z.object({
    body: z
      .object({
        name: commonSchemas.optionalName,
        email: commonSchemas.email.optional(),
        phone: commonSchemas.optionalPhone,
        avatar: commonSchemas.optionalUrl,
      })
      .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
      }),
  }),
};

/**
 * User validation schemas
 */
export const userSchemas = {
  // Get user by ID
  getById: z.object({
    params: z.object({
      id: commonSchemas.objectId,
    }),
  }),

  // Update user (admin)
  update: z.object({
    params: z.object({
      id: commonSchemas.objectId,
    }),
    body: z.object({
      name: commonSchemas.optionalName,
      email: commonSchemas.email.optional(),
      phone: commonSchemas.optionalPhone,
      role: z.enum(["user", "admin", "moderator"]).optional(),
      isActive: z.boolean().optional(),
      isVerified: z.boolean().optional(),
    }),
  }),

  // Delete user
  delete: z.object({
    params: z.object({
      id: commonSchemas.objectId,
    }),
  }),

  // List users
  list: z.object({
    query: z.object({
      page: commonSchemas.page,
      limit: commonSchemas.limit,
      sortBy: commonSchemas.sortBy,
      sortOrder: commonSchemas.sortOrder,
      search: z.string().optional(),
      role: z.enum(["user", "admin", "moderator"]).optional(),
      isActive: z.coerce.boolean().optional(),
      isVerified: z.coerce.boolean().optional(),
      startDate: commonSchemas.startDate,
      endDate: commonSchemas.endDate,
    }),
  }),
};

/**
 * OTP validation schemas
 */
export const otpSchemas = {
  // Send OTP
  send: z.object({
    body: z.object({
      email: commonSchemas.email,
      purpose: z.enum(["verification", "password_reset", "2fa"]),
      type: z.enum(["numeric", "alphanumeric"]).optional(),
    }),
  }),

  // Verify OTP
  verify: z.object({
    body: z.object({
      email: commonSchemas.email,
      otp: z
        .string()
        .length(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "OTP must be numeric"),
      purpose: z.enum(["verification", "password_reset", "2fa"]),
    }),
  }),
};

/**
 * File upload validation
 */
export const fileSchemas = {
  // Single file
  single: z.object({
    file: z
      .object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        size: z
          .number()
          .max(10 * 1024 * 1024, "File size must not exceed 10MB"),
        buffer: z.instanceof(Buffer),
      })
      .optional(),
  }),

  // Multiple files
  multiple: z.object({
    files: z
      .array(
        z.object({
          fieldname: z.string(),
          originalname: z.string(),
          encoding: z.string(),
          mimetype: z.string(),
          size: z
            .number()
            .max(10 * 1024 * 1024, "File size must not exceed 10MB"),
          buffer: z.instanceof(Buffer),
        }),
      )
      .max(10, "Maximum 10 files allowed"),
  }),
};

/**
 * Validation middleware factory
 * Creates middleware that validates request against schema
 */
export function validate(schema: z.ZodSchema) {
  return (req: any, _res: any, next: any) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
        file: req.file,
        files: req.files,
      });

      // Merge validated data back into request
      req.validated = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");
        return next(ApiError.badRequest(messages));
      }
      next(error);
    }
  };
}

/**
 * Validate specific parts of request
 */
export function validateBody(schema: z.ZodSchema) {
  return (req: any, _res: any, next: any) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");
        return next(ApiError.badRequest(messages));
      }
      next(error);
    }
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: any, _res: any, next: any) => {
    try {
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");
        return next(ApiError.badRequest(messages));
      }
      next(error);
    }
  };
}

export function validateParams(schema: z.ZodSchema) {
  return (req: any, _res: any, next: any) => {
    try {
      req.validatedParams = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");
        return next(ApiError.badRequest(messages));
      }
      next(error);
    }
  };
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return sanitizeInput(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
}

/**
 * Sanitize middleware
 */
export function sanitize() {
  return (req: any, _res: any, next: any) => {
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);
    next();
  };
}

/**
 * Type-safe schema inference
 */
export type InferSchema<T extends z.ZodSchema> = z.infer<T>;

/**
 * Create a schema that makes all fields optional (for partial updates)
 */
export function makePartial<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.partial();
}

/**
 * Create a schema that requires at least one field
 */
export function requireAtLeastOne<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  fields: (keyof T)[],
) {
  return schema.refine(
    (data) => fields.some((field) => data[field] !== undefined),
    { message: `At least one of ${fields.join(", ")} is required` },
  );
}

/**
 * Common response schemas for API documentation
 */
export const responseSchemas = {
  success: <T extends z.ZodSchema>(dataSchema: T) =>
    z.object({
      success: z.literal(true),
      data: dataSchema,
      message: z.string().optional(),
    }),

  error: z.object({
    success: z.literal(false),
    message: z.string(),
    errors: z
      .array(
        z.object({
          field: z.string(),
          message: z.string(),
        }),
      )
      .optional(),
  }),

  paginated: <T extends z.ZodSchema>(dataSchema: T) =>
    z.object({
      success: z.literal(true),
      data: z.array(dataSchema),
      pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
      }),
    }),
};
