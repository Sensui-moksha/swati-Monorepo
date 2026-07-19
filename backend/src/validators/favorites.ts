import { z } from "zod";

export const createFavoriteSchema = z.object({
  body: z.object({
    resourceId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid resource ID"),
    type: z.enum([
      "book",
      "publication",
      "magazine_issue",
      "author",
      "collection",
    ]),
    resourceTitle: z.string().min(1).max(200),
    resourceImage: z.string().url().optional(),
  }),
});

export const favoriteQuerySchema = z.object({
  query: z.object({
    type: z
      .enum(["book", "publication", "magazine_issue", "author", "collection"])
      .optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const paramIdSchema = z.object({
  params: z.object({
    resourceId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid resource ID"),
  }),
});
