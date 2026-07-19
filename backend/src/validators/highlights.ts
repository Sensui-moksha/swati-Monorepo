import { z } from "zod";

export const createHighlightSchema = z.object({
  body: z.object({
    resourceId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid resource ID"),
    resourceType: z.enum(["book", "publication", "magazine_issue", "article"]),
    resourceTitle: z.string().min(1).max(200),
    text: z.string().min(1).max(2000),
    color: z.enum(["yellow", "green", "blue", "pink", "orange"]),
    page: z.number().min(0).optional(),
    location: z.string().max(200).optional(),
    startOffset: z.number().min(0).optional(),
    endOffset: z.number().min(0).optional(),
    note: z.string().max(1000).optional(),
  }),
});

export const updateHighlightSchema = z.object({
  body: z.object({
    color: z.enum(["yellow", "green", "blue", "pink", "orange"]).optional(),
    note: z.string().max(1000).optional(),
  }),
});

export const highlightQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    color: z.enum(["yellow", "green", "blue", "pink", "orange"]).optional(),
    search: z.string().optional(),
  }),
});

export const highlightIdSchema = z.object({
  params: z.object({
    highlightId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid highlight ID"),
  }),
});

export const resourceIdSchema = z.object({
  params: z.object({
    resourceId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid resource ID"),
  }),
});
