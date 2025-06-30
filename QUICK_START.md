
# Quick Start Guide

Get Anonymity V2 running in 5 minutes!

## 1. One-Command Install

```bash
# Download and install everything
git clone <your-repo-url>
cd anonymity-v2
chmod +x install.sh && ./install.sh
```

## 2. Start the App

```bash
# Frontend only (recommended for testing)
npm run dev
```

Open http://localhost:5173

## 3. Setup Wallet

1. Install [Phantom Wallet](https://phantom.app/)
2. Create/import wallet
3. Switch to **Solana Devnet**
4. Get test SOL: `solana airdrop 2 <your-address> --url devnet`

## 4. Use the Privacy Pool

1. **Connect Wallet** - Click connect button
2. **Deposit** - Choose amount → Generate secret → Confirm transaction
3. **Save Secret Note** - Backup this safely! 
4. **Withdraw** - Enter secret → Choose recipient → Anonymous withdrawal

## Development Commands

```bash
npm run dev                 # Frontend only
npm run dev:full           # Frontend + Backend
npm run deploy:program     # Deploy smart contracts
npm run wallet:airdrop     # Get devnet SOL
```

## Need Help?

- Check browser console for errors
- Ensure wallet is on Devnet
- Read full README.md for troubleshooting

⚠️ **Devnet only - experimental software!**
