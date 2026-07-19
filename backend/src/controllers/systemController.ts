import { Request, Response, NextFunction } from "express";
import { systemService } from "../services/SystemService";

export class SystemController {
  async getAppInfo(_req: Request, res: Response, next: NextFunction) {
    try {
      const info = await systemService.getAppInfo();
      res.json({ success: true, data: info });
    } catch (err) {
      next(err);
    }
  }

  async getHealth(_req: Request, res: Response, next: NextFunction) {
    try {
      const health = await systemService.getHealth();
      res.json({ success: true, data: health });
    } catch (err) {
      next(err);
    }
  }

  async getDatabaseStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await systemService.getDatabaseStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  async listSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await systemService.listSettings();
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  async getSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const key = String(req.params.key);
      const setting = await systemService.getSetting(key);
      res.json({ success: true, data: setting });
    } catch (err) {
      next(err);
    }
  }

  async upsertSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const key = String(req.params.key);
      const value = req.body.value;
      const meta = req.body.meta || {};
      const updated = await systemService.upsertSetting(key, value, meta);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async testEmail(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await systemService.testEmail();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const systemController = new SystemController();
