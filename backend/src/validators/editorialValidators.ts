import { z } from "zod";

const articleBase = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  subtitle: z.string().max(300).optional(),
  excerpt: z.string().max(500).optional(),
  summary: z.string().max(500).optional(),
  content: z.string().min(1),
  contentHtml: z.string().optional(),
  coverImage: z.string().optional(),
  featuredImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  author: z.string().optional(),
  coAuthors: z.array(z.string()).optional(),
  category: z.string().optional(),
  publication: z.string().optional(),
  magazineIssue: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z
    .enum(["draft", "pending_review", "published", "archived", "rejected"])
    .optional(),
  isFeatured: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  publishedAt: z.coerce.date().optional(),
  scheduledAt: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  language: z.string().max(10).optional(),
});

export const createArticleSchema = z.object({
  body: articleBase.extend({ content: z.string().min(1) }),
});
export const updateArticleSchema = z.object({ body: articleBase.partial() });
export const articleIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f0-9]{24}$/) }),
});
export const articleSlugSchema = z.object({
  params: z.object({ slug: z.string().min(1) }),
});

export const reviewSchema = z.object({
  body: z.object({
    reason: z.string().min(1).optional(),
    notes: z.string().min(1).optional(),
  }),
});
export const scheduleSchema = z.object({
  body: z.object({ scheduledAt: z.coerce.date() }),
});
export const versionCompareSchema = z.object({
  query: z.object({
    fromVersion: z.string().regex(/^\d+$/),
    toVersion: z.string().regex(/^\d+$/),
  }),
});
export const versionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f0-9]{24}$/),
    version: z.string().regex(/^\d+$/),
  }),
});
export const listQuerySchema = z.object({
  query: z
    .object({
      page: z.string().regex(/^\d+$/).optional(),
      limit: z.string().regex(/^\d+$/).optional(),
      q: z.string().optional(),
      category: z.string().optional(),
      tag: z.string().optional(),
      author: z.string().optional(),
      status: z.string().optional(),
    })
    .partial(),
});
export const relatedQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().optional(),
    tags: z.string().optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const createCommentSchema = z.object({
  body: z.object({
    articleId: z.string().regex(/^[a-f0-9]{24}$/),
    body: z.string().min(1).max(4000),
  }),
});
export const moderateCommentSchema = z.object({
  body: z.object({
    status: z.enum(["approved", "rejected", "spam"]),
    moderationNotes: z.string().max(1000).optional(),
  }),
});
export const commentIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f0-9]{24}$/) }),
});
export const articleCommentsSchema = z.object({
  params: z.object({ articleId: z.string().regex(/^[a-f0-9]{24}$/) }),
});

export const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    description: z.string().max(500).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
export const updateTagSchema = z.object({
  body: createTagSchema.shape.body.partial(),
});
export const mergeTagsSchema = z.object({
  body: z.object({
    sourceTagId: z.string().regex(/^[a-f0-9]{24}$/),
    targetTagId: z.string().regex(/^[a-f0-9]{24}$/),
  }),
});
export const tagIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f0-9]{24}$/) }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    description: z.string().max(500).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    parent: z.string().regex(/^[a-f0-9]{24}$/).optional().nullable(),
    isActive: z.boolean().optional(),
    order: z.number().optional(),
  }),
});
export const updateCategorySchema = z.object({
  body: createCategorySchema.shape.body.partial(),
});
export const categoryIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f0-9]{24}$/) }),
});
export const categorySlugSchema = z.object({
  params: z.object({ slug: z.string().min(1) }),
});

export const mediaUpdateSchema = z.object({
  body: z.object({
    filename: z.string().optional(),
    originalName: z.string().optional(),
    mimeType: z.string().optional(),
    url: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    folder: z.string().optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
    isPublic: z.boolean().optional(),
  }),
});
export const mediaIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f0-9]{24}$/) }),
});
export const mediaQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    folder: z.string().optional(),
    type: z.string().optional(),
    search: z.string().optional(),
  }),
});
