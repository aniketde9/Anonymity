
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';

// Load the IDL
const idl = JSON.parse(fs.readFileSync('./target/idl/anonymity_pool.json', 'utf8'));

async function main() {
  // Configure the client to use devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
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

main().catch(console.error);
