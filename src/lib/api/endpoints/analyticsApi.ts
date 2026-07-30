import { apiClient } from '../client';
import { ApiResponse } from '../types';

export const analyticsApi = {
  getRevenueAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/analytics/commerce', { params });
  },
  getUserAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/analytics/users', { params });
  },
  getContentAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/analytics/content', { params });
  },
  getPaymentAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/payments', { params });
  },
  getSearchAnalytics: async (params?: Record<string, any>) => {
    // Falls back to generic analytics controller if we add a search method
    return apiClient.get<ApiResponse<any>>('/analytics/search', { params });
  },
  getSubscriptionAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/analytics/subscriptions', { params });
  },
  getPublicationAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/analytics/publications', { params });
  },
  getTransactions: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any[]>>('/analytics/transactions', { params });
  },
  getPlanBreakdown: async (params?: Record<string, any>) => {
    // Keep this one hitting admin since the backend route is still on /v1/admin/analytics/plan-breakdown
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/plan-breakdown', { params });
  },
  getPublishingAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/analytics/publishing', { params });
  },
  getReadingAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/analytics/reading', { params });
  },
  getRecommendationsAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/analytics/recommendations', { params });
  },
  getExecutiveAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/analytics/executive', { params });
  },
};
