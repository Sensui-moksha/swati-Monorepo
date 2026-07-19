import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { publisherService } from "../services/publisherService";

export class PublisherController {
  async createPublisher(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const publisher = await publisherService.createPublisher(
        req.body,
        req.user?.id,
      );
      res.status(201).json({ success: true, data: publisher });
    } catch (error) {
      next(error);
    }
  }

  async getPublisher(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const publisher = await publisherService.getPublisherById(req.params.id!);
      res.json({ success: true, data: publisher });
    } catch (error) {
      next(error);
    }
  }

  async getPublisherBySlug(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const publisher = await publisherService.getPublisherBySlug(
        req.params.slug!,
      );
      res.json({ success: true, data: publisher });
    } catch (error) {
      next(error);
    }
  }

  async listPublishers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await publisherService.listPublishers(req.query as any, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        sort: req.query.sort as any,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updatePublisher(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const publisher = await publisherService.updatePublisher(
        req.params.id!,
        req.body,
      );
      res.json({ success: true, data: publisher });
    } catch (error) {
      next(error);
    }
  }

  async deletePublisher(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await publisherService.deletePublisher(req.params.id!);
      res.json({ success: true, message: "Publisher deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async restorePublisher(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const publisher = await publisherService.restorePublisher(req.params.id!);
      res.json({ success: true, data: publisher });
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedPublishers(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const publishers = await publisherService.getFeaturedPublishers(
        Number(req.query.limit) || 8,
      );
      res.json({ success: true, data: publishers });
    } catch (error) {
      next(error);
    }
  }
}

export const publisherController = new PublisherController();
