import { apiClient } from "../client";
import type {
  Subscription,
  SubscriptionPlan,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from "../types";

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
  status?: "active" | "past_due" | "cancelled" | "trialing" | "incomplete" | "paused";
  planId?: string;
}

const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-weekly",
    name: "Swathi Weekly Pass",
    slug: "swathi-weekly-pass",
    description: "Unlimited access to Swathi Weekly digital editions and serials library.",
    price: 299,
    currency: "INR",
    interval: "month",
    features: [
      "Full digital access to Swathi Weekly",
      "Serials & novel archives access",
      "Exclusive access to Swathi Originals",
      "Cross-device reading sync",
    ],
    publicationIds: [],
    isActive: true,
    isPopular: false,
    sortOrder: 1,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "plan-monthly",
    name: "Swathi Monthly Pass",
    slug: "swathi-monthly-pass",
    description: "All-inclusive pass for Weekly and Monthly archives and special editions.",
    price: 1999,
    currency: "INR",
    interval: "year",
    features: [
      "Full digital access to Weekly & Monthly editions",
      "Complete back-catalog archive access",
      "Exclusive access to Swathi Originals",
      "Downloadable offline PDF reading",
      "Ad-free digital reading experience",
    ],
    publicationIds: [],
    isActive: true,
    isPopular: true,
    sortOrder: 2,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "plan-lifetime",
    name: "Swathi Lifetime Pass",
    slug: "swathi-lifetime-pass",
    description: "Lifetime unlimited digital access and exclusive physical releases.",
    price: 9999,
    currency: "INR",
    interval: "lifetime",
    features: [
      "Lifetime unlimited digital access",
      "Access to all current and future publications",
      "Exclusive hardcover special publications",
      "Patron badge & direct line to editorial team",
    ],
    publicationIds: [],
    isActive: true,
    isPopular: false,
    sortOrder: 3,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
];

export const subscriptionsApi = {
  // Plans
  listPlans: async (params?: PaginationParams & { active?: boolean; type?: string }) => {
    try {
      const res = await apiClient.get<PaginatedResponse<SubscriptionPlan>>("/plans", { params });
      if (res.data && res.data.length > 0) return res;
    } catch (_) {}
    return {
      data: FALLBACK_PLANS,
      meta: {
        page: 1,
        limit: 10,
        total: FALLBACK_PLANS.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  },

  getPlan: async (id: string) => {
    try {
      const res = await apiClient.get<ApiResponse<SubscriptionPlan>>(`/plans/${id}`);
      if (res.data) return res;
    } catch (_) {}
    const found = FALLBACK_PLANS.find((p) => p.id === id || p.slug === id) || FALLBACK_PLANS[0];
    return { success: true, data: found };
  },

  createPlan: (data: Partial<SubscriptionPlan>) =>
    apiClient.post<ApiResponse<SubscriptionPlan>>("/plans", data),

  updatePlan: (id: string, data: Partial<SubscriptionPlan>) =>
    apiClient.put<ApiResponse<SubscriptionPlan>>(`/plans/${id}`, data),

  deletePlan: (id: string) => apiClient.delete<ApiResponse<void>>(`/plans/${id}`),

  // Subscriptions
  list: (params?: SubscriptionFilters) =>
    apiClient.get<PaginatedResponse<Subscription>>("/subscriptions", { params }),

  get: (id: string) => apiClient.get<ApiResponse<Subscription>>(`/subscriptions/${id}`),

  getCurrent: () => apiClient.get<ApiResponse<Subscription | null>>("/subscriptions/current"),

  create: (data: CreateSubscriptionData) =>
    apiClient.post<ApiResponse<Subscription>>("/subscriptions", data),

  update: (id: string, data: UpdateSubscriptionData) =>
    apiClient.patch<ApiResponse<Subscription>>(`/subscriptions/${id}`, data),

  cancel: (id: string, immediately?: boolean, reason?: string) =>
    apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/cancel`, {
      immediately,
      reason,
    }),

  resume: (id: string) => apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/resume`),

  pause: (id: string, resumeAt?: string) =>
    apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/pause`, { resumeAt }),

  // Payment methods
  listPaymentMethods: () =>
    apiClient.get<
      ApiResponse<
        Array<{ id: string; type: string; brand: string; last4: string; isDefault: boolean }>
      >
    >("/subscriptions/payment-methods"),

  addPaymentMethod: (paymentMethodId: string, setAsDefault?: boolean) =>
    apiClient.post<ApiResponse<void>>("/subscriptions/payment-methods", {
      paymentMethodId,
      setAsDefault,
    }),

  removePaymentMethod: (paymentMethodId: string) =>
    apiClient.delete<ApiResponse<void>>(`/subscriptions/payment-methods/${paymentMethodId}`),

  setDefaultPaymentMethod: (paymentMethodId: string) =>
    apiClient.post<ApiResponse<void>>(`/subscriptions/payment-methods/${paymentMethodId}/default`),

  // Invoices
  listInvoices: (params?: PaginationParams & { status?: string }) =>
    apiClient.get<
      PaginatedResponse<{
        id: string;
        amount: number;
        status: string;
        date: string;
        pdfUrl: string;
      }>
    >("/subscriptions/invoices", { params }),

  getInvoice: (invoiceId: string) =>
    apiClient.get<
      ApiResponse<{
        id: string;
        amount: number;
        status: string;
        date: string;
        pdfUrl: string;
        lines: Array<{ description: string; amount: number; quantity: number }>;
      }>
    >(`/subscriptions/invoices/${invoiceId}`),

  downloadInvoice: (invoiceId: string) =>
    apiClient.get<Blob>(`/subscriptions/invoices/${invoiceId}/download`, { responseType: "blob" }),

  // Upcoming invoice
  getUpcomingInvoice: (subscriptionId?: string) =>
    apiClient.get<
      ApiResponse<{
        amount: number;
        lines: Array<{ description: string; amount: number }>;
        date: string;
      }>
    >("/subscriptions/upcoming-invoice", { params: { subscriptionId } }),

  // Usage
  getUsage: (
    subscriptionId: string,
    params?: { metric?: string; dateFrom?: string; dateTo?: string },
  ) =>
    apiClient.get<ApiResponse<{ metric: string; current: number; limit: number; period: string }>>(
      `/subscriptions/${subscriptionId}/usage`,
      { params },
    ),

  // Stats
  getStats: (params?: { dateFrom?: string; dateTo?: string }) =>
    apiClient.get<
      ApiResponse<{
        totalSubscriptions: number;
        activeSubscriptions: number;
        mrr: number;
        arr: number;
        churnRate: number;
        ltv: number;
        subscriptionsByPlan: Record<string, number>;
        subscriptionsByStatus: Record<string, number>;
        revenueByPeriod: Array<{ period: string; revenue: number; subscriptions: number }>;
      }>
    >("/subscriptions/stats", { params }),

  // Export
  export: (params?: SubscriptionFilters & { format?: "csv" | "xlsx" }) =>
    apiClient.get<Blob>("/subscriptions/export", { params, responseType: "blob" }),
};
