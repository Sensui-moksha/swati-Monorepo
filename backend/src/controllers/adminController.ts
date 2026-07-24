import { Response, NextFunction } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../middleware/auth";
import { analyticsService } from "../services/analyticsService";
import { mediaService } from "../services/mediaService";
import { sessionService } from "../services/SessionService";
import { userService } from "../services/UserService";

export class AdminController {
  async getOverview(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const from = req.query.from
        ? new Date(String(req.query.from))
        : undefined;
      const to = req.query.to ? new Date(String(req.query.to)) : undefined;
      const overview = await analyticsService.getOverview({ from, to });
      const userStats = await userService.getUserStats();

      res.json({
        success: true,
        data: {
          analyticsOverview: overview,
          userStats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const stats = await userService.getUserStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async listUsers(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const sortBy = String(req.query.sortBy || "createdAt");
      const sortOrder = String(req.query.sortOrder || "desc");
      const filter = {
        search: req.query.search ? String(req.query.search) : undefined,
        role: req.query.role ? String(req.query.role) : undefined,
        isActive:
          req.query.isActive !== undefined
            ? String(req.query.isActive) === "true"
            : undefined,
        isVerified:
          req.query.isVerified !== undefined
            ? String(req.query.isVerified) === "true"
            : undefined,
      };

      const users = await userService.getUsers(filter, {
        page,
        limit,
        sort: {
          [sortBy]: sortOrder === "asc" ? 1 : -1,
        },
      });

      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async createUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await userService.createUser(req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async getUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await userService.getUserById(id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const updatedUser = await userService.updateUser(id, req.body);
      res.json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      await userService.deleteUser(id);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }

  async activateUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await userService.activateUser(id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async deactivateUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await userService.deactivateUser(id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async verifyUserEmail(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await userService.verifyUserEmail(id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async listUsersWithActiveSessions(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const filter: any = {
        deviceInfo: req.query.deviceInfo
          ? String(req.query.deviceInfo)
          : undefined,
        isActive:
          req.query.isActive !== undefined
            ? String(req.query.isActive) === "true"
            : undefined,
      };
      const users = await sessionService.findUsersWithActiveSessions(filter, {
        page,
        limit,
        sort: { "sessions.lastActive": -1 },
      });
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async getUserSessions(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const sessions = await sessionService.getAllSessions(
        new Types.ObjectId(id),
      );
      res.json({ success: true, data: sessions });
    } catch (error) {
      next(error);
    }
  }

  async getMediaStats(
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const stats = await mediaService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getMediaUsage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const total = req.query.userId ? String(req.query.userId) : undefined;
      const usage = await mediaService.getUsage(total);
      res.json({ success: true, data: usage });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
