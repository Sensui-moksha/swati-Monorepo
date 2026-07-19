import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { commerceController } from "../controllers/commerceController";

const router = Router();

router.post(
  "/check",
  authenticate,
  commerceController.checkAccess.bind(commerceController),
);
router.post(
  "/assert",
  authenticate,
  commerceController.assertAccess.bind(commerceController),
);

export default router;
