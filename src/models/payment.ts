import type { UUID } from 'crypto';
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

export enum PolicyDecision {
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  REQUIRES_HUMAN_APPROVAL = 'REQUIRES_HUMAN_APPROVAL',
}

export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;

export interface EvaluationResult {
  decision: PolicyDecision;
  reason?: string;
}

export interface FinalEvaluationResult extends EvaluationResult {
  id: UUID;
  auditTrail: AuditEntry[];
}

export enum AuditActor {
  SYSTEM = 'SYSTEM',
  AGENT = 'AGENT',
  HUMAN = 'HUMAN',
}

export interface AuditEntry {
  timestamp: string;
  actor: AuditActor;
  action: string;
  details?: string;
}
