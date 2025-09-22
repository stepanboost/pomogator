#!/bin/bash
echo "🤖 Building Bot service..."

# Install dependencies
npm install

# Build shared packages first
cd ../../packages/shared
npm install
npm run build
cd ../redis
npm install
npm run build
cd ../prisma
npm install
npx prisma generate
cd ../../apps/bot

# Build Bot
npm run build

echo "✅ Bot build complete!"
