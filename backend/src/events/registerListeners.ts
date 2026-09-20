import { eventBus } from "./EventBus";
import { logger } from "../utils/logger";
import { IndexerService } from "../services/IndexerService";
import { DRMSecurityEvent } from "../models/DRMSecurityEvent";
import { Types } from "mongoose";

/**
 * Register all decoupled subscribers to the EventBus
 */
export function registerDomainEventListeners(): void {
  // 1. Article Published -> Trigger search indexing and subscriber notification
  eventBus.subscribe("article.published", async (event) => {
    logger.info(`[EventBus Handler] article.published for articleId: ${event.payload?.articleId}`);
    // Future expansion: push to elasticsearch / redis cache invalidation
  });

  // 2. Book Published -> Trigger asynchronous elasticsearch PDF parsing & indexing
  eventBus.subscribe("book.published", async (event) => {
    const { publicationId, issueId } = event.payload || {};
    logger.info(`[EventBus Handler] book.published for pub: ${publicationId}, issue: ${issueId}`);
    if (publicationId) {
      try {
        await IndexerService.indexPublication(publicationId, issueId);
      } catch (err: any) {
        logger.warn(`[EventBus Handler] Indexing failed for ${publicationId}: ${err?.message}`);
      }
    }
  });

  // 3. Order Paid -> Log commerce audit and trigger invoice generation
  eventBus.subscribe("order.paid", async (event) => {
    logger.info(`[EventBus Handler] order.paid: Order ${event.payload?.orderId} paid successfully`);
  });

  // 4. DRM Security Breach -> Record security audit
  eventBus.subscribe("drm.breach", async (event) => {
    const { userId, deviceId, eventType, severity, details } = event.payload || {};
    logger.warn(`[EventBus Handler] DRM Breach reported: ${eventType} (Severity: ${severity})`);
    if (userId && deviceId) {
      try {
        await DRMSecurityEvent.create({
          userId: new Types.ObjectId(userId),
          deviceId,
          eventType: eventType || "unauthorized_access",
          severity: severity || "medium",
          details,
          timestamp: new Date(),
        });
      } catch (err: any) {
        logger.error(`[EventBus Handler] Failed to log DRM breach event: ${err?.message}`);
      }
    }
  });

  logger.info("Domain event listeners successfully registered.");
}
