
#!/bin/bash

# Anonymity V2 - Automated Installation Script
# This script will install all dependencies and set up the project

set -e

echo "🚀 Setting up Anonymity V2 Privacy Pool..."
echo "============================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create .env files with default values
echo "⚙️  Creating environment configuration..."

# Frontend .env
cat > .env << EOF
VITE_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=a1c96ec7-818b-4789-ad2c-2bd175df4a95
VITE_PROGRAM_ID=AnonymityV2PoolProgram11111111111111111111
EOF

# Backend .env
cat > backend/.env << EOF
PORT=5000
SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=a1c96ec7-818b-4789-ad2c-2bd175df4a95
PROGRAM_ID=AnonymityV2PoolProgram11111111111111111111
EOF

echo "✅ Environment files created"

# Check if Solana CLI should be installed (optional)
echo ""
echo "🔧 Optional: Install Solana CLI for development?"
echo "   This is only needed if you want to deploy smart contracts or get devnet SOL"
read -p "   Install Solana CLI? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Installing Solana CLI..."
    sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
    
    # Add to PATH for current session
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    
    echo "✅ Solana CLI installed"
    echo "   💡 Add to your shell profile:"
    echo "   export PATH=\"\$HOME/.local/share/solana/install/active_release/bin:\$PATH\""
    
    # Set to devnet
    solana config set --url devnet
    echo "✅ Solana CLI configured for devnet"
fi

# Check if Anchor should be installed (optional)
echo ""
echo "🔧 Optional: Install Anchor Framework for smart contract development?"
read -p "   Install Anchor CLI? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Installing Anchor CLI..."
    npm install -g @coral-xyz/anchor-cli
    echo "✅ Anchor CLI installed"
fi

echo ""
echo "🎉 Installation Complete!"
echo "========================="
echo ""
echo "🚀 Quick Start:"
echo "   1. npm run dev              # Start frontend only"
echo "   2. Open http://localhost:5173"
echo ""
echo "🔧 Full Stack Development:"
echo "   1. cd backend && npm run dev  # Terminal 1 - Start backend"
echo "   2. npm run dev               # Terminal 2 - Start frontend"
echo ""
echo "💰 Get Devnet SOL (if Solana CLI installed):"
echo "   solana airdrop 2 <your-wallet-address> --url devnet"
echo ""
echo "📖 Read README.md for detailed instructions"
echo ""
echo "⚠️  IMPORTANT: This is experimental software for devnet only!"
echo "   Always backup your secret notes securely."
EOF
