import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { webhookService } from "../services/webhookService";

export class WebhookController {
  async receive(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await webhookService.logWebhook(
        String(req.body.providerName || "unknown"),
        String(req.body.eventType || "unknown"),
        req.body.payload || req.body,
        req.headers as Record<string, unknown>,
        "received",
      );
      res.status(501).json({ success: false, message: "Not Implemented" });
    } catch (error) {
      next(error);
    }
  }

  async verify(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await webhookService.logWebhook(
        String(req.body.providerName || "unknown"),
        String(req.body.eventType || "unknown"),
        req.body.payload || req.body,
        req.headers as Record<string, unknown>,
        "ignored",
      );
      res.status(501).json({ success: false, message: "Not Implemented" });
    } catch (error) {
      next(error);
    }
  }

  async listLogs(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await webhookService.listLogs(
          String(req.query.providerName || "unknown"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const webhookController = new WebhookController();
