import type { PaymentPolicy } from './engine';
import type { EvaluationResult, PaymentIntent } from '../models/payment';

export class MaxAmountPolicy implements PaymentPolicy {
  name = 'MaxAmountLimit';
  constructor(private limit: number) {}

  validate(intent: PaymentIntent): EvaluationResult {
    if (intent.amount > this.limit) {
      return {
        approved: false,
        reason: `Amount ${intent.amount} exceeds limit of ${this.limit}`,
      };
    }
    return { approved: true };
  }
}
