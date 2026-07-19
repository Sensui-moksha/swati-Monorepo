import { Types } from "mongoose";
import { ApiError } from "../middleware/errorHandler";
import { userRepository } from "../repositories/UserRepository";
import { IUser, IUserProfile, IUserPreferences } from "../models/User";

export class UserProfileService {
  async getProfile(userId: Types.ObjectId): Promise<Partial<IUser>> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const { password: _password, ...profileData } = user.toObject();
    return profileData;
  }

  async updateProfile(
    userId: Types.ObjectId,
    data: Partial<IUserProfile>,
  ): Promise<IUser | null> {
    if (!data || Object.keys(data).length === 0) {
      throw new ApiError(400, "No profile data provided");
    }

    const updateData: Record<string, unknown> = {
      "profile.phone": data.phone,
      "profile.dateOfBirth": data.dateOfBirth,
      "profile.bio": data.bio,
      "profile.gender": data.gender,
      "profile.location": data.location,
      "profile.website": data.website,
      "profile.socialLinks": data.socialLinks,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    return userRepository.updateById(userId, updateData);
  }

  async updatePreferences(
    userId: Types.ObjectId,
    data: Partial<IUserPreferences>,
  ): Promise<IUser | null> {
    if (!data || Object.keys(data).length === 0) {
      throw new ApiError(400, "No preferences data provided");
    }

    const updateData: any = {};

    if (data.theme) updateData["preferences.theme"] = data.theme;
    if (data.language) updateData["preferences.language"] = data.language;
    if (data.notifications)
      updateData["preferences.notifications"] = data.notifications;
    if (data.privacy) updateData["preferences.privacy"] = data.privacy;
    if (data.readingPreferences)
      updateData["preferences.readingPreferences"] = data.readingPreferences;

    return userRepository.updateById(userId, updateData);
  }

  async updateTheme(
    userId: Types.ObjectId,
    theme: "light" | "dark" | "system",
  ): Promise<IUser | null> {
    return userRepository.updateById(userId, { "preferences.theme": theme });
  }

  async updateLanguage(
    userId: Types.ObjectId,
    language: string,
  ): Promise<IUser | null> {
    return userRepository.updateById(userId, {
      "preferences.language": language,
    });
  }

  async updateNotificationSettings(
    userId: Types.ObjectId,
    settings: any,
  ): Promise<IUser | null> {
    return userRepository.updateById(userId, {
      "preferences.notifications": settings,
    });
  }

  async updatePrivacySettings(
    userId: Types.ObjectId,
    settings: any,
  ): Promise<IUser | null> {
    return userRepository.updateById(userId, {
      "preferences.privacy": settings,
    });
  }

  async updateReadingPreferences(
    userId: Types.ObjectId,
    preferences: any,
  ): Promise<IUser | null> {
    return userRepository.updateById(userId, {
      "preferences.readingPreferences": preferences,
    });
  }

  async updateBio(userId: Types.ObjectId, bio: string): Promise<IUser | null> {
    if (bio.length > 500) {
      throw new ApiError(400, "Bio cannot exceed 500 characters");
    }
    return userRepository.updateById(userId, { "profile.bio": bio });
  }

  async updateAvatar(
    userId: Types.ObjectId,
    avatar: string,
  ): Promise<IUser | null> {
    return userRepository.updateById(userId, { avatar });
  }

  async getPreferences(
    userId: Types.ObjectId,
  ): Promise<IUserPreferences | null> {
    const user = await userRepository.findById(userId);
    return user?.preferences || null;
  }

  async getReadingStats(userId: Types.ObjectId): Promise<any> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user.readingStats || {};
  }

  async updateReadingStats(
    userId: Types.ObjectId,
    stats: any,
  ): Promise<IUser | null> {
    return userRepository.updateById(userId, { readingStats: stats });
  }

  async incrementBooksRead(userId: Types.ObjectId): Promise<IUser | null> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const currentStats = user.readingStats || {};
    return userRepository.updateById(userId, {
      readingStats: {
        ...currentStats,
        totalBooksRead: (currentStats.totalBooksRead || 0) + 1,
      },
    });
  }

  async addReadingTime(
    userId: Types.ObjectId,
    minutes: number,
  ): Promise<IUser | null> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const currentStats = user.readingStats || {};
    return userRepository.updateById(userId, {
      readingStats: {
        ...currentStats,
        totalReadingTime: (currentStats.totalReadingTime || 0) + minutes,
        lastReadAt: new Date(),
      },
    });
  }

  async getSubscription(userId: Types.ObjectId): Promise<any> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user.subscription || {};
  }

  async updateSubscription(
    userId: Types.ObjectId,
    subscription: any,
  ): Promise<IUser | null> {
    return userRepository.updateById(userId, { subscription });
  }

  async changeSubscriptionTier(
    userId: Types.ObjectId,
    tier: "free" | "basic" | "premium" | "enterprise",
  ): Promise<IUser | null> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return userRepository.updateById(userId, {
      "subscription.tier": tier,
      "subscription.isActive": true,
      "subscription.startDate": new Date(),
    });
  }

  async getSocialLinks(userId: Types.ObjectId): Promise<any> {
    const user = await userRepository.findById(userId);
    return user?.profile?.socialLinks || {};
  }

  async updateSocialLinks(
    userId: Types.ObjectId,
    socialLinks: any,
  ): Promise<IUser | null> {
    return userRepository.updateById(userId, {
      "profile.socialLinks": socialLinks,
    });
  }

  async getPublicProfile(userId: Types.ObjectId): Promise<any> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      profile: {
        bio: user.profile?.bio,
        location: user.profile?.location,
        website: user.profile?.website,
        socialLinks: user.profile?.socialLinks,
      },
      readingStats: user.readingStats,
      createdAt: user.createdAt,
    };
  }
}

export const userProfileService = new UserProfileService();
