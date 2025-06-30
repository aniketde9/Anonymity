
# Anonymity V2 - Solana Privacy Pool

A decentralized privacy pool on Solana that breaks the on-chain link between your source and destination addresses using Token-2022 Confidential Transfers and zero-knowledge proofs.

## Features

- 🔒 **Private Deposits**: Break transaction links using cryptographic commitments
- 🌳 **Merkle Tree Privacy**: Uses Merkle trees for anonymous withdrawal proofs
- 🔐 **Zero-Knowledge Proofs**: Verify ownership without revealing identity
- 💰 **Multiple Denominations**: Support for 0.1, 1, 10, and 100 SOL pools
- 🌐 **Modern UI**: Clean React interface with Phantom wallet integration
- ⚡ **Solana Devnet**: Built for Solana's high-performance blockchain

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express API for ZK proof generation
- **Smart Contract**: Anchor program deployed on Solana Devnet
- **Privacy**: Poseidon hash + Merkle trees + ZK proofs

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Phantom Wallet browser extension
- Git

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd anonymity-v2
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Install Solana CLI (Optional - for development)

```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
export PATH="/home/runner/.local/share/solana/install/active_release/bin:$PATH"
```

### 4. Install Anchor Framework (Optional - for smart contract development)

```bash
npm install -g @coral-xyz/anchor-cli
```

### 5. Start the Application

#### Option A: Quick Start (Frontend Only)
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`

#### Option B: Full Stack (Frontend + Backend)
```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
npm run dev
```

## Usage

### 1. Connect Wallet
- Install Phantom wallet extension
- Create or import a Solana wallet
- Ensure you're on Solana Devnet
- Connect your wallet to the application

### 2. Get Devnet SOL
```bash
# Get some devnet SOL for testing
solana airdrop 2 <your-wallet-address> --url devnet
```

### 3. Make a Private Deposit
- Choose deposit amount (0.1, 1, 10, or 100 SOL)
- Generate a secret note (keep this safe!)
- Confirm the transaction
- Wait for confirmation

### 4. Anonymous Withdrawal
- Enter your secret note from the deposit
- Specify recipient address (can be different from deposit address)
- Generate zero-knowledge proof
- Withdraw anonymously

## Development

### Project Structure

```
anonymity-v2/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── utils/             # Crypto utilities
│   └── types.ts           # TypeScript types
├── backend/               # Express API server
│   ├── src/
│   │   ├── utils/         # ZK proof & Merkle tree utilities
│   │   └── server.ts      # Main server file
├── programs/              # Anchor smart contracts
│   └── anonymity-pool/    # Main privacy pool program
├── scripts/               # Deployment scripts
└── package.json
```

### Smart Contract Development

#### Build the Program
```bash
anchor build
```

#### Deploy to Devnet
```bash
anchor deploy --provider.cluster devnet
```

#### Run Deployment Script
```bash
npx ts-node scripts/deploy.ts
```

### Environment Variables

Create `.env` files if needed:

**Frontend (.env)**
```
VITE_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=a1c96ec7-818b-4789-ad2c-2bd175df4a95
VITE_PROGRAM_ID=AnonymityV2PoolProgram11111111111111111111
```

**Backend (.env)**
```
PORT=5000
SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=a1c96ec7-818b-4789-ad2c-2bd175df4a95
```

## Security Warnings

⚠️ **IMPORTANT SECURITY NOTICES**

1. **Experimental Software**: This is experimental software. Use at your own risk.
2. **Devnet Only**: Currently configured for Solana Devnet only.
3. **Backup Secret Notes**: Always backup your secret notes securely. Loss = permanent loss of funds.
4. **No Mainnet**: Do not use on Solana Mainnet without proper security audits.
5. **Privacy Limitations**: Anonymity set size affects privacy. Larger sets = better privacy.

## API Endpoints

### Backend API (http://localhost:5000)

- `POST /api/generate-proof` - Generate ZK withdrawal proof
- `GET /api/merkle-tree/:poolId` - Get Merkle tree state
- `POST /api/commitment` - Add new commitment to tree
- `GET /api/pool-stats` - Get pool statistics

## Troubleshooting

### Common Issues

1. **Wallet Connection Issues**
   - Ensure Phantom wallet is installed and unlocked
   - Switch to Solana Devnet in wallet settings

2. **RPC Issues**
   - The Helius RPC endpoint is configured for devnet
   - If rate limited, get your own API key from helius.xyz

3. **Transaction Failures**
   - Ensure sufficient SOL for gas fees
   - Check if program is deployed correctly
   - Verify you're on the correct network (devnet)

4. **Installation Issues**
   - Use Node.js v18 or higher
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

### Getting Help

1. Check browser developer console for errors
2. Verify wallet is connected and on devnet
3. Ensure backend is running if using full stack mode
4. Check Solana RPC endpoint status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on devnet
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

This software is provided "as is" without warranty. Use at your own risk. The developers are not responsible for any loss of funds or other damages. This is experimental software and should not be used with real funds on mainnet without proper security audits.
