import { computeAgingBuckets, computeOnTimeRate, computeDSO } from '../api.analytics';

describe('analytics helpers', () => {
  test('computeAgingBuckets groups balances correctly by due days', () => {
    const asOf = new Date('2025-01-31T00:00:00Z');
    const mk = (due, bal) => ({ due_date: due, balance: bal });
    const invoices = [
      mk('2025-01-20', 100), // 11 days => 0-30
      mk('2024-12-31', 200), // 31 days => 31-60
      mk('2024-11-25', 300), // 67 days => 61-90
      mk('2024-09-01', 400), // 152 days => 90+
    ];
    const { buckets, counts } = computeAgingBuckets(invoices, asOf);
    expect(buckets['0-30']).toBe(100);
    expect(buckets['31-60']).toBe(200);
    expect(buckets['61-90']).toBe(300);
    expect(buckets['90+']).toBe(400);
    expect(counts).toEqual({ '0-30': 1, '31-60': 1, '61-90': 1, '90+': 1 });
  });

  test('computeOnTimeRate counts fully paid on/before due date', () => {
    const invoices = [
      { total: 100, paid_total: 100, due_date: '2025-02-01', paid_at: '2025-02-01' }, // on-time
      { total: 150, paid_total: 150, due_date: '2025-02-01', paid_at: '2025-02-02' }, // late
      { total: 200, paid_total: 100, due_date: '2025-02-01', paid_at: '2025-01-31' }, // not fully paid
    ];
    const rate = computeOnTimeRate(invoices);
    expect(rate).toBeCloseTo(1 / 3);
  });

  test('computeDSO uses (Avg AR / Net Credit Sales) * periodDays', () => {
    const dso = computeDSO({ averageAR: 5000, netCreditSales: 60000, periodDays: 365 });
    expect(dso).toBeCloseTo((5000 / 60000) * 365);
  });
});


