# Agent Payments Guardrails

A safe, policy-driven orchestration system for autonomous AI agents. This repository implements a **"Guardrails First"** architecture, ensuring that AI-generated payment intents are validated against strict financial policies before any transaction is executed.



## 🚀 Quick Start

This project is built with **Infrastructure as Code (IaC)** principles. It includes a Dev Container configuration to ensure a reproducible environment for all engineers.

### Prerequisites
* **Docker** (if running locally) OR
* **GitHub Codespaces** (Recommended)

### Running the System

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Simulation:**
    ```bash
    npm start
    ```
    *This simulates an Agent proposing a payment, the Policy Engine evaluating it, and the Mock Service executing it.*

3.  **Run Safety Tests:**
    ```bash
    npm test
    ```

---

## 🏗 Architecture

The system follows a **Strategy Pattern** to decouple the *Policy Logic* from the *Execution Flow*.

1.  **Agent Layer (`src/agent`)**: Generates a structured `PaymentIntent`. In a production environment, this would interface with an LLM (e.g., OpenAI/Gemini).
2.  **Guardrail Layer (`src/models` & `src/policies`)**:
    * **Zod Schemas**: Provide runtime validation to prevent "hallucinated" data types.
    * **Policy Engine**: Iterates through a set of configured rules (Strategies). If *any* policy fails, the entire transaction is blocked (Fail-Safe).
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
* **Decision:** Used `zod` for runtime schema validation instead of just TypeScript interfaces.
* **Reasoning:** TypeScript types are stripped at runtime. An AI agent (LLM) can easily hallucinate a string into a number field. Zod acts as a hard guardrail at the IO boundary, ensuring financial safety before any logic executes.

### 2. Strategy Pattern for Policies
The Policy Engine is designed using the **Strategy Pattern**.
* **Decision:** Decoupled the "Engine" (orchestrator) from the "Policies" (rules).
* **Reasoning:** This allows us to add new complex rules (e.g., `DailySpendLimit`, `SanctionsCheck`) without modifying the core payment logic, adhering to the Open/Closed Principle.

### 3. Infrastructure as Code (IaC)
* **Decision:** Enforced a `.devcontainer` configuration.
* **Reasoning:** In a startup environment, "it works on my machine" is a massive time sink. This ensures that any engineer (or CI pipeline) spins up the exact same Node.js/TypeScript environment instantly.

## ⚖️ Trade-offs & Assumptions

### 1. In-Memory Persistence (Speed vs. Durability)
* **Trade-off:** I utilized in-memory storage for the Policy Engine and Mock Payment Service to ensure the application is portable and easy to run in a Codespace without setting up Docker containers for PostgreSQL/Redis.
* **Production Reality:** In a real-world scenario, this would be replaced with a distributed lock manager (Redis) and a durable ledger (PostgreSQL) to ensure transaction integrity during server restarts.

### 2. Synchronous Validation (Simplicity vs. Scale)
* **Trade-off:** The current policy evaluation happens synchronously within the request loop.
* **Production Reality:** For high-throughput systems, I would move to an Event-Driven Architecture (e.g., Kafka/RabbitMQ). The Agent would receive a `202 Accepted` response, and the policy engine would process the validation asynchronously to prevent back-pressure.

### 3. Fail-Close Default
* **Assumption:** The system assumes a "Fail-Close" security model. If a policy service is unreachable or throws an unknown error, the transaction is strictly denied rather than risking an unverified payment.

---

## 🔮 Future Improvements (The Roadmap)

If this were moving to production, these are the immediate next steps:

1.  **Idempotency Layer:** Implement an idempotency key check (using Redis) to prevent double-spending if an Agent retries a request due to network jitter.
2.  **Immutable Audit Logs:** Replace `console.log` with a structured logger (e.g., Winston/Pino) that ships logs to an observability platform (Datadog/CloudWatch) for compliance auditing.
3.  **Human-in-the-Loop (HITL):** Create a "Threshold Policy." If a payment exceeds £5,000, it shouldn't be just "Denied"—it should trigger a Slack notification to a human manager for manual approval.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

*Note: The MIT License was chosen to ensure this architectural prototype is open for inspection and evaluation without restrictive proprietary constraints.*
