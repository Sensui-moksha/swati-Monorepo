import { Types } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { CommerceInvoice, ICommerceInvoice } from "../models/CommerceInvoice";

export class CommerceInvoiceRepository extends BaseRepository<ICommerceInvoice> {
  constructor() {
    super(CommerceInvoice);
  }

  async findByInvoiceNumber(
    invoiceNumber: string,
  ): Promise<ICommerceInvoice | null> {
    return (this.model as typeof CommerceInvoice).findByInvoiceNumber(
      invoiceNumber,
    );
  }
  async findByOrder(
    orderId: string | Types.ObjectId,
  ): Promise<ICommerceInvoice[]> {
    return (this.model as typeof CommerceInvoice).findByOrder(
      orderId instanceof Types.ObjectId ? orderId : new Types.ObjectId(orderId),
    );
  }
  async findByUser(
    userId: string | Types.ObjectId,
  ): Promise<ICommerceInvoice[]> {
    return (this.model as typeof CommerceInvoice).findByUser(
      userId instanceof Types.ObjectId ? userId : new Types.ObjectId(userId),
    );
  }
}

export const commerceInvoiceRepository = new CommerceInvoiceRepository();
