import { MockAgent } from './agent/mock';
import { PolicyEngine } from './policies/engine';
import { MaxAmountPolicy } from './policies/amountPolicy';
import { DailyBudgetPolicy } from './policies/budgetPolicy';
import { CategoryPolicy } from './policies/categoryPolicy';
import { TimeBasedPolicy } from './policies/timePolicy';
import { MockPaymentService } from './payment/service';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

async function main() {
  logger.info('🚀 Starting Safe Agentic Payment System...');

  // 1. Setup Dependencies
  const agent = new MockAgent();
  const paymentService = new MockPaymentService();

  // Define Guardrails (e.g., Max limit of 1000 GBP)
  const policyEngine = new PolicyEngine([
    new MaxAmountPolicy(1000),
    new DailyBudgetPolicy(3000),
    new CategoryPolicy(),
    new TimeBasedPolicy(),
  ]);

  try {
    // 2. Agent proposes a payment
    logger.info('🤖 Agent is generating payment intent...');
    const intent = await agent.generateIntent();
    logger.info('📋 Intent received:', { intent });

    // 3. System evaluates guardrails
    logger.info('🛡️ Running Policy Engine...');
    const decision = policyEngine.evaluate(intent);

    if (decision.approved) {
      logger.info('✅ APPROVED. Proceeding to execution.');

      // 4. Execute Payment
      const receipt = await paymentService.execute(intent);
      logger.info('🎉 Payment Successful!', { receipt });
    } else {
      logger.warn('🛑 BLOCKED. Reason:', { reason: decision.reason });
      // Requirement #4: Feedback Loop would happen here
    }
  } catch (error) {
    logger.error('💥 System Error:', { error });
  }
}

// Run the application
main();
