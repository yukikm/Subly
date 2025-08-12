use crate::{constants::*, error::ErrorCode, state::*};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(subscription_id: u64)]
pub struct UnsubscribeFromService<'info> {
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
            USER_SUBSCRIPTION_SEED.as_bytes(),
            user.key().as_ref(),
            subscription_id.to_le_bytes().as_ref()
        ],
        bump = user_subscription.bumps,
        constraint = user_subscription.user == user.key() @ ErrorCode::UnauthorizedUser,
        constraint = user_subscription.subscription_id == subscription_id @ ErrorCode::InvalidSubscriptionId
    )]
    pub user_subscription: Account<'info, UserSubscription>,

    #[account(
        mut,
        seeds = [
            SUBSCRIPTION_SERVICE_SEED.as_bytes(),
            user_subscription.provider.as_ref(),
            user_subscription.service_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub subscription_service: Account<'info, SubscriptionService>,

    #[account(
        mut,
        seeds = [PROVIDER_SEED.as_bytes(), user_subscription.provider.as_ref()],
        bump
    )]
    pub provider_account: Account<'info, Provider>,

    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    pub system_program: Program<'info, System>,
}

impl<'info> UnsubscribeFromService<'info> {
    pub fn handler(ctx: Context<UnsubscribeFromService>, _subscription_id: u64) -> Result<()> {
        require!(
            !ctx.accounts.global_state.is_paused,
            ErrorCode::ProtocolPaused
        );

        let user_subscription = &mut ctx.accounts.user_subscription;
        let user_account = &mut ctx.accounts.user_account;
        let provider_account = &mut ctx.accounts.provider_account;

        require!(
            user_subscription.is_active,
            ErrorCode::SubscriptionNotActive
        );

        // Calculate locked amount for this subscription
        let subscription_service = &ctx.accounts.subscription_service;
        let monthly_fee_lamports = subscription_service.fee_usd * 1_000_000; // Assuming 1 USD = 1M lamports for now

        // Free up locked SOL
        user_account.locked_sol = user_account
            .locked_sol
            .checked_sub(monthly_fee_lamports * 12) // Unlock 12 months worth
            .unwrap_or(0);

        // Deactivate subscription
        user_subscription.is_active = false;
        user_subscription.unsubscribed_at = Some(Clock::get()?.unix_timestamp);

        // Update counters
        provider_account.total_subscribers = provider_account.total_subscribers.saturating_sub(1);

        msg!(
            "User {} unsubscribed from service '{}' (Provider: {})",
            ctx.accounts.user.key(),
            subscription_service.name,
            user_subscription.provider
        );

        Ok(())
    }
}
