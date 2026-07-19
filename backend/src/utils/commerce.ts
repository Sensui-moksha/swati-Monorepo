import { Types } from "mongoose";
import {
  CommerceHistoryEntry,
  CommerceLineItem,
  PlanBillingCycle,
} from "../interfaces/commerce";

export function mapBillingCycleToUserTier(
  billingCycle: PlanBillingCycle,
): "free" | "basic" | "premium" | "enterprise" {
  switch (billingCycle) {
    case "free":
      return "free";
    case "monthly":
    case "quarterly":
      return "basic";
    case "half_yearly":
    case "annual":
      return "premium";
    case "lifetime":
      return "enterprise";
    default:
      return "basic";
  }
}

export function calculateLineItemTotal(
  item: Pick<CommerceLineItem, "quantity" | "unitPrice">,
): number {
  return Math.round(item.quantity * item.unitPrice * 100) / 100;
}

export function calculateOrderTotals(
  items: CommerceLineItem[],
  discount = 0,
  taxRate = 0,
): { subtotal: number; discount: number; tax: number; total: number } {
  const subtotal =
    Math.round(items.reduce((sum, item) => sum + item.totalPrice, 0) * 100) /
    100;
  const safeDiscount = Math.min(discount, subtotal);
  const taxableBase = Math.max(subtotal - safeDiscount, 0);
  const tax = Math.round(taxableBase * taxRate * 100) / 100;
  const total = Math.round((taxableBase + tax) * 100) / 100;
  return { subtotal, discount: safeDiscount, tax, total };
}

export function appendHistory(
  history: CommerceHistoryEntry[] = [],
  action: string,
  from: string | undefined,
  to: string | undefined,
  note?: string,
  performedBy?: string,
): CommerceHistoryEntry[] {
  return history.concat({
    action,
    from,
    to,
    note,
    performedBy: performedBy ? new Types.ObjectId(performedBy) : undefined,
    at: new Date(),
  });
}

export function isActiveInRange(
  start?: Date,
  end?: Date,
  at = new Date(),
): boolean {
  if (start && start > at) return false;
  if (end && end < at) return false;
  return true;
}
