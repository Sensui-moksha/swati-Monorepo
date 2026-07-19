import { Types, FilterQuery, UpdateQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { User, IUser, IUserSession } from "../models/User";

export interface SessionFilter extends FilterQuery<IUser> {
  userId?: Types.ObjectId;
  isActive?: boolean;
  device?: string;
}

export class SessionRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  /**
   * Create a new session for a user
   */
  async createSession(
    userId: Types.ObjectId,
    session: IUserSession,
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      $push: { sessions: session },
      activeSessionId: session.sessionId,
    } as UpdateQuery<IUser>);
  }

  /**
   * Add a session to a user (alias for createSession)
   */
  async addSession(
    userId: Types.ObjectId,
    session: IUserSession,
  ): Promise<IUser | null> {
    return this.createSession(userId, session);
  }

  /**
   * Get all active sessions for a user
   */
  async getActiveSessions(userId: Types.ObjectId): Promise<IUserSession[]> {
    const user = await this.findById(userId);
    if (!user || !user.sessions) return [];
    const now = new Date();
    return user.sessions.filter((s) => s.expiresAt > now);
  }

  /**
   * Get all sessions for a user (including expired)
   */
  async getAllSessions(userId: Types.ObjectId): Promise<IUserSession[]> {
    const user = await this.findById(userId);
    if (!user || !user.sessions) return [];
    return user.sessions;
  }

  /**
   * Get a specific session by ID
   */
  async getSession(
    userId: Types.ObjectId,
    sessionId: string,
  ): Promise<IUserSession | null> {
    const user = await this.findById(userId);
    if (!user || !user.sessions) return null;
    return user.sessions.find((s) => s.sessionId === sessionId) || null;
  }

  /**
   * Get the active session for a user
   */
  async getActiveSession(userId: Types.ObjectId): Promise<IUserSession | null> {
    const user = await this.findById(userId);
    if (!user || !user.sessions || !user.activeSessionId) return null;
    return (
      user.sessions.find((s) => s.sessionId === user.activeSessionId) || null
    );
  }

  /**
   * Update a session's last active time
   */
  async updateSessionActivity(
    userId: Types.ObjectId,
    sessionId: string,
  ): Promise<IUser | null> {
    return this.model
      .findOneAndUpdate(
        { _id: userId, "sessions.sessionId": sessionId },
        { $set: { "sessions.$.lastActive": new Date() } },
        { new: true },
      )
      .exec();
  }

  /**
   * Update session device info
   */
  async updateSessionInfo(
    userId: Types.ObjectId,
    sessionId: string,
    updates: Partial<IUserSession>,
  ): Promise<IUser | null> {
    const update: UpdateQuery<IUser> = {};
    Object.keys(updates).forEach((key) => {
      update[`sessions.$[elem].${key}`] = (updates as any)[key];
    });
    return this.model
      .findOneAndUpdate(
        { _id: userId, "sessions.sessionId": sessionId },
        { $set: update },
        { arrayFilters: [{ "elem.sessionId": sessionId }], new: true },
      )
      .exec();
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(
    userId: Types.ObjectId,
    sessionId: string,
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      $pull: { sessions: { sessionId } },
      $set: { activeSessionId: null },
    } as UpdateQuery<IUser>);
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllSessions(userId: Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, {
      $set: { sessions: [], activeSessionId: null },
    } as UpdateQuery<IUser>);
  }

  /**
   * Revoke all sessions except the current one
   */
  async revokeOtherSessions(
    userId: Types.ObjectId,
    currentSessionId: string,
  ): Promise<IUser | null> {
    return this.model
      .findOneAndUpdate(
        { _id: userId },
        {
          $pull: { sessions: { sessionId: { $ne: currentSessionId } } },
          $set: { activeSessionId: currentSessionId },
        },
        { new: true },
      )
      .exec();
  }

  /**
   * Remove expired sessions for a user
   */
  async removeExpiredSessions(userId: Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, {
      $pull: { sessions: { expiresAt: { $lt: new Date() } } },
    } as UpdateQuery<IUser>);
  }

  /**
   * Set active session
   */
  async setActiveSession(
    userId: Types.ObjectId,
    sessionId: string,
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      activeSessionId: sessionId,
    } as UpdateQuery<IUser>);
  }

  /**
   * Get active session ID
   */
  async getActiveSessionId(userId: Types.ObjectId): Promise<string | null> {
    const user = await this.findById(userId);
    return user?.activeSessionId || null;
  }

  /**
   * Count active sessions for a user
   */
  async countActiveSessions(userId: Types.ObjectId): Promise<number> {
    const user = await this.findById(userId);
    if (!user || !user.sessions) return 0;
    const now = new Date();
    return user.sessions.filter((s) => s.expiresAt > now).length;
  }

  /**
   * Get total session count for a user
   */
  async getSessionCount(userId: Types.ObjectId): Promise<number> {
    const user = await this.findById(userId);
    if (!user || !user.sessions) return 0;
    return user.sessions.length;
  }

  /**
   * Get active session count for a user (alias for countActiveSessions)
   */
  async getActiveSessionCount(userId: Types.ObjectId): Promise<number> {
    return this.countActiveSessions(userId);
  }

  /**
   * Check if user has too many active sessions
   */
  async hasTooManySessions(
    userId: Types.ObjectId,
    maxSessions: number = 10,
  ): Promise<boolean> {
    const count = await this.countActiveSessions(userId);
    return count >= maxSessions;
  }

  /**
   * Get sessions with pagination
   */
  async getSessionsWithPagination(
    userId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IUserSession>> {
    const user = await this.findById(userId);
    if (!user || !user.sessions) {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const page = options.page || 1;
    const limit = options.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    const sessions = user.sessions.slice(start, end);
    const total = user.sessions.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Find user by session ID
   */
  async findUserBySessionId(sessionId: string): Promise<IUser | null> {
    return this.model.findOne({ "sessions.sessionId": sessionId }).exec();
  }

  /**
   * Find user by active session ID
   */
  async findUserByActiveSessionId(sessionId: string): Promise<IUser | null> {
    return this.model.findOne({ activeSessionId: sessionId }).exec();
  }

  /**
   * Clean up all expired sessions across all users
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.model
      .updateMany(
        {},
        { $pull: { sessions: { expiresAt: { $lt: new Date() } } } },
      )
      .exec();
    return result.modifiedCount;
  }

  /**
   * Get sessions by device type
   */
  async getSessionsByDeviceType(
    userId: Types.ObjectId,
    deviceType: string,
  ): Promise<IUserSession[]> {
    const user = await this.findById(userId);
    if (!user || !user.sessions) return [];
    return user.sessions.filter((s) => s.device?.deviceType === deviceType);
  }

  /**
   * Get sessions by IP
   */
  async getSessionsByIP(
    userId: Types.ObjectId,
    ip: string,
  ): Promise<IUserSession[]> {
    const user = await this.findById(userId);
    if (!user || !user.sessions) return [];
    return user.sessions.filter((s) => s.ip === ip);
  }

  /**
   * Find users with active sessions (for admin)
   */
  async findUsersWithActiveSessions(
    filter: SessionFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IUser>> {
    const { userId, isActive, deviceInfo, ...restFilter } = filter;
    const query: FilterQuery<IUser> = { ...restFilter };

    if (userId) {
      query._id = userId;
    }

    if (typeof isActive === "boolean") {
      query.isActive = isActive;
    }

    if (deviceInfo) {
      query["sessions.device.deviceType"] = {
        $regex: deviceInfo,
        $options: "i",
      };
    }

    // Only users with at least one active session
    query["sessions.0"] = { $exists: true };
    query["sessions.expiresAt"] = { $gt: new Date() };

    return this.findWithPagination(query, options);
  }

  /**
   * Get session statistics for a user
   */
  async getSessionStats(userId: Types.ObjectId): Promise<{
    total: number;
    active: number;
    expired: number;
    devices: string[];
  }> {
    const user = await this.findById(userId);
    if (!user || !user.sessions) {
      return { total: 0, active: 0, expired: 0, devices: [] };
    }

    const now = new Date();
    const active = user.sessions.filter((s) => s.expiresAt > now);
    const expired = user.sessions.filter((s) => s.expiresAt <= now);
    const devices = [
      ...new Set(
        user.sessions.map((s) => s.device?.deviceType).filter(Boolean),
      ),
    ] as string[];

    return {
      total: user.sessions.length,
      active: active.length,
      expired: expired.length,
      devices,
    };
  }
}

export const sessionRepository = new SessionRepository();
