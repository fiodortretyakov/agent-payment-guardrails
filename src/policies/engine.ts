import type { PaymentIntent, EvaluationResult } from '../models/payment';

export interface PaymentPolicy {
  name: string;
  validate(intent: PaymentIntent): { allowed: boolean; error?: string };
}

export class PolicyEngine {
  constructor(private policies: PaymentPolicy[]) {}

  evaluate(intent: PaymentIntent): EvaluationResult {
    for (const policy of this.policies) {
      const result = policy.validate(intent);
      if (!result.allowed) {
        return { approved: false, reason: `Policy '${policy.name}' violated: ${result.error}` };
      }
    }
    return { approved: true, reason: "All policies passed." };
  }
}
