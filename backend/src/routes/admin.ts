import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
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

export default router;
