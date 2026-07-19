import { Types } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { CommercePayment, ICommercePayment } from "../models/CommercePayment";

export class CommercePaymentRepository extends BaseRepository<ICommercePayment> {
  constructor() {
    super(CommercePayment);
  }

  async findByReferenceNumber(
    referenceNumber: string,
  ): Promise<ICommercePayment | null> {
    return (this.model as typeof CommercePayment).findByReferenceNumber(
      referenceNumber,
    );
  }
  async findByOrder(
    orderId: string | Types.ObjectId,
  ): Promise<ICommercePayment[]> {
    return (this.model as typeof CommercePayment).findByOrder(
      orderId instanceof Types.ObjectId ? orderId : new Types.ObjectId(orderId),
    );
  }
  async findByUser(
    userId: string | Types.ObjectId,
  ): Promise<ICommercePayment[]> {
    return (this.model as typeof CommercePayment).findByUser(
      userId instanceof Types.ObjectId ? userId : new Types.ObjectId(userId),
    );
  }
}

export const commercePaymentRepository = new CommercePaymentRepository();
