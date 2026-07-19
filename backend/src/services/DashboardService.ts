import { Types } from "mongoose";
import { userRepository } from "../repositories/UserRepository";
import { bookmarkRepository } from "../repositories/BookmarkRepository";
import { favoriteRepository } from "../repositories/FavoriteRepository";
import { readingProgressRepository } from "../repositories/ReadingProgressRepository";
import { readingHistoryRepository } from "../repositories/ReadingHistoryRepository";
import { noteRepository } from "../repositories/NoteRepository";
import { highlightRepository } from "../repositories/HighlightRepository";
import { notificationRepository } from "../repositories/NotificationRepository";
import { ApiError } from "../middleware/errorHandler";
import { recommendationService } from "./RecommendationService";

export class DashboardService {
  async getDashboard(userId: Types.ObjectId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Fetch data in parallel
    const [
      continueReading,
      recentlyViewed,
      stats,
      favoriteCount,
      bookmarkCount,
      unreadNotifications,
      readingTimeline,
    ] = await Promise.all([
      readingProgressRepository.findForContinueReading(userId, 5),
      readingHistoryRepository.findRecentlyViewed(userId, 5),
      this.getReadingStats(userId),
      favoriteRepository.countByUser(userId),
      bookmarkRepository.countByUser(userId),
      notificationRepository.countUnreadByUser(userId),
      readingHistoryRepository.getReadingTimeline(userId, 7),
    ]);

    return {
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        email: user.email,
      },
      continueReading,
      recentlyViewed,
      readingStats: stats,
      counts: {
        favorites: favoriteCount,
        bookmarks: bookmarkCount,
        unreadNotifications,
      },
      readingActivity: {
        thisWeek: readingTimeline.length,
        totalTime: stats.totalReadingTime || 0,
      },
      subscription: user.subscription,
      preferences: user.preferences,
    };
  }

  async getReadingStats(userId: Types.ObjectId) {
    const [activeCount, completedCount, totalNotes, totalHighlights] =
      await Promise.all([
        readingProgressRepository.countActiveByUser(userId),
        readingProgressRepository.countCompletedByUser(userId),
        noteRepository.model.countDocuments({ user: userId }),
        highlightRepository.model.countDocuments({ user: userId }),
      ]);

    const user = await userRepository.findById(userId);
    const userStats = (user?.readingStats || {}) as Record<string, any>;

    return {
      totalBooksRead: userStats.totalBooksRead || 0,
      totalReadingTime: userStats.totalReadingTime || 0,
      currentStreak: userStats.currentStreak || 0,
      longestStreak: userStats.longestStreak || 0,
      activeReadings: activeCount,
      completedReadings: completedCount,
      totalNotes,
      totalHighlights,
    };
  }

  async getActivitySummary(userId: Types.ObjectId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [readings, notes, highlights] = await Promise.all([
      readingHistoryRepository.model
        .find({
          user: userId,
          readAt: { $gte: startDate },
        })
        .exec(),
      noteRepository.model
        .find({
          user: userId,
          createdAt: { $gte: startDate },
        })
        .exec(),
      highlightRepository.model
        .find({
          user: userId,
          createdAt: { $gte: startDate },
        })
        .exec(),
    ]);

    // Group by date
    const activityByDate: Record<string, any> = {};

    readings.forEach((reading) => {
      const date = reading.readAt?.toISOString().split("T")[0];
      if (date) {
        const key = date ?? "unknown";
        const entry = activityByDate[key] ?? {
          readings: 0,
          notes: 0,
          highlights: 0,
        };
        activityByDate[key] = entry;
        entry.readings++;
      }
    });

    notes.forEach((note) => {
      const date = note.createdAt.toISOString().split("T")[0];
      const key = date ?? "unknown";
      const entry = activityByDate[key] ?? {
        readings: 0,
        notes: 0,
        highlights: 0,
      };
      activityByDate[key] = entry;
      entry.notes++;
    });

    highlights.forEach((highlight) => {
      const date = highlight.createdAt.toISOString().split("T")[0];
      const key = date ?? "unknown";
      const entry = activityByDate[key] ?? {
        readings: 0,
        notes: 0,
        highlights: 0,
      };
      activityByDate[key] = entry;
      entry.highlights++;
    });

    return activityByDate;
  }

  async getReadingGoalProgress(userId: Types.ObjectId, goal: number) {
    const stats = await this.getReadingStats(userId);
    const progress = Math.min((stats.completedReadings / goal) * 100, 100);

    return {
      goal,
      completed: stats.completedReadings,
      progress,
      remaining: Math.max(goal - stats.completedReadings, 0),
    };
  }

  async getReadingHeatmap(userId: Types.ObjectId) {
    const days = 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const readings = await readingHistoryRepository.model
      .find({
        user: userId,
        readAt: { $gte: startDate },
      })
      .exec();

    const heatmap: Record<string, number> = {};

    readings.forEach((reading) => {
      const date = reading.readAt?.toISOString().split("T")[0];
      if (date) {
        heatmap[date] = (heatmap[date] || 0) + 1;
      }
    });

    return heatmap;
  }

  async getPersonalizedRecommendations(userId: Types.ObjectId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return recommendationService.getPersonalizedRecommendations(userId);
  }

  async getDetailedStats(userId: Types.ObjectId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const [readings, notes, highlights, bookmarks, favorites] =
      await Promise.all([
        readingProgressRepository.countActiveByUser(userId),
        noteRepository.countByUser(userId),
        highlightRepository.countByUser(userId),
        bookmarkRepository.countByUser(userId),
        favoriteRepository.countByUser(userId),
      ]);

    return {
      readingStats: user.readingStats,
      activeReadings: readings,
      notes,
      highlights,
      bookmarks,
      favorites,
      profile: {
        completedBooks: user.readingStats?.totalBooksRead || 0,
        totalReadingTime: user.readingStats?.totalReadingTime || 0,
        longestStreak: user.readingStats?.longestStreak || 0,
        currentStreak: user.readingStats?.currentStreak || 0,
      },
    };
  }
}

export const dashboardService = new DashboardService();
