
use anchor_lang::prelude::*;
use anchor_spl::token_2022::{self, Token2022, TokenAccount, Mint, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("FragmentedPaymentsV111111111111111111111111");

#[program]
pub mod anonymity_pool {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.mint = ctx.accounts.mint.key();
        pool.total_deposits = 0;
        pool.total_payments = 0;
        pool.service_fee_bps = 50; // 0.5% service fee
        
        msg!("Fragmented Payments Pool initialized");
        Ok(())
    }

    pub fn deposit_for_recipient(
        ctx: Context<DepositForRecipient>,
        recipient: Pubkey,
        total_amount: u64,
        delivery_speed: u8, // 1=fast(1hr), 2=standard(6hr), 3=slow(24hr)
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let depositor = &ctx.accounts.depositor;
        
        // Calculate service fee
        let service_fee = (total_amount * pool.service_fee_bps as u64) / 10000;
        let net_amount = total_amount - service_fee;
        
        // Transfer tokens from depositor to pool
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.depositor_token_account.to_account_info(),
                to: ctx.accounts.pool_vault.to_account_info(),
                authority: depositor.to_account_info(),
            },
        );
        token_2022::transfer(transfer_ctx, total_amount)?;
        
        // Create payment schedule
        let payment_schedule = PaymentSchedule {
            depositor: depositor.key(),
            recipient,
            total_amount: net_amount,
            remaining_amount: net_amount,
            delivery_speed,
            created_at: Clock::get()?.unix_timestamp,
            last_payment_at: 0,
            is_completed: false,
        };
        
        pool.payment_schedules.push(payment_schedule);
        pool.total_deposits += 1;
        
        emit!(DepositForRecipientEvent {
            depositor: depositor.key(),
            recipient,
            total_amount: net_amount,
            delivery_speed,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Deposit created: {} tokens for recipient {}", net_amount, recipient);
        Ok(())
    }

    pub fn execute_fragmented_payment(
        ctx: Context<ExecuteFragmentedPayment>,
        schedule_index: u32,
        payment_amount: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        
        // Only authorized scheduler can call this
        require!(
            ctx.accounts.scheduler.key() == pool.authority,
            ErrorCode::UnauthorizedScheduler
        );
        
        let schedule_idx = schedule_index as usize;
        require!(
            schedule_idx < pool.payment_schedules.len(),
            ErrorCode::InvalidScheduleIndex
        );
        
        let schedule = &mut pool.payment_schedules[schedule_idx];
        require!(!schedule.is_completed, ErrorCode::ScheduleAlreadyCompleted);
        require!(
            payment_amount <= schedule.remaining_amount,
            ErrorCode::InsufficientRemainingBalance
        );
        
        // Transfer from pool to recipient
        let pool_bump = ctx.bumps.pool;
        let seeds = &[b"pool".as_ref(), &[pool_bump]];
        let signer_seeds = &[&seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_vault.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: pool.to_account_info(),
            },
            signer_seeds,
        );
        token_2022::transfer(transfer_ctx, payment_amount)?;
        
        // Update schedule
        schedule.remaining_amount -= payment_amount;
        schedule.last_payment_at = Clock::get()?.unix_timestamp;
        
        if schedule.remaining_amount == 0 {
            schedule.is_completed = true;
            pool.total_payments += 1;
        }
        
        emit!(FragmentedPaymentEvent {
            recipient: schedule.recipient,
            amount: payment_amount,
            remaining_amount: schedule.remaining_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Fragmented payment: {} tokens to {}", payment_amount, schedule.recipient);
        Ok(())
    }

    pub fn get_schedule_info(
        ctx: Context<GetScheduleInfo>,
        depositor: Pubkey,
        recipient: Pubkey,
    ) -> Result<()> {
        let pool = &ctx.accounts.pool;
        
        for (index, schedule) in pool.payment_schedules.iter().enumerate() {
            if schedule.depositor == depositor && schedule.recipient == recipient {
                msg!("Schedule {}: Total: {}, Remaining: {}, Completed: {}",
                    index,
                    schedule.total_amount,
                    schedule.remaining_amount,
                    schedule.is_completed
                );
                return Ok(());
            }
        }
        
        msg!("No schedule found for depositor {} to recipient {}", depositor, recipient);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + FragmentedPaymentsPool::INIT_SPACE,
        seeds = [b"pool"],
        bump
    )]
    pub pool: Account<'info, FragmentedPaymentsPool>,
    
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
pub struct DepositForRecipient<'info> {
    #[account(mut)]
    pub pool: Account<'info, FragmentedPaymentsPool>,
    
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
pub struct ExecuteFragmentedPayment<'info> {
    #[account(
        mut,
        seeds = [b"pool"],
        bump
    )]
    pub pool: Account<'info, FragmentedPaymentsPool>,
    
    #[account(mut)]
    pub scheduler: Signer<'info>,
    
    #[account(
        mut,
        associated_token::mint = pool.mint,
        associated_token::authority = pool,
    )]
    pub pool_vault: Account<'info, TokenAccount>,
    
    /// CHECK: This is the recipient's token account
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token2022>,
}

#[derive(Accounts)]
pub struct GetScheduleInfo<'info> {
    pub pool: Account<'info, FragmentedPaymentsPool>,
}

#[account]
pub struct FragmentedPaymentsPool {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub total_deposits: u64,
    pub total_payments: u64,
    pub service_fee_bps: u16,
    pub payment_schedules: Vec<PaymentSchedule>,
}

impl FragmentedPaymentsPool {
    pub const INIT_SPACE: usize = 32 + 32 + 8 + 8 + 2 + 4 + (32 * 100); // Space for 100 schedules initially
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PaymentSchedule {
    pub depositor: Pubkey,
    pub recipient: Pubkey,
    pub total_amount: u64,
    pub remaining_amount: u64,
    pub delivery_speed: u8,
    pub created_at: i64,
    pub last_payment_at: i64,
    pub is_completed: bool,
}

#[event]
pub struct DepositForRecipientEvent {
    pub depositor: Pubkey,
    pub recipient: Pubkey,
    pub total_amount: u64,
    pub delivery_speed: u8,
    pub timestamp: i64,
}

#[event]
pub struct FragmentedPaymentEvent {
    pub recipient: Pubkey,
    pub amount: u64,
    pub remaining_amount: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized scheduler")]
    UnauthorizedScheduler,
    #[msg("Invalid schedule index")]
    InvalidScheduleIndex,
    #[msg("Schedule already completed")]
    ScheduleAlreadyCompleted,
    #[msg("Insufficient remaining balance")]
    InsufficientRemainingBalance,
}
