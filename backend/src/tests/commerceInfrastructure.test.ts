import { Types } from "mongoose";
import { DummyPaymentProvider } from "../providers/DummyPaymentProvider";
import { accessControlService } from "../services/accessControlService";
import { webhookService } from "../services/webhookService";
import { userRepository } from "../repositories/UserRepository";
import { commerceSubscriptionRepository } from "../repositories/CommerceSubscriptionRepository";
import { planRepository } from "../repositories/PlanRepository";
import { commerceOrderRepository } from "../repositories/CommerceOrderRepository";
import { webhookLogRepository } from "../repositories/WebhookLogRepository";

jest.mock("../repositories/UserRepository");
jest.mock("../repositories/CommerceSubscriptionRepository");
jest.mock("../repositories/PlanRepository");
jest.mock("../repositories/CommerceOrderRepository");
jest.mock("../repositories/WebhookLogRepository");

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockSubscriptionRepository =
  commerceSubscriptionRepository as jest.Mocked<
    typeof commerceSubscriptionRepository
  >;
const mockPlanRepository = planRepository as jest.Mocked<typeof planRepository>;
const mockOrderRepository = commerceOrderRepository as jest.Mocked<
  typeof commerceOrderRepository
>;
const mockWebhookLogRepository = webhookLogRepository as jest.Mocked<
  typeof webhookLogRepository
>;

describe("Commerce infrastructure", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("simulates payment provider lifecycle", async () => {
    const provider = new DummyPaymentProvider();

    const created = await provider.createPayment({
      orderId: "order_1",
      amount: 129.5,
      currency: "USD",
      metadata: { source: "test" },
    });
    const captured = await provider.capturePayment({
      referenceNumber: created.referenceNumber,
      amount: 129.5,
    });
    const refunded = await provider.refundPayment({
      referenceNumber: created.referenceNumber,
      amount: 20,
    });

    expect(created.providerName).toBe("dummy");
    expect(created.status).toBe("pending");
    expect(created.referenceNumber).toMatch(/^dummy_/);
    expect(captured.status).toBe("captured");
    expect(refunded.status).toBe("refunded");
    expect(refunded.refundReference).toMatch(/^refund_/);
  });

  it("allows access for an active matching subscription", async () => {
    const userId = new Types.ObjectId().toString();
    const planId = new Types.ObjectId();

    mockUserRepository.findById.mockResolvedValue({ _id: userId } as any);
    mockSubscriptionRepository.findActiveByUser.mockResolvedValue({
      plan: planId,
      startDate: new Date(Date.now() - 60_000),
      endDate: new Date(Date.now() + 60_000),
    } as any);
    mockPlanRepository.findById.mockResolvedValue({
      _id: planId,
      slug: "pro",
    } as any);

    const decision = await accessControlService.canAccessContent(userId, {
      requiredPlanSlug: "pro",
      subscriptionRequired: true,
    });

    expect(decision).toEqual({
      decision: "allowed",
      reason: "subscription active",
    });
  });

  it("recognizes purchased content", async () => {
    const userId = new Types.ObjectId().toString();

    mockUserRepository.findById.mockResolvedValue({ _id: userId } as any);
    mockSubscriptionRepository.findActiveByUser.mockResolvedValue(null);
    mockOrderRepository.findOne.mockResolvedValue({
      _id: new Types.ObjectId(),
    } as any);

    const decision = await accessControlService.canAccessContent(userId, {
      purchaseRequired: true,
      resourceId: "resource_1",
    });

    expect(decision.decision).toBe("allowed");
    expect(decision.reason).toBe("purchased");
  });

  it("logs unimplemented webhooks", async () => {
    mockWebhookLogRepository.create.mockResolvedValue({} as any);

    const result = await webhookService.notImplemented(
      "dummy",
      "payment.succeeded",
      { id: "evt_1" },
      { "x-signature": "sig" },
    );

    expect(result.status).toBe(501);
    expect(result.result).toEqual(
      expect.objectContaining({
        providerName: "dummy",
        eventType: "payment.succeeded",
        verified: false,
      }),
    );
    expect(mockWebhookLogRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        providerName: "dummy",
        eventType: "payment.succeeded",
        status: "ignored",
      }),
    );
  });
});
