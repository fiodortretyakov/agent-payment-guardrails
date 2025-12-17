import type { PaymentPolicy } from './engine';
import type { PaymentIntent } from '../models/payment';

export class TimeBasedPolicy implements PaymentPolicy {
  name = 'TimeBasedLimit';

  // Block payments outside business hours (9 AM - 5 PM GMT)
  private isBusinessHours(): boolean {
    const now = new Date();
    const hour = now.getUTCHours();
    return hour >= 9 && hour < 17;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(_intent: PaymentIntent) {
    if (!this.isBusinessHours()) {
      return {
        allowed: false,
        error: 'Payments are only allowed during business hours (9 AM - 5 PM GMT)',
      };
    }
    return { allowed: true };
  }
}
