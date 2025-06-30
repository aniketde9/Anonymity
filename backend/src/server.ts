
import express from 'express';
import cors from 'cors';
import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { createHash } from 'crypto';
import { MerkleTree } from './utils/merkleTree';
import { generateProof, verifyProof } from './utils/zkProof';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Solana connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const programId = new PublicKey('AnonymityV2PoolProgram11111111111111111111');

// Pool configuration
const POOL_CONFIGS = {
  '0.1': { amount: 0.1 * 1e9, poolPubkey: null as PublicKey | null },
  '1': { amount: 1 * 1e9, poolPubkey: null as PublicKey | null },
  '10': { amount: 10 * 1e9, poolPubkey: null as PublicKey | null },
  '100': { amount: 100 * 1e9, poolPubkey: null as PublicKey | null },
};

// In-memory storage (use database in production)
const merkleTreeStorage: { [poolKey: string]: MerkleTree } = {};
const commitmentStorage: { [commitment: string]: any } = {};

// API Routes

// Get pool stats
app.get('/api/pool/stats', async (req, res) => {
  try {
    let totalValuePooled = 0;
    let anonymitySetSize = 0;

    for (const [amount, config] of Object.entries(POOL_CONFIGS)) {
      if (config.poolPubkey) {
        // Fetch on-chain pool data
        const poolAccount = await connection.getAccountInfo(config.poolPubkey);
        if (poolAccount) {
          // Parse pool data and accumulate stats
          anonymitySetSize += 10; // Mock data - replace with actual parsing
          totalValuePooled += parseFloat(amount) * 10; // Mock calculation
        }
      }
    }

    res.json({
      totalValuePooled: totalValuePooled / 1e9, // Convert to SOL
      anonymitySetSize
    });
  } catch (error) {
    console.error('Error fetching pool stats:', error);
    res.status(500).json({ error: 'Failed to fetch pool stats' });
  }
});

// Create deposit commitment
app.post('/api/deposit/prepare', async (req, res) => {
  try {
    const { secretNote, depositAmount } = req.body;

    if (!secretNote || !depositAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate commitment from secret note
    const commitment = createHash('sha256')
      .update(secretNote)
      .digest('hex');

    // Get or create merkle tree for this pool
    const poolKey = depositAmount.toString();
    if (!merkleTreeStorage[poolKey]) {
      merkleTreeStorage[poolKey] = new MerkleTree(20); // Height 20
    }

    const merkleTree = merkleTreeStorage[poolKey];
    const leafIndex = merkleTree.getNextLeafIndex();

    // Store commitment data
    commitmentStorage[commitment] = {
      secretNote,
      depositAmount,
      leafIndex,
      timestamp: Date.now(),
      used: false
    };

    res.json({
      commitment,
      leafIndex,
      merkleRoot: merkleTree.getRoot()
    });
  } catch (error) {
    console.error('Error preparing deposit:', error);
    res.status(500).json({ error: 'Failed to prepare deposit' });
  }
});

// Process deposit
app.post('/api/deposit/commit', async (req, res) => {
  try {
    const { commitment, signature } = req.body;

    if (!commitment || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const commitmentData = commitmentStorage[commitment];
    if (!commitmentData) {
      return res.status(400).json({ error: 'Invalid commitment' });
    }

    // Verify transaction signature
    const confirmedTx = await connection.confirmTransaction(signature, 'confirmed');
    if (confirmedTx.value.err) {
      return res.status(400).json({ error: 'Transaction failed' });
    }

    // Add commitment to merkle tree
    const poolKey = commitmentData.depositAmount.toString();
    const merkleTree = merkleTreeStorage[poolKey];
    merkleTree.addLeaf(Buffer.from(commitment, 'hex'));

    // Mark as committed
    commitmentData.committed = true;
    commitmentData.transactionSignature = signature;

    res.json({
      success: true,
      leafIndex: commitmentData.leafIndex,
      merkleRoot: merkleTree.getRoot()
    });
  } catch (error) {
    console.error('Error committing deposit:', error);
    res.status(500).json({ error: 'Failed to commit deposit' });
  }
});

// Prepare withdrawal
app.post('/api/withdraw/prepare', async (req, res) => {
  try {
    const { secretNote, recipientAddress } = req.body;

    if (!secretNote || !recipientAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate commitment from secret note
    const commitment = createHash('sha256')
      .update(secretNote)
      .digest('hex');

    const commitmentData = commitmentStorage[commitment];
    if (!commitmentData || !commitmentData.committed || commitmentData.used) {
      return res.status(400).json({ error: 'Invalid or already used secret note' });
    }

    // Generate nullifier
    const nullifier = createHash('sha256')
      .update(secretNote + recipientAddress)
      .digest('hex');

    // Get merkle proof
    const poolKey = commitmentData.depositAmount.toString();
    const merkleTree = merkleTreeStorage[poolKey];
    const merkleProof = merkleTree.getProof(commitmentData.leafIndex);

    // Generate zero-knowledge proof (simplified)
    const zkProof = await generateProof({
      secret: secretNote,
      nullifier,
      commitment,
      merkleProof,
      recipient: recipientAddress
    });

    res.json({
      nullifier,
      merkleProof: merkleProof.map(p => p.toString('hex')),
      zkProof,
      depositAmount: commitmentData.depositAmount
    });
  } catch (error) {
    console.error('Error preparing withdrawal:', error);
    res.status(500).json({ error: 'Failed to prepare withdrawal' });
  }
});

// Process withdrawal
app.post('/api/withdraw/execute', async (req, res) => {
  try {
    const { secretNote, signature } = req.body;

    if (!secretNote || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const commitment = createHash('sha256')
      .update(secretNote)
      .digest('hex');

    const commitmentData = commitmentStorage[commitment];
    if (!commitmentData) {
      return res.status(400).json({ error: 'Invalid secret note' });
    }

    // Verify transaction signature
    const confirmedTx = await connection.confirmTransaction(signature, 'confirmed');
    if (confirmedTx.value.err) {
      return res.status(400).json({ error: 'Transaction failed' });
    }

    // Mark as used
    commitmentData.used = true;
    commitmentData.withdrawalSignature = signature;
    commitmentData.withdrawalTimestamp = Date.now();

    res.json({
      success: true,
      message: 'Withdrawal completed successfully'
    });
  } catch (error) {
    console.error('Error executing withdrawal:', error);
    res.status(500).json({ error: 'Failed to execute withdrawal' });
  }
});

// Get merkle tree info
app.get('/api/merkle/:poolAmount', async (req, res) => {
  try {
    const poolKey = req.params.poolAmount;
    const merkleTree = merkleTreeStorage[poolKey];

    if (!merkleTree) {
      return res.status(404).json({ error: 'Pool not found' });
    }

    res.json({
      root: merkleTree.getRoot(),
      height: merkleTree.getHeight(),
      leafCount: merkleTree.getLeafCount()
    });
  } catch (error) {
    console.error('Error fetching merkle tree info:', error);
    res.status(500).json({ error: 'Failed to fetch merkle tree info' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Anonymity V2 Backend running on port ${PORT}`);
  console.log(`Connected to Solana devnet: ${connection.rpcEndpoint}`);
});
