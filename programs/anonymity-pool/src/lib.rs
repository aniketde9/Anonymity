
use anchor_lang::prelude::*;
use anchor_spl::token_2022::{self, Token2022, TokenAccount, Mint};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("AnonymityV2PoolProgram11111111111111111111");

#[program]
pub mod anonymity_pool {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        deposit_amount: u64,
        merkle_tree_height: u8,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.mint = ctx.accounts.mint.key();
        pool.deposit_amount = deposit_amount;
        pool.merkle_tree_height = merkle_tree_height;
        pool.next_leaf_index = 0;
        pool.merkle_tree_root = [0u8; 32];
        pool.nullifier_hashes = Vec::new();
        
        msg!("Privacy pool initialized with deposit amount: {}", deposit_amount);
        Ok(())
    }

    pub fn deposit(
        ctx: Context<Deposit>,
        commitment: [u8; 32],
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        
        // Verify deposit amount matches pool requirement
        let deposit_amount = pool.deposit_amount;
        
        // Transfer tokens to pool vault
        let cpi_accounts = token_2022::Transfer {
            from: ctx.accounts.depositor_token_account.to_account_info(),
            to: ctx.accounts.pool_vault.to_account_info(),
            authority: ctx.accounts.depositor.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token_2022::transfer(cpi_ctx, deposit_amount)?;
        
        // Add commitment to merkle tree
        pool.commitments.push(commitment);
        pool.next_leaf_index += 1;
        
        // Update merkle tree root (simplified - in production use proper merkle tree)
        pool.merkle_tree_root = commitment;
        
        emit!(DepositEvent {
            commitment,
            leaf_index: pool.next_leaf_index - 1,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Deposit successful. Commitment added at index: {}", pool.next_leaf_index - 1);
        Ok(())
    }

    pub fn withdraw(
        ctx: Context<Withdraw>,
        nullifier_hash: [u8; 32],
        merkle_proof: Vec<[u8; 32]>,
        commitment: [u8; 32],
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        
        // Check nullifier hasn't been used
        require!(!pool.nullifier_hashes.contains(&nullifier_hash), ErrorCode::NullifierAlreadyUsed);
        
        // Verify merkle proof (simplified - in production use proper verification)
        require!(pool.commitments.contains(&commitment), ErrorCode::InvalidProof);
        
        // Add nullifier to prevent double spending
        pool.nullifier_hashes.push(nullifier_hash);
        
        // Transfer tokens from pool vault to recipient
        let authority_seeds = &[
            b"pool".as_ref(),
            &[ctx.bumps.pool],
        ];
        let signer = &[&authority_seeds[..]];
        
        let cpi_accounts = token_2022::Transfer {
            from: ctx.accounts.pool_vault.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        
        token_2022::transfer(cpi_ctx, pool.deposit_amount)?;
        
        emit!(WithdrawEvent {
            nullifier_hash,
            recipient: ctx.accounts.recipient.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Withdrawal successful");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + PrivacyPool::INIT_SPACE,
        seeds = [b"pool"],
        bump
    )]
    pub pool: Account<'info, PrivacyPool>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = pool,
    )]
    pub pool_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub pool: Account<'info, PrivacyPool>,
    
    #[account(mut)]
    pub depositor: Signer<'info>,
    
    #[account(
        mut,
        associated_token::mint = pool.mint,
        associated_token::authority = depositor,
    )]
    pub depositor_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = pool.mint,
        associated_token::authority = pool,
    )]
    pub pool_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token2022>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"pool"],
        bump
    )]
    pub pool: Account<'info, PrivacyPool>,
    
    #[account(mut)]
    pub recipient: Signer<'info>,
    
    #[account(
        mut,
        associated_token::mint = pool.mint,
        associated_token::authority = recipient,
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = pool.mint,
        associated_token::authority = pool,
    )]
    pub pool_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token2022>,
}

#[account]
pub struct PrivacyPool {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub deposit_amount: u64,
    pub merkle_tree_height: u8,
    pub next_leaf_index: u32,
    pub merkle_tree_root: [u8; 32],
    pub commitments: Vec<[u8; 32]>,
    pub nullifier_hashes: Vec<[u8; 32]>,
}

impl PrivacyPool {
    pub const INIT_SPACE: usize = 32 + 32 + 8 + 1 + 4 + 32 + 4 + 4;
}

#[event]
pub struct DepositEvent {
    pub commitment: [u8; 32],
    pub leaf_index: u32,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawEvent {
    pub nullifier_hash: [u8; 32],
    pub recipient: Pubkey,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Nullifier hash already used")]
    NullifierAlreadyUsed,
    #[msg("Invalid merkle proof")]
    InvalidProof,
    #[msg("Insufficient balance")]
    InsufficientBalance,
}
