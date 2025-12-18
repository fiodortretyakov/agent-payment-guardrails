import type { PaymentPolicy } from './engine';
import type { EvaluationResult, PaymentIntent } from '../models/payment';

export class ThresholdPolicy implements PaymentPolicy {
  name = 'HumanApprovalThreshold';

  constructor(private threshold: number) {}

  validate(intent: PaymentIntent): EvaluationResult {
    if (intent.amount >= this.threshold) {
      return {
        requiresHumanApproval: true,
        reason: `Transaction of £${intent.amount} exceeds autonomous threshold of £${this.threshold}.`,
      };
    }

    return {
      approved: true,
      requiresHumanApproval: false,
    };
  }
}
