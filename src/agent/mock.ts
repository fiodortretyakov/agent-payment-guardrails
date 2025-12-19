import type { PaymentIntent } from '../models/payment';
import { randomUUID } from 'crypto';

export class MockAgent {
  // Simulate the agent "thinking" and proposing a payment
  async generateIntent(): Promise<PaymentIntent> {
    return {
      idempotencyKey: randomUUID(),
      amount: 500,
      currency: 'GBP',
      beneficiary: 'Apple Store London',
      category: 'equipment',
      justification: 'Buying a new Macbook for the design team.',
    };
  }
  async setReceipt(receiptId: string): Promise<void> {
    // Simulate storing the receipt
    console.log(`🧾 Storing receipt with ID: ${receiptId}`);
  }
}
