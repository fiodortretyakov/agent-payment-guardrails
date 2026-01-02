import type { PaymentPolicy } from './engine';
import { PolicyDecision, type EvaluationResult, type PaymentIntent } from '../models/payment';

export class DailyBudgetPolicy implements PaymentPolicy {
  name = 'DailyBudgetLimit';
  private currentSpent = 0;
  private lastResetDate: string;

  constructor(private dailyLimit: number) {
    this.lastResetDate = new Date().toISOString().split('T')[0] ?? '';
  }

  private resetIfNewDay(): void {
    const today = new Date().toISOString().split('T')[0] ?? '';
    if (today !== this.lastResetDate) {
      this.currentSpent = 0;
      this.lastResetDate = today;
    }
  }

  validate(intent: PaymentIntent): EvaluationResult {
    this.resetIfNewDay();

    if (this.currentSpent + intent.amount > this.dailyLimit) {
      return {
        decision: PolicyDecision.DENIED,
        reason: `Daily budget exceeded. Remaining: ${this.dailyLimit - this.currentSpent}, Requested: ${intent.amount}`,
      };
    }
    // Note: In production, only update after transaction SUCCESS
    // This is a simplified version for demonstration
    this.currentSpent += intent.amount;
    return { decision: PolicyDecision.APPROVED };
  }

  // Method to reset budget (useful for testing)
  reset(): void {
    this.currentSpent = 0;
    this.lastResetDate = new Date().toISOString().split('T')[0] ?? '';
  }
}
