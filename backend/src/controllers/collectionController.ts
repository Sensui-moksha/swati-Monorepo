import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { collectionService } from "../services/collectionService";

export class CollectionController {
  async createCollection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const collection = await collectionService.createCollection(
        req.body,
        req.user?.id,
      );
      res.status(201).json({ success: true, data: collection });
    } catch (error) {
      next(error);
    }
  }

  async getCollection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const collection = await collectionService.getCollectionById(
        req.params.id!,
      );
      res.json({ success: true, data: collection });
    } catch (error) {
      next(error);
    }
  }

  async getCollectionBySlug(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const collection = await collectionService.getCollectionBySlug(
        req.params.slug!,
      );
      res.json({ success: true, data: collection });
    } catch (error) {
      next(error);
    }
  }

  async listCollections(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await collectionService.listCollections(req.query as any, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        sort: req.query.sort as any,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateCollection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const collection = await collectionService.updateCollection(
        req.params.id!,
        req.body,
      );
      res.json({ success: true, data: collection });
    } catch (error) {
      next(error);
    }
  }

  async deleteCollection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await collectionService.deleteCollection(req.params.id!);
      res.json({ success: true, message: "Collection deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async restoreCollection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const collection = await collectionService.restoreCollection(
        req.params.id!,
      );
      res.json({ success: true, data: collection });
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedCollections(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const collections = await collectionService.getFeaturedCollections(
        Number(req.query.limit) || 6,
      );
      res.json({ success: true, data: collections });
    } catch (error) {
      next(error);
    }
  }
}

export const collectionController = new CollectionController();
