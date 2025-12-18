import type { PaymentPolicy } from './engine';
import { PolicyDecision, type EvaluationResult, type PaymentIntent } from '../models/payment';

export class ThresholdPolicy implements PaymentPolicy {
  name = 'HumanApprovalThreshold';

  constructor(private threshold: number) {}

  validate(intent: PaymentIntent): EvaluationResult {
    if (intent.amount >= this.threshold) {
      return {
        decision: PolicyDecision.REQUIRES_HUMAN_APPROVAL,
        reason: `Transaction of £${intent.amount} exceeds autonomous threshold of £${this.threshold}.`,
      };
    }

    return {
      decision: PolicyDecision.APPROVED,
    };
  }
}
