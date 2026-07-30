import { analyticsService } from '../../backend/src/services/analyticsService';
import { commercePaymentRepository } from '../../backend/src/repositories/CommercePaymentRepository';
import { commerceSubscriptionRepository } from '../../backend/src/repositories/CommerceSubscriptionRepository';

// Mock dependencies
jest.mock('../../backend/src/repositories/CommercePaymentRepository');
jest.mock('../../backend/src/repositories/CommerceSubscriptionRepository');

describe('Financial Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate MRR and ARR correctly', async () => {
    // Mock 100 active subs, 20 canceled
    (commerceSubscriptionRepository.count as jest.Mock).mockImplementation((filter) => {
      if (filter.status === 'active') return Promise.resolve(100);
      if (filter.status === 'canceled') return Promise.resolve(20);
      return Promise.resolve(0);
    });

    (commercePaymentRepository.aggregate as jest.Mock).mockResolvedValue([
      { _id: { year: 2026, month: 6 }, revenue: 1200, count: 100 },
      { _id: { year: 2026, month: 7 }, revenue: 1500, count: 120 }
    ]);

    const result = await analyticsService.getFinancialReports();

    expect(result.activeSubscriptions).toBe(100);
    expect(result.mrr).toBe(1500); // 100 * 15
    expect(result.arr).toBe(18000); // 1500 * 12
    expect(result.churnRate).toBeCloseTo(16.66); // 20 / (100 + 20) * 100
    expect(result.revenueTrends.length).toBe(2);
  });
});
