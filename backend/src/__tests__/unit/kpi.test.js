import { computeLateFee } from '../../services/invoice.services.js';

describe('placeholder KPI related tests (backend)', () => {
  test('late fee returns 0 when before due date', () => {
    const fee = computeLateFee({ total: 100, paid_total: 0, due_at: '2025-02-10' }, '2025-02-01');
    expect(fee).toBe(0);
  });
});


