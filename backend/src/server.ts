import express from 'express';
import cors from 'cors';
import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import bs58 from 'bs58';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Solana connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://devnet.helius-rpc.com/?api-key=a1c96ec7-818b-4789-ad2c-2bd175df4a95',
  'confirmed'
);

// Scheduler keypair (should be the same as pool authority)
const SCHEDULER_PRIVATE_KEY = process.env.SCHEDULER_PRIVATE_KEY;
let schedulerKeypair: Keypair;

if (SCHEDULER_PRIVATE_KEY) {
  schedulerKeypair = Keypair.fromSecretKey(bs58.decode(SCHEDULER_PRIVATE_KEY));
} else {
  // Generate new keypair for development
  schedulerKeypair = Keypair.generate();
  console.log('Generated new scheduler keypair:', schedulerKeypair.publicKey.toString());
  console.log('Private key (base58):', bs58.encode(schedulerKeypair.secretKey));
}

const PROGRAM_ID = new PublicKey('FragmentedPaymentsV111111111111111111111111');
const POOL_SEED = 'pool';

// In-memory tracking of active schedules
const activeSchedules = new Map<string, any>();

// Fragmentation algorithm
function calculateNextPaymentAmount(schedule: any): number {
  const { remaining_amount, delivery_speed, created_at } = schedule;
  const now = Date.now() / 1000;
  const elapsed = now - created_at;

  // Delivery speed: 1=1hr, 2=6hr, 3=24hr
  const totalDeliveryTime = delivery_speed === 1 ? 3600 : delivery_speed === 2 ? 21600 : 86400;
  const minPayments = 5; // Minimum number of fragments
  const maxPayments = Math.max(15, Math.floor(remaining_amount / 1000000)); // Max based on amount

  // Random fragment size (5-25% of remaining amount)
  const minPercent = 0.05;
  const maxPercent = 0.25;
  const randomPercent = minPercent + (Math.random() * (maxPercent - minPercent));

  let fragmentAmount = Math.floor(remaining_amount * randomPercent);

  // Ensure we don't create too many tiny payments at the end
  const estimatedRemainingPayments = Math.floor(remaining_amount / fragmentAmount);
  if (estimatedRemainingPayments > maxPayments) {
    fragmentAmount = Math.floor(remaining_amount / maxPayments);
  }

  // If this would be the last payment or very close, send the rest
  if (fragmentAmount >= remaining_amount * 0.8) {
    fragmentAmount = remaining_amount;
  }

  return Math.max(fragmentAmount, 1); // Minimum 1 lamport
}

function calculateNextPaymentDelay(deliverySpeed: number): number {
  // Random delay based on delivery speed
  let baseDelay: number;

  switch (deliverySpeed) {
    case 1: // Fast: 1-10 minutes
      baseDelay = 60 + Math.random() * 540;
      break;
    case 2: // Standard: 5-30 minutes  
      baseDelay = 300 + Math.random() * 1500;
      break;
    case 3: // Slow: 15-60 minutes
      baseDelay = 900 + Math.random() * 2700;
      break;
    default:
      baseDelay = 300;
  }

  return Math.floor(baseDelay * 1000); // Convert to milliseconds
}

// Process a single fragmented payment
async function processFragmentedPayment(scheduleIndex: number, schedule: any) {
  try {
    console.log(`Processing fragmented payment for schedule ${scheduleIndex}`);

    const paymentAmount = calculateNextPaymentAmount(schedule);

    // Get pool PDA
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(POOL_SEED)],
      PROGRAM_ID
    );

    // Get recipient token account
    const recipientTokenAccount = await getAssociatedTokenAddress(
      schedule.mint,
      new PublicKey(schedule.recipient)
    );

    // Get pool vault
    const poolVault = await getAssociatedTokenAddress(
      schedule.mint,
      poolPda,
      true
    );

    // Create transaction (simplified - in real implementation, use Anchor)
    console.log(`Sending ${paymentAmount} tokens to ${schedule.recipient}`);

    // Update our local tracking
    schedule.remaining_amount -= paymentAmount;
    schedule.last_payment_at = Date.now() / 1000;

    if (schedule.remaining_amount <= 0) {
      schedule.is_completed = true;
      activeSchedules.delete(`${scheduleIndex}`);
      console.log(`Schedule ${scheduleIndex} completed`);
    } else {
      // Schedule next payment
      const nextDelay = calculateNextPaymentDelay(schedule.delivery_speed);
      setTimeout(() => processFragmentedPayment(scheduleIndex, schedule), nextDelay);
      console.log(`Next payment in ${Math.floor(nextDelay / 1000)} seconds`);
    }

  } catch (error) {
    console.error(`Error processing fragmented payment:`, error);
    // Retry after delay
    setTimeout(() => processFragmentedPayment(scheduleIndex, schedule), 60000);
  }
}

// API Routes

app.get('/api/pool-stats', async (req, res) => {
  try {
    const stats = {
      totalDeposits: Array.from(activeSchedules.values()).length,
      totalPayments: 0,
      activeSchedules: activeSchedules.size,
      serviceFee: 0.5, // 0.5%
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching pool stats:', error);
    res.status(500).json({ error: 'Failed to fetch pool stats' });
  }
});

app.post('/api/schedule-payment', async (req, res) => {
  try {
    const { recipient, totalAmount, deliverySpeed, txSignature } = req.body;

    // Verify transaction (simplified)
    console.log(`New payment scheduled: ${totalAmount} to ${recipient}`);

    // Create schedule
    const scheduleIndex = activeSchedules.size;
    const schedule = {
      depositor: 'unknown', // Would get from transaction
      recipient,
      total_amount: totalAmount,
      remaining_amount: totalAmount * 0.995, // After 0.5% fee
      delivery_speed: deliverySpeed,
      created_at: Date.now() / 1000,
      last_payment_at: 0,
      is_completed: false,
      mint: 'So11111111111111111111111111111111111111112', // SOL mint
    };

    activeSchedules.set(`${scheduleIndex}`, schedule);

    // Start fragmented payments
    const initialDelay = calculateNextPaymentDelay(deliverySpeed);
    setTimeout(() => processFragmentedPayment(scheduleIndex, schedule), initialDelay);

    res.json({ 
      success: true, 
      scheduleIndex,
      message: 'Payment scheduled successfully',
      estimatedDeliveryTime: deliverySpeed === 1 ? '1 hour' : deliverySpeed === 2 ? '6 hours' : '24 hours'
    });

  } catch (error) {
    console.error('Error scheduling payment:', error);
    res.status(500).json({ error: 'Failed to schedule payment' });
  }
});

app.get('/api/schedule/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const schedule = activeSchedules.get(scheduleId);

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({
      scheduleId,
      ...schedule,
      progress: ((schedule.total_amount - schedule.remaining_amount) / schedule.total_amount * 100).toFixed(2)
    });

  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    scheduler: schedulerKeypair.publicKey.toString(),
    activeSchedules: activeSchedules.size
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Fragmented Payments Scheduler running on port ${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/health`);
  console.log('✅ Backend server is ready to handle fragmented payments');
});