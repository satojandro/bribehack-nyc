#!/bin/bash

# Bribehack Subgraph Deployment Script

echo "🚀 Bribehack Subgraph Deployment"
echo "================================"

# Check if graph-cli is installed
if ! command -v graph &> /dev/null; then
    echo "❌ graph-cli is not installed. Installing..."
    npm install -g @graphprotocol/graph-cli
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate types
echo "⚙️  Generating types..."
npm run codegen

# Build the subgraph
echo "🔨 Building subgraph..."
npm run build

# Deploy to The Graph Studio
echo ""
echo "📝 To deploy to The Graph Studio:"
echo "1. Go to https://thegraph.com/studio/"
echo "2. Connect your wallet and create a new subgraph"
echo "3. Name it: bribehack-sepolia"
echo "4. Copy your deploy key"
echo ""
read -p "Enter your deploy key (or press Enter to skip): " DEPLOY_KEY

if [ ! -z "$DEPLOY_KEY" ]; then
    read -p "Enter your subgraph slug (e.g., bribehack-sepolia): " SUBGRAPH_SLUG
    
    if [ ! -z "$SUBGRAPH_SLUG" ]; then
        echo "🚀 Deploying to The Graph Studio..."
        graph deploy $SUBGRAPH_SLUG \
            --node https://api.studio.thegraph.com/deploy \
            --deploy-key $DEPLOY_KEY \
            --version-label v1.0.0
    fi
else
    echo "⏭️  Skipping deployment. You can deploy manually with:"
    echo "   graph deploy YOUR_SUBGRAPH_SLUG \\"
    echo "     --node https://api.studio.thegraph.com/deploy \\"
    echo "     --deploy-key YOUR_DEPLOY_KEY \\"
    echo "     --version-label v1.0.0"
fi

echo ""
echo "✅ Build complete! Your subgraph is ready for deployment."