import { apiClient } from "../client";
import type { ApiResponse } from "../types";

export interface VersionSummary {
  _id: string;
  entityType: string;
  entityId: string;
  versionNumber: number;
  reason: string;
  checksum: string;
  author?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  diff?: {
    added?: Record<string, any>;
    modified?: Record<string, { from: any; to: any }>;
    deleted?: string[];
  };
  createdAt: string;
}

export interface VersionDetail extends VersionSummary {
  snapshot: Record<string, any>;
}

export interface VersionHistoryResponse {
  versions: VersionSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface VersionDiffResponse {
  entityType: string;
  entityId: string;
  baseVersion: number;
  targetVersion: number;
  diff: {
    added?: Record<string, any>;
    modified?: Record<string, { from: any; to: any }>;
    deleted?: string[];
  };
}

export const versionControlApi = {
  getHistory: (entityType: string, entityId: string, limit = 20, offset = 0) =>
    apiClient.get<ApiResponse<VersionHistoryResponse>>(
      `/v1/versions/${entityType}/${entityId}?limit=${limit}&offset=${offset}`
    ),

  getVersion: (entityType: string, entityId: string, versionNumber: number) =>
    apiClient.get<ApiResponse<VersionDetail>>(
      `/v1/versions/${entityType}/${entityId}/${versionNumber}`
    ),

  getDiff: (entityType: string, entityId: string, v1: number, v2: number) =>
    apiClient.get<ApiResponse<VersionDiffResponse>>(
      `/v1/versions/${entityType}/${entityId}/diff?v1=${v1}&v2=${v2}`
    ),

  createSnapshot: (entityType: string, entityId: string, reason?: string) =>
    apiClient.post<ApiResponse<VersionDetail>>(
      `/v1/versions/${entityType}/${entityId}/snapshot`,
      { reason }
    ),

  rollback: (entityType: string, entityId: string, targetVersion: number, reason?: string) =>
    apiClient.post<ApiResponse<{ entity: any; newVersion: VersionDetail }>>(
      `/v1/versions/${entityType}/${entityId}/rollback`,
      { targetVersion, reason }
    ),

  prune: (entityType: string, entityId: string, keepCount = 30) =>
    apiClient.delete<ApiResponse<{ deletedCount: number; keepCount: number }>>(
      `/v1/versions/${entityType}/${entityId}/prune`,
      { data: { keepCount } }
    ),
};
