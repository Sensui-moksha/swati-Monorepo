import { eventBus } from "../../events/EventBus";
import { QUEUES, addJob } from "../../jobs/queueManager";
import * as redisModule from "../../config/redis";

describe("E2E Journey: System Infrastructure, Events & Background Queues", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Domain EventBus Lifecycle", () => {
    it("should publish domain events asynchronously and notify all registered subscribers", async () => {
      const received: any[] = [];
      const testEventName = "publication.archived";

      eventBus.subscribe(testEventName, async (event) => {
        received.push(event);
      });

      const published = await eventBus.publish(testEventName, {
        publicationId: "pub-999",
        reason: "Licensing expired",
      });

      // Wait a tick for setImmediate dispatch
      await new Promise((r) => setTimeout(r, 20));

      expect(published).toBeDefined();
      expect(published.id).toBeDefined();
      expect(received).toHaveLength(1);
      expect(received[0].payload.publicationId).toBe("pub-999");
    });

    it("should handle subscriber errors with exponential retry and DLQ routing", async () => {
      const failingEvent = "order.failed_processing";
      let callCount = 0;

      eventBus.subscribe(
        failingEvent,
        async () => {
          callCount++;
          throw new Error("Simulated transient network drop");
        },
        { retries: 2 }
      );

      await eventBus.publish(failingEvent, { orderId: "ord-test-123" });

      // Wait for retry backoff delays
      await new Promise((r) => setTimeout(r, 250));

      // Attempt 0 + 2 retries = 3 calls total
      expect(callCount).toBe(3);

      const dlq = eventBus.getDeadLetterQueue();
      const item = dlq.find((d) => d.event.name === failingEvent);
      expect(item).toBeDefined();
      expect(item?.error).toContain("Simulated transient network drop");
    });
  });

  describe("BullMQ Queue Pipeline Safety", () => {
    it("should gracefully handle Redis disconnects when enqueuing jobs", async () => {
      jest.spyOn(redisModule, "getRedisClient").mockReturnValue(null);

      // Should not throw or crash when redis client is offline
      await expect(
        addJob(QUEUES.PDF_OPTIMIZATION, "test-job", { file: "test.pdf" })
      ).resolves.not.toThrow();
    });
  });
});
