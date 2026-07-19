import { PaymentProvider } from "../interfaces/payment";
import { generatePaymentReference } from "../utils/payment";

export class DummyPaymentProvider implements PaymentProvider {
  providerName = "dummy";

  async createPayment(input: {
    orderId: string;
    amount: number;
    currency: string;
    metadata?: Record<string, unknown>;
  }) {
    return {
      providerName: this.providerName,
      referenceNumber: generatePaymentReference("dummy"),
      status: "pending" as const,
      orderId: input.orderId,
      amount: input.amount,
      currency: input.currency,
      raw: { simulated: true, metadata: input.metadata || {} },
    };
  }

  async verifyPayment(input: {
    referenceNumber: string;
    payload?: Record<string, unknown>;
  }) {
    return !!input.referenceNumber;
  }

  async capturePayment(input: {
    referenceNumber: string;
    amount?: number;
    payload?: Record<string, unknown>;
  }) {
    return {
      providerName: this.providerName,
      referenceNumber: input.referenceNumber,
      status: "captured" as const,
      raw: {
        captured: true,
        amount: input.amount ?? null,
        payload: input.payload || {},
      },
    };
  }

  async cancelPayment(input: {
    referenceNumber: string;
    payload?: Record<string, unknown>;
  }) {
    return {
      providerName: this.providerName,
      referenceNumber: input.referenceNumber,
      status: "cancelled" as const,
      raw: { cancelled: true, payload: input.payload || {} },
    };
  }

  async refundPayment(input: {
    referenceNumber: string;
    amount?: number;
    payload?: Record<string, unknown>;
  }) {
    return {
      providerName: this.providerName,
      referenceNumber: input.referenceNumber,
      refundReference: generatePaymentReference("refund"),
      status: "refunded" as const,
      raw: {
        refunded: true,
        amount: input.amount ?? null,
        payload: input.payload || {},
      },
    };
  }

  async getPaymentStatus(input: { referenceNumber: string }) {
    return {
      providerName: this.providerName,
      referenceNumber: input.referenceNumber,
      status: "pending" as const,
      raw: { simulated: true },
    };
  }

  async createWebhook(input: { eventType: string; targetUrl: string }) {
    return {
      providerName: this.providerName,
      webhookId: generatePaymentReference("wh"),
      targetUrl: input.targetUrl,
    };
  }

  async verifyWebhook(input: {
    headers?: Record<string, string | string[] | undefined>;
    body?: Record<string, unknown>;
  }) {
    return {
      providerName: this.providerName,
      eventType: String(input.body?.eventType || "unknown"),
      verified: false,
      raw: { simulated: true },
    };
  }
}
