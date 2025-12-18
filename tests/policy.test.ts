import { PolicyEngine } from '../src/policies/engine';
import { MaxAmountPolicy } from '../src/policies/amountPolicy';
import { CategoryPolicy } from '../src/policies/categoryPolicy';
import { TimeBasedPolicy } from '../src/policies/timePolicy';
import { PaymentIntentSchema } from '../src/models/payment';

describe('End-to-End Guardrail Validation', () => {
  const engine = new PolicyEngine([new MaxAmountPolicy(1000), new CategoryPolicy()]);

  // Case 1: The Happy Path
  test('✅ should APPROVE a valid standard request', () => {
    const valid = {
      idempotencyKey: '11111111-1111-1111-1111-111111111111',
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
      idempotencyKey: '22222222-2222-2222-2222-222222222222',
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
      idempotencyKey: '33333333-3333-3333-3333-333333333333',
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

  // Case 5: Idempotency Check
  test('🔄 should BLOCK duplicate idempotencyKey', () => {
    const duplicateIntent = {
      idempotencyKey: '44444444-4444-4444-4444-444444444444',
      amount: 200,
      currency: 'GBP',
      beneficiary: 'Office Supplies',
      category: 'equipment',
      justification: 'Buying stationery for the team',
    };

    // First evaluation should pass
    const firstResult = engine.evaluate(duplicateIntent as any);
    expect(firstResult.approved).toBe(true);

    // Second evaluation with same key should be blocked
    const secondResult = engine.evaluate(duplicateIntent as any);
    expect(secondResult.approved).toBe(false);
    expect(secondResult.reason).toContain('Duplicate Payment');
  });
});

describe('MaxAmountPolicy', () => {
  const policy = new MaxAmountPolicy(1000);

  test('should ALLOW amounts below or equal to limit', () => {
    const intent = {
      idempotencyKey: 'test-key',
      amount: 500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'equipment',
      justification: 'Test purchase',
    } as any;

    const result = policy.validate(intent);
    expect(result.approved).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  test('should BLOCK amounts exceeding limit', () => {
    const intent = {
      idempotencyKey: 'test-key',
      amount: 1500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'equipment',
      justification: 'Test purchase',
    } as any;

    const result = policy.validate(intent);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('exceeds limit of 1000');
  });
});

describe('CategoryPolicy', () => {
  const policy = new CategoryPolicy();

  test('should ALLOW approved categories', () => {
    const intent = {
      idempotencyKey: 'test-key',
      amount: 500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'equipment',
      justification: 'Test purchase',
    } as any;

    const result = policy.validate(intent);
    expect(result.approved).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  test('should BLOCK non-approved categories', () => {
    const intent = {
      idempotencyKey: 'test-key',
      amount: 500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'services',
      justification: 'Test purchase',
    } as any;

    const result = policy.validate(intent);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('not in the approved list');
  });
});

describe('PolicyEngine Built-in Checks', () => {
  const engine = new PolicyEngine([]); // No policies, just built-ins

  test('should BLOCK intents with HTML in justification', () => {
    const maliciousIntent = {
      idempotencyKey: 'test-key',
      amount: 500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'equipment',
      justification: 'Test purchase <script>alert("xss")</script>',
    } as any;

    const result = engine.evaluate(maliciousIntent);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('Security Violation: HTML detected');
  });

  test('should ALLOW intents without HTML', () => {
    const cleanIntent = {
      idempotencyKey: 'test-key',
      amount: 500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'equipment',
      justification: 'Clean test purchase',
    } as any;

    const result = engine.evaluate(cleanIntent);
    expect(result.approved).toBe(true);
  });
});

describe('MaxAmountPolicy', () => {
  const policy = new MaxAmountPolicy(1000);

  test('should ALLOW amounts below or equal to limit', () => {
    const intent = {
      idempotencyKey: 'test-key',
      amount: 500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'equipment',
      justification: 'Test purchase',
    } as any;

    const result = policy.validate(intent);
    expect(result.approved).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  test('should BLOCK amounts exceeding limit', () => {
    const intent = {
      idempotencyKey: 'test-key',
      amount: 1500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'equipment',
      justification: 'Test purchase',
    } as any;

    const result = policy.validate(intent);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('exceeds limit of 1000');
  });
});

describe('CategoryPolicy', () => {
  const policy = new CategoryPolicy();

  test('should ALLOW approved categories', () => {
    const intent = {
      idempotencyKey: 'test-key',
      amount: 500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'equipment',
      justification: 'Test purchase',
    } as any;

    const result = policy.validate(intent);
    expect(result.approved).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  test('should BLOCK non-approved categories', () => {
    const intent = {
      idempotencyKey: 'test-key',
      amount: 500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'services',
      justification: 'Test purchase',
    } as any;

    const result = policy.validate(intent);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('not in the approved list');
  });
});

describe('PolicyEngine Built-in Checks', () => {
  const engine = new PolicyEngine([]); // No policies, just built-ins

  test('should BLOCK intents with HTML in justification', () => {
    const maliciousIntent = {
      idempotencyKey: 'test-key',
      amount: 500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'equipment',
      justification: 'Test purchase <script>alert("xss")</script>',
    } as any;

    const result = engine.evaluate(maliciousIntent);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('Security Violation: HTML detected');
  });

  test('should ALLOW intents without HTML', () => {
    const cleanIntent = {
      idempotencyKey: 'test-key',
      amount: 500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'equipment',
      justification: 'Clean test purchase',
    } as any;

    const result = engine.evaluate(cleanIntent);
    expect(result.approved).toBe(true);
  });
});

describe('TimeBasedPolicy', () => {
  const policy = new TimeBasedPolicy();

  test('should ALLOW during business hours', () => {
    // Mock the time to be within business hours
    jest.spyOn(Date.prototype, 'getUTCHours').mockReturnValue(12); // Noon

    const intent = {
      idempotencyKey: 'test-key',
      amount: 500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'equipment',
      justification: 'Test purchase',
    } as any;

    const result = policy.validate(intent);
    expect(result.approved).toBe(true);
    expect(result.reason).toBeUndefined();

    jest.restoreAllMocks();
  });

  test('should BLOCK outside business hours', () => {
    // Mock the time to be outside business hours
    jest.spyOn(Date.prototype, 'getUTCHours').mockReturnValue(20); // 8 PM

    const intent = {
      idempotencyKey: 'test-key',
      amount: 500,
      currency: 'GBP',
      beneficiary: 'Test',
      category: 'equipment',
      justification: 'Test purchase',
    } as any;

    const result = policy.validate(intent);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('business hours');

    jest.restoreAllMocks();
  });
});
