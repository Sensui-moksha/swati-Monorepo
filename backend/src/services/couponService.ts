import { ApiError } from "../middleware/errorHandler";
import { commerceCouponRepository } from "../repositories/CommerceCouponRepository";
import { ICommerceCoupon } from "../models/CommerceCoupon";

export class CouponService {
  async createCoupon(
    input: Partial<ICommerceCoupon>,
  ): Promise<ICommerceCoupon> {
    if (!input.code || !input.title || !input.type)
      throw new ApiError(400, "Coupon code, title and type are required");
    return commerceCouponRepository.create(input as any);
  }
  async updateCoupon(
    id: string,
    input: Partial<ICommerceCoupon>,
  ): Promise<ICommerceCoupon> {
    const updated = await commerceCouponRepository.updateById(id, input as any);
    if (!updated) throw new ApiError(404, "Coupon not found");
    return updated;
  }
  async deleteCoupon(id: string): Promise<void> {
    const deleted = await commerceCouponRepository.softDelete(id);
    if (!deleted) throw new ApiError(404, "Coupon not found");
  }
  async archiveCoupon(id: string): Promise<ICommerceCoupon> {
    return this.updateCoupon(id, {
      isArchived: true,
      isActive: false,
      archivedAt: new Date(),
    } as any);
  }
  async restoreCoupon(id: string): Promise<ICommerceCoupon> {
    return this.updateCoupon(id, {
      isArchived: false,
      isActive: true,
      archivedAt: undefined,
      isDeleted: false,
      deletedAt: undefined,
    } as any);
  }
  async listCoupons(page = 1, limit = 20) {
    return commerceCouponRepository.findWithPagination(
      {},
      { page, limit, sort: { updatedAt: -1 } },
    );
  }
  async getCoupon(id: string) {
    const coupon = await commerceCouponRepository.findById(id);
    if (!coupon) throw new ApiError(404, "Coupon not found");
    return coupon;
  }
  async getByCode(code: string) {
    const coupon = await commerceCouponRepository.findByCode(code);
    if (!coupon) throw new ApiError(404, "Coupon not found");
    return coupon;
  }
}

export const couponService = new CouponService();
