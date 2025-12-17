import { z } from 'zod';

export const PaymentIntentSchema = z.object({
  amount: z.number().positive().describe("Amount in minor units (e.g., pence)"),
  currency: z.enum(['GBP', 'USD', 'EUR']),
  beneficiary: z.string().min(1),
  category: z.enum(['equipment', 'travel', 'software', 'services']),
  justification: z.string().min(10),
});

export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;

export interface EvaluationResult {
  approved: boolean;
  reason: string;
  transactionId?: string;
}
