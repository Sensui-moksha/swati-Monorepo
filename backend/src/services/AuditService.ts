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
}
