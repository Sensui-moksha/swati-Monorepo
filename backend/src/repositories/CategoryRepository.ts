import { Types, FilterQuery, UpdateQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Category, ICategory } from "../models/Category";

export interface CategoryFilter extends FilterQuery<ICategory> {
  search?: string;
  isActive?: boolean;
  parent?: string | Types.ObjectId | null;
}

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor() {
    super(Category);
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return this.model.findOne({ slug });
  }

  async findByName(name: string): Promise<ICategory | null> {
    return this.model.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
  }

  async findWithPagination(
    filter: CategoryFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<ICategory>> {
    const { search, isActive, parent, ...restFilter } = filter;
    const query: FilterQuery<ICategory> = { ...restFilter };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (typeof isActive === "boolean") {
      query.isActive = isActive;
    }

    if (parent !== undefined) {
      if (parent === null) {
        query.parent = { $exists: false };
      } else {
        query.parent =
          parent instanceof Types.ObjectId
            ? parent
            : new Types.ObjectId(parent);
      }
    }

    return super.findWithPagination(query, {
      ...options,
      sort: options.sort || { order: 1, name: 1 },
    });
  }

  async getRootCategories(): Promise<ICategory[]> {
    return this.model
      .find({ parent: { $exists: false }, isActive: true })
      .sort({ order: 1, name: 1 });
  }

  async getChildren(parentId: string | Types.ObjectId): Promise<ICategory[]> {
    return this.model
      .find({ parent: parentId, isActive: true })
      .sort({ order: 1, name: 1 });
  }

  async getCategoryTree(): Promise<ICategory[]> {
    const categories = await this.model
      .find({ isActive: true })
      .sort({ order: 1, name: 1 });
    return this.buildTree(categories);
  }

  private buildTree(
    categories: ICategory[],
    parentId: Types.ObjectId | null = null,
  ): ICategory[] {
    return categories
      .filter((cat) => {
        const catParent = cat.parent as Types.ObjectId | undefined;
        if (parentId === null) {
          return !catParent;
        }
        return catParent?.equals(parentId);
      })
      .map((cat) => ({
        ...cat.toObject(),
        children: this.buildTree(categories, cat._id),
      })) as ICategory[];
  }

  async getActiveCategories(): Promise<ICategory[]> {
    return this.model.find({ isActive: true }).sort({ order: 1, name: 1 });
  }

  async getCategoryWithArticleCount(
    categoryId: string | Types.ObjectId,
  ): Promise<ICategory | null> {
    const category = await this.findById(categoryId);
    if (!category) return null;

    const Article = (await import("../models/Article.js")).Article;
    const count = await Article.countDocuments({
      category: categoryId,
      status: "published",
    });

    return {
      ...category.toObject(),
      articleCount: count,
    } as ICategory & { articleCount: number };
  }

  async getCategoriesWithArticleCounts(): Promise<
    (ICategory & { articleCount: number })[]
  > {
    const categories = await this.getActiveCategories();
    const Article = (await import("../models/Article.js")).Article;

    const counts = await Article.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      counts.map((c: { _id: Types.ObjectId; count: number }) => [
        c._id.toString(),
        c.count,
      ]),
    );

    return categories.map((cat) => ({
      ...cat.toObject(),
      articleCount: countMap.get(cat._id.toString()) || 0,
    }));
  }

  async updateOrder(
    categoryId: string | Types.ObjectId,
    order: number,
  ): Promise<ICategory | null> {
    return this.updateById(categoryId, { order } as UpdateQuery<ICategory>);
  }

  async reorderCategories(
    updates: { id: string | Types.ObjectId; order: number }[],
  ): Promise<void> {
    const bulkOps = updates.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { order },
      },
    }));

    if (bulkOps.length > 0) {
      await this.model.bulkWrite(bulkOps);
    }
  }

  async moveCategory(
    categoryId: string | Types.ObjectId,
    newParentId: string | Types.ObjectId | null,
  ): Promise<ICategory | null> {
    const update: UpdateQuery<ICategory> = newParentId
      ? { parent: newParentId }
      : { $unset: { parent: "" } };

    return this.updateById(categoryId, update);
  }

  async getDescendants(
    categoryId: string | Types.ObjectId,
  ): Promise<ICategory[]> {
    const descendants: ICategory[] = [];
    const findChildren = async (parentId: Types.ObjectId) => {
      const children = await this.model.find({ parent: parentId });
      for (const child of children) {
        descendants.push(child);
        await findChildren(child._id);
      }
    };

    await findChildren(
      categoryId instanceof Types.ObjectId
        ? categoryId
        : new Types.ObjectId(categoryId),
    );
    return descendants;
  }

  async hasChildren(categoryId: string | Types.ObjectId): Promise<boolean> {
    const count = await this.model.countDocuments({ parent: categoryId });
    return count > 0;
  }

  async getCategoryStats(): Promise<{
    total: number;
    active: number;
    withArticles: number;
  }> {
    const Article = (await import("../models/Article.js")).Article;

    const [total, active, withArticles] = await Promise.all([
      this.model.countDocuments(),
      this.model.countDocuments({ isActive: true }),
      Article.distinct("category", { status: "published" }).then(
        (ids: Types.ObjectId[]) => ids.length,
      ),
    ]);

    return { total, active, withArticles };
  }
}

export const categoryRepository = new CategoryRepository();
