import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface ReadingStats {
  booksRead: number;
  highlightsCount: number;
  readingStreak: number;
  totalReadingTime: number;
}

export interface SubscriptionInfo {
  tier: string;
  status: string;
  renewsAt?: string;
  cancelAtPeriodEnd?: boolean;
}

export const profileApi = {
  getReadingStats: () =>
    apiClient.get<ApiResponse<ReadingStats>>('/profile/reading-stats'),

  getSubscription: () =>
    apiClient.get<ApiResponse<SubscriptionInfo>>('/profile/subscription'),

  getSearchHistory: () =>
    apiClient.get<ApiResponse<{query: string, timestamp: string}[]>>('/profile/search-history'),

  getBookmarks: () =>
    apiClient.get<ApiResponse<number[]>>('/profile/bookmarks'),

  getNotes: () =>
    apiClient.get<ApiResponse<{p: number, t: string}[]>>('/profile/notes'),

  getPreferences: () =>
    apiClient.get<ApiResponse<any>>('/profile/preferences'),

  updatePreferences: (data: any) =>
    apiClient.put<ApiResponse<any>>('/profile/preferences', data),
};
