import { z } from 'zod';

export const PaymentIntentSchema = z.object({
  idempotencyKey: z.string().min(32).describe('Unique key to prevent duplicate payments'),
  goal: z.string().min(10).describe('The high-level objective provided to the agent'),
  amount: z.number().positive().describe('The total cost of the item in minor units'),
  currency: z.enum(['GBP', 'USD', 'EUR']),
  beneficiary: z.string().min(1).describe('The entity being paid'),
  category: z.enum(['equipment', 'software', 'travel', 'services', 'other']),
  justification: z.string().min(10).describe('Why this purchase is necessary'),
});

export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;

export interface EvaluationResult {
  approved?: boolean;
  requiresHumanApproval?: boolean;
  reason?: string;
}
