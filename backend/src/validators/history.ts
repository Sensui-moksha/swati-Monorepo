import { z } from "zod";

export const recordReadingSchema = z.object({
  body: z.object({
    resourceId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid resource ID"),
    resourceType: z.enum(["book", "publication", "magazine_issue", "article"]),
    resourceTitle: z.string().min(1).max(200),
    resourceImage: z.string().url().optional(),
    duration: z.number().min(0).optional(),
    pageRead: z.number().min(0).optional(),
    percentageRead: z.number().min(0).max(100).optional(),
  }),
});

export const historyQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    days: z.string().regex(/^\d+$/).optional(),
  }),
});

export const paramIdSchema = z.object({
  params: z.object({
    resourceId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid resource ID"),
  }),
});
