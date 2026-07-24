import { apiClient } from '../client';
import type {
  User,
  Address,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export interface UserFilters extends PaginationParams {
  role?: 'customer' | 'admin' | 'editor' | 'author' | 'subscriber';
  status?: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt' | 'orderCount' | 'totalSpent';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserFilters['role'];
  status?: UserFilters['status'];
  metadata?: Record<string, unknown>;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: string;
}

export interface AddressData {
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export const usersApi = {
  // Users
  list: (params?: UserFilters) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<User>>(`/users/${id}`),

  getCurrent: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),

  create: (data: CreateUserData) =>
    apiClient.post<ApiResponse<User>>('/users', data),

  update: (data: UpdateUserData) =>
    apiClient.patch<ApiResponse<User>>(`/users/${data.id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/users/${id}`),

  // Bulk operations
  bulkUpdate: (ids: string[], data: Partial<User>) =>
    apiClient.patch<ApiResponse<User[]>>('/users/bulk', { ids, data }),

  bulkDelete: (ids: string[]) =>
    apiClient.delete<ApiResponse<void>>('/users/bulk', { data: { ids } }),

  // Profile
  updateProfile: (data: Partial<User>) =>
    apiClient.patch<ApiResponse<User>>('/users/me/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<ApiResponse<void>>('/users/me/password', { currentPassword, newPassword }),

  // Avatar
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post<ApiResponse<{ url: string }>>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteAvatar: () =>
    apiClient.delete<ApiResponse<void>>('/users/me/avatar'),

  // Addresses
  listAddresses: () =>
    apiClient.get<ApiResponse<Address[]>>('/users/me/addresses'),

  getAddress: (id: string) =>
    apiClient.get<ApiResponse<Address>>(`/users/me/addresses/${id}`),

  createAddress: (data: AddressData) =>
    apiClient.post<ApiResponse<Address>>('/users/me/addresses', data),

  updateAddress: (id: string, data: Partial<AddressData>) =>
    apiClient.patch<ApiResponse<Address>>(`/users/me/addresses/${id}`, data),

  deleteAddress: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/users/me/addresses/${id}`),

  setDefaultAddress: (id: string, type: 'shipping' | 'billing') =>
    apiClient.post<ApiResponse<void>>(`/users/me/addresses/${id}/default`, { type }),

  // Admin: manage user addresses
  adminListAddresses: (userId: string) =>
    apiClient.get<ApiResponse<Address[]>>(`/users/${userId}/addresses`),

  adminCreateAddress: (userId: string, data: AddressData) =>
    apiClient.post<ApiResponse<Address>>(`/users/${userId}/addresses`, data),

  adminUpdateAddress: (userId: string, addressId: string, data: Partial<AddressData>) =>
    apiClient.patch<ApiResponse<Address>>(`/users/${userId}/addresses/${addressId}`, data),

  adminDeleteAddress: (userId: string, addressId: string) =>
    apiClient.delete<ApiResponse<void>>(`/users/${userId}/addresses/${addressId}`),

  // Preferences
  getPreferences: () =>
    apiClient.get<ApiResponse<Record<string, unknown>>>('/users/me/preferences'),

  updatePreferences: (preferences: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<Record<string, unknown>>>('/users/me/preferences', preferences),

  // Notifications
  getNotifications: (params?: PaginationParams & { unreadOnly?: boolean }) =>
    apiClient.get<PaginatedResponse<{ id: string; type: string; title: string; message: string; read: boolean; data?: Record<string, unknown>; createdAt: string }>>('/users/me/notifications', { params }),

  markNotificationRead: (id: string) =>
    apiClient.post<ApiResponse<void>>(`/users/me/notifications/${id}/read`),

  markAllNotificationsRead: () =>
    apiClient.post<ApiResponse<void>>('/users/me/notifications/read-all'),

  // Stats
  getStats: (params?: { dateFrom?: string; dateTo?: string }) =>
    apiClient.get<ApiResponse<{
      totalUsers: number;
      activeUsers: number;
      newUsers: number;
      usersByRole: Record<string, number>;
      usersByStatus: Record<string, number>;
      registrationsByPeriod: Array<{ period: string; count: number }>;
    }>>('/admin/stats/users', { params }),

  // Export
  export: (params?: UserFilters & { format?: 'csv' | 'xlsx' }) =>
    apiClient.get<Blob>('/users/export', { params, responseType: 'blob' }),

  // Impersonation (admin only)
  impersonate: (userId: string) =>
    apiClient.post<ApiResponse<{ token: string; user: User }>>(`/users/${userId}/impersonate`),

  stopImpersonation: () =>
    apiClient.post<ApiResponse<void>>('/users/impersonation/stop'),
};