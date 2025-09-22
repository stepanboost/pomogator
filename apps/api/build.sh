#!/bin/bash
echo "🚀 Building API service..."

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
cd ../../apps/api

# Build API
npm run build

echo "✅ API build complete!"
