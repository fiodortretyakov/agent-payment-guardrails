import { PaymentPolicy } from './engine';
import { PaymentIntent } from '../models/payment';

export class MaxAmountPolicy implements PaymentPolicy {
  name = "MaxAmountLimit";
  constructor(private limit: number) {}

  validate(intent: PaymentIntent) {
    if (intent.amount > this.limit) {
      return { allowed: false, error: `Amount ${intent.amount} exceeds limit of ${this.limit}` };
    }
    return { allowed: true };
  }
}
