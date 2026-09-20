import { apiClient } from "../client";
import type { PaginatedResponse, ApiResponse, PaginationParams, Coupon } from "../types";

export const couponsApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Coupon>>("/v1/coupons", { params }),

  get: (id: string) => apiClient.get<ApiResponse<Coupon>>(`/v1/coupons/${id}`),

  getByCode: (code: string) => apiClient.get<ApiResponse<Coupon>>(`/v1/coupons/code/${code}`),

  create: (data: Partial<Coupon>) => apiClient.post<ApiResponse<Coupon>>("/v1/coupons", data),

  update: (id: string, data: Partial<Coupon>) =>
    apiClient.put<ApiResponse<Coupon>>(`/v1/coupons/${id}`, data),

  delete: (id: string) => apiClient.delete<ApiResponse<void>>(`/v1/coupons/${id}`),

  archive: (id: string) => apiClient.post<ApiResponse<void>>(`/v1/coupons/${id}/archive`),

  restore: (id: string) => apiClient.post<ApiResponse<void>>(`/v1/coupons/${id}/restore`),
};
