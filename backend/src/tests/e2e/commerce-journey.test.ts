import { accessControlService } from "../../services/accessControlService";
import { userRepository } from "../../repositories/UserRepository";
import { commerceSubscriptionRepository } from "../../repositories/CommerceSubscriptionRepository";
import { planRepository } from "../../repositories/PlanRepository";
import { commerceOrderRepository } from "../../repositories/CommerceOrderRepository";
import { Types } from "mongoose";

describe("E2E Journey 2: Commerce, Digital Subscriptions & Entitlements", () => {
  const testUserId = new Types.ObjectId().toString();
  const testPlanId = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should grant access to public content without authentication or active subscription", async () => {
    jest.spyOn(userRepository, "findById").mockResolvedValue({ _id: testUserId } as any);
    jest.spyOn(commerceSubscriptionRepository, "findActiveByUser").mockResolvedValue(null);

    const result = await accessControlService.canAccessContent(testUserId, {
      subscriptionRequired: false,
      premium: false,
    });

    expect(result.decision).toBe("allowed");
    expect(result.reason).toBe("public access");
  });

  it("should require active subscription for premium digital editions", async () => {
    jest.spyOn(userRepository, "findById").mockResolvedValue({ _id: testUserId } as any);
    jest.spyOn(commerceSubscriptionRepository, "findActiveByUser").mockResolvedValue(null);

    const result = await accessControlService.canAccessContent(testUserId, {
      subscriptionRequired: true,
      premium: true,
    });

    expect(result.decision).toBe("subscription_required");
  });

  it("should grant access to premium publications when user holds an active subscription", async () => {
    const activeSub = {
      _id: new Types.ObjectId(),
      user: testUserId,
      plan: testPlanId,
      status: "active",
      startDate: new Date(Date.now() - 86400000), // 1 day ago
      endDate: new Date(Date.now() + 86400000 * 30), // 30 days from now
    };

    jest.spyOn(userRepository, "findById").mockResolvedValue({ _id: testUserId } as any);
    jest.spyOn(commerceSubscriptionRepository, "findActiveByUser").mockResolvedValue(activeSub as any);
    jest.spyOn(planRepository, "findById").mockResolvedValue({ _id: testPlanId, slug: "all-access" } as any);

    const result = await accessControlService.canAccessContent(testUserId, {
      subscriptionRequired: true,
      premium: true,
      requiredPlanSlug: "all-access",
    });

    expect(result.decision).toBe("allowed");
    expect(result.reason).toBe("subscription active");
  });

  it("should grant access to a specific book if purchased directly via order", async () => {
    const bookId = new Types.ObjectId().toString();

    jest.spyOn(userRepository, "findById").mockResolvedValue({ _id: testUserId } as any);
    jest.spyOn(commerceSubscriptionRepository, "findActiveByUser").mockResolvedValue(null);
    jest.spyOn(commerceOrderRepository, "findOne").mockResolvedValue({
      _id: new Types.ObjectId(),
      status: "paid",
      user: testUserId,
    } as any);

    const result = await accessControlService.canAccessContent(testUserId, {
      purchaseRequired: true,
      resourceId: bookId,
    });

    expect(result.decision).toBe("allowed");
    expect(result.reason).toBe("purchased");
  });
});
