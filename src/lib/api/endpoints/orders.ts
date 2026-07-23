import { apiClient } from '../client';
import type {
  Order,
  OrderItem,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export interface CreateOrderData {
  items: Array<{
    productType: 'book' | 'subscription' | 'issue';
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddressId?: string;
  billingAddressId?: string;
  paymentMethodId?: string;
  couponCode?: string;
  notes?: string;
}

export interface OrderFilters extends PaginationParams {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  dateFrom?: string;
  dateTo?: string;
}

export const ordersApi = {
  // Orders
  list: (params?: OrderFilters) =>
    apiClient.get<PaginatedResponse<Order>>('/orders', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/orders/${id}`),

  getByNumber: (orderNumber: string) =>
    apiClient.get<ApiResponse<Order>>(`/orders/number/${orderNumber}`),

  create: (data: CreateOrderData) =>
    apiClient.post<ApiResponse<Order>>('/orders', data),

  update: (id: string, data: Partial<Order>) =>
    apiClient.patch<ApiResponse<Order>>(`/orders/${id}`, data),

  cancel: (id: string, reason?: string) =>
    apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason }),

  // Order items
  getItems: (orderId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<OrderItem>>(`/orders/${orderId}/items`, { params }),

  // Status updates
  updateStatus: (id: string, status: Order['status'], note?: string) =>
    apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status, note }),

  updatePaymentStatus: (id: string, paymentStatus: Order['paymentStatus'], transactionId?: string) =>
    apiClient.patch<ApiResponse<Order>>(`/orders/${id}/payment-status`, { paymentStatus, transactionId }),

  // Shipping
  addTracking: (id: string, trackingNumber: string, carrier: string, trackingUrl?: string) =>
    apiClient.post<ApiResponse<Order>>(`/orders/${id}/tracking`, { trackingNumber, carrier, trackingUrl }),

  // Refunds
  requestRefund: (id: string, reason: string, amount?: number, items?: string[]) =>
    apiClient.post<ApiResponse<Order>>(`/orders/${id}/refund`, { reason, amount, items }),

  processRefund: (id: string, refundId: string, action: 'approve' | 'reject', note?: string) =>
    apiClient.post<ApiResponse<Order>>(`/orders/${id}/refunds/${refundId}/${action}`, { note }),

  // Invoices
  getInvoice: (orderId: string) =>
    apiClient.get<ApiResponse<{ url: string; pdfUrl: string }>>(`/orders/${orderId}/invoice`),

  downloadInvoice: (orderId: string) =>
    apiClient.get<Blob>(`/orders/${orderId}/invoice/download`, { responseType: 'blob' }),

  // Stats
  getStats: (params?: { dateFrom?: string; dateTo?: string }) =>
    apiClient.get<ApiResponse<{
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      ordersByStatus: Record<string, number>;
      revenueByPeriod: Array<{ period: string; revenue: number; orders: number }>;
    }>>('/orders/stats', { params }),

  // Export
  export: (params?: OrderFilters & { format?: 'csv' | 'xlsx' }) =>
    apiClient.get<Blob>('/orders/export', { params, responseType: 'blob' }),
};