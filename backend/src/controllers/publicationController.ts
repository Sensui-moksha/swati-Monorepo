import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { publicationService } from "../services/publicationService";

export class PublicationController {
  async createPublication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const publication = await publicationService.createPublication(
        req.body,
        req.user?.id,
      );
      res.status(201).json({ success: true, data: publication });
    } catch (error) {
      next(error);
    }
  }

  async getPublication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const publication = await publicationService.getPublicationById(
        req.params.id!,
      );
      res.json({ success: true, data: publication });
    } catch (error) {
      next(error);
    }
  }

  async getPublicationBySlug(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const publication = await publicationService.getPublicationBySlug(
        req.params.slug!,
      );
      res.json({ success: true, data: publication });
    } catch (error) {
      next(error);
    }
  }

  async listPublications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await publicationService.listPublications(
        req.query as any,
        {
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 20,
          sort: req.query.sort as any,
        },
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updatePublication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const publication = await publicationService.updatePublication(
        req.params.id!,
        req.body,
      );
      res.json({ success: true, data: publication });
    } catch (error) {
      next(error);
    }
  }

  async deletePublication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await publicationService.deletePublication(req.params.id!);
      res.json({ success: true, message: "Publication deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async restorePublication(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const publication = await publicationService.restorePublication(
        req.params.id!,
      );
      res.json({ success: true, data: publication });
    } catch (error) {
      next(error);
    }
  }

  async getLatestPublications(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const publications = await publicationService.getLatestPublications(
        Number(req.query.limit) || 6,
      );
      res.json({ success: true, data: publications });
    } catch (error) {
      next(error);
    }
  }

  async getArchivedPublications(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const publications = await publicationService.getArchivedPublications(
        Number(req.query.limit) || 12,
      );
      res.json({ success: true, data: publications });
    } catch (error) {
      next(error);
    }
  }
}

export const publicationController = new PublicationController();
