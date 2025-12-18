import type { PaymentPolicy } from './engine';
import type { PaymentIntent } from '../models/payment';

export class ThresholdPolicy implements PaymentPolicy {
  name = 'HumanApprovalThreshold';

  constructor(private threshold: number) {}

  validate(intent: PaymentIntent) {
    if (intent.amount >= this.threshold) {
      return {
        allowed: true, // It's still a "valid" intent
        requiresHumanApproval: true,
        error: `Transaction of £${intent.amount} exceeds autonomous threshold of £${this.threshold}.`,
      };
    }

    return { allowed: true, requiresHumanApproval: false };
  }
}
