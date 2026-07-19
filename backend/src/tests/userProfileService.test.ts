describe("UserProfileService", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("getProfile returns user profile without password", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: "1",
      email: "test@example.com",
      password: "hashed",
      toObject: () => ({
        _id: "1",
        email: "test@example.com",
        password: "hashed",
      }),
    };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.getProfile("1");
    expect(res).toEqual({ _id: "1", email: "test@example.com" });
    expect(res).not.toHaveProperty("password");
  });

  test("getProfile throws when user not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    const { userProfileService } = require("../services/UserProfileService");
    await expect(userProfileService.getProfile("1")).rejects.toThrow(
      "User not found",
    );
  });

  test("updateProfile updates profile fields", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", profile: { bio: "Updated bio" } };
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.updateProfile("1", {
      bio: "Updated bio",
    });
    expect(res).toEqual(fakeUser);
  });

  test("updateProfile throws when no data provided", async () => {
    const { userProfileService } = require("../services/UserProfileService");
    await expect(userProfileService.updateProfile("1", {})).rejects.toThrow(
      "No profile data provided",
    );
  });

  test("updatePreferences updates preferences", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", preferences: { theme: "dark" } };
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.updatePreferences("1", {
      theme: "dark",
    });
    expect(res).toEqual(fakeUser);
  });

  test("updatePreferences throws when no data provided", async () => {
    const { userProfileService } = require("../services/UserProfileService");
    await expect(userProfileService.updatePreferences("1", {})).rejects.toThrow(
      "No preferences data provided",
    );
  });

  test("updateTheme updates theme", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", preferences: { theme: "dark" } };
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.updateTheme("1", "dark");
    expect(res).toEqual(fakeUser);
  });

  test("updateLanguage updates language", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", preferences: { language: "es" } };
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.updateLanguage("1", "es");
    expect(res).toEqual(fakeUser);
  });

  test("updateNotificationSettings updates notifications", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: "1",
      preferences: { notifications: { email: true } },
    };
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.updateNotificationSettings("1", {
      email: true,
    });
    expect(res).toEqual(fakeUser);
  });

  test("updatePrivacySettings updates privacy", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: "1",
      preferences: { privacy: { profileVisibility: "public" } },
    };
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.updatePrivacySettings("1", {
      profileVisibility: "public",
    });
    expect(res).toEqual(fakeUser);
  });

  test("updateReadingPreferences updates reading preferences", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: "1",
      preferences: { readingPreferences: { fontSize: "large" } },
    };
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.updateReadingPreferences("1", {
      fontSize: "large",
    });
    expect(res).toEqual(fakeUser);
  });

  test("updateBio updates bio", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", profile: { bio: "Short bio" } };
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.updateBio("1", "Short bio");
    expect(res).toEqual(fakeUser);
  });

  test("updateBio throws when bio too long", async () => {
    const { userProfileService } = require("../services/UserProfileService");
    const longBio = "a".repeat(501);
    await expect(userProfileService.updateBio("1", longBio)).rejects.toThrow(
      "Bio cannot exceed 500 characters",
    );
  });

  test("updateAvatar updates avatar", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", avatar: "https://example.com/avatar.jpg" };
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.updateAvatar(
      "1",
      "https://example.com/avatar.jpg",
    );
    expect(res).toEqual(fakeUser);
  });

  test("getPreferences returns preferences", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", preferences: { theme: "dark" } };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.getPreferences("1");
    expect(res).toEqual({ theme: "dark" });
  });

  test("getPreferences returns null when user not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.getPreferences("1");
    expect(res).toBeNull();
  });

  test("getReadingStats returns reading stats", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", readingStats: { totalBooksRead: 10 } };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.getReadingStats("1");
    expect(res).toEqual({ totalBooksRead: 10 });
  });

  test("getReadingStats throws when user not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    const { userProfileService } = require("../services/UserProfileService");
    await expect(userProfileService.getReadingStats("1")).rejects.toThrow(
      "User not found",
    );
  });

  test("updateReadingStats updates reading stats", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", readingStats: { totalBooksRead: 11 } };
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.updateReadingStats("1", {
      totalBooksRead: 11,
    });
    expect(res).toEqual(fakeUser);
  });

  test("incrementBooksRead increments counter", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", readingStats: { totalBooksRead: 10 } };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue({ _id: "1", readingStats: { totalBooksRead: 11 } });
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.incrementBooksRead("1");
    expect(res.readingStats.totalBooksRead).toBe(11);
  });

  test("incrementBooksRead throws when user not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    const { userProfileService } = require("../services/UserProfileService");
    await expect(userProfileService.incrementBooksRead("1")).rejects.toThrow(
      "User not found",
    );
  });

  test("addReadingTime adds reading time", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", readingStats: { totalReadingTime: 100 } };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.updateById = jest.fn().mockResolvedValue({
      _id: "1",
      readingStats: { totalReadingTime: 130, lastReadAt: new Date() },
    });
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.addReadingTime("1", 30);
    expect(res.readingStats.totalReadingTime).toBe(130);
    expect(res.readingStats.lastReadAt).toBeDefined();
  });

  test("getSubscription returns subscription", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", subscription: { tier: "premium" } };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.getSubscription("1");
    expect(res).toEqual({ tier: "premium" });
  });

  test("getSubscription throws when user not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    const { userProfileService } = require("../services/UserProfileService");
    await expect(userProfileService.getSubscription("1")).rejects.toThrow(
      "User not found",
    );
  });

  test("updateSubscription updates subscription", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: "1",
      subscription: { tier: "premium", isActive: true },
    };
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.updateSubscription("1", {
      tier: "premium",
      isActive: true,
    });
    expect(res).toEqual(fakeUser);
  });

  test("changeSubscriptionTier changes tier", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: "1",
      subscription: { tier: "premium", isActive: true, startDate: new Date() },
    };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.changeSubscriptionTier("1", "premium");
    expect(res.subscription.tier).toBe("premium");
    expect(res.subscription.isActive).toBe(true);
  });

  test("getSocialLinks returns social links", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: "1",
      profile: { socialLinks: { twitter: "@user" } },
    };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.getSocialLinks("1");
    expect(res).toEqual({ twitter: "@user" });
  });

  test("getSocialLinks returns empty when no links", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = { _id: "1", profile: {} };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.getSocialLinks("1");
    expect(res).toEqual({});
  });

  test("updateSocialLinks updates social links", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: "1",
      profile: { socialLinks: { twitter: "@user" } },
    };
    UserRepository.userRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.updateSocialLinks("1", {
      twitter: "@user",
    });
    expect(res).toEqual(fakeUser);
  });

  test("getPublicProfile returns public profile", async () => {
    const UserRepository = require("../repositories/UserRepository");
    const fakeUser = {
      _id: "1",
      username: "testuser",
      fullName: "Test User",
      avatar: "https://example.com/avatar.jpg",
      profile: {
        bio: "Bio",
        location: "NYC",
        website: "https://example.com",
        socialLinks: { twitter: "@user" },
      },
      readingStats: { totalBooksRead: 10 },
      createdAt: new Date(),
    };
    UserRepository.userRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeUser);
    const { userProfileService } = require("../services/UserProfileService");
    const res = await userProfileService.getPublicProfile("1");
    expect(res).toEqual({
      _id: "1",
      username: "testuser",
      fullName: "Test User",
      avatar: "https://example.com/avatar.jpg",
      profile: {
        bio: "Bio",
        location: "NYC",
        website: "https://example.com",
        socialLinks: { twitter: "@user" },
      },
      readingStats: { totalBooksRead: 10 },
      createdAt: fakeUser.createdAt,
    });
  });

  test("getPublicProfile throws when user not found", async () => {
    const UserRepository = require("../repositories/UserRepository");
    UserRepository.userRepository.findById = jest.fn().mockResolvedValue(null);
    const { userProfileService } = require("../services/UserProfileService");
    await expect(userProfileService.getPublicProfile("1")).rejects.toThrow(
      "User not found",
    );
  });
});
