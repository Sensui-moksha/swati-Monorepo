import { apiClient } from '../client';
import type {
  Subscription,
  SubscriptionPlan,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export interface CreateSubscriptionData {
  planId: string;
  paymentMethodId?: string;
  trialDays?: number;
  couponCode?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateSubscriptionData {
  planId?: string;
  quantity?: number;
  trialEnd?: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, unknown>;
}

export interface SubscriptionFilters extends PaginationParams {
  status?: 'active' | 'past_due' | 'cancelled' | 'trialing' | 'incomplete' | 'paused';
  planId?: string;
}

export const subscriptionsApi = {
  // Plans
  listPlans: (params?: PaginationParams & { active?: boolean; type?: string }) =>
    apiClient.get<PaginatedResponse<SubscriptionPlan>>('/subscriptions/plans', { params }),

  getPlan: (id: string) =>
    apiClient.get<ApiResponse<SubscriptionPlan>>(`/subscriptions/plans/${id}`),

  // Subscriptions
  list: (params?: SubscriptionFilters) =>
    apiClient.get<PaginatedResponse<Subscription>>('/subscriptions', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Subscription>>(`/subscriptions/${id}`),

  getCurrent: () =>
    apiClient.get<ApiResponse<Subscription | null>>('/subscriptions/current'),

  create: (data: CreateSubscriptionData) =>
    apiClient.post<ApiResponse<Subscription>>('/subscriptions', data),

  update: (id: string, data: UpdateSubscriptionData) =>
    apiClient.patch<ApiResponse<Subscription>>(`/subscriptions/${id}`, data),

  cancel: (id: string, immediately?: boolean, reason?: string) =>
    apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/cancel`, { immediately, reason }),

  resume: (id: string) =>
    apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/resume`),

  pause: (id: string, resumeAt?: string) =>
    apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/pause`, { resumeAt }),

  // Payment methods
  listPaymentMethods: () =>
    apiClient.get<ApiResponse<Array<{ id: string; type: string; brand: string; last4: string; isDefault: boolean }>>>('/subscriptions/payment-methods'),

  addPaymentMethod: (paymentMethodId: string, setAsDefault?: boolean) =>
    apiClient.post<ApiResponse<void>>('/subscriptions/payment-methods', { paymentMethodId, setAsDefault }),

  removePaymentMethod: (paymentMethodId: string) =>
    apiClient.delete<ApiResponse<void>>(`/subscriptions/payment-methods/${paymentMethodId}`),

  setDefaultPaymentMethod: (paymentMethodId: string) =>
    apiClient.post<ApiResponse<void>>(`/subscriptions/payment-methods/${paymentMethodId}/default`),

  // Invoices
  listInvoices: (params?: PaginationParams & { status?: string }) =>
    apiClient.get<PaginatedResponse<{ id: string; amount: number; status: string; date: string; pdfUrl: string }>>('/subscriptions/invoices', { params }),

  getInvoice: (invoiceId: string) =>
    apiClient.get<ApiResponse<{ id: string; amount: number; status: string; date: string; pdfUrl: string; lines: Array<{ description: string; amount: number; quantity: number }> }>>(`/subscriptions/invoices/${invoiceId}`),

  downloadInvoice: (invoiceId: string) =>
    apiClient.get<Blob>(`/subscriptions/invoices/${invoiceId}/download`, { responseType: 'blob' }),

  // Upcoming invoice
  getUpcomingInvoice: (subscriptionId?: string) =>
    apiClient.get<ApiResponse<{ amount: number; lines: Array<{ description: string; amount: number }>; date: string }>>('/subscriptions/upcoming-invoice', { params: { subscriptionId } }),

  // Usage
  getUsage: (subscriptionId: string, params?: { metric?: string; dateFrom?: string; dateTo?: string }) =>
    apiClient.get<ApiResponse<{ metric: string; current: number; limit: number; period: string }>>(`/subscriptions/${subscriptionId}/usage`, { params }),

  // Stats
  getStats: (params?: { dateFrom?: string; dateTo?: string }) =>
    apiClient.get<ApiResponse<{
      totalSubscriptions: number;
      activeSubscriptions: number;
      mrr: number;
      arr: number;
      churnRate: number;
      ltv: number;
      subscriptionsByPlan: Record<string, number>;
      subscriptionsByStatus: Record<string, number>;
      revenueByPeriod: Array<{ period: string; revenue: number; subscriptions: number }>;
    }>>('/subscriptions/stats', { params }),

  // Export
  export: (params?: SubscriptionFilters & { format?: 'csv' | 'xlsx' }) =>
    apiClient.get<Blob>('/subscriptions/export', { params, responseType: 'blob' }),
};