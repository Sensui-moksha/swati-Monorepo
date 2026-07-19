import { Types } from "mongoose";
import { ApiError } from "../middleware/errorHandler";
import { commerceSubscriptionRepository } from "../repositories/CommerceSubscriptionRepository";
import { planRepository } from "../repositories/PlanRepository";
import { userRepository } from "../repositories/UserRepository";
import { ICommerceSubscription } from "../models/CommerceSubscription";
import { appendHistory, mapBillingCycleToUserTier } from "../utils/commerce";

const toId = (value: string | Types.ObjectId) =>
  value instanceof Types.ObjectId ? value : new Types.ObjectId(value);

export class SubscriptionService {
  async subscribe(
    userId: string,
    planId: string,
    input: {
      trialEndsAt?: Date;
      autoRenew?: boolean;
      note?: string;
      performedBy?: string;
    } = {},
  ): Promise<ICommerceSubscription> {
    const plan = await planRepository.findById(planId);
    if (!plan) throw new ApiError(404, "Plan not found");

    const subscription = await commerceSubscriptionRepository.create({
      subscriptionNumber: `sub_${Date.now()}`,
      user: toId(userId),
      plan: toId(planId),
      status: plan.billingCycle === "free" ? "trial" : "active",
      startDate: new Date(),
      trialEndsAt: input.trialEndsAt,
      currentPeriodStart: new Date(),
      currentPeriodEnd: input.trialEndsAt || undefined,
      nextBillingAt: input.trialEndsAt || undefined,
      autoRenew: input.autoRenew ?? true,
      history: appendHistory(
        [],
        "subscribe",
        undefined,
        plan.billingCycle,
        input.note,
        input.performedBy,
      ),
    } as any);

    await userRepository.updateById(userId, {
      subscription: {
        tier: mapBillingCycleToUserTier(plan.billingCycle),
        startDate: new Date(),
        endDate: input.trialEndsAt,
        isActive: true,
        autoRenew: input.autoRenew ?? true,
      },
    } as any);

    return subscription;
  }

  async renew(
    subscriptionId: string,
    input: { extensionDays?: number; note?: string; performedBy?: string } = {},
  ): Promise<ICommerceSubscription> {
    const subscription =
      await commerceSubscriptionRepository.findById(subscriptionId);
    if (!subscription) throw new ApiError(404, "Subscription not found");
    const extensionDays = input.extensionDays ?? 30;
    const nextEnd = new Date(
      subscription.currentPeriodEnd || subscription.endDate || Date.now(),
    );
    nextEnd.setDate(nextEnd.getDate() + extensionDays);
    const updated = await commerceSubscriptionRepository.updateById(
      subscriptionId,
      {
        status: "renewing",
        currentPeriodEnd: nextEnd,
        endDate: nextEnd,
        nextBillingAt: nextEnd,
        history: appendHistory(
          subscription.history,
          "renew",
          subscription.status,
          "renewing",
          input.note,
          input.performedBy,
        ),
      } as any,
    );
    if (!updated) throw new ApiError(500, "Failed to renew subscription");
    return updated;
  }

  async upgrade(
    subscriptionId: string,
    planId: string,
    input: { note?: string; performedBy?: string } = {},
  ): Promise<ICommerceSubscription> {
    const plan = await planRepository.findById(planId);
    if (!plan) throw new ApiError(404, "Plan not found");
    const subscription =
      await commerceSubscriptionRepository.findById(subscriptionId);
    if (!subscription) throw new ApiError(404, "Subscription not found");
    const updated = await commerceSubscriptionRepository.updateById(
      subscriptionId,
      {
        plan: toId(planId),
        status: "active",
        history: appendHistory(
          subscription.history,
          "upgrade",
          subscription.status,
          "active",
          input.note,
          input.performedBy,
        ),
      } as any,
    );
    if (!updated) throw new ApiError(500, "Failed to upgrade subscription");
    await userRepository.updateById(subscription.user, {
      "subscription.tier": mapBillingCycleToUserTier(plan.billingCycle),
      "subscription.isActive": true,
    } as any);
    return updated;
  }

  async downgrade(
    subscriptionId: string,
    planId: string,
    input: { note?: string; performedBy?: string } = {},
  ): Promise<ICommerceSubscription> {
    return this.upgrade(subscriptionId, planId, input);
  }

  async pause(
    subscriptionId: string,
    input: { note?: string; performedBy?: string } = {},
  ): Promise<ICommerceSubscription> {
    const subscription =
      await commerceSubscriptionRepository.findById(subscriptionId);
    if (!subscription) throw new ApiError(404, "Subscription not found");
    const updated = await commerceSubscriptionRepository.updateById(
      subscriptionId,
      {
        status: "paused",
        pausedAt: new Date(),
        history: appendHistory(
          subscription.history,
          "pause",
          subscription.status,
          "paused",
          input.note,
          input.performedBy,
        ),
      } as any,
    );
    if (!updated) throw new ApiError(500, "Failed to pause subscription");
    return updated;
  }

  async resume(
    subscriptionId: string,
    input: { note?: string; performedBy?: string } = {},
  ): Promise<ICommerceSubscription> {
    const subscription =
      await commerceSubscriptionRepository.findById(subscriptionId);
    if (!subscription) throw new ApiError(404, "Subscription not found");
    const updated = await commerceSubscriptionRepository.updateById(
      subscriptionId,
      {
        status: "active",
        resumedAt: new Date(),
        history: appendHistory(
          subscription.history,
          "resume",
          subscription.status,
          "active",
          input.note,
          input.performedBy,
        ),
      } as any,
    );
    if (!updated) throw new ApiError(500, "Failed to resume subscription");
    return updated;
  }

  async cancel(
    subscriptionId: string,
    input: { note?: string; performedBy?: string } = {},
  ): Promise<ICommerceSubscription> {
    const subscription =
      await commerceSubscriptionRepository.findById(subscriptionId);
    if (!subscription) throw new ApiError(404, "Subscription not found");
    const updated = await commerceSubscriptionRepository.updateById(
      subscriptionId,
      {
        status: "cancelled",
        cancelledAt: new Date(),
        autoRenew: false,
        history: appendHistory(
          subscription.history,
          "cancel",
          subscription.status,
          "cancelled",
          input.note,
          input.performedBy,
        ),
      } as any,
    );
    if (!updated) throw new ApiError(500, "Failed to cancel subscription");
    return updated;
  }

  async expire(
    subscriptionId: string,
    input: { note?: string; performedBy?: string } = {},
  ): Promise<ICommerceSubscription> {
    const subscription =
      await commerceSubscriptionRepository.findById(subscriptionId);
    if (!subscription) throw new ApiError(404, "Subscription not found");
    const updated = await commerceSubscriptionRepository.updateById(
      subscriptionId,
      {
        status: "expired",
        expiredAt: new Date(),
        history: appendHistory(
          subscription.history,
          "expire",
          subscription.status,
          "expired",
          input.note,
          input.performedBy,
        ),
      } as any,
    );
    if (!updated) throw new ApiError(500, "Failed to expire subscription");
    return updated;
  }

  async getById(subscriptionId: string): Promise<ICommerceSubscription> {
    const subscription =
      await commerceSubscriptionRepository.findById(subscriptionId);
    if (!subscription) throw new ApiError(404, "Subscription not found");
    return subscription;
  }
  async getByUser(userId: string) {
    return commerceSubscriptionRepository.findByUser(userId);
  }
  async getActiveByUser(userId: string) {
    return commerceSubscriptionRepository.findActiveByUser(userId);
  }
  async listHistory(subscriptionId: string) {
    const subscription = await this.getById(subscriptionId);
    return subscription.history;
  }
}

export const subscriptionService = new SubscriptionService();
