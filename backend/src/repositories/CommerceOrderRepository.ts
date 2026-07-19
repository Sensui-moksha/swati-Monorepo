import { Types } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { CommerceOrder, ICommerceOrder } from "../models/CommerceOrder";

export class CommerceOrderRepository extends BaseRepository<ICommerceOrder> {
  constructor() {
    super(CommerceOrder);
  }

  async findByOrderNumber(orderNumber: string): Promise<ICommerceOrder | null> {
    return (this.model as typeof CommerceOrder).findByOrderNumber(orderNumber);
  }
  async findByUser(userId: string | Types.ObjectId): Promise<ICommerceOrder[]> {
    return (this.model as typeof CommerceOrder).findByUser(
      userId instanceof Types.ObjectId ? userId : new Types.ObjectId(userId),
    );
  }
}

export const commerceOrderRepository = new CommerceOrderRepository();
