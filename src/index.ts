import { MockAgent } from './agent/mock';
import { PolicyEngine } from './policies/engine';
import { MaxAmountPolicy } from './policies/amountPolicy';
import { DailyBudgetPolicy } from './policies/budgetPolicy';
import { CategoryPolicy } from './policies/categoryPolicy';
import { TimeBasedPolicy } from './policies/timePolicy';
import { ThresholdPolicy } from './policies/thresholdPolicy';
import { MockPaymentService } from './payment/service';
import winston from 'winston';
import { PolicyDecision } from './models/payment';

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
    new ThresholdPolicy(1000),
  ]);

  try {
    // 2. Agent proposes a payment
    logger.info('🤖 Agent is generating payment intent...');
    const intent = await agent.generateIntent();
    logger.info('📋 Intent received:', { intent });

    // 3. System evaluates guardrails
    logger.info('🛡️ Running Policy Engine...');
    const result = policyEngine.evaluate(intent);

    switch (result.decision) {
      case PolicyDecision.APPROVED: {
        logger.info('✅ APPROVED. Proceeding to execution.');

        // 4. Execute Payment
        const receipt = await paymentService.execute(intent);
        await agent.setReceipt(receipt.id);
        logger.info('🎉 Payment Successful!', { receipt });
        break;
      }

      case PolicyDecision.REQUIRES_HUMAN_APPROVAL:
        logger.info('⏸️ PENDING: This exceeds the autonomous threshold. Sending for approval...');
        logger.info('⚠️ REQUIRES HUMAN APPROVAL. Reason:', { reason: result.reason });
        break;

      case PolicyDecision.DENIED:
        logger.warn('🛑 BLOCKED. Reason:', { reason: result.reason });
        break;
    }
  } catch (error) {
    logger.error('💥 System Error:', { error });
  }
}

// Run the application
main();
