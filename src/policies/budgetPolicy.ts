import type { PaymentPolicy } from './engine';
import type { PaymentIntent } from '../models/payment';

export class DailyBudgetPolicy implements PaymentPolicy {
  name = 'DailyBudgetLimit';
  private currentSpent = 0;

  constructor(private dailyLimit: number) {}

  validate(intent: PaymentIntent) {
    if (this.currentSpent + intent.amount > this.dailyLimit) {
      return {
        allowed: false,
        error: `Daily budget exceeded. Remaining: ${this.dailyLimit - this.currentSpent}`,
      };
    }
    this.currentSpent += intent.amount; // In reality, only update after SUCCESS
    return { allowed: true };
  }
}
