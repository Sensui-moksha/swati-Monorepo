import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';
import { Role } from '../models/Role';
import { AuditService, AuditAction } from '../services/AuditService';

/**
 * Middleware to check if the authenticated user has a specific permission.
 * Validates against the roles embedded in the JWT or loaded from DB.
 */
export const requirePermission = (requiredPermission: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return next(ApiError.unauthorized('Authentication required'));
      }

      // For Zero Trust: always fetch the latest role from DB rather than trusting the JWT payload
      // because permissions might have been revoked in real-time.
      const roles = await Role.find({ name: { $in: user.roles || ['guest'] } }).lean();
      
      let hasPermission = false;
      for (const role of roles) {
        if (role.permissions.includes(requiredPermission) || role.permissions.includes('*')) {
          hasPermission = true;
          break;
        }
      }

      if (!hasPermission) {
        AuditService.log({
          userId: user.id,
          action: AuditAction.ADMIN_ACTION, // Or a generic ACCESS_DENIED
          details: { reason: 'Missing permission', requiredPermission },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
        });
        return next(ApiError.forbidden(`Missing required permission: ${requiredPermission}`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validates resource-level ownership or admin override
 */
export const requireResourceOwnership = (resourceIdParam: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const resourceId = req.params[resourceIdParam];

    if (!user) return next(ApiError.unauthorized());

    // Allow if user is admin
    if (user.roles?.includes('admin')) {
      return next();
    }

    // Check if the resource belongs to the user
    // This is generic. In a real app, you'd check the DB if the resource's ownerId === user.id
    if (resourceId !== user.id) {
      return next(ApiError.forbidden('You do not have ownership of this resource'));
    }

    next();
  };
};
