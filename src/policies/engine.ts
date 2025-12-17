import type { PaymentIntent, EvaluationResult } from '../models/payment';

export interface PaymentPolicy {
  name: string;
  validate(intent: PaymentIntent): { allowed: boolean; error?: string };
}

export class PolicyEngine {
  constructor(private policies: PaymentPolicy[]) {}
  // Use a Set to track processed keys in memory
  private processedKeys = new Set<string>();

  evaluate(intent: PaymentIntent): EvaluationResult {
    // Check Idempotency first
    if (this.processedKeys.has(intent.idempotencyKey)) {
      return {
        approved: false,
        reason: 'Duplicate Payment: This idempotencyKey has already been processed.',
      };
    }

    // Safety check: Basic string sanitization
    const cleanJustification = intent.justification.replace(/<[^>]*>?/gm, '');
    if (cleanJustification !== intent.justification) {
      return { approved: false, reason: 'Security Violation: HTML detected in justification' };
    }
    for (const policy of this.policies) {
      const result = policy.validate(intent);
      if (!result.allowed) {
        return {
          approved: false,
          reason: `Policy '${policy.name}' violated: ${result.error}`,
        };
      }
    }

    // If all pass, "commit" the key
    this.processedKeys.add(intent.idempotencyKey);
    return { approved: true, reason: 'All policies passed.' };
  }
}
