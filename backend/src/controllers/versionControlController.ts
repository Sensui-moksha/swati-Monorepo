import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { VersionControlService } from "../services/VersionControlService";
import { VersionableEntityType } from "../models/EntityVersion";

const VALID_ENTITIES = new Set<string>([
  "Article",
  "Book",
  "MagazineIssue",
  "Publication",
  "Media",
  "Setting",
]);

function requireParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function parseEntityType(raw: string | undefined): VersionableEntityType {
  const val = requireParam(raw, "entityType");
  if (!VALID_ENTITIES.has(val)) {
    throw new Error(`Invalid entity type: ${val}. Must be one of ${Array.from(VALID_ENTITIES).join(", ")}`);
  }
  return val as VersionableEntityType;
}


export class VersionControlController {
  async getHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = parseEntityType(req.params.entityType);
      const entityId = requireParam(req.params.entityId, "entityId");
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const history = await VersionControlService.getHistory(
        entityType,
        entityId,
        limit,
        offset
      );
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async getVersion(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = parseEntityType(req.params.entityType);
      const entityId = requireParam(req.params.entityId, "entityId");
      const versionStr = requireParam(req.params.versionNumber, "versionNumber");
      const versionNumber = parseInt(versionStr);

      if (isNaN(versionNumber)) {
        res.status(400).json({ success: false, message: "Valid versionNumber required" });
        return;
      }

      const version = await VersionControlService.getVersion(
        entityType,
        entityId,
        versionNumber
      );
      if (!version) {
        res.status(404).json({ success: false, message: "Version not found" });
        return;
      }

      res.json({ success: true, data: version });
    } catch (error) {
      next(error);
    }
  }

  async getDiff(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = parseEntityType(req.params.entityType);
      const entityId = requireParam(req.params.entityId, "entityId");
      const v1 = parseInt(req.query.v1 as string);
      const v2 = parseInt(req.query.v2 as string);

      if (isNaN(v1) || isNaN(v2)) {
        res.status(400).json({
          success: false,
          message: "Query parameters v1 and v2 must be valid numbers",
        });
        return;
      }

      const diff = await VersionControlService.getDiff(entityType, entityId, v1, v2);
      res.json({ success: true, data: diff });
    } catch (error) {
      next(error);
    }
  }

  async createSnapshot(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = parseEntityType(req.params.entityType);
      const entityId = requireParam(req.params.entityId, "entityId");
      const authorId = req.user?._id;
      const reason = req.body?.reason || "Manual snapshot";

      const snapshot = await VersionControlService.createSnapshot(
        entityType,
        entityId,
        authorId,
        reason
      );
      res.status(201).json({ success: true, data: snapshot });
    } catch (error) {
      next(error);
    }
  }

  async rollback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = parseEntityType(req.params.entityType);
      const entityId = requireParam(req.params.entityId, "entityId");
      const targetVersion = parseInt(req.body?.targetVersion);
      const authorId = req.user?._id;
      const reason = req.body?.reason;

      if (isNaN(targetVersion)) {
        res.status(400).json({
          success: false,
          message: "targetVersion is required and must be a number",
        });
        return;
      }

      const result = await VersionControlService.rollback(
        entityType,
        entityId,
        targetVersion,
        authorId,
        reason
      );
      res.json({
        success: true,
        message: `Successfully rolled back ${entityType} to v${targetVersion}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async prune(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = parseEntityType(req.params.entityType);
      const entityId = requireParam(req.params.entityId, "entityId");
      const keepCount = parseInt(req.body?.keepCount) || 30;

      const deletedCount = await VersionControlService.pruneVersions(
        entityType,
        entityId,
        keepCount
      );
      res.json({
        success: true,
        message: `Pruned ${deletedCount} old versions`,
        data: { deletedCount, keepCount },
      });
    } catch (error) {
      next(error);
    }
  }
}


export const versionControlController = new VersionControlController();
