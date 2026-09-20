import { apiClient } from "../client";
import type { ApiResponse } from "../types";

export const settingsApi = {
  getSettings: (category: string) =>
    apiClient.get<ApiResponse<any>>(`/v1/admin/settings/${category}`),
  updateSettings: (category: string, data: any) =>
    apiClient.put<ApiResponse<any>>(`/v1/admin/settings/${category}`, data),
};
