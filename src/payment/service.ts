import type { PaymentIntent } from '../models/payment';

export interface TransactionReceipt {
  id: string;
  status: 'SUCCESS' | 'FAILED';
  timestamp: Date;
}

export class MockPaymentService {
  async execute(intent: PaymentIntent): Promise<TransactionReceipt> {
    console.log(`🏦 Connecting to Bank API for ${intent.currency} ${intent.amount}...`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate a random "Bank Failure"
    if (Math.random() < 0.1) {
      throw new Error('Bank Connection Timeout');
    }

    return {
      id: `txn_${Math.random().toString(36).substring(7)}`,
      status: 'SUCCESS',
      timestamp: new Date(),
    };
  }
}
