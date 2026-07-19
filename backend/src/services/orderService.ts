import { ApiError } from "../middleware/errorHandler";
import { commerceOrderRepository } from "../repositories/CommerceOrderRepository";
import { ICommerceOrder } from "../models/CommerceOrder";
import {
  calculateLineItemTotal,
  calculateOrderTotals,
  appendHistory,
} from "../utils/commerce";
import { CreateOrderItemInput } from "../interfaces/commerce";

export class OrderService {
  async createOrder(
    userId: string,
    items: CreateOrderItemInput[],
    input: {
      discount?: number;
      taxRate?: number;
      currency?: string;
      couponCode?: string;
      planId?: string;
      subscriptionId?: string;
      note?: string;
      performedBy?: string;
    } = {},
  ): Promise<ICommerceOrder> {
    if (!items.length)
      throw new ApiError(400, "At least one order item is required");
    const normalizedItems = items.map((item) => ({
      ...item,
      totalPrice: calculateLineItemTotal(item),
    })) as any;
    const totals = calculateOrderTotals(
      normalizedItems,
      input.discount ?? 0,
      input.taxRate ?? 0,
    );

    return commerceOrderRepository.create({
      orderNumber: `ord_${Date.now()}`,
      user: userId,
      items: normalizedItems,
      status: "pending",
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      currency: input.currency || "INR",
      couponCode: input.couponCode,
      plan: input.planId,
      subscription: input.subscriptionId,
      history: appendHistory(
        [],
        "create",
        undefined,
        "pending",
        input.note,
        input.performedBy,
      ),
    } as any);
  }

  async updateOrder(
    orderId: string,
    input: Partial<ICommerceOrder>,
  ): Promise<ICommerceOrder> {
    const updated = await commerceOrderRepository.updateById(
      orderId,
      input as any,
    );
    if (!updated) throw new ApiError(404, "Order not found");
    return updated;
  }

  async cancelOrder(
    orderId: string,
    note = "Order cancelled",
  ): Promise<ICommerceOrder> {
    const order = await commerceOrderRepository.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");
    const updated = await commerceOrderRepository.updateById(orderId, {
      status: "cancelled",
      history: appendHistory(
        order.history,
        "cancel",
        order.status,
        "cancelled",
        note,
      ),
    } as any);
    if (!updated) throw new ApiError(500, "Failed to cancel order");
    return updated;
  }

  async getOrder(orderId: string): Promise<ICommerceOrder> {
    const order = await commerceOrderRepository.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");
    return order;
  }
  async getOrderByNumber(orderNumber: string) {
    const order = await commerceOrderRepository.findByOrderNumber(orderNumber);
    if (!order) throw new ApiError(404, "Order not found");
    return order;
  }
  async listOrders(userId?: string, page = 1, limit = 20) {
    return userId
      ? commerceOrderRepository.findWithPagination({ user: userId } as any, {
          page,
          limit,
          sort: { createdAt: -1 },
        })
      : commerceOrderRepository.findWithPagination(
          {},
          { page, limit, sort: { createdAt: -1 } },
        );
  }
  async history(orderId: string) {
    const order = await this.getOrder(orderId);
    return order.history;
  }
}

export const orderService = new OrderService();
