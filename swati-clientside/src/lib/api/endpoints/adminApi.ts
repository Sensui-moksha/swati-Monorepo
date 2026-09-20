import { apiClient } from "../client";
import type {
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
  AdminUser,
  AdminSession,
  AdminStats,
  MediaAsset,
} from "../types";

export const adminApi = {
  // Users
  listUsers: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<AdminUser>>("/v1/admin/users", { params }),

  getUser: (id: string) => apiClient.get<ApiResponse<AdminUser>>(`/v1/admin/users/${id}`),

  updateUser: (id: string, data: Partial<AdminUser>) =>
    apiClient.put<ApiResponse<AdminUser>>(`/v1/admin/users/${id}`, data),

  createUser: (data: any) => apiClient.post<ApiResponse<AdminUser>>("/v1/admin/users", data),

  deleteUser: (id: string) => apiClient.delete<ApiResponse<void>>(`/v1/admin/users/${id}`),

  activateUser: (id: string) => apiClient.post<ApiResponse<void>>(`/v1/admin/users/${id}/activate`),

  deactivateUser: (id: string) =>
    apiClient.post<ApiResponse<void>>(`/v1/admin/users/${id}/deactivate`),

  // Roles/Permissions (Using generic paths as placeholder, adjust based on actual routes if they differ)
  listRoles: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<any>>("/v1/admin/roles", { params }),

  listStaff: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<AdminUser>>("/v1/admin/staff", { params }),

  // Dashboard & Stats
  getDashboardOverview: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<any>>("/v1/admin/dashboard/overview", { params }),

  getUserStats: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<AdminStats>>("/v1/admin/stats/users", { params }),

  // Media (Admin specific)
  getMediaStats: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<any>>("/v1/admin/media/stats", { params }),

  getMediaUsage: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<any>>("/v1/admin/media/usage", { params }),

  listMedia: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<MediaAsset>>("/media", { params }), // From API_ROUTES.md /api/media

  // Misc admin tables (Mock placeholders for tables that don't have explicit documented endpoints but might fall under standard CRUD)
  listCampaigns: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<any>>("/v1/admin/campaigns", { params }),

  listArchive: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<any>>("/v1/admin/archive", { params }),

  listSupportTickets: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<any>>("/v1/admin/support", { params }),

  listNotifications: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<any>>("/v1/admin/notifications", { params }),

  listTrending: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<any>>("/v1/admin/trending", { params }),

  listWorkspace: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<any>>("/v1/admin/workspace", { params }),

  listGeneric: (entity: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<any>>(`/v1/admin/${entity}`, { params }),

  createGeneric: (entity: string, data: any) =>
    apiClient.post<ApiResponse<any>>(`/v1/admin/${entity}`, data),

  updateGeneric: (entity: string, id: string, data: any) =>
    apiClient.put<ApiResponse<any>>(`/v1/admin/${entity}/${id}`, data),

  deleteGeneric: (entity: string, id: string) =>
    apiClient.delete<ApiResponse<any>>(`/v1/admin/${entity}/${id}`),

  getReportPreview: (params: { source: string; dims: string[]; metrics: string[] }) =>
    apiClient.get<ApiResponse<any[]>>("/v1/admin/reports/preview", { params }),
};
