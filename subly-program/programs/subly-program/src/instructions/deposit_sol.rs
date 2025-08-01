use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::{constants::*, state::*};

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct DepositSol<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = User::LEN,
        seeds = [USER_SEED.as_bytes(), user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, User>,

    /// CHECK: This is the program's SOL vault
    #[account(
        mut,
        seeds = [b"sol_vault"],
        bump
    )]
    pub sol_vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DepositSol>, amount: u64) -> Result<()> {
    let user_account = &mut ctx.accounts.user_account;

    // Initialize user account if needed
    if user_account.wallet == Pubkey::default() {
        user_account.wallet = ctx.accounts.user.key();
        user_account.deposited_sol = 0;
        user_account.subscription_count = 0;
    }

    // Transfer SOL from user to vault
    let transfer_instruction = system_program::Transfer {
        from: ctx.accounts.user.to_account_info(),
        to: ctx.accounts.sol_vault.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        transfer_instruction,
    );

    system_program::transfer(cpi_ctx, amount)?;

    // Update deposited amount
    user_account.deposited_sol = user_account.deposited_sol.checked_add(amount).unwrap();

    msg!(
        "User {} deposited {} SOL (total: {} SOL)",
        ctx.accounts.user.key(),
        amount as f64 / 1_000_000_000.0,
        user_account.deposited_sol as f64 / 1_000_000_000.0
    );

    Ok(())
}
