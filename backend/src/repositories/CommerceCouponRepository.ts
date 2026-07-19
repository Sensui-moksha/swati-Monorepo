import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { CommerceCoupon, ICommerceCoupon } from "../models/CommerceCoupon";

export class CommerceCouponRepository extends BaseRepository<ICommerceCoupon> {
  constructor() {
    super(CommerceCoupon);
  }

  async findByCode(code: string): Promise<ICommerceCoupon | null> {
    return (this.model as typeof CommerceCoupon).findByCode(code);
  }
  async findActive(): Promise<ICommerceCoupon[]> {
    return (this.model as typeof CommerceCoupon).findActive();
  }
  async findWithPagination(
    filter: Record<string, unknown> = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<ICommerceCoupon>> {
    return super.findWithPagination(filter as any, options);
  }
}

export const commerceCouponRepository = new CommerceCouponRepository();
