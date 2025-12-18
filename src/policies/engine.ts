import {
  type PaymentIntent,
  type EvaluationResult,
  PolicyDecision,
  type FinalEvaluationResult,
  type AuditEntry,
  AuditActor,
} from '../models/payment';
import { randomUUID } from 'crypto';
import sanitizeHtml from 'sanitize-html';

export interface PaymentPolicy {
  name: string;
  validate(intent: PaymentIntent): EvaluationResult;
}

export class PolicyEngine {
  constructor(private policies: PaymentPolicy[]) {}
  // Use a Set to track processed keys in memory
  private processedKeys = new Set<string>();

  evaluate(intent: PaymentIntent): FinalEvaluationResult {
    // Generate a unique identifier for this specific decision
    const evaluationId = randomUUID();

    // Start with a clean audit trail
    const auditTrail: AuditEntry[] = [
      this.createEntry(AuditActor.SYSTEM, `Evaluation started: ${evaluationId}`),
    ];

    // Check Idempotency first
    if (this.processedKeys.has(intent.idempotencyKey)) {
      return {
        decision: PolicyDecision.DENIED,
        reason: 'Duplicate Payment: This idempotencyKey has already been processed.',
        id: evaluationId,
        auditTrail: auditTrail,
      };
    } else {
      auditTrail.push(this.createEntry(AuditActor.SYSTEM, 'Idempotency check passed.'));
    }

    // Safety check: Sanitize HTML to prevent XSS
    const cleanJustification = sanitizeHtml(intent.justification, {
      allowedTags: [],
      allowedAttributes: {},
    });
    if (cleanJustification !== intent.justification) {
      return {
        decision: PolicyDecision.DENIED,
        reason: 'Security Violation: HTML detected in justification',
        id: evaluationId,
        auditTrail: auditTrail,
      };
    } else {
      auditTrail.push(this.createEntry(AuditActor.SYSTEM, 'Sanitization check passed.'));
    }

    let finalRequiresApproval = false;

    for (const policy of this.policies) {
      const result = policy.validate(intent);
      // 1. If any policy blocks it, stop immediately
      if (result.decision === PolicyDecision.DENIED) {
        return {
          decision: PolicyDecision.DENIED,
          reason: `Policy '${policy.name}' violated: ${result.reason}`,
          id: evaluationId,
          auditTrail: auditTrail,
        };
      }

      // 2. If any policy flags it for human, remember that
      if (result.decision === PolicyDecision.REQUIRES_HUMAN_APPROVAL) {
        finalRequiresApproval = true;
        auditTrail.push(
          this.createEntry(AuditActor.SYSTEM, `Policy '${policy.name}' requires human approval.`)
        );
      } else {
        auditTrail.push(this.createEntry(AuditActor.SYSTEM, `Policy '${policy.name}' approved.`));
      }
    }

    // If all pass, "commit" the key
    this.processedKeys.add(intent.idempotencyKey);
    return {
      decision: finalRequiresApproval
        ? PolicyDecision.REQUIRES_HUMAN_APPROVAL
        : PolicyDecision.APPROVED,
      reason: finalRequiresApproval ? 'Pending human sign-off' : 'Auto-approved',
      id: evaluationId,
      auditTrail: auditTrail,
    };
  }

  private createEntry(actor: AuditActor, action: string): AuditEntry {
    return {
      timestamp: new Date().toISOString(),
      actor,
      action,
    };
  }
}
