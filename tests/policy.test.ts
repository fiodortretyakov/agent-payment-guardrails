import { PolicyEngine } from '../src/policies/engine';
import { MaxAmountPolicy } from '../src/policies/amountPolicy';
import { CategoryPolicy } from '../src/policies/categoryPolicy';
import { PaymentIntentSchema } from '../src/models/payment';

describe('End-to-End Guardrail Validation', () => {
  const engine = new PolicyEngine([new MaxAmountPolicy(1000), new CategoryPolicy()]);

  // Case 1: The Happy Path
  test('✅ should APPROVE a valid standard request', () => {
    const valid = {
      amount: 500,
      currency: 'GBP',
      beneficiary: 'AWS',
      category: 'software',
      justification: 'Cloud hosting for the main app',
    };
    const result = engine.evaluate(valid as any);
    expect(result.approved).toBe(true);
  });

  // Case 2: Guardrail - Amount Limit
  test('❌ should BLOCK payment exceeding MaxAmountPolicy', () => {
    const expensive = {
      amount: 1001,
      currency: 'GBP',
      beneficiary: 'Luxury Cars Ltd',
      category: 'equipment',
      justification: 'New CEO company car',
    };
    const result = engine.evaluate(expensive as any);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('exceeds limit');
  });

  // Case 3: Guardrail - Category Restriction
  test('❌ should BLOCK payment for non-approved categories', () => {
    const restricted = {
      amount: 50,
      currency: 'GBP',
      beneficiary: 'Local Pub',
      category: 'services', // Not in our 'equipment/software/travel' list
      justification: 'Team drinks',
    };
    const result = engine.evaluate(restricted as any);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('not in the approved list');
  });

  // Case 4: Schema Validation (The "Zod" Test)
  test('🚨 should THROW error if agent sends invalid data types', () => {
    const malformed = {
      amount: 'five hundred', // String instead of number
      currency: 'XYZ', // Invalid enum
      beneficiary: '',
      category: 'unknown',
    };

    const parseResult = PaymentIntentSchema.safeParse(malformed);
    expect(parseResult.success).toBe(false);
  });
});
