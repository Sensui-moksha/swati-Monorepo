import { apiClient } from "../client";
import type { ApiResponse } from "../types";

export interface DRMTokenResponse {
  token: string;
  expiresAt: number;
  watermarkId: string;
  watermarkText: string;
  streamUrl: string;
}

export interface RegisteredDevice {
  _id: string;
  deviceId: string;
  deviceType: "mobile" | "tablet" | "desktop" | "e-reader" | "other";
  deviceName: string;
  ipAddress: string;
  isActive: boolean;
  registeredAt: string;
  lastActiveAt: string;
}

export const drmApi = {
  requestToken: (bookId: string, deviceName?: string) => {
    const deviceId =
      typeof window !== "undefined"
        ? localStorage.getItem("swathi_device_id") ||
          (() => {
            const id = `dev-${Math.random().toString(36).slice(2, 11)}`;
            localStorage.setItem("swathi_device_id", id);
            return id;
          })()
        : "ssr-device";

    return apiClient.post<ApiResponse<DRMTokenResponse>>("/pdf/drm/token", {
      bookId,
      deviceId,
      deviceName: deviceName || "Reader Browser",
    });
  },

  rotateToken: (token: string) =>
    apiClient.post<ApiResponse<DRMTokenResponse>>("/pdf/drm/rotate", { token }),

  listDevices: () => apiClient.get<ApiResponse<RegisteredDevice[]>>("/pdf/drm/devices"),

  deauthorizeDevice: (deviceId: string) =>
    apiClient.delete<ApiResponse<{ success: boolean; message: string }>>(
      `/pdf/drm/devices/${deviceId}`
    ),
};
