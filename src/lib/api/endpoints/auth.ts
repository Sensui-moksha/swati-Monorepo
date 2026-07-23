import { apiClient } from '../client';
import type { User, ApiResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  passwordConfirm: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const authApi = {
  // Login
  login: (credentials: LoginCredentials) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials),

  // Register
  register: (data: RegisterData) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  // Logout
  logout: (refreshToken?: string) =>
    apiClient.post<ApiResponse<void>>('/auth/logout', { refreshToken }),

  // Refresh token
  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; expiresIn: number }>>('/auth/refresh', { refreshToken }),

  // Forgot password
  forgotPassword: (data: ForgotPasswordData) =>
    apiClient.post<ApiResponse<void>>('/auth/forgot-password', data),

  // Reset password
  resetPassword: (data: ResetPasswordData) =>
    apiClient.post<ApiResponse<void>>('/auth/reset-password', data),

  // Verify email
  verifyEmail: (data: VerifyEmailData) =>
    apiClient.post<ApiResponse<void>>('/auth/verify-email', data),

  // Resend verification email
  resendVerificationEmail: (email: string) =>
    apiClient.post<ApiResponse<void>>('/auth/resend-verification', { email }),

  // Change password (authenticated)
  changePassword: (data: ChangePasswordData) =>
    apiClient.post<ApiResponse<void>>('/auth/change-password', data),

  // Get current user
  me: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),

  // Social login
  socialLogin: (provider: 'google' | 'facebook' | 'apple' | 'github', token: string) =>
    apiClient.post<ApiResponse<AuthResponse>>(`/auth/social/${provider}`, { token }),

  // Link social account
  linkSocialAccount: (provider: 'google' | 'facebook' | 'apple' | 'github', token: string) =>
    apiClient.post<ApiResponse<void>>(`/auth/social/${provider}/link`, { token }),

  // Unlink social account
  unlinkSocialAccount: (provider: 'google' | 'facebook' | 'apple' | 'github') =>
    apiClient.delete<ApiResponse<void>>(`/auth/social/${provider}/unlink`),

  // Two-factor authentication
  enable2FA: () =>
    apiClient.post<ApiResponse<{ secret: string; qrCode: string; backupCodes: string[] }>>('/auth/2fa/enable'),

  verify2FA: (token: string) =>
    apiClient.post<ApiResponse<{ backupCodes: string[] }>>('/auth/2fa/verify', { token }),

  disable2FA: (password: string) =>
    apiClient.post<ApiResponse<void>>('/auth/2fa/disable', { password }),

  regenerateBackupCodes: () =>
    apiClient.post<ApiResponse<{ backupCodes: string[] }>>('/auth/2fa/backup-codes/regenerate'),

  // Sessions
  listSessions: () =>
    apiClient.get<ApiResponse<Array<{ id: string; device: string; ip: string; location: string; lastActive: string; current: boolean }>>>('/auth/sessions'),

  revokeSession: (sessionId: string) =>
    apiClient.delete<ApiResponse<void>>(`/auth/sessions/${sessionId}`),

  revokeAllSessions: () =>
    apiClient.delete<ApiResponse<void>>('/auth/sessions'),

  // API Keys (for developers)
  listApiKeys: () =>
    apiClient.get<ApiResponse<Array<{ id: string; name: string; key: string; lastUsed: string | null; createdAt: string }>>>('/auth/api-keys'),

  createApiKey: (name: string, permissions?: string[]) =>
    apiClient.post<ApiResponse<{ id: string; key: string }>>('/auth/api-keys', { name, permissions }),

  revokeApiKey: (keyId: string) =>
    apiClient.delete<ApiResponse<void>>(`/auth/api-keys/${keyId}`),
};