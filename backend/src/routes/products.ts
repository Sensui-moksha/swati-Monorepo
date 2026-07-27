import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { Product } from "../models/Product";
import { ProductCategory } from "../models/ProductCategory";

const router = Router();

// GET /v1/products - List products from MongoDB
router.get("/", async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter: any = { isDeleted: false };

    if (req.query.search) {
      filter.name = { $regex: String(req.query.search), $options: "i" };
    }
    if (req.query.status) {
      filter.status = String(req.query.status);
    }
    if (req.query.type) {
      filter.type = String(req.query.type);
    }

    const items = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: items.map((p) => ({ ...p, id: (p as any)._id.toString() })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /v1/products/stats - Product stats from MongoDB
router.get("/stats", async (_req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    const publishedProducts = await Product.countDocuments({ status: "published", isDeleted: false });
    const lowStockProducts = await Product.countDocuments({ inventoryQuantity: { $lte: 10 }, isDeleted: false });
    const outOfStockProducts = await Product.countDocuments({ status: "out_of_stock", isDeleted: false });

    res.json({
      success: true,
      data: {
        totalProducts,
        publishedProducts,
        lowStockProducts,
        outOfStockProducts,
        totalInventoryValue: totalProducts * 499,
        productsByCategory: {},
        productsByType: {},
        topSellingProducts: [],
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /v1/products/categories - Product categories from MongoDB
router.get("/categories", async (_req, res, next) => {
  try {
    const categories = await ProductCategory.find({}).lean();
    res.json({
      success: true,
      data: categories.map((c) => ({ ...c, id: (c as any)._id.toString() })),
      meta: { page: 1, limit: 100, total: categories.length, totalPages: 1 },
    });
  } catch (err) {
    next(err);
  }
});

// GET /v1/products/slug/:slug - Get product by slug from MongoDB
router.get("/slug/:slug", async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "");
    const product = await Product.findOne({ slug, isDeleted: false }).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.json({ success: true, data: { ...product, id: (product as any)._id.toString() } });
  } catch (err) {
    return next(err);
  }
});

// GET /v1/products/:id - Get product by ID from MongoDB
router.get("/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id || "");
    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.json({ success: true, data: { ...product, id: (product as any)._id.toString() } });
  } catch (err) {
    return next(err);
  }
});

// POST /v1/products - Create product in MongoDB
router.post("/", authenticate, authorize("admin", "editor"), async (req, res, next) => {
  try {
    const data = req.body || {};
    const created = await Product.create({
      name: data.name || "New Product",
      slug: data.slug || (data.name ? String(data.name).toLowerCase().replace(/\s+/g, "-") : `prod-${Date.now()}`),
      description: data.description || "Product description",
      type: data.type || "book",
      categoryId: data.categoryId || "660000000000000000000001",
      price: data.price || 0,
      status: data.status || "published",
    });
    res.status(201).json({ success: true, data: { ...created.toObject(), id: created._id.toString() } });
  } catch (err) {
    next(err);
  }
});

// PATCH /v1/products/:id - Update product in MongoDB
router.patch("/:id", authenticate, authorize("admin", "editor"), async (req, res, next) => {
  try {
    const id = String(req.params.id || "");
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true }).lean();
    res.json({ success: true, data: updated ? { ...updated, id: (updated as any)._id.toString() } : null });
  } catch (err) {
    next(err);
  }
});

// DELETE /v1/products/:id - Delete product from MongoDB
router.delete("/:id", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const id = String(req.params.id || "");
    await Product.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
