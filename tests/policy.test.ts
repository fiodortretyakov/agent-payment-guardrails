import { PolicyEngine } from '../src/policies/engine';
import { MaxAmountPolicy } from '../src/policies/amountPolicy';
import { CategoryPolicy } from '../src/policies/categoryPolicy';
import type { PaymentIntent } from '../src/models/payment';

describe('Safety Guardrails', () => {
  // A standard valid payment to use in tests
  const validIntent: PaymentIntent = {
    amount: 100,
    currency: 'GBP',
    beneficiary: 'Test Vendor',
    category: 'equipment',
    justification: 'Unit test',
  };

  test('should BLOCK payments over the limit', () => {
    const engine = new PolicyEngine([new MaxAmountPolicy(500)]);
    const result = engine.evaluate({ ...validIntent, amount: 1000 });

    expect(result.approved).toBe(false);
    expect(result.reason).toContain('exceeds limit');
  });

  test('should APPROVE payments within the limit', () => {
    const engine = new PolicyEngine([new MaxAmountPolicy(500)]);
    const result = engine.evaluate({ ...validIntent, amount: 499 });

    expect(result.approved).toBe(true);
  });

  test('should BLOCK forbidden categories', () => {
    const engine = new PolicyEngine([new CategoryPolicy()]);
    // @ts-ignore - forcing a bad category to test the logic layer
    const result = engine.evaluate({ ...validIntent, category: 'gambling' });

    expect(result.approved).toBe(false);
    expect(result.reason).toContain('not in the approved list');
  });
});
