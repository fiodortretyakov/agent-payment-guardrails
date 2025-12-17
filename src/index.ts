import { MockAgent } from './agent/mock';
import { PolicyEngine } from './policies/engine';
import { MaxAmountPolicy } from './policies/amountPolicy';
import { CategoryPolicy } from './policies/categoryPolicy';
import { MockPaymentService } from './payment/service';

async function main() {
  console.log('🚀 Starting Safe Agentic Payment System...\n');

  // 1. Setup Dependencies
  const agent = new MockAgent();
  const paymentService = new MockPaymentService();

  // Define Guardrails (e.g., Max limit of 1000 GBP)
  const policyEngine = new PolicyEngine([new MaxAmountPolicy(1000), new CategoryPolicy()]);

  try {
    // 2. Agent proposes a payment
    console.log('🤖 Agent is generating payment intent...');
    const intent = await agent.generateIntent();
    console.log('📋 Intent received:', intent);

    // 3. System evaluates guardrails
    console.log('\n🛡️  Running Policy Engine...');
    const decision = policyEngine.evaluate(intent);

    if (decision.approved) {
      console.log('✅ APPROVED. Proceeding to execution.');

      // 4. Execute Payment
      const receipt = await paymentService.execute(intent);
      console.log('🎉 Payment Successful!', receipt);
    } else {
      console.warn('🛑 BLOCKED. Reason:', decision.reason);
      // Requirement #4: Feedback Loop would happen here
    }
  } catch (error) {
    console.error('💥 System Error:', error);
  }
}

// Run the application
main();
