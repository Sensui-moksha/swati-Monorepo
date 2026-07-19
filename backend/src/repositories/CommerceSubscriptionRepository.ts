import { Types } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import {
  CommerceSubscription,
  ICommerceSubscription,
} from "../models/CommerceSubscription";

export class CommerceSubscriptionRepository extends BaseRepository<ICommerceSubscription> {
  constructor() {
    super(CommerceSubscription);
  }

  async findBySubscriptionNumber(
    subscriptionNumber: string,
  ): Promise<ICommerceSubscription | null> {
    return this.model.findOne({ subscriptionNumber }).exec();
  }

  async findByUser(
    userId: string | Types.ObjectId,
  ): Promise<ICommerceSubscription[]> {
    return (this.model as typeof CommerceSubscription).findByUser(
      userId instanceof Types.ObjectId ? userId : new Types.ObjectId(userId),
    );
  }

  async findActiveByUser(
    userId: string | Types.ObjectId,
  ): Promise<ICommerceSubscription | null> {
    return (this.model as typeof CommerceSubscription).findActiveByUser(
      userId instanceof Types.ObjectId ? userId : new Types.ObjectId(userId),
    );
  }
}

export const commerceSubscriptionRepository =
  new CommerceSubscriptionRepository();
