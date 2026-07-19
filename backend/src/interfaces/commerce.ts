import { Types } from "mongoose";

export type PlanBillingCycle =
  "free" | "monthly" | "quarterly" | "half_yearly" | "annual" | "lifetime";
export type SubscriptionStatus =
  | "trial"
  | "active"
  | "paused"
  | "renewing"
  | "expired"
  | "cancelled"
  | "suspended";
export type OrderStatus =
  | "pending"
  | "processing"
  | "awaiting_payment"
  | "paid"
  | "failed"
  | "cancelled"
  | "completed"
  | "refund_pending"
  | "refunded";
export type PaymentStatus =
  | "pending"
  | "processing"
  | "authorized"
  | "captured"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";
export type CouponType = "percentage" | "flat";
export type PromotionType =
  "festival" | "student" | "referral" | "flash_sale" | "limited_time_offer";
export type AccessDecision =
  | "allowed"
  | "subscription_required"
  | "plan_required"
  | "purchase_required"
  | "denied";

export interface CommerceHistoryEntry {
  action: string;
  from?: string;
  to?: string;
  note?: string;
  performedBy?: Types.ObjectId;
  at: Date;
}

export interface CommerceLineItem {
  type:
    | "plan"
    | "book"
    | "publication"
    | "magazine_issue"
    | "subscription"
    | "custom";
  resourceId?: Types.ObjectId;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CommerceAuditTrailEntry {
  event: string;
  message?: string;
  metadata?: Record<string, unknown>;
  at: Date;
}

export interface CreateOrderItemInput {
  type: CommerceLineItem["type"];
  resourceId?: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, unknown>;
}

export interface SubscriptionActionInput {
  note?: string;
  performedBy?: string;
}

export interface ReportWindow {
  from?: Date;
  to?: Date;
}
