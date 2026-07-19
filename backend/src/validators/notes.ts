import { z } from "zod";

export const createNoteSchema = z.object({
  body: z.object({
    resourceId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid resource ID"),
    resourceType: z.enum(["book", "publication", "magazine_issue", "article"]),
    resourceTitle: z.string().min(1).max(200),
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(5000),
    page: z.number().min(0).optional(),
    location: z.string().max(200).optional(),
    tags: z.array(z.string().min(1).max(50)).default([]),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
  }),
});

export const updateNoteSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).max(5000).optional(),
    page: z.number().min(0).optional(),
    location: z.string().max(200).optional(),
    tags: z.array(z.string().min(1).max(50)).optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
  }),
});

export const noteQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const noteIdSchema = z.object({
  params: z.object({
    noteId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid note ID"),
  }),
});

export const resourceIdSchema = z.object({
  params: z.object({
    resourceId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid resource ID"),
  }),
});
