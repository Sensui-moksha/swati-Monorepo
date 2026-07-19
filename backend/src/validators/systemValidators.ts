import { z } from "zod";
import { commonSchemas } from "../utils/validation";

export const systemSchemas = {
  keyParam: z.object({
    params: z.object({ key: z.string().min(1) }),
  }),

  upsertSetting: z.object({
    params: z.object({ key: z.string().min(1) }),
    body: z.object({
      value: z.any(),
      meta: z.record(z.any()).optional(),
    }),
  }),

  pagination: z.object({
    query: z
      .object({
        page: commonSchemas.page.default(1),
        limit: commonSchemas.limit.default(20),
      })
      .partial(),
  }),
};
