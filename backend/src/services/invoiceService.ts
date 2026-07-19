import { ApiError } from "../middleware/errorHandler";
import { commerceInvoiceRepository } from "../repositories/CommerceInvoiceRepository";
import { commerceOrderRepository } from "../repositories/CommerceOrderRepository";
import { generateInvoiceNumber } from "../utils/payment";
import { ICommerceInvoice } from "../models/CommerceInvoice";

export class InvoiceService {
  async generateInvoice(
    orderId: string,
    input: {
      userId: string;
      subscriptionId?: string;
      paymentId?: string;
      gstin?: string;
      note?: string;
    },
  ): Promise<ICommerceInvoice> {
    const order = await commerceOrderRepository.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");
    return commerceInvoiceRepository.create({
      invoiceNumber: generateInvoiceNumber(),
      user: input.userId,
      order: orderId,
      subscription: input.subscriptionId,
      payment: input.paymentId,
      currency: order.currency,
      subtotal: order.subtotal,
      discount: order.discount,
      tax: order.tax,
      total: order.total,
      gstin: input.gstin,
      cgst: 0,
      sgst: 0,
      igst: 0,
      status: "issued",
      issuedAt: new Date(),
      downloadUrl: `/api/v1/invoices/${orderId}/download`,
      history: [
        { action: "generate", to: "issued", note: input.note, at: new Date() },
      ],
    } as any);
  }

  async getInvoice(id: string): Promise<ICommerceInvoice> {
    const invoice = await commerceInvoiceRepository.findById(id);
    if (!invoice) throw new ApiError(404, "Invoice not found");
    return invoice;
  }
  async getInvoiceByNumber(invoiceNumber: string) {
    const invoice =
      await commerceInvoiceRepository.findByInvoiceNumber(invoiceNumber);
    if (!invoice) throw new ApiError(404, "Invoice not found");
    return invoice;
  }
  async listInvoices(userId?: string, page = 1, limit = 20) {
    return userId
      ? commerceInvoiceRepository.findWithPagination({ user: userId } as any, {
          page,
          limit,
          sort: { createdAt: -1 },
        })
      : commerceInvoiceRepository.findWithPagination(
          {},
          { page, limit, sort: { createdAt: -1 } },
        );
  }
  async history(id: string) {
    const invoice = await this.getInvoice(id);
    return invoice.history;
  }
  async downloadPlaceholder(id: string) {
    const invoice = await this.getInvoice(id);
    return {
      invoiceNumber: invoice.invoiceNumber,
      downloadUrl: invoice.downloadUrl || `/api/v1/invoices/${id}/download`,
    };
  }
}

export const invoiceService = new InvoiceService();
