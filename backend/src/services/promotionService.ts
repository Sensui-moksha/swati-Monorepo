import { ApiError } from "../middleware/errorHandler";
import { commercePromotionRepository } from "../repositories/CommercePromotionRepository";
import { ICommercePromotion } from "../models/CommercePromotion";

export class PromotionService {
  async createPromotion(
    input: Partial<ICommercePromotion>,
  ): Promise<ICommercePromotion> {
    if (!input.title || !input.type || !input.discountType)
      throw new ApiError(
        400,
        "Promotion title, type and discount type are required",
      );
    return commercePromotionRepository.create(input as any);
  }
  async updatePromotion(
    id: string,
    input: Partial<ICommercePromotion>,
  ): Promise<ICommercePromotion> {
    const updated = await commercePromotionRepository.updateById(
      id,
      input as any,
    );
    if (!updated) throw new ApiError(404, "Promotion not found");
    return updated;
  }
  async deletePromotion(id: string): Promise<void> {
    const deleted = await commercePromotionRepository.softDelete(id);
    if (!deleted) throw new ApiError(404, "Promotion not found");
  }
  async archivePromotion(id: string): Promise<ICommercePromotion> {
    return this.updatePromotion(id, {
      isArchived: true,
      isActive: false,
      archivedAt: new Date(),
    } as any);
  }
  async restorePromotion(id: string): Promise<ICommercePromotion> {
    return this.updatePromotion(id, {
      isArchived: false,
      isActive: true,
      archivedAt: undefined,
      isDeleted: false,
      deletedAt: undefined,
    } as any);
  }
  async listPromotions(page = 1, limit = 20) {
    return commercePromotionRepository.findWithPagination(
      {},
      { page, limit, sort: { updatedAt: -1 } },
    );
  }
  async getPromotion(id: string) {
    const promotion = await commercePromotionRepository.findById(id);
    if (!promotion) throw new ApiError(404, "Promotion not found");
    return promotion;
  }
  async getPromotionBySlug(slug: string) {
    const promotion = await commercePromotionRepository.findBySlug(slug);
    if (!promotion) throw new ApiError(404, "Promotion not found");
    return promotion;
  }
  async activePromotions() {
    return commercePromotionRepository.findActive();
  }
}

export const promotionService = new PromotionService();
