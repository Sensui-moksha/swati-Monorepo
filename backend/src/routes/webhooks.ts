import { Router } from "express";
import { validate } from "../middleware/validate";
import { webhookController } from "../controllers/webhookController";
import { webhookSchema } from "../validators/commerceValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/webhooks:
 *   post:
 *     summary: Receive webhook
 *     tags: [Webhooks]
 */
router.post(
  "/",
  validate(webhookSchema),
  webhookController.receive.bind(webhookController),
);
router.post(
  "/verify",
  validate(webhookSchema),
  webhookController.verify.bind(webhookController),
);
router.get("/logs", webhookController.listLogs.bind(webhookController));

export default router;
