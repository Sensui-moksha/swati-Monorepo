import { Types } from "mongoose";
import { subscriptionService } from "../services/subscriptionService";
import { planRepository } from "../repositories/PlanRepository";
import { commerceSubscriptionRepository } from "../repositories/CommerceSubscriptionRepository";
import { userRepository } from "../repositories/UserRepository";

jest.mock("../repositories/PlanRepository");
jest.mock("../repositories/CommerceSubscriptionRepository");
jest.mock("../repositories/UserRepository");

const mockPlanRepository = planRepository as jest.Mocked<typeof planRepository>;
const mockSubscriptionRepository =
  commerceSubscriptionRepository as jest.Mocked<
    typeof commerceSubscriptionRepository
  >;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

describe("subscriptionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates an active subscription for paid plans and syncs the user tier", async () => {
    const userId = new Types.ObjectId().toString();
    const planId = new Types.ObjectId().toString();

    mockPlanRepository.findById.mockResolvedValue({
      _id: planId,
      billingCycle: "annual",
    } as any);
    mockSubscriptionRepository.create.mockResolvedValue({
      _id: new Types.ObjectId(),
      subscriptionNumber: "sub_test",
      status: "active",
      history: [],
    } as any);
    mockUserRepository.updateById.mockResolvedValue({} as any);

    const subscription = await subscriptionService.subscribe(userId, planId, {
      autoRenew: false,
      note: "new plan",
      performedBy: userId,
    });

    expect(subscription.status).toBe("active");
    expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.any(Types.ObjectId),
        plan: expect.any(Types.ObjectId),
        status: "active",
        autoRenew: false,
      }),
    );
    expect(mockUserRepository.updateById).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        subscription: expect.objectContaining({
          tier: "premium",
          isActive: true,
          autoRenew: false,
        }),
      }),
    );
  });

  it("moves a subscription into renewing state when renewed", async () => {
    const subscriptionId = new Types.ObjectId().toString();

    mockSubscriptionRepository.findById.mockResolvedValue({
      _id: subscriptionId,
      status: "active",
      currentPeriodEnd: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2026-01-01T00:00:00.000Z"),
      history: [],
    } as any);
    mockSubscriptionRepository.updateById.mockResolvedValue({
      _id: subscriptionId,
      status: "renewing",
      history: [{ action: "renew" }],
    } as any);

    const renewed = await subscriptionService.renew(subscriptionId, {
      extensionDays: 30,
      performedBy: subscriptionId,
    });

    expect(renewed.status).toBe("renewing");
    expect(mockSubscriptionRepository.updateById).toHaveBeenCalledWith(
      subscriptionId,
      expect.objectContaining({
        status: "renewing",
        nextBillingAt: expect.any(Date),
      }),
    );
  });
});
