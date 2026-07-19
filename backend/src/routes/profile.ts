import { Router } from "express";
import { profileController } from "../controllers/profileController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  updateProfileSchema,
  updatePreferencesSchema,
  updateThemeSchema,
  updateLanguageSchema,
  updateBioSchema,
  updateAvatarSchema,
  updateSocialLinksSchema,
  changeSubscriptionSchema,
} from "../validators/profile";

const router = Router();

// Profile endpoints
router.get(
  "/",
  authenticate,
  profileController.getProfile.bind(profileController),
);
router.put(
  "/",
  authenticate,
  validate(updateProfileSchema),
  profileController.updateProfile.bind(profileController),
);
router.put(
  "/bio",
  authenticate,
  validate(updateBioSchema),
  profileController.updateBio.bind(profileController),
);
router.put(
  "/avatar",
  authenticate,
  validate(updateAvatarSchema),
  profileController.updateAvatar.bind(profileController),
);

// Preferences endpoints
router.get(
  "/preferences",
  authenticate,
  profileController.getPreferences.bind(profileController),
);
router.put(
  "/preferences",
  authenticate,
  validate(updatePreferencesSchema),
  profileController.updatePreferences.bind(profileController),
);
router.put(
  "/preferences/theme",
  authenticate,
  validate(updateThemeSchema),
  profileController.updateTheme.bind(profileController),
);
router.put(
  "/preferences/language",
  authenticate,
  validate(updateLanguageSchema),
  profileController.updateLanguage.bind(profileController),
);

// Reading stats
router.get(
  "/reading-stats",
  authenticate,
  profileController.getReadingStats.bind(profileController),
);

// Subscription
router.get(
  "/subscription",
  authenticate,
  profileController.getSubscription.bind(profileController),
);
router.put(
  "/subscription/tier",
  authenticate,
  validate(changeSubscriptionSchema),
  profileController.changeSubscriptionTier.bind(profileController),
);

// Social links
router.get(
  "/social-links",
  authenticate,
  profileController.getSocialLinks.bind(profileController),
);
router.put(
  "/social-links",
  authenticate,
  validate(updateSocialLinksSchema),
  profileController.updateSocialLinks.bind(profileController),
);

// Public profile
router.get(
  "/public/:userId",
  profileController.getPublicProfile.bind(profileController),
);

export default router;
