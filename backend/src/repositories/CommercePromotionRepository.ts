import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import {
  CommercePromotion,
  ICommercePromotion,
} from "../models/CommercePromotion";

export class CommercePromotionRepository extends BaseRepository<ICommercePromotion> {
  constructor() {
    super(CommercePromotion);
  }

  async findBySlug(slug: string): Promise<ICommercePromotion | null> {
    return (this.model as typeof CommercePromotion).findBySlug(slug);
  }
  async findActive(): Promise<ICommercePromotion[]> {
    return (this.model as typeof CommercePromotion).findActive();
  }
  async findWithPagination(
    filter: Record<string, unknown> = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<ICommercePromotion>> {
    return super.findWithPagination(filter as any, options);
  }
}

export const commercePromotionRepository = new CommercePromotionRepository();
