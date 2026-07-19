import { Request, Response, NextFunction } from "express";
import { userProfileService } from "../services/UserProfileService";
import { AuthRequest } from "../middleware/auth";

export class ProfileController {
  async getProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const profile = await userProfileService.getProfile(userId);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const profile = await userProfileService.updateProfile(userId, req.body);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async getPreferences(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const preferences = await userProfileService.getPreferences(userId);
      res.json({ success: true, data: preferences });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const preferences = await userProfileService.updatePreferences(
        userId,
        req.body,
      );
      res.json({ success: true, data: preferences });
    } catch (error) {
      next(error);
    }
  }

  async updateTheme(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { theme } = req.body;
      const user = await userProfileService.updateTheme(userId, theme);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateLanguage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { language } = req.body;
      const user = await userProfileService.updateLanguage(userId, language);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateBio(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { bio } = req.body;
      const user = await userProfileService.updateBio(userId, bio);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateAvatar(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { avatar } = req.body;
      const user = await userProfileService.updateAvatar(userId, avatar);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async getReadingStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const stats = await userProfileService.getReadingStats(userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getSubscription(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const subscription = await userProfileService.getSubscription(userId);
      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  }

  async changeSubscriptionTier(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { tier } = req.body;
      const user = await userProfileService.changeSubscriptionTier(
        userId,
        tier,
      );
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async getSocialLinks(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const socialLinks = await userProfileService.getSocialLinks(userId);
      res.json({ success: true, data: socialLinks });
    } catch (error) {
      next(error);
    }
  }

  async updateSocialLinks(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const user = await userProfileService.updateSocialLinks(userId, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async getPublicProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const profile = await userProfileService.getPublicProfile(
        req.params.userId as any,
      );
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
