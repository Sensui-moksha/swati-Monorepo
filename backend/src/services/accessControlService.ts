import { ApiError } from "../middleware/errorHandler";
import { userRepository } from "../repositories/UserRepository";
import { commerceSubscriptionRepository } from "../repositories/CommerceSubscriptionRepository";
import { planRepository } from "../repositories/PlanRepository";
import { commerceOrderRepository } from "../repositories/CommerceOrderRepository";
import { isActiveInRange } from "../utils/commerce";

export class AccessControlService {
  async canAccessContent(
    userId: string,
    input: {
      requiredPlanSlug?: string;
      subscriptionRequired?: boolean;
      purchaseRequired?: boolean;
      resourceId?: string;
      premium?: boolean;
    } = {},
  ) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const subscription =
      await commerceSubscriptionRepository.findActiveByUser(userId);
    const activeSubscription =
      subscription &&
      isActiveInRange(subscription.startDate, subscription.endDate);

    if (input.purchaseRequired && input.resourceId) {
      const order = await commerceOrderRepository.findOne({
        user: userId,
        status: { $in: ["paid", "completed"] },
        "items.resourceId": input.resourceId as any,
      });
      if (order) return { decision: "allowed", reason: "purchased" };
    }

    if (input.subscriptionRequired || input.requiredPlanSlug || input.premium) {
      if (!activeSubscription)
        return {
          decision: "subscription_required",
          reason: "active subscription required",
        };
      const plan = await planRepository.findById(subscription!.plan);
      if (!plan) return { decision: "denied", reason: "plan missing" };
      if (input.requiredPlanSlug && plan.slug !== input.requiredPlanSlug)
        return { decision: "plan_required", reason: "plan mismatch" };
      return { decision: "allowed", reason: "subscription active" };
    }

    return { decision: "allowed", reason: "public access" };
  }

  async assertAccess(
    userId: string,
    input?: Parameters<AccessControlService["canAccessContent"]>[1],
  ) {
    const decision = await this.canAccessContent(userId, input);
    if (decision.decision !== "allowed")
      throw new ApiError(403, decision.reason || "Access denied");
    return decision;
  }
}

export const accessControlService = new AccessControlService();
