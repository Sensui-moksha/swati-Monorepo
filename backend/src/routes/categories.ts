import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { categoryController } from "../controllers/categoryController";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  categorySlugSchema,
} from "../validators/editorialValidators";

const router = Router();

router.get("/", categoryController.listCategories.bind(categoryController));
router.get("/:id", validate(categoryIdSchema), categoryController.getCategoryById.bind(categoryController));
router.get("/slug/:slug", validate(categorySlugSchema), categoryController.getCategoryBySlug.bind(categoryController));

router.post(
  "/",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(createCategorySchema),
  categoryController.createCategory.bind(categoryController),
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(categoryIdSchema),
  validate(updateCategorySchema),
  categoryController.updateCategory.bind(categoryController),
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(categoryIdSchema),
  categoryController.deleteCategory.bind(categoryController),
);

export default router;
