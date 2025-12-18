# Agent Payments Guardrails

[![CI](https://github.com/fiodortretyakov/agent-payment-guardrails/actions/workflows/ci.yml/badge.svg)](https://github.com/fiodortretyakov/agent-payment-guardrails/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/fiodortretyakov/agent-payment-guardrails/graph/badge.svg?token=7JUE7ZODDF)](https://codecov.io/gh/fiodortretyakov/agent-payment-guardrails)

A safe, policy-driven orchestration system for autonomous AI agents. This repository implements a **"Guardrails First"** architecture, ensuring that AI-generated payment intents are validated against strict financial policies before any transaction is executed.

## 🚀 Quick Start

This project is built with **Infrastructure as Code (IaC)** principles. It includes a Dev Container configuration to ensure a reproducible environment for all engineers.

### Prerequisites

- **Docker** (if running locally) OR
- **GitHub Codespaces** (Recommended)

### Running the System

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Run the Simulation:**

    ```bash
    npm start
    ```

    _This simulates an Agent proposing a payment, the Policy Engine evaluating it, and the Mock Service executing it._

3.  **Run Safety Tests:**
    ```bash
    npm test
    ```

---

## 🏗 Architecture

The system follows a **Strategy Pattern** to decouple the _Policy Logic_ from the _Execution Flow_.

1.  **Agent Layer (`src/agent`)**: Generates a structured `PaymentIntent`. In a production environment, this would interface with an LLM (e.g., OpenAI/Gemini).
2.  **Guardrail Layer (`src/models` & `src/policies`)**:
    - **Zod Schemas**: Provide runtime validation to prevent "hallucinated" data types.
    - **Policy Engine**: Iterates through a set of configured rules (Strategies). If _any_ policy fails, the entire transaction is blocked (Fail-Safe).
3.  **Execution Layer (`src/payment`)**: A mock interface representing a Banking API or Ledger.

### Directory Structure

```text
/src
  /agent        # Logic for intent generation
  /models       # Zod schemas (The "Contract")
  /payment      # Mock execution service
  /policies     # Extensible rule definitions (Strategy Pattern)
/tests          # Jest safety suites
```

## 🧠 Key Design Decisions

### 1. Zero-Trust Architecture (Zod Validation)

I implemented a **"Trust but Verify"** approach for the AI Agent.

- **Decision:** Used `zod` for runtime schema validation instead of just TypeScript interfaces.
- **Reasoning:** TypeScript types are stripped at runtime. An AI agent (LLM) can easily hallucinate a string into a number field. Zod acts as a hard guardrail at the IO boundary, ensuring financial safety before any logic executes.

### 2. Strategy Pattern for Policies

The Policy Engine is designed using the **Strategy Pattern**.

- **Decision:** Decoupled the "Engine" (orchestrator) from the "Policies" (rules).
- **Reasoning:** This allows us to add new complex rules (e.g., `DailySpendLimit`, `SanctionsCheck`) without modifying the core payment logic, adhering to the Open/Closed Principle.

### 3. Infrastructure as Code (IaC)

- **Decision:** Enforced a `.devcontainer` configuration.
- **Reasoning:** In a startup environment, "it works on my machine" is a massive time sink. This ensures that any engineer (or CI pipeline) spins up the exact same Node.js/TypeScript environment instantly.

## ⚖️ Trade-offs & Assumptions

### 1. In-Memory Persistence (Speed vs. Durability)

- **Trade-off:** I utilized in-memory storage for the Policy Engine and Mock Payment Service to ensure the application is portable and easy to run in a Codespace without setting up Docker containers for PostgreSQL/Redis.
- **Production Reality:** In a real-world scenario, this would be replaced with a distributed lock manager (Redis) and a durable ledger (PostgreSQL) to ensure transaction integrity during server restarts.

### 2. Synchronous Validation (Simplicity vs. Scale)

- **Trade-off:** The current policy evaluation happens synchronously within the request loop.
- **Production Reality:** For high-throughput systems, I would move to an Event-Driven Architecture (e.g., Kafka/RabbitMQ). The Agent would receive a `202 Accepted` response, and the policy engine would process the validation asynchronously to prevent back-pressure.

### 3. Fail-Close Default

- **Assumption:** The system assumes a "Fail-Close" security model. If a policy service is unreachable or throws an unknown error, the transaction is strictly denied rather than risking an unverified payment.

## 🛡️ Security & Safety Measures

### 1. Floating Point Protection

To avoid IEEE 754 rounding errors common in JavaScript, the system strictly uses **integer math**. All amounts are processed in minor units (e.g., pence/cents).

### 2. Idempotency Guarantees

Every `PaymentIntent` requires a UUID `idempotencyKey`. This prevents the "Double Spend" problem if the AI Agent retries a request due to a timeout.

### 3. Fail-Safe Defaults

The `PolicyEngine` utilizes a **deny-by-default** approach. If an unknown error occurs during evaluation, the transaction is automatically blocked.

---

## ✅ Recent Improvements

- **Idempotency Checks:** Implemented in-memory idempotency to prevent duplicate payments.
- **Enhanced Security:** Upgraded HTML sanitization using `sanitize-html` library for better XSS protection.
- **Structured Logging:** Integrated Winston for JSON-formatted logs with timestamps.
- **CI/CD Pipeline:** Added GitHub Actions for automated testing, linting, and coverage reporting.
- **Comprehensive Testing:** 100%+ coverage with unit and integration tests.
- **TypeScript Strictness:** Enabled strict mode for better type safety.

## 🔮 Future Improvements (The Roadmap)

If this were moving to production, these are the next steps:

1.  **Persistent Idempotency:** Replace in-memory set with Redis for durability across restarts.
2.  **Audit Logs to Observability:** Ship Winston logs to platforms like Datadog or CloudWatch.
3.  **Human-in-the-Loop (HITL):** Add a "Threshold Policy" for high-value payments with Slack notifications.
4.  **Rate Limiting:** Implement request throttling to prevent abuse.
5.  **Multi-Currency Support:** Expand beyond GBP/USD/EUR with dynamic exchange rates.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

_Note: The MIT License was chosen to ensure this architectural prototype is open for inspection and evaluation without restrictive proprietary constraints._
