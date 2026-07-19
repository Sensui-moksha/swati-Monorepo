import { z } from "zod";

const objectId = z.string().regex(/^[a-f0-9]{24}$/, "Invalid ObjectId");

const listQuery = z.object({
  query: z
    .object({
      page: z.string().regex(/^\d+$/).optional(),
      limit: z.string().regex(/^\d+$/).optional(),
      search: z.string().optional(),
    })
    .partial(),
});

export const planIdSchema = z.object({ params: z.object({ id: objectId }) });
export const planSlugSchema = z.object({
  params: z.object({ slug: z.string().min(1) }),
});
export const planListQuerySchema = listQuery;
export const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(120),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    description: z.string().max(1000).optional(),
    billingCycle: z.enum([
      "free",
      "monthly",
      "quarterly",
      "half_yearly",
      "annual",
      "lifetime",
    ]),
    price: z.number().min(0).optional(),
    currency: z.string().max(10).optional(),
    trialDays: z.number().int().min(0).optional(),
    features: z.array(z.string()).optional(),
    limits: z
      .object({
        books: z.number().int().min(0).optional(),
        devices: z.number().int().min(0).optional(),
        downloads: z.number().int().min(0).optional(),
      })
      .optional(),
    sortOrder: z.number().int().optional(),
  }),
});
export const updatePlanSchema = z.object({
  body: createPlanSchema.shape.body.partial(),
});

export const subscriptionIdSchema = z.object({
  params: z.object({ id: objectId }),
});
export const subscriptionActionSchema = z.object({
  body: z.object({
    note: z.string().max(500).optional(),
    performedBy: z
      .string()
      .regex(/^[a-f0-9]{24}$/)
      .optional(),
    extensionDays: z.number().int().min(1).max(3650).optional(),
    planId: objectId.optional(),
    trialEndsAt: z.coerce.date().optional(),
    autoRenew: z.boolean().optional(),
  }),
});
export const subscriptionListQuerySchema = listQuery;
export const createSubscriptionSchema = z.object({
  body: z.object({
    userId: objectId,
    planId: objectId,
    trialEndsAt: z.coerce.date().optional(),
    autoRenew: z.boolean().optional(),
    note: z.string().max(500).optional(),
  }),
});

export const orderIdSchema = z.object({ params: z.object({ id: objectId }) });
export const orderNumberSchema = z.object({
  params: z.object({ orderNumber: z.string().min(1) }),
});
export const orderListQuerySchema = listQuery;
export const createOrderSchema = z.object({
  body: z.object({
    userId: objectId,
    items: z
      .array(
        z.object({
          type: z.enum([
            "plan",
            "book",
            "publication",
            "magazine_issue",
            "subscription",
            "custom",
          ]),
          resourceId: objectId.optional(),
          title: z.string().min(1).max(200),
          quantity: z.number().int().min(1),
          unitPrice: z.number().min(0),
        }),
      )
      .min(1),
    discount: z.number().min(0).optional(),
    taxRate: z.number().min(0).max(1).optional(),
    currency: z.string().max(10).optional(),
    couponCode: z.string().max(50).optional(),
    planId: objectId.optional(),
    subscriptionId: objectId.optional(),
    note: z.string().max(500).optional(),
  }),
});
export const updateOrderSchema = z.object({
  body: z
    .object({
      status: z
        .enum([
          "pending",
          "processing",
          "awaiting_payment",
          "paid",
          "failed",
          "cancelled",
          "completed",
          "refund_pending",
          "refunded",
        ])
        .optional(),
      couponCode: z.string().max(50).optional(),
      note: z.string().max(500).optional(),
    })
    .partial(),
});

export const paymentIdSchema = z.object({ params: z.object({ id: objectId }) });
export const paymentRefSchema = z.object({
  params: z.object({ referenceNumber: z.string().min(1) }),
});
export const createPaymentSchema = z.object({
  body: z.object({
    orderId: objectId,
    userId: objectId.optional(),
    subscriptionId: objectId.optional(),
    amount: z.number().min(0),
    currency: z.string().max(10),
    metadata: z.record(z.unknown()).optional(),
  }),
});
export const paymentListQuerySchema = listQuery;
export const refundPaymentSchema = z.object({
  body: z.object({ amount: z.number().min(0).optional() }),
});

export const invoiceIdSchema = z.object({ params: z.object({ id: objectId }) });
export const invoiceNumberSchema = z.object({
  params: z.object({ invoiceNumber: z.string().min(1) }),
});
export const invoiceListQuerySchema = listQuery;
export const createInvoiceSchema = z.object({
  body: z.object({
    orderId: objectId,
    userId: objectId,
    subscriptionId: objectId.optional(),
    paymentId: objectId.optional(),
    gstin: z.string().max(20).optional(),
    note: z.string().max(500).optional(),
  }),
});

export const couponIdSchema = z.object({ params: z.object({ id: objectId }) });
export const couponCodeSchema = z.object({
  params: z.object({ code: z.string().min(1) }),
});
export const couponListQuerySchema = listQuery;
export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50),
    title: z.string().min(1).max(120),
    description: z.string().max(1000).optional(),
    type: z.enum(["percentage", "flat"]),
    value: z.number().min(0),
    expiryAt: z.coerce.date().optional(),
    usageLimit: z.number().int().min(0).optional(),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
    applicablePlans: z.array(objectId).optional(),
    applicableBooks: z.array(objectId).optional(),
    applicableCategories: z.array(objectId).optional(),
  }),
});
export const updateCouponSchema = z.object({
  body: createCouponSchema.shape.body.partial(),
});

export const promotionIdSchema = z.object({
  params: z.object({ id: objectId }),
});
export const promotionSlugSchema = z.object({
  params: z.object({ slug: z.string().min(1) }),
});
export const promotionListQuerySchema = listQuery;
export const createPromotionSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(160),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    type: z.enum([
      "festival",
      "student",
      "referral",
      "flash_sale",
      "limited_time_offer",
    ]),
    description: z.string().max(1000).optional(),
    discountType: z.enum(["percentage", "flat"]),
    discountValue: z.number().min(0),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
    usageLimit: z.number().int().min(0).optional(),
    applicablePlans: z.array(objectId).optional(),
    applicableBooks: z.array(objectId).optional(),
    applicableCategories: z.array(objectId).optional(),
  }),
});
export const updatePromotionSchema = z.object({
  body: createPromotionSchema.shape.body.partial(),
});

export const webhookSchema = z.object({
  body: z.object({
    providerName: z.string().min(1),
    eventType: z.string().min(1),
    referenceNumber: z.string().optional(),
    payload: z.record(z.unknown()).optional(),
  }),
});

export const reportingQuerySchema = z.object({
  query: z
    .object({
      from: z.coerce.date().optional(),
      to: z.coerce.date().optional(),
    })
    .partial(),
});
