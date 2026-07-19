import { Types } from "mongoose";
import { categoryRepository } from "../repositories";
import { ApiError } from "../middleware/errorHandler";
import { ICategory } from "../models/Category";

export interface CreateCategoryInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parent?: string | Types.ObjectId;
  isActive?: boolean;
  order?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  parent?: string | Types.ObjectId | null;
  isActive?: boolean;
  order?: number;
}

export interface CategoryWithArticleCount extends Omit<
  ICategory,
  "articleCount"
> {
  articleCount: number;
}

export interface CategoryTreeNode extends ICategory {
  children: CategoryTreeNode[];
}

export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  rootCategories: number;
}

class CategoryService {
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async createCategory(data: CreateCategoryInput): Promise<ICategory> {
    const existingByName = await categoryRepository.findByName(data.name);
    if (existingByName) {
      throw ApiError.conflict("Category with this name already exists");
    }

    const slug = this.generateSlug(data.name);
    const existingBySlug = await categoryRepository.findBySlug(slug);
    if (existingBySlug) {
      throw ApiError.conflict("Category with this slug already exists");
    }

    if (data.parent) {
      const parentCategory = await categoryRepository.findById(data.parent);
      if (!parentCategory) {
        throw ApiError.notFound("Parent category not found");
      }
    }

    const categoryData = {
      ...data,
      slug,
      parent: data.parent ? new Types.ObjectId(data.parent) : undefined,
      isActive: data.isActive ?? true,
      order: data.order ?? 0,
    };

    return categoryRepository.create(categoryData);
  }

  async getCategoryById(id: string | Types.ObjectId): Promise<ICategory> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw ApiError.notFound("Category not found");
    }
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<ICategory> {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw ApiError.notFound("Category not found");
    }
    return category;
  }

  async getCategories(
    filter: {
      search?: string;
      isActive?: boolean;
      parent?: string | Types.ObjectId | null;
    } = {},
    options: {
      page?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
    } = {},
  ) {
    return categoryRepository.findWithPagination(filter, options);
  }

  async getAllCategories(
    filter: {
      search?: string;
      isActive?: boolean;
      parent?: string | Types.ObjectId | null;
    } = {},
  ): Promise<ICategory[]> {
    return categoryRepository
      .findWithPagination(filter, { limit: 1000 })
      .then((r) => r.data);
  }

  async getActiveCategories(): Promise<ICategory[]> {
    return categoryRepository.getActiveCategories();
  }

  async getRootCategories(): Promise<ICategory[]> {
    return categoryRepository.getRootCategories();
  }

  async getChildren(parentId: string | Types.ObjectId): Promise<ICategory[]> {
    return categoryRepository.getChildren(parentId);
  }

  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    return categoryRepository.getCategoryTree() as Promise<CategoryTreeNode[]>;
  }

  async getCategoryWithArticleCount(
    id: string | Types.ObjectId,
  ): Promise<CategoryWithArticleCount> {
    const category = await categoryRepository.getCategoryWithArticleCount(id);
    if (!category) {
      throw ApiError.notFound("Category not found");
    }
    return {
      ...category,
      articleCount: category.articleCount ?? 0,
    } as CategoryWithArticleCount;
  }

  async getCategoriesWithArticleCounts(): Promise<CategoryWithArticleCount[]> {
    const categories =
      await categoryRepository.getCategoriesWithArticleCounts();
    return categories.map((cat) => ({
      ...cat,
      articleCount: cat.articleCount ?? 0,
    })) as CategoryWithArticleCount[];
  }

  async updateCategory(
    id: string | Types.ObjectId,
    data: UpdateCategoryInput,
  ): Promise<ICategory> {
    const category = await this.getCategoryById(id);

    if (data.name && data.name !== category.name) {
      const existingByName = await categoryRepository.findByName(data.name);
      if (existingByName && !existingByName._id.equals(category._id)) {
        throw ApiError.conflict("Category with this name already exists");
      }
    }

    if (data.parent !== undefined) {
      if (data.parent === null) {
        // Moving to root level - handled below
      } else {
        const parentCategory = await categoryRepository.findById(data.parent);
        if (!parentCategory) {
          throw ApiError.notFound("Parent category not found");
        }
        // Prevent circular reference
        if (parentCategory._id.equals(category._id)) {
          throw ApiError.badRequest("Category cannot be its own parent");
        }
        // Check if new parent is a descendant of this category
        const descendants = await categoryRepository.getDescendants(
          category._id,
        );
        const descendantIds = descendants.map((d) => d._id.toString());
        if (descendantIds.includes(data.parent.toString())) {
          throw ApiError.badRequest(
            "Cannot move category to its own descendant",
          );
        }
      }
    }

    const updateData: Partial<ICategory> = {
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      isActive: data.isActive,
      sortOrder: data.order,
    };
    if (data.name) {
      updateData.slug = this.generateSlug(data.name);
      const existingBySlug = await categoryRepository.findBySlug(
        updateData.slug,
      );
      if (existingBySlug && !existingBySlug._id.equals(category._id)) {
        throw ApiError.conflict("Category with this slug already exists");
      }
    }
    if (data.parent !== undefined) {
      if (data.parent === null) {
        // Use $unset to remove parent field
        const updated = await categoryRepository.updateById(id, {
          $unset: { parent: "" },
        });
        if (!updated) {
          throw ApiError.notFound("Category not found");
        }
        return updated;
      } else {
        updateData.parent = new Types.ObjectId(data.parent);
      }
    }

    const updated = await categoryRepository.updateById(id, updateData);
    if (!updated) {
      throw ApiError.notFound("Category not found");
    }
    return updated;
  }

  async deleteCategory(id: string | Types.ObjectId): Promise<void> {
    await this.getCategoryById(id);

    // Check if category has children
    const children = await categoryRepository.getChildren(id);
    if (children.length > 0) {
      throw ApiError.badRequest(
        "Cannot delete category with children. Move or delete children first.",
      );
    }

    // Check if category has articles
    const Article = (await import("../models/Article.js")).Article;
    const articleCount = await Article.countDocuments({ category: id });
    if (articleCount > 0) {
      throw ApiError.badRequest(
        "Cannot delete category with articles. Reassign or delete articles first.",
      );
    }

    await categoryRepository.deleteById(id);
  }

  async hardDeleteCategory(id: string | Types.ObjectId): Promise<void> {
    await this.getCategoryById(id);
    await categoryRepository.deleteById(id);
  }

  async reorderCategories(
    updates: { id: string | Types.ObjectId; order: number }[],
  ): Promise<void> {
    await categoryRepository.reorderCategories(updates);
  }

  async moveCategory(
    categoryId: string | Types.ObjectId,
    newParentId: string | Types.ObjectId | null,
  ): Promise<ICategory> {
    const category = await this.getCategoryById(categoryId);

    if (newParentId !== null) {
      const parentCategory = await categoryRepository.findById(newParentId);
      if (!parentCategory) {
        throw ApiError.notFound("Parent category not found");
      }
      if (parentCategory._id.equals(category._id)) {
        throw ApiError.badRequest("Category cannot be its own parent");
      }
      const descendants = await categoryRepository.getDescendants(category._id);
      const descendantIds = descendants.map((d) => d._id.toString());
      if (descendantIds.includes(newParentId.toString())) {
        throw ApiError.badRequest("Cannot move category to its own descendant");
      }
    }

    return categoryRepository.moveCategory(
      categoryId,
      newParentId,
    ) as Promise<ICategory>;
  }

  async getDescendants(
    categoryId: string | Types.ObjectId,
  ): Promise<ICategory[]> {
    return categoryRepository.getDescendants(categoryId);
  }

  async getCategoryStats(): Promise<CategoryStats> {
    const [total, active, inactive, rootCategories] = await Promise.all([
      categoryRepository.count(),
      categoryRepository.count({ isActive: true }),
      categoryRepository.count({ isActive: false }),
      categoryRepository.count({ parent: { $exists: false } }),
    ]);

    return { total, active, inactive, rootCategories };
  }
}

export const categoryService = new CategoryService();
