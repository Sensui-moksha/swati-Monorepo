import { Router } from "express";
import { favoriteController } from "../controllers/favoriteController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createFavoriteSchema,
  favoriteQuerySchema,
  paramIdSchema,
} from "../validators/favorites";

const router = Router();

/**
 * @swagger
 * /api/v1/favorites:
 *   post:
 *     summary: Add to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resourceId, type, resourceTitle]
 *             properties:
 *               resourceId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [book, publication, magazine_issue, author, collection]
 *               resourceTitle:
 *                 type: string
 *               resourceImage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Added to favorites
 *   get:
 *     summary: Get favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of favorites
 */
router.post(
  "/",
  authenticate,
  validate(createFavoriteSchema),
  favoriteController.addFavorite.bind(favoriteController),
);
router.get(
  "/",
  authenticate,
  validate(favoriteQuerySchema),
  favoriteController.getFavorites.bind(favoriteController),
);

/**
 * @swagger
 * /api/v1/favorites/check/{resourceId}:
 *   get:
 *     summary: Check if resource is favorited
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite status
 */
router.get(
  "/check/:resourceId",
  authenticate,
  validate(paramIdSchema),
  favoriteController.isFavorite.bind(favoriteController),
);

/**
 * @swagger
 * /api/v1/favorites/count:
 *   get:
 *     summary: Get favorite count
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorite count
 */
router.get(
  "/count",
  authenticate,
  favoriteController.getFavoriteCount.bind(favoriteController),
);

/**
 * @swagger
 * /api/v1/favorites/toggle/{resourceId}:
 *   post:
 *     summary: Toggle favorite status
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               resourceTitle:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favorite toggled
 */
router.post(
  "/toggle/:resourceId",
  authenticate,
  favoriteController.toggleFavorite.bind(favoriteController),
);

/**
 * @swagger
 * /api/v1/favorites/{resourceId}:
 *   delete:
 *     summary: Remove from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removed from favorites
 */
router.delete(
  "/:resourceId",
  authenticate,
  validate(paramIdSchema),
  favoriteController.removeFavorite.bind(favoriteController),
);

export default router;
