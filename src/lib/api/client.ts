// Base API Client with authentication, interceptors, and error handling

import type { AuthTokens, User, ApiResponse, PaginatedResponse, PaginationParams } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const TOKEN_KEY = 'swati_auth_tokens';
const USER_KEY = 'swati_user';

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    try {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        const tokens: AuthTokens = JSON.parse(stored);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveTokensToStorage(tokens: AuthTokens): void {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    } catch {
      // Ignore storage errors
    }
  }

  private clearTokensFromStorage(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.saveTokensToStorage(tokens);
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.clearTokensFromStorage();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const tokens = await this.refreshPromise;
      return tokens;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<AuthTokens> {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const tokens: AuthTokens = {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    };

    this.setTokens(tokens);
    return tokens;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 - try to refresh token
    if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/')) {
      try {
        await this.refreshAccessToken();
        // Retry with new token
        (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      } catch {
        this.clearTokens();
        // Redirect to login if needed
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Authentication expired');
      }
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: unknown;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = isJson && typeof data === 'object' && data !== null && 'error' in data
        ? (data as { error: string }).error
        : `HTTP ${response.status}: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  }

  // GET request
  async get<T>(
    endpoint: string,
    options?: { params?: Record<string, unknown>; responseType?: 'json' | 'blob' }
  ): Promise<T> {
    const params = options?.params;
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request<T>(fullEndpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: { headers?: HeadersInit }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: options?.headers,
    });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: { headers?: HeadersInit }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers: options?.headers,
    });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: { headers?: HeadersInit }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers: options?.headers,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: { data?: unknown }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: options?.data ? JSON.stringify(options.data) : undefined,
    });
  }

  // Upload file
  async upload<T>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress((event.loaded / event.total) * 100);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch {
            resolve(xhr.responseText as T);
          }
        } else {
          reject(new ApiError(`Upload failed: ${xhr.statusText}`, xhr.status));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiError('Upload failed', 0));
      });

      xhr.addEventListener('abort', () => {
        reject(new ApiError('Upload aborted', 0));
      });

      if (this.accessToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
      }

      xhr.open('POST', `${this.baseURL}${endpoint}`);
      xhr.send(formData);
    });
  }

  // Download file
  async download(endpoint: string, filename?: string): Promise<void> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new ApiError('Download failed', response.status);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Helper functions for common patterns
export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string; rememberMe?: boolean }) =>
      apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', credentials),
    
    register: (data: { email: string; password: string; name: string }) =>
      apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/register', data),
    
    logout: () => apiClient.post<ApiResponse<void>>('/auth/logout'),
    
    refresh: () => apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh'),
    
    me: () => apiClient.get<ApiResponse<User>>('/auth/me'),
    
    forgotPassword: (email: string) =>
      apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email }),
    
    resetPassword: (token: string, password: string) =>
      apiClient.post<ApiResponse<void>>('/auth/reset-password', { token, password }),
    
    changePassword: (currentPassword: string, newPassword: string) =>
      apiClient.post<ApiResponse<void>>('/auth/change-password', { currentPassword, newPassword }),
    
    verifyEmail: (token: string) =>
      apiClient.post<ApiResponse<void>>('/auth/verify-email', { token }),
    
    resendVerification: () =>
      apiClient.post<ApiResponse<void>>('/auth/resend-verification'),
    
    setup2FA: () =>
      apiClient.get<ApiResponse<{ secret: string; qrCode: string; backupCodes: string[] }>>('/auth/2fa/setup'),
    
    verify2FA: (token: string) =>
      apiClient.post<ApiResponse<AuthTokens>>('/auth/2fa/verify', { token }),
    
    disable2FA: (password: string) =>
      apiClient.post<ApiResponse<void>>('/auth/2fa/disable', { password }),
    
    getSessions: () =>
      apiClient.get<ApiResponse<{ sessions: Array<{ id: string; userAgent: string; ip: string; lastActive: string; current: boolean }> }>>('/auth/sessions'),
    
    revokeSession: (sessionId: string) =>
      apiClient.delete<ApiResponse<void>>(`/auth/sessions/${sessionId}`),
    
    revokeAllSessions: () =>
      apiClient.delete<ApiResponse<void>>('/auth/sessions'),
  },

  // Users
  users: {
    getProfile: () => apiClient.get<ApiResponse<User>>('/users/profile'),
    
    updateProfile: (data: Partial<User>) =>
      apiClient.patch<ApiResponse<User>>('/users/profile', data),
    
    updateAvatar: (file: File, onProgress?: (progress: number) => void) =>
      apiClient.upload<ApiResponse<{ avatar: string }>>('/users/avatar', file, onProgress),
    
    deleteAvatar: () =>
      apiClient.delete<ApiResponse<void>>('/users/avatar'),
    
    getPreferences: () =>
      apiClient.get<ApiResponse<Record<string, unknown>>>('/users/preferences'),
    
    updatePreferences: (preferences: Record<string, unknown>) =>
      apiClient.patch<ApiResponse<Record<string, unknown>>>('/users/preferences', preferences),
    
    getNotifications: (params?: PaginationParams) =>
      apiClient.get<ApiResponse<PaginatedResponse<{ id: string; type: string; title: string; message: string; isRead: boolean; createdAt: string }>>>('/users/notifications', params as Record<string, unknown> | undefined),
    
    markNotificationRead: (id: string) =>
      apiClient.patch<ApiResponse<void>>(`/users/notifications/${id}/read`),
    
    markAllNotificationsRead: () =>
      apiClient.patch<ApiResponse<void>>('/users/notifications/read-all'),
    
    deleteNotification: (id: string) =>
      apiClient.delete<ApiResponse<void>>(`/users/notifications/${id}`),
  },
};

export default apiClient;