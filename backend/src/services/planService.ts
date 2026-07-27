import { ApiError } from "../middleware/errorHandler";
import { planRepository } from "../repositories/PlanRepository";
import { IPlan } from "../models/Plan";

export class PlanService {
  async createPlan(input: Partial<IPlan>): Promise<IPlan> {
    if (!input.name || !input.billingCycle)
      throw new ApiError(400, "Plan name and billing cycle are required");
    return planRepository.create(input as Partial<IPlan>);
  }

  async updatePlan(id: string, input: Partial<IPlan>): Promise<IPlan> {
    const updated = await planRepository.updateById(id, input as any);
    if (!updated) throw new ApiError(404, "Plan not found");
    return updated;
  }

  async deletePlan(id: string): Promise<void> {
    const deleted = await planRepository.deleteById(id);
    if (!deleted) {
      const softDeleted = await planRepository.softDelete(id);
      if (!softDeleted) throw new ApiError(404, "Plan not found");
    }
  }

  async archivePlan(id: string): Promise<IPlan> {
    return this.updatePlan(id, {
      isArchived: true,
      isActive: false,
      archivedAt: new Date(),
    } as any);
  }
  async restorePlan(id: string): Promise<IPlan> {
    return this.updatePlan(id, {
      isArchived: false,
      isActive: true,
      archivedAt: undefined,
      isDeleted: false,
      deletedAt: undefined,
    } as any);
  }
  async listPlans(page = 1, limit = 20) {
    return planRepository.findWithPagination(
      { isDeleted: { $ne: true } },
      { page, limit, sort: { sortOrder: 1, name: 1 } },
    );
  }
  async getPlan(id: string) {
    const plan = await planRepository.findById(id);
    if (!plan) throw new ApiError(404, "Plan not found");
    return plan;
  }
  async getPlanBySlug(slug: string) {
    const plan = await planRepository.findBySlug(slug);
    if (!plan) throw new ApiError(404, "Plan not found");
    return plan;
  }
  async getActivePlans() {
    return planRepository.findActive();
  }
}

export const planService = new PlanService();
