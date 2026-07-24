import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { categoryService } from "../services/CategoryService";

function requireParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export class CategoryController {
  async createCategory(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res
        .status(201)
        .json({ success: true, data: await categoryService.createCategory(req.body) });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await categoryService.updateCategory(
          requireParam(req.params.id, "id"),
          req.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await categoryService.deleteCategory(requireParam(req.params.id, "id"));
      res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await categoryService.getCategoryById(requireParam(req.params.id, "id")),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await categoryService.getCategoryBySlug(requireParam(req.params.slug, "slug")),
      });
    } catch (error) {
      next(error);
    }
  }

  async listCategories(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await categoryService.getCategories(
          {},
          {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 20,
          }
        ),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
