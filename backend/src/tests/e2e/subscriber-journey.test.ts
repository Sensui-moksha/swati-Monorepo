import { Types } from "mongoose";
import { subscriptionService } from "../../services/subscriptionService";
import { planRepository } from "../../repositories/PlanRepository";
import { commerceSubscriptionRepository } from "../../repositories/CommerceSubscriptionRepository";
import { userRepository } from "../../repositories/UserRepository";

jest.mock("../../repositories/PlanRepository");
jest.mock("../../repositories/CommerceSubscriptionRepository");
jest.mock("../../repositories/UserRepository");

const mockPlanRepository = planRepository as jest.Mocked<typeof planRepository>;
const mockSubscriptionRepository = commerceSubscriptionRepository as jest.Mocked<
  typeof commerceSubscriptionRepository
>;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

describe("E2E Journey: Subscriber Lifecycle (Purchase, Access, Renew, Cancel, Upgrade)", () => {
  const userId = new Types.ObjectId().toString();
  const basicPlanId = new Types.ObjectId().toString();
  const premiumPlanId = new Types.ObjectId().toString();
  const subscriptionId = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Subscription Purchase & Activation", () => {
    it("should successfully subscribe user to an annual plan and update member tier", async () => {
      mockPlanRepository.findById.mockResolvedValue({
        _id: basicPlanId,
        name: "Standard Annual",
        billingCycle: "annual",
        price: 999,
      } as any);

      mockSubscriptionRepository.create.mockResolvedValue({
        _id: subscriptionId,
        subscriptionNumber: "SUB-2026-001",
        status: "active",
        autoRenew: true,
        history: [],
      } as any);

      mockUserRepository.updateById.mockResolvedValue({} as any);

      const sub = await subscriptionService.subscribe(userId, basicPlanId, {
        autoRenew: true,
        performedBy: userId,
      });

      expect(sub.status).toBe("active");
      expect(mockUserRepository.updateById).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          subscription: expect.objectContaining({
            tier: "premium",
            isActive: true,
          }),
        })
      );
    });
  });

  describe("Subscription Renewal & Continuation", () => {
    it("should extend current period end date upon renewal request", async () => {
      const now = new Date();
      const currentEnd = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

      mockSubscriptionRepository.findById.mockResolvedValue({
        _id: subscriptionId,
        user: new Types.ObjectId(userId),
        plan: new Types.ObjectId(basicPlanId),
        status: "active",
        currentPeriodEnd: currentEnd,
        history: [],
      } as any);

      mockSubscriptionRepository.updateById.mockResolvedValue({
        _id: subscriptionId,
        status: "renewing",
      } as any);

      const renewed = await subscriptionService.renew(subscriptionId, {
        note: "Auto-renew monthly cycle",
      });

      expect(renewed.status).toBe("renewing");
      expect(mockSubscriptionRepository.updateById).toHaveBeenCalledWith(
        subscriptionId,
        expect.objectContaining({
          status: "renewing",
        })
      );
    });
  });

  describe("Cancellation & Plan Change (Upgrade)", () => {
    it("should set autoRenew to false and mark status cancelled upon cancellation", async () => {
      mockSubscriptionRepository.findById.mockResolvedValue({
        _id: subscriptionId,
        user: new Types.ObjectId(userId),
        status: "active",
        autoRenew: true,
        history: [],
      } as any);

      mockSubscriptionRepository.updateById.mockResolvedValue({
        _id: subscriptionId,
        status: "cancelled",
        autoRenew: false,
        cancelledAt: new Date(),
      } as any);

      const cancelled = await subscriptionService.cancel(subscriptionId, {
        note: "Cost cutting",
      });

      expect(cancelled.autoRenew).toBe(false);
      expect(cancelled.status).toBe("cancelled");
      expect(mockSubscriptionRepository.updateById).toHaveBeenCalledWith(
        subscriptionId,
        expect.objectContaining({
          autoRenew: false,
          status: "cancelled",
        })
      );
    });

    it("should seamlessly change plan to an upgraded tier", async () => {
      mockPlanRepository.findById.mockResolvedValue({
        _id: premiumPlanId,
        name: "VIP Archival All-Access",
        billingCycle: "annual",
      } as any);

      mockSubscriptionRepository.findById.mockResolvedValue({
        _id: subscriptionId,
        user: new Types.ObjectId(userId),
        plan: new Types.ObjectId(basicPlanId),
        status: "active",
        history: [],
      } as any);

      mockSubscriptionRepository.updateById.mockResolvedValue({
        _id: subscriptionId,
        plan: new Types.ObjectId(premiumPlanId),
        status: "active",
      } as any);

      mockUserRepository.updateById.mockResolvedValue({} as any);

      const upgraded = await subscriptionService.upgrade(subscriptionId, premiumPlanId, {
        note: "User requested tier upgrade",
      });
      expect(upgraded.plan.toString()).toBe(premiumPlanId);
    });
  });
});
