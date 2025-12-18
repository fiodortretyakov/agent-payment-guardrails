import type { PaymentIntent } from '../models/payment';
import { randomUUID } from 'crypto';

export class MockAgent {
  // Simulate the agent "thinking" and proposing a payment
  async generateIntent(): Promise<PaymentIntent> {
    return {
      goal: 'Equip the new Lead Designer with necessary hardware', // THE GOAL
      idempotencyKey: randomUUID(),
      amount: 500, // Try changing this to 5000 to test your guardrails!
      currency: 'GBP',
      beneficiary: 'Apple Store London',
      category: 'equipment',
      justification: 'Buying a new Macbook for the design team.',
    };
  }
}
