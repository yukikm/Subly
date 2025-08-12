use crate::{error::ErrorCode, state::*};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ProcessSubscriptionPayments<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump,
        constraint = global_state.authority == authority.key() @ ErrorCode::UnauthorizedAuthority
    )]
    pub global_state: Account<'info, GlobalState>,

    /// CHECK: Treasury account to collect protocol fees
    #[account(
        mut,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> ProcessSubscriptionPayments<'info> {
    pub fn handler(ctx: Context<ProcessSubscriptionPayments>) -> Result<()> {
        require!(
            !ctx.accounts.global_state.is_paused,
            ErrorCode::ProtocolPaused
        );

        msg!("Processing subscription payments");

        // This is a simplified version - in practice, you'd iterate through active subscriptions
        // and process payments based on billing cycles

        // Update last payment processing timestamp
        // global_state.last_payment_processed = Clock::get()?.unix_timestamp;

        Ok(())
    }
}
