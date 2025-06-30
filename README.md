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

## 🚀 COMPLETE DEPLOYMENT GUIDE (Non-Technical)

### Step 1: Setup Your Wallet
1. Install [Phantom Wallet](https://phantom.app/) browser extension
2. Create a new wallet (save your seed phrase safely!)
3. Click the settings gear in Phantom → Change Network → **Switch to Devnet**
4. Copy your wallet address (click your wallet name to copy)

### Step 2: Get Test SOL
Run this command in the Shell (bottom of screen):
```bash
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```
Replace `YOUR_WALLET_ADDRESS` with your actual wallet address from Phantom.

### Step 3: Deploy the Smart Contract
1. Click **"Deploy Program"** workflow (in the dropdown next to Run)
2. Wait for all 3 steps to complete (takes 2-3 minutes)
3. Look for the final output that shows **Program ID** - copy this address!

### Step 4: Update Frontend Configuration
After deployment completes, you'll see output like:
```
Program ID: ABC123...XYZ
```
Copy that Program ID and replace it in the code.

### Step 5: Start the Backend Server
1. Click **"Start Backend"** workflow 
2. Wait until you see "Server running on port 5000"

### Step 6: Start the Frontend
1. Click the **Run** button (starts frontend)
2. Open the web preview (should show at top)
3. Connect your Phantom wallet

### Step 7: Test the System
1. Enter a recipient address
2. Enter amount (start with 0.1 SOL for testing)
3. Choose delivery speed
4. Click "Send Private Payment"
5. Confirm transaction in Phantom

**That's it! Your private payment system is now live on Solana Devnet!**

---

## 🛠️ Technical Details (For Developers)

### Architecture

- **Smart Contract**: Rust/Anchor program on Solana devnet
- **Backend**: Node.js scheduler service on port 5000  
- **Frontend**: React app with Solana wallet integration

### Environment Variables

Create `.env` file:
```bash
VITE_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=a1c96ec7-818b-4789-ad2c-2bd175df4a95
VITE_PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID
```

Create `backend/.env` file:
```bash
PORT=5000
SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=a1c96ec7-818b-4789-ad2c-2bd175df4a95
SCHEDULER_PRIVATE_KEY=YOUR_KEYPAIR_BASE58
```

### Available Workflows

- **Dev Server**: Starts frontend only
- **Start Backend**: Starts Node.js scheduler service
- **Deploy Program**: Builds and deploys smart contract to devnet

## 🔒 Security Features

- **Value Obfuscation**: Original amounts hidden through fragmentation
- **Timing Obfuscation**: Payments spread over time
- **Pool Mixing**: High-volume transactions provide cover
- **Non-Custodial**: Automated system with no human intervention

## ⚠️ Important Notes

1. **Devnet Only**: This is configured for Solana Devnet (test network)
2. **Test SOL**: Use `solana airdrop 2 <address> --url devnet` for test funds
3. **Save Addresses**: Keep your Program ID and wallet addresses safe
4. **Experimental**: Use at your own risk, this is experimental software

## 🎮 Usage Guide

### Sending a Private Payment

1. **Connect Wallet**: Click "Connect" and select Phantom
2. **Enter Details**: 
   - Recipient's Solana address
   - Amount in SOL
   - Delivery speed (Fast/Standard/Slow)
3. **Send**: Click "Send Private Payment"
4. **Confirm**: Approve transaction in Phantom wallet
5. **Track**: Your payment will be automatically fragmented and delivered

### Tracking Payments

1. Go to "Track Payments" tab
2. Enter wallet address to monitor
3. View active payment schedules
4. See real-time fragmented delivery progress

## 🚨 Troubleshooting

### Common Issues:

**"Transaction failed"**
- Ensure wallet is on Devnet
- Check you have enough SOL for transaction + fees
- Refresh page and try again

**"Program not found"**
- Run "Deploy Program" workflow first
- Update Program ID in frontend code
- Restart frontend with Run button

**"Backend connection failed"**
- Start "Start Backend" workflow
- Check port 5000 is available
- Look for "Server running" message

**"Wallet won't connect"**
- Refresh page
- Switch Phantom to Devnet
- Clear browser cache

### Getting More Test SOL
```bash
solana airdrop 2 <your-address> --url devnet
```

### Check Your Balance
```bash
solana balance <your-address> --url devnet
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Look at browser console for error messages
3. Ensure all steps were followed in order
4. Try with a smaller test amount first (0.1 SOL)

---

**Ready to use private payments on Solana! 🚀**