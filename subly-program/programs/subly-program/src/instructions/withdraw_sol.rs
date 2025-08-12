use crate::{constants::*, error::ErrorCode, state::*};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct WithdrawSol<'info> {
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
        seeds = [b"vault", user.key().as_ref()],
        bump,
    )]
    pub sol_vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> WithdrawSol<'info> {
    pub fn handler(ctx: Context<WithdrawSol>, amount: u64) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;

        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(
            user_account.deposited_sol >= amount,
            ErrorCode::InsufficientBalance
        );

        // Calculate available balance (deposited - locked for subscriptions)
        let available_balance = user_account
            .deposited_sol
            .checked_sub(user_account.locked_sol)
            .unwrap_or(0);

        require!(
            available_balance >= amount,
            ErrorCode::InsufficientAvailableBalance
        );

        // Transfer SOL from vault to user
        let vault_bump = ctx.bumps.sol_vault;
        let user_key = ctx.accounts.user.key();
        let signer_seeds: &[&[&[u8]]] = &[&[b"vault", user_key.as_ref(), &[vault_bump]]];

        let transfer_ix = anchor_lang::system_program::Transfer {
            from: ctx.accounts.sol_vault.to_account_info(),
            to: ctx.accounts.user.to_account_info(),
        };

        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                transfer_ix,
                signer_seeds,
            ),
            amount,
        )?;

        // Update user account
        user_account.deposited_sol = user_account.deposited_sol.checked_sub(amount).unwrap();

        msg!(
            "User {} withdrew {} SOL (remaining: {} SOL)",
            ctx.accounts.user.key(),
            amount as f64 / 1_000_000_000.0,
            user_account.deposited_sol as f64 / 1_000_000_000.0
        );

        Ok(())
    }
}
