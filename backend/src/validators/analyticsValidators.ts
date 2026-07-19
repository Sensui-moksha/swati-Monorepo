import { z } from "zod";
import { commonSchemas } from "../utils/validation";

const analyticsQuery = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: commonSchemas.page.optional(),
  limit: commonSchemas.limit.optional(),
  section: z
    .enum(["overview", "users", "reading", "content", "commerce"])
    .optional(),
  type: z
    .enum(["overview", "users", "reading", "content", "commerce"])
    .optional(),
  exportFormat: z.enum(["json", "csv"]).optional(),
  userId: commonSchemas.objectId.optional(),
  categoryId: commonSchemas.objectId.optional(),
  tagId: commonSchemas.objectId.optional(),
});

export const analyticsQuerySchema = z.object({
  query: analyticsQuery.partial(),
});
export const analyticsExportSchema = z.object({
  query: analyticsQuery.partial(),
});
