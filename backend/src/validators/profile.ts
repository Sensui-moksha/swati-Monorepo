import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    phone: z.string().optional(),
    dateOfBirth: z.string().datetime().optional(),
    bio: z.string().max(500).optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    website: z.string().url().optional(),
    location: z
      .object({
        country: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
      })
      .optional(),
    socialLinks: z
      .object({
        twitter: z.string().optional(),
        facebook: z.string().optional(),
        instagram: z.string().optional(),
        linkedin: z.string().optional(),
      })
      .optional(),
  }),
});

export const updatePreferencesSchema = z.object({
  body: z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    language: z.string().optional(),
    notifications: z
      .object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        sms: z.boolean().optional(),
        inApp: z.boolean().optional(),
      })
      .optional(),
    privacy: z
      .object({
        profilePublic: z.boolean().optional(),
        showReadingStats: z.boolean().optional(),
        allowRecommendations: z.boolean().optional(),
      })
      .optional(),
    readingPreferences: z
      .object({
        fontSize: z.number().min(10).max(32).optional(),
        lineHeight: z.number().min(1).max(2.5).optional(),
        fontFamily: z.string().optional(),
      })
      .optional(),
  }),
});

export const updateThemeSchema = z.object({
  body: z.object({
    theme: z.enum(["light", "dark", "system"]),
  }),
});

export const updateLanguageSchema = z.object({
  body: z.object({
    language: z.string(),
  }),
});

export const updateBioSchema = z.object({
  body: z.object({
    bio: z.string().max(500),
  }),
});

export const updateAvatarSchema = z.object({
  body: z.object({
    avatar: z.string().url(),
  }),
});

export const updateSocialLinksSchema = z.object({
  body: z.object({
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
  }),
});

export const changeSubscriptionSchema = z.object({
  body: z.object({
    tier: z.enum(["free", "basic", "premium", "enterprise"]),
  }),
});
