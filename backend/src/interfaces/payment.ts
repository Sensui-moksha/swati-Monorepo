export interface PaymentProviderCreateResult {
  providerName: string;
  referenceNumber: string;
  status: "pending" | "authorized" | "captured";
  orderId: string;
  amount: number;
  currency: string;
  raw?: Record<string, unknown>;
}

export interface PaymentProviderStatusResult {
  providerName: string;
  referenceNumber: string;
  status:
    "pending" | "authorized" | "captured" | "failed" | "cancelled" | "refunded";
  raw?: Record<string, unknown>;
}

export interface PaymentProviderRefundResult {
  providerName: string;
  referenceNumber: string;
  refundReference: string;
  status: "refunded" | "partially_refunded";
  raw?: Record<string, unknown>;
}

export interface PaymentProviderWebhookResult {
  providerName: string;
  eventType: string;
  verified: boolean;
  raw?: Record<string, unknown>;
}

export interface PaymentProvider {
  providerName: string;
  createPayment(input: {
    orderId: string;
    amount: number;
    currency: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentProviderCreateResult>;
  verifyPayment(input: {
    referenceNumber: string;
    payload?: Record<string, unknown>;
  }): Promise<boolean>;
  capturePayment(input: {
    referenceNumber: string;
    amount?: number;
    payload?: Record<string, unknown>;
  }): Promise<PaymentProviderStatusResult>;
  cancelPayment(input: {
    referenceNumber: string;
    payload?: Record<string, unknown>;
  }): Promise<PaymentProviderStatusResult>;
  refundPayment(input: {
    referenceNumber: string;
    amount?: number;
    payload?: Record<string, unknown>;
  }): Promise<PaymentProviderRefundResult>;
  getPaymentStatus(input: {
    referenceNumber: string;
  }): Promise<PaymentProviderStatusResult>;
  createWebhook(input: {
    eventType: string;
    targetUrl: string;
  }): Promise<{ providerName: string; webhookId: string; targetUrl: string }>;
  verifyWebhook(input: {
    headers?: Record<string, string | string[] | undefined>;
    body?: Record<string, unknown>;
  }): Promise<PaymentProviderWebhookResult>;
}
