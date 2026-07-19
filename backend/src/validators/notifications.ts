import { z } from "zod";

export const notificationQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    filter: z.enum(["all", "unread", "read"]).optional(),
    type: z.string().optional(),
  }),
});

export const markAsReadSchema = z.object({
  body: z.object({}).optional(),
});

export const notificationIdSchema = z.object({
  params: z.object({
    notificationId: z
      .string()
      .regex(/^[a-f0-9]{24}$/, "Invalid notification ID"),
  }),
});

export const notificationTypeSchema = z.object({
  query: z.object({
    type: z.enum([
      "book_published",
      "publication_released",
      "magazine_released",
      "author_new_work",
      "reading_milestone",
      "recommendation",
      "subscription_expiring",
      "subscription_expired",
      "system",
    ]),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});
