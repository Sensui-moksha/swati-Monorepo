import { z } from "zod";

export const startReadingSchema = z.object({
  body: z.object({
    resourceId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid resource ID"),
    resourceType: z.enum(["book", "publication", "magazine_issue", "article"]),
    resourceTitle: z.string().min(1).max(200),
    totalPages: z.number().min(1),
    currentPage: z.number().min(0).default(0),
    timeSpent: z.number().min(0).default(0),
  }),
});

export const updateProgressSchema = z.object({
  body: z.object({
    currentPage: z.number().min(0),
    timeSpent: z.number().min(0).optional(),
  }),
});

export const progressQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    filter: z.enum(["active", "completed", "all"]).optional(),
  }),
});

export const paramIdSchema = z.object({
  params: z.object({
    resourceId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid resource ID"),
  }),
});

export const readerContentSchema = z.object({
  params: z.object({
    resourceId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid resource ID"),
    resourceType: z.enum(["book", "publication", "magazine_issue", "article"]),
  }),
});
