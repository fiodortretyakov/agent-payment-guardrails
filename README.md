# Agent Payments Guardrails

[![CI](https://github.com/fiodortretyakov/agent-payment-guardrails/actions/workflows/ci.yml/badge.svg)](https://github.com/fiodortretyakov/agent-payment-guardrails/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/fiodortretyakov/agent-payment-guardrails/graph/badge.svg?token=7JUE7ZODDF)](https://codecov.io/gh/fiodortretyakov/agent-payment-guardrails)
![Node Version](https://img.shields.io/badge/node-25-green)
![License](https://img.shields.io/badge/license-MIT-blue)

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

## 🏗 Why This Tech Stack?

In a fintech context, the choice of tools is driven by the **"Security-First"** principle. Below is the rationale for the architectural decisions made in this project.

### 🛡️ TypeScript: Type Safety as Financial Safety
We chose TypeScript over JavaScript because, in a payments environment, a **"type error" is a "financial error."**

* **Strong Typing:** By using `Interfaces` and `Enums` for `PolicyDecision` and `AuditEntry`, we eliminate entire classes of bugs (such as `null` amounts or malformed IDs) before the code even executes.
* **Self-Documenting Logic:** The code becomes a "source of truth." Any developer (or AI agent) can inspect the types to understand exactly what the system expects.
* **Modern ESM:** Leveraging native ECMAScript Modules ensures we stay aligned with the latest security standards and performance optimizations.

---

### ⚡ Node.js 25: High Performance & Native Security
* **Non-Blocking I/O:** AI agents are highly concurrent. Node’s event loop allows us to process hundreds of payment proposals simultaneously without the overhead of heavy thread management.
* **Native Crypto:** We utilize the built-in `node:crypto` module for cryptographically secure UUID generation. This reduces our "dependency footprint," keeping the project lean and minimizing supply-chain attack vectors.
* **Top-Level Await:** Simplifies our orchestration logic, making the code cleaner and more readable for audit purposes.

---

### 🧩 Zod: Zero-Trust Runtime Validation
TypeScript validates at compile-time, but **Zod** provides the essential runtime "Guardrail."

* **Input Sanitization:** Every request from an AI agent is treated as untrusted. Zod parses and validates the payload before it ever touches our business logic.
* **Integer Math (Pence vs. Pounds):** We enforce `.int()` on all amount fields. In fintech, floating-point numbers (e.g., `19.99`) lead to rounding errors. We handle all currency in **minor units** (e.g., `1999` pence) to ensure 100% mathematical accuracy.

---

### 📜 Strategy Pattern: Modular & Auditable Policies
The `PolicyEngine` does not use a monolithic "if-else" block. Instead, it employs the **Strategy Design Pattern**.

* **Extensibility:** Each guardrail (Max Amount, Category, Human-in-the-loop) is an independent class. New rules can be added without touching existing, tested code (Open-Closed Principle).
* **Explainability:** Each policy contributes to a structured `auditTrail`. If a payment is rejected, the system provides a clear, machine-readable reason why, allowing the AI agent to "reinstantiate" with corrected data.

---

### 🚀 Key Professional Features Included:
* **Idempotency:** Native support for `idempotencyKey` to prevent double-spending during network retries.
* **Tiered Approvals:** A "Yellow Zone" (e.g., £500 - £1,000) that automatically flags transactions for human review while allowing lower amounts to pass autonomously.
* **Traceability:** Every decision generates a unique `evaluationId`, linking the AI's proposal to the final system decision for compliance auditing.

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
