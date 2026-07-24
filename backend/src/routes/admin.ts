import { Router } from "express";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { adminController } from "../controllers/adminController";
import { adminSchemas } from "../validators/adminValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/admin/dashboard/overview:
 *   get:
 *     summary: Get admin dashboard overview
 *     tags: [Admin]
 */
router.get(
  "/dashboard/overview",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.dashboardQuery),
  adminController.getOverview.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/stats/users:
 *   get:
 *     summary: Get user statistics for admin
 *     tags: [Admin]
 */
router.get(
  "/stats/users",
  authenticate,
  authorize("admin"),
  adminController.getUserStats.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: List users for admin management
 *     tags: [Admin]
 */
router.get(
  "/users",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userList),
  adminController.listUsers.bind(adminController),
);
router.post(
  "/users",
  authenticate,
  authorize("admin"),
  adminController.createUser.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Admin]
 */
router.get(
  "/users/:id",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userById),
  adminController.getUser.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Admin]
 */
router.put(
  "/users/:id",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userUpdate),
  adminController.updateUser.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Admin]
 */
router.delete(
  "/users/:id",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userById),
  adminController.deleteUser.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}/activate:
 *   post:
 *     summary: Activate a user account
 *     tags: [Admin]
 */
router.post(
  "/users/:id/activate",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userById),
  adminController.activateUser.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}/deactivate:
 *   post:
 *     summary: Deactivate a user account
 *     tags: [Admin]
 */
router.post(
  "/users/:id/deactivate",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userById),
  adminController.deactivateUser.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}/verify-email:
 *   post:
 *     summary: Verify a user's email manually
 *     tags: [Admin]
 */
router.post(
  "/users/:id/verify-email",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userById),
  adminController.verifyUserEmail.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/sessions/active:
 *   get:
 *     summary: List users with active sessions
 *     tags: [Admin]
 */
router.get(
  "/sessions/active",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.activeSessions),
  adminController.listUsersWithActiveSessions.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/users/{id}/sessions:
 *   get:
 *     summary: Get all sessions for a user
 *     tags: [Admin]
 */
router.get(
  "/users/:id/sessions",
  authenticate,
  authorize("admin"),
  validate(adminSchemas.userById),
  adminController.getUserSessions.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/media/stats:
 *   get:
 *     summary: Get media usage and storage stats
 *     tags: [Admin]
 */
router.get(
  "/media/stats",
  authenticate,
  authorize("admin"),
  adminController.getMediaStats.bind(adminController),
);

/**
 * @swagger
 * /api/v1/admin/media/usage:
 *   get:
 *     summary: Get total media storage usage
 *     tags: [Admin]
 */
router.get(
  "/media/usage",
  authenticate,
  authorize("admin"),
  adminController.getMediaUsage.bind(adminController),
);

// Admin Settings routes
router.get("/settings/:category", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const category = String(req.params.category || "");
    const { Setting } = await import("../models/Setting.js");
    const settingDoc = await Setting.findOne({ key: `settings_${category}` });
    if (settingDoc) {
      res.json({ success: true, data: settingDoc.value });
      return;
    }
    const capCat = category ? category.charAt(0).toUpperCase() + category.slice(1) : "General";
    res.json({
      success: true,
      data: {
        category,
        fields: [
          { id: "1", label: `${capCat} Setting 1`, value: "Default Value 1" },
          { id: "2", label: `${capCat} Setting 2`, value: "Default Value 2" },
        ],
      },
    });
  } catch (err) {
    next(err);
  }
});

router.put("/settings/:category", authenticate, authorize("admin"), async (req: AuthRequest, res, next) => {
  try {
    const category = String(req.params.category || "");
    const { Setting } = await import("../models/Setting.js");
    const settingDoc = await Setting.findOneAndUpdate(
      { key: `settings_${category}` },
      { value: req.body, type: "json", updatedBy: req.user?._id?.toString() },
      { upsert: true, new: true },
    );
    res.json({ success: true, data: settingDoc?.value ?? req.body });
  } catch (err) {
    next(err);
  }
});

// Admin Reports Preview route
router.get("/reports/preview", authenticate, authorize("admin"), (_req, res) => {
  res.json({ success: true, data: [] });
});

// Dynamic Admin Entity Handler for admin entity management
router.get("/:entity", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const { entity } = req.params;
    let items: any[] = [];
    let total = 0;

    if (entity === "books") {
      const { Book } = await import("../models/Book.js");
      items = await Book.find({}).sort({ createdAt: -1 }).limit(20).lean();
      total = await Book.countDocuments();
      items = items.map((b: any) => ({ ...b, id: b._id.toString(), name: b.title }));
    } else if (entity === "publications") {
      const { Publication } = await import("../models/Publication.js");
      items = await Publication.find({}).sort({ createdAt: -1 }).limit(20).lean();
      total = await Publication.countDocuments();
      items = items.map((p: any) => ({ ...p, id: p._id.toString() }));
    } else if (entity === "articles") {
      const { Article } = await import("../models/Article.js");
      items = await Article.find({}).sort({ createdAt: -1 }).limit(20).lean();
      total = await Article.countDocuments();
      items = items.map((a: any) => ({ ...a, id: a._id.toString(), name: a.title }));
    } else if (entity === "categories") {
      const { Category } = await import("../models/Category.js");
      items = await Category.find({}).sort({ createdAt: -1 }).limit(20).lean();
      total = await Category.countDocuments();
      items = items.map((c: any) => ({ ...c, id: c._id.toString() }));
    } else if (entity === "authors") {
      const { Author } = await import("../models/Author.js");
      items = await Author.find({}).sort({ createdAt: -1 }).limit(20).lean();
      total = await Author.countDocuments();
      items = items.map((a: any) => ({ ...a, id: a._id.toString() }));
    } else if (entity === "orders" || entity === "payments") {
      const { CommerceOrder } = await import("../models/CommerceOrder.js");
      items = await CommerceOrder.find({}).sort({ createdAt: -1 }).limit(20).populate("user", "fullName email name").lean();
      total = await CommerceOrder.countDocuments();
      items = items.map((o: any) => ({ ...o, id: o._id.toString(), name: o.orderNumber }));
    } else if (entity === "staff" || entity === "roles") {
      const { User } = await import("../models/User.js");
      const roleFilter = entity === "staff" ? { role: { $in: ["admin", "editor", "publisher", "support"] } } : {};
      items = await User.find(roleFilter).sort({ createdAt: -1 }).limit(20).lean();
      total = await User.countDocuments(roleFilter);
      items = items.map((u: any) => ({ ...u, id: u._id.toString(), name: u.fullName || u.username }));
    } else if (entity === "workspace" || entity === "tasks") {
      const { Article } = await import("../models/Article.js");
      items = await Article.find({}).sort({ updatedAt: -1 }).limit(20).populate("author", "fullName email").lean();
      total = await Article.countDocuments();
      items = items.map((a: any) => ({
        id: a._id.toString(),
        name: a.title,
        status: a.status || "published",
        owner: (a.author as any)?.fullName || "Editorial Team",
        updatedAt: a.updatedAt || a.createdAt,
      }));
    } else if (entity === "notifications") {
      const { Article } = await import("../models/Article.js");
      items = await Article.find({}).sort({ createdAt: -1 }).limit(10).lean();
      total = items.length;
      items = items.map((a: any) => ({
        id: a._id.toString(),
        type: "Content Release",
        title: `New Article: ${a.title}`,
        message: `Article published in category ${a.categoryId || "General"}`,
        date: new Date(a.createdAt).toLocaleDateString(),
        status: "Delivered",
      }));
    }

    res.json({
      data: items,
      meta: {
        page: 1,
        limit: 20,
        total,
        totalPages: Math.ceil(total / 20) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
