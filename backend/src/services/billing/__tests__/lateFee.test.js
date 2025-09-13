import { computeLateFee } from '../lateFee.js';

describe('computeLateFee', () => {
  const prefs = { initialPct: 0.10, monthlyCompPct: 0.015 };

  test('on-time (asOf equal to due date) -> 0', () => {
    const invoice = { total: 1000, paid_total: 0, due_date: '2025-01-15' };
    const fee = computeLateFee(invoice, '2025-01-15', prefs);
    expect(fee).toBe(0);
  });

  test('1 day late -> 10% initial only', () => {
    const invoice = { total: 1000, paid_total: 0, due_date: '2025-01-15' };
    const fee = computeLateFee(invoice, '2025-01-16', prefs);
    expect(fee).toBe(100); // $100.00
  });

  test('32 days late -> 10% initial + 1 full compounding period (1.5%)', () => {
    const invoice = { total: 1000, paid_total: 0, due_date: '2025-01-15' };
    const fee = computeLateFee(invoice, '2025-02-16', prefs); // 32 days later
    // Base 1000 -> after initial: 1100; 1.5% on 1100 = 16.50; fee total = 116.50
    expect(fee).toBe(116.5);
  });

  test('65 days late -> initial + 2 periods of 1.5% compounding', () => {
    const invoice = { total: 1000, paid_total: 0, due_date: '2025-01-15' };
    const fee = computeLateFee(invoice, '2025-03-21', prefs); // ~65 days later
    // Base 1000 -> initial 10% => 1100; month1 1.5%: 1116.50; month2 1.5%: 1133.2475 rounded to cents: 1133.25
    // fee = 133.25
    expect(fee).toBe(133.25);
  });
});


