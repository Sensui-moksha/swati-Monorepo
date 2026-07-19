import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional(),
  description: z.string().max(5000).optional(),
  isbn: z.string().max(100).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  author: z.string().optional(),
  publisher: z.string().optional(),
  category: z.string().optional(),
  genre: z.string().optional(),
  series: z.string().optional(),
  collection: z.string().optional(),
  publication: z.string().optional(),
  language: z.string().max(50).optional(),
  edition: z.string().max(100).optional(),
  pages: z.number().int().positive().optional(),
  price: z.number().min(0).optional(),
  isPremium: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  status: z.enum(["draft", "review", "published", "archived"]).optional(),
  publishedDate: z.coerce.date().optional(),
  coverImage: z.string().optional(),
  pdfUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().max(300).optional(),
  seoDescription: z.string().max(1000).optional(),
  keywords: z.array(z.string()).optional(),
});

export const updateBookSchema = createBookSchema.partial();

export const createPublicationSchema = z.object({
  name: z.string().min(1).max(300),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(5000).optional(),
  publisher: z.string().optional(),
  issueDate: z.coerce.date().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().max(300).optional(),
  seoDescription: z.string().max(1000).optional(),
  keywords: z.array(z.string()).optional(),
});

export const updatePublicationSchema = createPublicationSchema.partial();

export const createMagazineIssueSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(5000).optional(),
  publication: z.string().optional(),
  issueNumber: z.string().max(100).optional(),
  volume: z.string().max(100).optional(),
  season: z.string().max(100).optional(),
  issueType: z.enum(["monthly", "weekly", "special", "digital"]).optional(),
  publishDate: z.coerce.date().optional(),
  status: z.enum(["draft", "scheduled", "published", "archived"]).optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().max(300).optional(),
  seoDescription: z.string().max(1000).optional(),
  keywords: z.array(z.string()).optional(),
});

export const updateMagazineIssueSchema = createMagazineIssueSchema.partial();

export const createAuthorSchema = z.object({
  name: z.string().min(1).max(300),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  bio: z.string().max(5000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  image: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateAuthorSchema = createAuthorSchema.partial();

export const createPublisherSchema = z.object({
  name: z.string().min(1).max(300),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(5000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  logo: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updatePublisherSchema = createPublisherSchema.partial();

export const createGenreSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(1000).optional(),
  color: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateGenreSchema = createGenreSchema.partial();

export const createSeriesSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(1000).optional(),
  publisher: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateSeriesSchema = createSeriesSchema.partial();

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(1000).optional(),
  type: z.enum(["editor", "featured", "student", "custom"]).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();
