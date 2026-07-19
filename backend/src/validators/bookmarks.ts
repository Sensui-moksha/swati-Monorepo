import { z } from "zod";

export const createBookmarkSchema = z.object({
  body: z.object({
    resourceId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid resource ID"),
    type: z.enum(["book", "publication", "magazine_issue", "article"]),
    resourceTitle: z.string().min(1).max(200),
    resourceImage: z.string().url().optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export const updateBookmarkSchema = z.object({
  body: z.object({
    resourceImage: z.string().url().optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export const bookmarkQuerySchema = z.object({
  query: z.object({
    type: z
      .enum(["book", "publication", "magazine_issue", "article"])
      .optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
  }),
});

export const paramIdSchema = z.object({
  params: z.object({
    resourceId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid resource ID"),
  }),
});
