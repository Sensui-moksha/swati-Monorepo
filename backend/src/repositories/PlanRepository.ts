import { BaseRepository } from "./BaseRepository";
import { Plan, IPlan } from "../models/Plan";

export class PlanRepository extends BaseRepository<IPlan> {
  constructor() {
    super(Plan);
  }

  async findBySlug(slug: string): Promise<IPlan | null> {
    return (this.model as typeof Plan).findBySlug(slug);
  }
  async findActive(): Promise<IPlan[]> {
    return (this.model as typeof Plan).findActive();
  }
}

export const planRepository = new PlanRepository();
