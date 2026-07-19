import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { planService } from "../services/planService";
import { subscriptionService } from "../services/subscriptionService";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import { invoiceService } from "../services/invoiceService";
import { couponService } from "../services/couponService";
import { promotionService } from "../services/promotionService";
import { accessControlService } from "../services/accessControlService";
import { reportingService } from "../services/reportingService";

const requireUserId = (req: AuthRequest): string => {
  const userId = req.user?._id?.toString();
  if (!userId) throw new Error("Authentication required");
  return userId;
};

const requireParam = (value: string | undefined, name: string): string => {
  if (!value) throw new Error(`${name} is required`);
  return value;
};

export class CommerceController {
  // Plans
  async createPlan(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res
        .status(201)
        .json({ success: true, data: await planService.createPlan(req.body) });
    } catch (error) {
      next(error);
    }
  }
  async updatePlan(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await planService.updatePlan(
          requireParam(req.params.id, "id"),
          req.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async deletePlan(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await planService.deletePlan(requireParam(req.params.id, "id"));
      res.json({ success: true, message: "Plan deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
  async archivePlan(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await planService.archivePlan(requireParam(req.params.id, "id")),
      });
    } catch (error) {
      next(error);
    }
  }
  async restorePlan(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await planService.restorePlan(requireParam(req.params.id, "id")),
      });
    } catch (error) {
      next(error);
    }
  }
  async listPlans(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await planService.listPlans(
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async getPlan(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await planService.getPlan(requireParam(req.params.id, "id")),
      });
    } catch (error) {
      next(error);
    }
  }
  async getPlanBySlug(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await planService.getPlanBySlug(
          requireParam(req.params.slug, "slug"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }

  // Subscriptions
  async subscribe(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: await subscriptionService.subscribe(
          req.body.userId,
          req.body.planId,
          {
            trialEndsAt: req.body.trialEndsAt,
            autoRenew: req.body.autoRenew,
            note: req.body.note,
            performedBy: req.user?._id?.toString(),
          },
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async renew(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await subscriptionService.renew(
          requireParam(req.params.id, "id"),
          {
            extensionDays: req.body.extensionDays,
            note: req.body.note,
            performedBy: req.user?._id?.toString(),
          },
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async upgrade(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await subscriptionService.upgrade(
          requireParam(req.params.id, "id"),
          req.body.planId,
          { note: req.body.note, performedBy: req.user?._id?.toString() },
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async downgrade(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await subscriptionService.downgrade(
          requireParam(req.params.id, "id"),
          req.body.planId,
          { note: req.body.note, performedBy: req.user?._id?.toString() },
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async pause(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await subscriptionService.pause(
          requireParam(req.params.id, "id"),
          { note: req.body.note, performedBy: req.user?._id?.toString() },
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async resume(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await subscriptionService.resume(
          requireParam(req.params.id, "id"),
          { note: req.body.note, performedBy: req.user?._id?.toString() },
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async cancelSubscription(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await subscriptionService.cancel(
          requireParam(req.params.id, "id"),
          { note: req.body.note, performedBy: req.user?._id?.toString() },
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async expire(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await subscriptionService.expire(
          requireParam(req.params.id, "id"),
          { note: req.body.note, performedBy: req.user?._id?.toString() },
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async listSubscriptions(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await subscriptionService.getByUser(
          String(req.query.userId || requireUserId(req)),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async getSubscription(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await subscriptionService.getById(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async subscriptionHistory(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await subscriptionService.listHistory(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }

  // Orders
  async createOrder(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: await orderService.createOrder(req.body.userId, req.body.items, {
          discount: req.body.discount,
          taxRate: req.body.taxRate,
          currency: req.body.currency,
          couponCode: req.body.couponCode,
          planId: req.body.planId,
          subscriptionId: req.body.subscriptionId,
          note: req.body.note,
          performedBy: req.user?._id?.toString(),
        }),
      });
    } catch (error) {
      next(error);
    }
  }
  async updateOrder(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await orderService.updateOrder(
          requireParam(req.params.id, "id"),
          req.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async cancelOrder(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await orderService.cancelOrder(
          requireParam(req.params.id, "id"),
          req.body.note,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async getOrder(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await orderService.getOrder(requireParam(req.params.id, "id")),
      });
    } catch (error) {
      next(error);
    }
  }
  async getOrderByNumber(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await orderService.getOrderByNumber(
          requireParam(req.params.orderNumber, "orderNumber"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async listOrders(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await orderService.listOrders(
          req.query.userId ? String(req.query.userId) : undefined,
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async orderHistory(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await orderService.history(requireParam(req.params.id, "id")),
      });
    } catch (error) {
      next(error);
    }
  }

  // Payments
  async createPayment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: await paymentService.createPayment(
          req.body.userId || requireUserId(req),
          req.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async verifyPayment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await paymentService.verifyPayment(
          requireParam(req.params.id, "id"),
          req.body.payload,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async capturePayment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await paymentService.capturePayment(
          requireParam(req.params.id, "id"),
          req.body.amount,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async cancelPayment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await paymentService.cancelPayment(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async refundPayment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await paymentService.refundPayment(
          requireParam(req.params.id, "id"),
          req.body.amount,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async getPaymentStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await paymentService.getPaymentStatus(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async getPayment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await paymentService.getById(requireParam(req.params.id, "id")),
      });
    } catch (error) {
      next(error);
    }
  }
  async getPaymentByReference(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await paymentService.getByReference(
          requireParam(req.params.referenceNumber, "referenceNumber"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async listPayments(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await paymentService.listPayments(
          req.query.userId ? String(req.query.userId) : undefined,
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async paymentAttempts(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await paymentService.attempts(requireParam(req.params.id, "id")),
      });
    } catch (error) {
      next(error);
    }
  }
  async paymentAuditTrail(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await paymentService.auditTrail(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }

  // Invoices
  async generateInvoice(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: await invoiceService.generateInvoice(req.body.orderId, req.body),
      });
    } catch (error) {
      next(error);
    }
  }
  async getInvoice(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await invoiceService.getInvoice(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async getInvoiceByNumber(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await invoiceService.getInvoiceByNumber(
          requireParam(req.params.invoiceNumber, "invoiceNumber"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async listInvoices(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await invoiceService.listInvoices(
          req.query.userId ? String(req.query.userId) : undefined,
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async invoiceHistory(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await invoiceService.history(requireParam(req.params.id, "id")),
      });
    } catch (error) {
      next(error);
    }
  }
  async downloadInvoice(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await invoiceService.downloadPlaceholder(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }

  // Coupons
  async createCoupon(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: await couponService.createCoupon(req.body),
      });
    } catch (error) {
      next(error);
    }
  }
  async updateCoupon(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await couponService.updateCoupon(
          requireParam(req.params.id, "id"),
          req.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteCoupon(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await couponService.deleteCoupon(requireParam(req.params.id, "id"));
      res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
  async archiveCoupon(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await couponService.archiveCoupon(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async restoreCoupon(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await couponService.restoreCoupon(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async listCoupons(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await couponService.listCoupons(
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async getCoupon(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await couponService.getCoupon(requireParam(req.params.id, "id")),
      });
    } catch (error) {
      next(error);
    }
  }
  async getCouponByCode(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await couponService.getByCode(
          requireParam(req.params.code, "code"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }

  // Promotions
  async createPromotion(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: await promotionService.createPromotion(req.body),
      });
    } catch (error) {
      next(error);
    }
  }
  async updatePromotion(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await promotionService.updatePromotion(
          requireParam(req.params.id, "id"),
          req.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async deletePromotion(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await promotionService.deletePromotion(requireParam(req.params.id, "id"));
      res.json({ success: true, message: "Promotion deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
  async archivePromotion(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await promotionService.archivePromotion(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async restorePromotion(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await promotionService.restorePromotion(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async listPromotions(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await promotionService.listPromotions(
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async getPromotion(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await promotionService.getPromotion(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async getPromotionBySlug(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await promotionService.getPromotionBySlug(
          requireParam(req.params.slug, "slug"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async activePromotions(
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await promotionService.activePromotions(),
      });
    } catch (error) {
      next(error);
    }
  }

  // Access control
  async checkAccess(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await accessControlService.canAccessContent(
          req.body.userId || requireUserId(req),
          req.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async assertAccess(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await accessControlService.assertAccess(
          req.body.userId || requireUserId(req),
          req.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  }

  // Reports
  async revenueSummary(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await reportingService.revenueSummary({
          from: req.query.from ? new Date(String(req.query.from)) : undefined,
          to: req.query.to ? new Date(String(req.query.to)) : undefined,
        }),
      });
    } catch (error) {
      next(error);
    }
  }
  async reportOrders(
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({ success: true, data: await reportingService.orders() });
    } catch (error) {
      next(error);
    }
  }
  async reportSubscriptions(
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({ success: true, data: await reportingService.subscriptions() });
    } catch (error) {
      next(error);
    }
  }
  async reportInvoices(
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({ success: true, data: await reportingService.invoices() });
    } catch (error) {
      next(error);
    }
  }
  async reportCoupons(
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({ success: true, data: await reportingService.coupons() });
    } catch (error) {
      next(error);
    }
  }
  async reportTransactions(
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({ success: true, data: await reportingService.transactions() });
    } catch (error) {
      next(error);
    }
  }
}

export const commerceController = new CommerceController();
