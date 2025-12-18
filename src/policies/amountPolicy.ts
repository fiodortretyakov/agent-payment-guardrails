import type { PaymentPolicy } from './engine';
import { PolicyDecision, type EvaluationResult, type PaymentIntent } from '../models/payment';

export class MaxAmountPolicy implements PaymentPolicy {
  name = 'MaxAmountLimit';
  constructor(private limit: number) {}

  validate(intent: PaymentIntent): EvaluationResult {
    if (intent.amount > this.limit) {
      return {
        decision: PolicyDecision.DENIED,
        reason: `Amount ${intent.amount} exceeds limit of ${this.limit}`,
      };
    }
    return { decision: PolicyDecision.APPROVED };
  }
}
