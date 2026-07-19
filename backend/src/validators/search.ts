import { z } from "zod";

export const searchSchema = z.object({
  query: z.object({
    q: z.string().min(1).max(100),
    type: z
      .enum(["notes", "highlights", "bookmarks", "favorites", "all"])
      .optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const advancedSearchSchema = z.object({
  body: z.object({
    query: z.string().min(1).max(100),
    filters: z
      .object({
        type: z
          .enum(["notes", "highlights", "bookmarks", "favorites"])
          .optional(),
        resourceType: z
          .enum(["book", "publication", "magazine_issue", "article"])
          .optional(),
        dateRange: z
          .object({
            from: z.string().datetime().optional(),
            to: z.string().datetime().optional(),
          })
          .optional(),
        tags: z.array(z.string()).optional(),
      })
      .optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
  }),
});
