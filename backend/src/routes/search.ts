import { Router } from "express";
import { searchController } from "../controllers/searchController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { searchSchema, advancedSearchSchema } from "../validators/search";

const router = Router();

router.get(
  "/",
  authenticate,
  validate(searchSchema),
  searchController.search.bind(searchController),
);
router.post(
  "/advanced",
  authenticate,
  validate(advancedSearchSchema),
  searchController.advancedSearch.bind(searchController),
);

export default router;
