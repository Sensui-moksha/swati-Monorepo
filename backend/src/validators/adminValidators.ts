import { z } from "zod";
import { commonSchemas } from "../utils/validation";

const userRoleEnum = z.enum([
  "user",
  "editor",
  "admin",
  "publisher",
  "support",
  "reader",
]);

export const adminSchemas = {
  dashboardQuery: z.object({
    query: z
      .object({
        from: commonSchemas.startDate.optional(),
        to: commonSchemas.endDate.optional(),
      })
      .partial(),
  }),

  userList: z.object({
    query: z
      .object({
        page: commonSchemas.page.default(1),
        limit: commonSchemas.limit.default(20),
        sortBy: commonSchemas.sortBy.optional(),
        sortOrder: commonSchemas.sortOrder.optional(),
        search: z.string().optional(),
        role: userRoleEnum.optional(),
        isActive: z.coerce.boolean().optional(),
        isVerified: z.coerce.boolean().optional(),
      })
      .partial(),
  }),

  userById: z.object({
    params: z.object({
      id: commonSchemas.objectId,
    }),
  }),

  activeSessions: z.object({
    query: z
      .object({
        page: commonSchemas.page.default(1),
        limit: commonSchemas.limit.default(20),
        deviceInfo: z.string().optional(),
        isActive: z.coerce.boolean().optional(),
      })
      .partial(),
  }),

  userUpdate: z.object({
    params: z.object({
      id: commonSchemas.objectId,
    }),
    body: z
      .object({
        username: z.string().min(1).max(50).optional(),
        fullName: z.string().min(1).max(100).optional(),
        email: commonSchemas.email.optional(),
        avatar: commonSchemas.optionalUrl,
        role: userRoleEnum.optional(),
        isActive: z.boolean().optional(),
        emailVerified: z.boolean().optional(),
      })
      .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
      }),
  }),
};
