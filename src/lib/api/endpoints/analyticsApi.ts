import { apiClient } from '../client';
import { ApiResponse } from '../types';

export const analyticsApi = {
  getRevenueAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/revenue', { params });
  },
  getUserAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/users', { params });
  },
  getContentAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/content', { params });
  },
  getPaymentAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/payments', { params });
  },
  getSearchAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/search', { params });
  },
  getSubscriptionAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/subscriptions', { params });
  },
  getPublicationAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/publications', { params });
  },
  getTransactions: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any[]>>('/v1/admin/analytics/transactions', { params });
  },
  getPlanBreakdown: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/plan-breakdown', { params });
  },
  getPublishingAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/publishing', { params });
  },
  getReadingAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/reading', { params });
  },
  getRecommendationsAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/recommendations', { params });
  },
  getExecutiveAnalytics: async (params?: Record<string, any>) => {
    return apiClient.get<ApiResponse<any>>('/v1/admin/analytics/executive', { params });
  },
};
