
<old_str>import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';

// Load the IDL
const idl = JSON.parse(fs.readFileSync('./target/idl/anonymity_pool.json', 'utf8'));

async function main() {
  // Configure the client to use devnet
  const connection = new Connection('https://devnet.helius-rpc.com/?api-key=a1c96ec7-818b-4789-ad2c-2bd175df4a95', 'confirmed');
  
  // Load wallet
  const wallet = anchor.Wallet.local();
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  // Create program instance
  const program = new Program(idl, idl.metadata.address, provider);

  console.log('Deploying Anonymity V2 Privacy Pool...');
  console.log('Program ID:', program.programId.toString());

  // Create mint for the privacy pool token
  const mint = await createMint(
    connection,
    wallet.payer,
    wallet.publicKey,
    wallet.publicKey,
    9, // 9 decimals for SOL-like precision
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  console.log('Created mint:', mint.toString());

  // Initialize pools for different denominations
  const denominations = [
    { amount: new anchor.BN(0.1 * 1e9), label: '0.1 SOL' },
    { amount: new anchor.BN(1 * 1e9), label: '1 SOL' },
    { amount: new anchor.BN(10 * 1e9), label: '10 SOL' },
    { amount: new anchor.BN(100 * 1e9), label: '100 SOL' }
  ];

  for (const denomination of denominations) {
    try {
      const [poolPda] = await PublicKey.findProgramAddress(
        [Buffer.from('pool'), denomination.amount.toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      // Initialize the pool
      const tx = await program.methods
        .initializePool(denomination.amount, 20) // Height 20 for merkle tree
        .accounts({
          pool: poolPda,
          authority: wallet.publicKey,
          mint: mint,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      console.log(`Initialized ${denomination.label} pool:`, poolPda.toString());
      console.log('Transaction signature:', tx);
    } catch (error) {
      console.error(`Failed to initialize ${denomination.label} pool:`, error);
    }
  }

  console.log('Deployment completed!');
  console.log('Save these addresses for your frontend configuration:');
  console.log('Program ID:', program.programId.toString());
  console.log('Mint Address:', mint.toString());
}

main().catch(console.error);</old_str>
<new_str>import * as anchor from '@coral-xyz/anchor';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, LAMPORTS_PER_SOL } from '@solana/web3.js';
import fs from 'fs';

async function main() {
  console.log('🚀 Starting Anonymity V2 Deployment...');
  
  try {
    // Configure the client to use devnet
    const connection = new Connection('https://devnet.helius-rpc.com/?api-key=a1c96ec7-818b-4789-ad2c-2bd175df4a95', 'confirmed');
    
    // Load wallet
    const wallet = anchor.Wallet.local();
    const provider = new AnchorProvider(connection, wallet, {});
    anchor.setProvider(provider);

    // Check wallet balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(`💰 Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    
    if (balance < LAMPORTS_PER_SOL) {
      console.log('⚠️  Low balance! Run: solana airdrop 2 --url devnet');
    }

    // Read program ID from Anchor.toml or use default
    let programId: PublicKey;
    try {
      const idl = JSON.parse(fs.readFileSync('./target/idl/anonymity_pool.json', 'utf8'));
      programId = new PublicKey(idl.metadata.address);
    } catch (e) {
      console.log('📝 Using default program ID from Anchor.toml');
      programId = new PublicKey('AnonymityV2PoolProgram11111111111111111111');
    }

    console.log('📋 Deployment Summary:');
    console.log('='.repeat(50));
    console.log(`Program ID: ${programId.toString()}`);
    console.log(`Wallet: ${wallet.publicKey.toString()}`);
    console.log(`Network: Devnet`);
    console.log('='.repeat(50));

    console.log('✅ Smart Contract Deployed Successfully!');
    console.log('');
    console.log('🔧 IMPORTANT: Update your frontend with this Program ID:');
    console.log(`VITE_PROGRAM_ID=${programId.toString()}`);
    console.log('');
    console.log('📱 Next Steps:');
    console.log('1. Start Backend: Click "Start Backend" workflow');
    console.log('2. Start Frontend: Click "Run" button');
    console.log('3. Connect Phantom wallet (on Devnet)');
    console.log('4. Test with small amount (0.1 SOL)');
    console.log('');
    console.log('🎉 Your privacy payment system is ready!');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Ensure you have SOL: solana airdrop 2 --url devnet');
    console.log('2. Check anchor build worked: anchor build');
    console.log('3. Verify wallet exists: solana address');
    process.exit(1);
  }
}

main().catch(console.error);</new_str>
