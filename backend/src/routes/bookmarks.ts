import { Router } from "express";
import { bookmarkController } from "../controllers/bookmarkController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createBookmarkSchema,
  updateBookmarkSchema,
  bookmarkQuerySchema,
  paramIdSchema,
} from "../validators/bookmarks";

const router = Router();

/**
 * @swagger
 * /api/v1/bookmarks:
 *   post:
 *     summary: Add a bookmark
 *     tags: [Bookmarks]
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
 *                 enum: [book, publication, magazine_issue, article]
 *               resourceTitle:
 *                 type: string
 *               resourceImage:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bookmark created
 *   get:
 *     summary: Get bookmarks
 *     tags: [Bookmarks]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of bookmarks
 */
router.post(
  "/",
  authenticate,
  validate(createBookmarkSchema),
  bookmarkController.addBookmark.bind(bookmarkController),
);
router.get(
  "/",
  authenticate,
  validate(bookmarkQuerySchema),
  bookmarkController.getBookmarks.bind(bookmarkController),
);

/**
 * @swagger
 * /api/v1/bookmarks/check/{resourceId}:
 *   get:
 *     summary: Check if resource is bookmarked
 *     tags: [Bookmarks]
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
 *         description: Bookmark status
 */
router.get(
  "/check/:resourceId",
  authenticate,
  validate(paramIdSchema),
  bookmarkController.isBookmarked.bind(bookmarkController),
);

/**
 * @swagger
 * /api/v1/bookmarks/count:
 *   get:
 *     summary: Get bookmark count
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookmark count
 */
router.get(
  "/count",
  authenticate,
  bookmarkController.getBookmarkCount.bind(bookmarkController),
);

/**
 * @swagger
 * /api/v1/bookmarks/{resourceId}:
 *   put:
 *     summary: Update bookmark
 *     tags: [Bookmarks]
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
 *               resourceImage:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bookmark updated
 *   delete:
 *     summary: Remove bookmark
 *     tags: [Bookmarks]
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
 *         description: Bookmark removed
 */
router.put(
  "/:resourceId",
  authenticate,
  validate(updateBookmarkSchema),
  bookmarkController.updateBookmark.bind(bookmarkController),
);
router.delete(
  "/:resourceId",
  authenticate,
  validate(paramIdSchema),
  bookmarkController.removeBookmark.bind(bookmarkController),
);

export default router;
