import type { PaymentPolicy } from './engine';
import type { PaymentIntent } from '../models/payment';

export class CategoryPolicy implements PaymentPolicy {
  name = 'AllowedCategories';

  // We allow specific categories. 'gambling' or 'personal' would be blocked by Zod schema,
  // but this is an extra logic layer for dynamic business rules.
  private allowedCategories = new Set(['equipment', 'software', 'travel']);

  validate(intent: PaymentIntent) {
    if (!this.allowedCategories.has(intent.category)) {
      return {
        allowed: false,
        error: `Category '${intent.category}' is not in the approved list.`,
      };
    }
    return { allowed: true };
  }
}
