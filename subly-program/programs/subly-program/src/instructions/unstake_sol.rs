use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{TokenAccount, Mint, Token},
};
use spl_stake_pool::instruction as spl_instruction;
use crate::{constants::*, error::ErrorCode, state::*};

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct UnstakeSol<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [USER_SEED.as_bytes(), user.key().as_ref()],
        bump = user_account.bump,
        constraint = user_account.wallet == user.key() @ ErrorCode::UnauthorizedUser
    )]
    pub user_account: Account<'info, User>,

    #[account(
        mut,
        seeds = [
            STAKE_ACCOUNT_SEED.as_bytes(),
            user.key().as_ref(),
        ],
        bump = stake_account.bump,
        constraint = stake_account.user == user.key() @ ErrorCode::UnauthorizedUser,
        constraint = stake_account.is_active @ ErrorCode::StakingNotAvailable
    )]
    pub stake_account: Account<'info, StakeAccount>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump,
    )]
    pub sol_vault: SystemAccount<'info>,

    /// Global state for reading Jito configuration
    #[account(
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    /// Protocol's JitoSOL vault (ATA owned by protocol PDA)
    #[account(
        mut,
        associated_token::mint = jito_sol_mint,
        associated_token::authority = protocol_authority
    )]
    pub protocol_jito_vault: Account<'info, TokenAccount>,

    /// CHECK: Protocol authority PDA that owns JitoSOL vault
    #[account(
        seeds = [b"protocol_authority"],
        bump
    )]
    pub protocol_authority: UncheckedAccount<'info>,

    // ===== Jito/SPL Stake Pool Accounts for Withdrawal =====
    
    /// CHECK: SPL Stake Pool program (read from GlobalState)
    #[account(address = global_state.spl_stake_pool_program)]
    pub stake_pool_program: UncheckedAccount<'info>,

    /// CHECK: Jito Stake Pool account (read from GlobalState)
    #[account(
        mut,
        address = global_state.jito_stake_pool
    )]
    pub jito_stake_pool: UncheckedAccount<'info>,

    /// CHECK: Stake pool withdraw authority (PDA derived from stake pool)
    pub stake_pool_withdraw_authority: UncheckedAccount<'info>,

    /// JitoSOL mint (read from GlobalState)
    #[account(
        mut,
        address = global_state.jito_sol_mint
    )]
    pub jito_sol_mint: Account<'info, Mint>,

    /// CHECK: Jito manager fee account
    #[account(mut)]
    pub manager_fee_account: UncheckedAccount<'info>,

    // ===== Programs =====
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> UnstakeSol<'info> {
    pub fn handler(ctx: Context<UnstakeSol>, jito_sol_amount: u64) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let stake_account = &mut ctx.accounts.stake_account;

        require!(jito_sol_amount > 0, ErrorCode::InvalidAmount);
        require!(
            stake_account.jito_sol_amount >= jito_sol_amount,
            ErrorCode::InsufficientStakedFunds
        );

        // Prepare signer seeds for protocol authority
        let protocol_authority_bump = ctx.bumps.protocol_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"protocol_authority",
            &[protocol_authority_bump],
        ]];

        // ===== REAL JITO UNSTAKING =====
        // Using actual Jito SPL Stake Pool withdraw_sol instruction
        
        // Create the withdraw_sol instruction for Jito SPL Stake Pool
        let withdraw_instruction = spl_instruction::withdraw_sol(
            &ctx.accounts.stake_pool_program.key(),          // stake pool program
            &ctx.accounts.jito_stake_pool.key(),             // stake pool
            &ctx.accounts.stake_pool_withdraw_authority.key(), // withdraw authority
            &ctx.accounts.protocol_authority.key(),          // user transfer authority (protocol)
            &ctx.accounts.protocol_jito_vault.key(),         // burn from (JitoSOL source)
            &ctx.accounts.sol_vault.key(),                   // to (SOL destination)
            &ctx.accounts.manager_fee_account.key(),         // manager fee account
            &ctx.accounts.jito_sol_mint.key(),              // pool mint
            &ctx.accounts.token_program.key(),               // token program
            &ctx.accounts.system_program.key(),              // system program
            jito_sol_amount,                                 // JitoSOL amount to burn
        );

        // Execute the Jito unstake via CPI
        anchor_lang::solana_program::program::invoke_signed(
            &withdraw_instruction,
            &[
                ctx.accounts.stake_pool_program.to_account_info(),
                ctx.accounts.jito_stake_pool.to_account_info(),
                ctx.accounts.stake_pool_withdraw_authority.to_account_info(),
                ctx.accounts.protocol_authority.to_account_info(),
                ctx.accounts.protocol_jito_vault.to_account_info(),
                ctx.accounts.sol_vault.to_account_info(),
                ctx.accounts.manager_fee_account.to_account_info(),
                ctx.accounts.jito_sol_mint.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            signer_seeds,
        )?;

        // Calculate estimated SOL received (reverse of staking calculation)
        let estimated_sol_received = jito_sol_amount.saturating_mul(102).saturating_div(100);

        // Update stake account
        stake_account.jito_sol_amount = stake_account.jito_sol_amount.checked_sub(jito_sol_amount).unwrap();
        stake_account.staked_amount = stake_account.staked_amount.checked_sub(estimated_sol_received).unwrap();

        // If no more staked amount, deactivate the stake account
        if stake_account.staked_amount == 0 {
            stake_account.is_active = false;
        }

        // Update user account
        user_account.staked_sol = user_account.staked_sol.checked_sub(estimated_sol_received).unwrap();
        user_account.deposited_sol = user_account.deposited_sol.checked_add(estimated_sol_received).unwrap();

        msg!(
            "User {} unstaked {} JitoSOL via pool {}, received ~{} SOL",
            ctx.accounts.user.key(),
            jito_sol_amount as f64 / 1_000_000_000.0,
            ctx.accounts.global_state.jito_stake_pool,
            estimated_sol_received as f64 / 1_000_000_000.0
        );

        Ok(())
    }
}
