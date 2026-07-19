import { BaseRepository } from "./BaseRepository";
import { WebhookLog, IWebhookLog } from "../models/WebhookLog";

export class WebhookLogRepository extends BaseRepository<IWebhookLog> {
  constructor() {
    super(WebhookLog);
  }

  async findByProvider(providerName: string): Promise<IWebhookLog[]> {
    return (this.model as typeof WebhookLog).findByProvider(providerName);
  }
}

export const webhookLogRepository = new WebhookLogRepository();
