#!/bin/bash
# Quick setup for Vercel deployment

set -e

echo "🚀 Starting Vercel deployment setup..."

# Check if in frontend directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Please run this script from the frontend directory"
  exit 1
fi

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
  echo "📦 Installing Vercel CLI..."
  npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
  echo "📝 Creating .env.local..."
  cp .env.example .env.local
  echo "⚠️  Please update .env.local with your configuration"
fi

# Build locally to test
echo "🔨 Building application..."
npm run build

# Check if user wants to deploy
read -p "Do you want to deploy to Vercel now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🚀 Starting Vercel deployment..."
  vercel
  echo "✅ Deployment complete!"
else
  echo "ℹ️  To deploy later, run: vercel"
fi

echo "✅ Setup complete!"