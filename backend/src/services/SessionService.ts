import { Types } from "mongoose";
import { sessionRepository } from "../repositories/SessionRepository";
import { IUserSession } from "../models/User";
import {
  PaginationOptions,
  PaginatedResult,
} from "../repositories/BaseRepository";

export interface SessionFilter {
  userId?: Types.ObjectId;
  isActive?: boolean;
  deviceType?: string;
}

export interface CreateSessionData {
  userId: Types.ObjectId;
  sessionId: string;
  ip: string;
  userAgent: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: [number, number];
  };
  expiresAt: Date;
}

export interface UpdateSessionData {
  lastActive?: Date;
  ip?: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: [number, number];
  };
  device?: {
    userAgent?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
  };
}

export class SessionService {
  /**
   * Create a new session for a user
   */
  async createSession(data: CreateSessionData): Promise<IUserSession> {
    const session: IUserSession = {
      sessionId: data.sessionId,
      ip: data.ip,
      userAgent: data.userAgent,
      device: {
        deviceType: data.deviceType,
        browser: data.browser,
        os: data.os,
      },
      location: data.location,
      createdAt: new Date(),
      lastActive: new Date(),
      expiresAt: data.expiresAt,
    };

    await sessionRepository.addSession(data.userId, session);
    return session;
  }

  /**
   * Get all active sessions for a user
   */
  async getActiveSessions(userId: Types.ObjectId): Promise<IUserSession[]> {
    return sessionRepository.getActiveSessions(userId);
  }

  /**
   * Get all sessions (including expired) for a user
   */
  async getAllSessions(userId: Types.ObjectId): Promise<IUserSession[]> {
    return sessionRepository.getAllSessions(userId);
  }

  /**
   * Get all sessions for a user (alias for getAllSessions)
   */
  async getUserSessions(userId: Types.ObjectId): Promise<IUserSession[]> {
    return this.getAllSessions(userId);
  }

  /**
   * Get a specific session by ID
   */
  async getSession(
    userId: Types.ObjectId,
    sessionId: string,
  ): Promise<IUserSession | null> {
    return sessionRepository.getSession(userId, sessionId);
  }

  /**
   * Get the active session for a user
   */
  async getActiveSession(userId: Types.ObjectId): Promise<IUserSession | null> {
    return sessionRepository.getActiveSession(userId);
  }

  /**
   * Update session activity timestamp
   */
  async updateSessionActivity(
    userId: Types.ObjectId,
    sessionId: string,
  ): Promise<void> {
    await sessionRepository.updateSessionActivity(userId, sessionId);
  }

  /**
   * Update session information
   */
  async updateSessionInfo(
    userId: Types.ObjectId,
    sessionId: string,
    data: UpdateSessionData,
  ): Promise<void> {
    // Map UpdateSessionData to Partial<IUserSession> for the repository
    const updates: Partial<IUserSession> = {};
    if (data.lastActive !== undefined) updates.lastActive = data.lastActive;
    if (data.ip !== undefined) updates.ip = data.ip;
    if (data.location !== undefined) {
      // location is not directly in IUserSession, but we could store it in device or location
      // For now, we'll skip location as it's not in the IUserSession interface
    }
    if (data.device !== undefined) {
      if (data.device.userAgent !== undefined)
        updates.userAgent = data.device.userAgent;
      if (data.device.deviceType !== undefined) {
        updates.device = {
          ...updates.device,
          deviceType: data.device.deviceType,
        } as IUserSession["device"];
      }
      // browser and os are not in IUserSession interface
    }
    await sessionRepository.updateSessionInfo(userId, sessionId, updates);
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(
    userId: Types.ObjectId,
    sessionId: string,
  ): Promise<void> {
    await sessionRepository.revokeSession(userId, sessionId);
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllSessions(userId: Types.ObjectId): Promise<void> {
    await sessionRepository.revokeAllSessions(userId);
  }

  /**
   * Revoke all sessions except the current one
   */
  async revokeOtherSessions(
    userId: Types.ObjectId,
    currentSessionId: string,
  ): Promise<void> {
    await sessionRepository.revokeOtherSessions(userId, currentSessionId);
  }

  /**
   * Remove expired sessions for a user
   */
  async removeExpiredSessions(userId: Types.ObjectId): Promise<void> {
    await sessionRepository.removeExpiredSessions(userId);
  }

  /**
   * Set the active session for a user
   */
  async setActiveSession(
    userId: Types.ObjectId,
    sessionId: string,
  ): Promise<void> {
    await sessionRepository.setActiveSession(userId, sessionId);
  }

  /**
   * Get session count for a user
   */
  async getSessionCount(userId: Types.ObjectId): Promise<number> {
    return sessionRepository.getSessionCount(userId);
  }

  /**
   * Get active session count for a user
   */
  async getActiveSessionCount(userId: Types.ObjectId): Promise<number> {
    return sessionRepository.getActiveSessionCount(userId);
  }

  /**
   * Check if user has too many active sessions
   */
  async hasTooManySessions(
    userId: Types.ObjectId,
    maxSessions: number = 10,
  ): Promise<boolean> {
    return sessionRepository.hasTooManySessions(userId, maxSessions);
  }

  /**
   * Get sessions with pagination
   */
  async getSessionsWithPagination(
    userId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IUserSession>> {
    return sessionRepository.getSessionsWithPagination(userId, options);
  }

  async findUsersWithActiveSessions(
    filter: SessionFilter = {},
    options: PaginationOptions = {},
  ) {
    return sessionRepository.findUsersWithActiveSessions(filter, options);
  }

  /**
   * Find user by session ID
   */
  async findUserBySessionId(sessionId: string) {
    return sessionRepository.findUserBySessionId(sessionId);
  }

  /**
   * Find user by active session ID
   */
  async findUserByActiveSessionId(sessionId: string) {
    return sessionRepository.findUserByActiveSessionId(sessionId);
  }

  /**
   * Clean up all expired sessions across all users
   */
  async cleanupExpiredSessions(): Promise<number> {
    return sessionRepository.cleanupExpiredSessions();
  }

  /**
   * Get sessions by device type
   */
  async getSessionsByDeviceType(
    userId: Types.ObjectId,
    deviceType: string,
  ): Promise<IUserSession[]> {
    return sessionRepository.getSessionsByDeviceType(userId, deviceType);
  }

  /**
   * Get sessions by IP
   */
  async getSessionsByIP(
    userId: Types.ObjectId,
    ip: string,
  ): Promise<IUserSession[]> {
    return sessionRepository.getSessionsByIP(userId, ip);
  }

  /**
   * Validate session and return user if valid
   */
  async validateSession(sessionId: string) {
    const user = await sessionRepository.findUserByActiveSessionId(sessionId);
    if (!user) {
      return null;
    }

    const session = user.sessions?.find((s) => s.sessionId === sessionId);
    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return { user, session };
  }
}

export const sessionService = new SessionService();
