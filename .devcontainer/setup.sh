#!/bin/bash
set -e

echo "🚀 Starting Infrastructure-as-Code Setup..."

# 1. Create directory structure
mkdir -p src/agent src/policies src/payment src/models tests

# 2. Initialize package.json with the technical KEBAB-CASE name
if [ ! -f "package.json" ]; then
    cat <<EOF > package.json
{
  "name": "agent-payments-guardrails",
  "version": "1.0.0",
  "type": "module",
  "description": "Safe agentic payment orchestration for Ralio assessment",
  "scripts": {
    "start": "tsx src/index.ts",
    "dev": "tsx watch src/index.ts",
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  },
  "keywords": ["ai", "fintech", "guardrails"],
  "author": "Founding Engineer Candidate",
  "license": "MIT"
}
EOF
fi

# 3. Install dependencies
echo "📦 Installing dependencies..."
# Zod for runtime validation (The core of the guardrail logic)
npm install zod
# Development tools: tsx for fast execution, Jest for testing
npm install -D typescript tsx @types/node jest ts-jest @types/jest

# 4. Initialize TypeScript
if [ ! -f "tsconfig.json" ]; then
    npx tsc --init \
        --rootDir src \
        --outDir dist \
        --target ESNext \
        --module ESNext \
        --moduleResolution node \
        --strict true \
        --esModuleInterop true \
        --skipLibCheck true \
        --forceConsistentCasingInFileNames true
fi

# 5. Create a basic Entry Point to verify setup
if [ ! -f "src/index.ts" ]; then
    echo "console.log('✅ Agent Payments System Ready.');" > src/index.ts
fi

echo "✨ Setup complete! Folders created and dependencies installed."
