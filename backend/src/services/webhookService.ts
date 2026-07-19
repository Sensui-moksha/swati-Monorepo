import { PaymentProviderWebhookResult } from "../interfaces/payment";
import { webhookLogRepository } from "../repositories/WebhookLogRepository";

export class WebhookService {
  async logWebhook(
    providerName: string,
    eventType: string,
    payload: Record<string, unknown>,
    headers: Record<string, unknown>,
    status: "received" | "verified" | "failed" | "ignored" = "received",
    response?: Record<string, unknown>,
  ) {
    return webhookLogRepository.create({
      providerName,
      eventType,
      payload,
      headers,
      status,
      response,
      processedAt: new Date(),
    } as any);
  }

  async listLogs(providerName: string) {
    return webhookLogRepository.findByProvider(providerName);
  }
  async notImplemented(
    providerName: string,
    eventType: string,
    payload: Record<string, unknown>,
    headers: Record<string, unknown>,
  ): Promise<{ status: 501; result: PaymentProviderWebhookResult }> {
    const result: PaymentProviderWebhookResult = {
      providerName,
      eventType,
      verified: false,
      raw: payload,
    };
    await this.logWebhook(
      providerName,
      eventType,
      payload,
      headers,
      "ignored",
      { message: "Not implemented" },
    );
    return { status: 501, result };
  }
}

export const webhookService = new WebhookService();
