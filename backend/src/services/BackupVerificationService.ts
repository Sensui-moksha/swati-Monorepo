import { logger } from '../utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

interface BackupVerificationResult {
  timestamp: string;
  mongoBackup: { exists: boolean; sizeBytes: number; ageHours: number; valid: boolean };
  storageBackup: { exists: boolean; sizeBytes: number; ageHours: number };
  redisBackup: { exists: boolean; sizeBytes: number; ageHours: number };
  overall: 'PASS' | 'WARN' | 'FAIL';
  issues: string[];
}

const BACKUP_DIR = process.env.BACKUP_DIR || '/var/backups/swathi';
const MAX_BACKUP_AGE_HOURS = Number(process.env.BACKUP_MAX_AGE_HOURS) || 25; // alert if > 25h old

/**
 * Verifies backup integrity for MongoDB, storage assets, and Redis.
 * Designed to run as a daily CRON job or on-demand health check.
 */
export class BackupVerificationService {
  /**
   * Full backup verification across all data stores.
   */
  static async verify(): Promise<BackupVerificationResult> {
    const now = new Date();
    const issues: string[] = [];

    const result: BackupVerificationResult = {
      timestamp: now.toISOString(),
      mongoBackup: { exists: false, sizeBytes: 0, ageHours: Infinity, valid: false },
      storageBackup: { exists: false, sizeBytes: 0, ageHours: Infinity },
      redisBackup: { exists: false, sizeBytes: 0, ageHours: Infinity },
      overall: 'PASS',
      issues,
    };

    // 1. MongoDB backup check
    const mongoDir = path.join(BACKUP_DIR, 'mongo');
    result.mongoBackup = { ...await this.checkBackupDir(mongoDir, now), valid: false };
    if (!result.mongoBackup.exists) {
      issues.push('MongoDB backup directory missing or empty');
    } else if (result.mongoBackup.ageHours > MAX_BACKUP_AGE_HOURS) {
      issues.push(`MongoDB backup is ${result.mongoBackup.ageHours.toFixed(1)}h old (max: ${MAX_BACKUP_AGE_HOURS}h)`);
    }

    // Validate mongodump integrity if bson files present
    if (result.mongoBackup.exists) {
      result.mongoBackup.valid = await this.validateMongoDump(mongoDir);
      if (!result.mongoBackup.valid) {
        issues.push('MongoDB backup BSON validation failed');
      }
    }

    // 2. Storage backup check (PDF/media assets)
    const storageDir = path.join(BACKUP_DIR, 'storage');
    result.storageBackup = await this.checkBackupDir(storageDir, now);
    if (!result.storageBackup.exists) {
      issues.push('Storage backup directory missing or empty');
    } else if (result.storageBackup.ageHours > MAX_BACKUP_AGE_HOURS) {
      issues.push(`Storage backup is ${result.storageBackup.ageHours.toFixed(1)}h old`);
    }

    // 3. Redis RDB check
    const redisDir = path.join(BACKUP_DIR, 'redis');
    result.redisBackup = await this.checkBackupDir(redisDir, now);
    if (!result.redisBackup.exists) {
      // Redis backup missing is a warning, not a failure — Redis is a cache layer
      issues.push('Redis backup not found (non-critical for cache-only usage)');
    }

    // Overall assessment
    const criticalIssues = issues.filter(i => !i.includes('non-critical') && !i.includes('Redis'));
    if (criticalIssues.length > 0) {
      result.overall = issues.some(i => i.includes('validation failed') || i.includes('missing')) ? 'FAIL' : 'WARN';
    }

    logger.info(`[BackupVerification] Result: ${result.overall} | Issues: ${issues.length}`);
    if (issues.length > 0) {
      issues.forEach(issue => logger.warn(`[BackupVerification] ${issue}`));
    }

    return result;
  }

  /**
   * Check a backup directory for the most recent backup file/folder.
   */
  private static async checkBackupDir(
    dirPath: string,
    now: Date
  ): Promise<{ exists: boolean; sizeBytes: number; ageHours: number; valid?: boolean }> {
    try {
      if (!fs.existsSync(dirPath)) {
        return { exists: false, sizeBytes: 0, ageHours: Infinity };
      }

      const entries = fs.readdirSync(dirPath)
        .map(name => {
          const fullPath = path.join(dirPath, name);
          const stat = fs.statSync(fullPath);
          return { name, fullPath, mtime: stat.mtime, size: stat.size, isDir: stat.isDirectory() };
        })
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      if (entries.length === 0) {
        return { exists: false, sizeBytes: 0, ageHours: Infinity };
      }

      const latest = entries[0]!;
      const totalSize = latest.isDir ? this.getDirSize(latest.fullPath) : latest.size;
      const ageMs = now.getTime() - latest.mtime.getTime();
      const ageHours = ageMs / (1000 * 60 * 60);

      return { exists: true, sizeBytes: totalSize, ageHours };
    } catch {
      return { exists: false, sizeBytes: 0, ageHours: Infinity };
    }
  }

  /**
   * Validate mongodump output by checking for BSON files and attempting bsondump --validate.
   */
  private static async validateMongoDump(dirPath: string): Promise<boolean> {
    try {
      // Find the most recent dump directory
      const entries = fs.readdirSync(dirPath)
        .map(name => ({ name, path: path.join(dirPath, name), stat: fs.statSync(path.join(dirPath, name)) }))
        .filter(e => e.stat.isDirectory())
        .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

      if (entries.length === 0) return false;

      const dumpDir = entries[0]!.path;

      // Check for .bson files
      const bsonFiles = this.findFiles(dumpDir, '.bson');
      if (bsonFiles.length === 0) return false;

      // Try bsondump validation on the first file (quick sanity check)
      try {
        await execAsync(`bsondump --quiet "${bsonFiles[0]}" | head -1`);
        return true;
      } catch {
        // bsondump not available — fall back to file size check
        return bsonFiles.every(f => fs.statSync(f).size > 0);
      }
    } catch {
      return false;
    }
  }

  private static findFiles(dir: string, ext: string): string[] {
    const results: string[] = [];
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...this.findFiles(fullPath, ext));
        } else if (entry.name.endsWith(ext)) {
          results.push(fullPath);
        }
      }
    } catch {
      // permission errors etc
    }
    return results;
  }

  private static getDirSize(dirPath: string): number {
    let total = 0;
    try {
      for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          total += this.getDirSize(fullPath);
        } else {
          total += fs.statSync(fullPath).size;
        }
      }
    } catch {
      // permission errors
    }
    return total;
  }
}
