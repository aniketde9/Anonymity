
# Anonymity V2 - Fragmented Payments Pool

A privacy-focused payment system on Solana that breaks payments into random fragments delivered over time, making it computationally difficult to trace the connection between sender and recipient.

## 🎯 What It Does

**The Problem**: Direct A→B payments on Solana are public and easily traceable.

**The Solution**: Send your payment to our smart contract pool, specify the recipient, and we automatically deliver the funds in random fragments over time. This breaks both value and timing correlations that blockchain analysts use to trace transactions.

## 🔄 How It Works

1. **Send to Pool**: You send the full amount (e.g., 10 SOL) to our anonymity pool in one transaction
2. **Automatic Fragmentation**: Our system breaks it into random amounts (e.g., 0.21 SOL, 1.43 SOL, 0.08 SOL...)  
3. **Time-Delayed Delivery**: These fragments are sent to your specified recipient over your chosen timeframe
4. **Privacy Through Volume**: Your payment gets lost in the noise of all other fragmented payments

## ✨ Key Features

- **🎯 Direct to Recipient**: No secret notes - just specify their address
- **🧩 Smart Fragmentation**: Intelligent random splitting of payments
- **⏰ Flexible Timing**: Choose Fast (1hr), Standard (6hr), or Slow (24hr) delivery
- **🔄 Fire & Forget**: Completely automated - recipient doesn't need to do anything
- **🔒 High Privacy**: Breaks value, timing, and wallet correlations

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- Solana CLI tools
- Anchor Framework
- Phantom or Solflare wallet

### Option 1: One-Command Setup
```bash
chmod +x install.sh && ./install.sh
```

### Option 2: Manual Setup

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd anonymity-v2
   npm install
   cd backend && npm install && cd ..
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   # Edit .env files with your settings
   ```

3. **Set Up Solana**:
   ```bash
   solana config set --url devnet
   solana airdrop 2  # Get test SOL
   ```

4. **Deploy Smart Contract**:
   ```bash
   anchor build
   anchor deploy --provider.cluster devnet
   ```

5. **Start the Application**:
   ```bash
   # Start backend scheduler
   cd backend && npm run dev &
   
   # Start frontend
   npm run dev
   ```

## 🏗️ Architecture

### Smart Contract (`programs/anonymity-pool/`)
- **Rust/Anchor** program on Solana
- Manages payment schedules and fund custody
- Validates fragmented payment instructions

### Backend Scheduler (`backend/`)
- **Node.js/TypeScript** service
- Orchestrates fragmented payments
- Implements randomization algorithms

### Frontend (`src/`)
- **React/TypeScript** interface
- Wallet integration via Solana Wallet Adapter
- Real-time payment tracking

## 📡 API Endpoints

### Backend API (http://localhost:5000)

- `POST /api/schedule-payment` - Schedule a new fragmented payment
- `GET /api/schedule/:scheduleId` - Get payment schedule status  
- `GET /api/pool-stats` - Get anonymity pool statistics
- `GET /health` - Service health check

## 🎮 Usage Guide

### Sending a Private Payment

1. Connect your Solana wallet (Phantom/Solflare)
2. Go to "Send Payment" tab
3. Enter recipient's Solana address
4. Specify amount in SOL
5. Choose delivery speed (affects privacy level)
6. Click "Send Private Payment"
7. Confirm the transaction

### Tracking Incoming Payments

1. Go to "Track Payments" tab
2. Enter the receiving wallet address
3. View active payment schedules and progress
4. Monitor fragmented delivery in real-time

## ⚙️ Configuration

### Environment Variables

**Frontend** (`.env`):
```bash
VITE_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
VITE_BACKEND_URL=http://localhost:5000
```

**Backend** (`backend/.env`):
```bash
PORT=5000
SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
SCHEDULER_PRIVATE_KEY=base58_encoded_keypair
```

### Delivery Speed Options

- **Fast (1 hour)**: 1-10 minute intervals, higher anonymity risk
- **Standard (6 hours)**: 5-30 minute intervals, balanced approach  
- **Slow (24 hours)**: 15-60 minute intervals, maximum privacy

## 🔒 Security Features

- **Value Obfuscation**: Original amounts hidden through fragmentation
- **Timing Obfuscation**: Payments spread over time
- **Pool Mixing**: High-volume transactions provide cover
- **Non-Custodial**: Automated system with no human intervention
- **Configurable Privacy**: Choose your privacy/speed tradeoff

## ⚠️ Security Warnings

1. **Experimental Software**: Use at your own risk
2. **Devnet Only**: Currently configured for Solana Devnet only
3. **Privacy Limitations**: Anonymity set size affects privacy strength
4. **No Mainnet**: Do not use on mainnet without proper security audits
5. **Backup Important**: Always backup wallet private keys

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start frontend
npm run dev:backend      # Start backend only
npm run dev:full         # Start both frontend and backend

# Building
npm run build            # Build frontend
npm run build:backend    # Build backend
npm run build:all        # Build everything

# Solana/Anchor
npm run anchor:build     # Build smart contract
npm run anchor:deploy    # Deploy to devnet
npm run deploy:program   # Build, deploy, and initialize

# Utilities
npm run wallet:airdrop   # Get devnet SOL
npm run wallet:balance   # Check wallet balance
npm run config:devnet    # Set Solana CLI to devnet
```

### Project Structure

```
├── programs/anonymity-pool/    # Solana smart contract
├── backend/                    # Node.js scheduler service
├── src/                       # React frontend
├── scripts/                   # Deployment scripts
├── install.sh                 # One-command setup
└── README.md                  # This file
```

## 🎯 Use Cases

- **Freelancer Payments**: Pay contractors without revealing your main wallet
- **Private Gifts**: Send anonymous gifts to friends or family
- **Online Purchases**: Buy services while maintaining financial privacy
- **Wallet Funding**: Fund other wallets without creating transaction links

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test thoroughly on devnet
4. Submit a pull request

## 📜 License

MIT License - see LICENSE file for details

## 🚨 Disclaimer

This software is experimental and provided "as is". The developers are not responsible for any loss of funds or other damages. Always test on devnet first and never use on mainnet without proper security audits.

The privacy guarantees depend on the size of the anonymity set and the behavior of other users. Larger pools and more diverse transaction patterns provide better privacy protection.
