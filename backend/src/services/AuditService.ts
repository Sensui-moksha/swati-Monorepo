import { AuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

export enum AuditAction {
  LOGIN = 'LOGIN',
  FAILED_LOGIN = 'FAILED_LOGIN',
  LOGOUT = 'LOGOUT',
  ROLE_CHANGE = 'ROLE_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  DOWNLOAD_FILE = 'DOWNLOAD_FILE',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ADMIN_ACTION = 'ADMIN_ACTION'
}

interface AuditLogPayload {
  userId?: string;
  action: AuditAction;
  resource?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
}

export class AuditService {
  /**
   * Fire-and-forget asynchronous audit logging.
   * Logs to MongoDB structured collection and to Winston logger for file rotation.
   */
  static log(payload: AuditLogPayload): void {
    // 1. Log to fast Winston logger
    logger.info(`AUDIT: ${payload.action}`, payload);

    // 2. Persist to MongoDB for querying/compliance dashboards
    // Using setImmediate to push this off the main event loop
    setImmediate(async () => {
      try {
        await AuditLog.create(payload);
      } catch (error) {
        // Fallback error logging if DB is unreachable
        logger.error('Failed to write audit log to database', { error, payload });
      }
    });
  }

  /**
   * Query audit logs with pagination and filters
   */
  static async queryLogs(
    filter: {
      userId?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
    limit = 50,
    offset = 0
  ) {
    const query: any = {};
    if (filter.userId) query.userId = filter.userId;
    if (filter.action) query.action = filter.action;
    if (filter.startDate || filter.endDate) {
      query.createdAt = {};
      if (filter.startDate) query.createdAt.$gte = filter.startDate;
      if (filter.endDate) query.createdAt.$lte = filter.endDate;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean()
        .exec(),
      AuditLog.countDocuments(query),
    ]);

    return { logs, total, limit, offset };
  }
}

