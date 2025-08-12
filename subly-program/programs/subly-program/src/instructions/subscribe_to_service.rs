use crate::{constants::*, error::ErrorCode, state::*};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

#[derive(Accounts)]
#[instruction(provider: Pubkey, service_id: u64)]
pub struct SubscribeToService<'info> {
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
            SUBSCRIPTION_SERVICE_SEED.as_bytes(),
            provider.as_ref(),
            service_id.to_le_bytes().as_ref()
        ],
        bump,
        constraint = subscription_service.is_active @ ErrorCode::ServiceNotActive,
        constraint = subscription_service.provider != user.key() @ ErrorCode::CannotSubscribeToOwnService
    )]
    pub subscription_service: Account<'info, SubscriptionService>,

    #[account(
        mut,
        seeds = [PROVIDER_SEED.as_bytes(), provider.as_ref()],
        bump
    )]
    pub provider_account: Account<'info, Provider>,

    #[account(
        init,
        payer = user,
        space = UserSubscription::INIT_SPACE,
        seeds = [
            USER_SUBSCRIPTION_SEED.as_bytes(),
            user.key().as_ref(),
            provider.as_ref(),
            service_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub user_subscription: Account<'info, UserSubscription>,

    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    // Subscription certificate NFT
    #[account(
        init,
        payer = user,
        mint::decimals = 0,
        mint::authority = user,
        mint::freeze_authority = user,
    )]
    pub certificate_nft_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = user,
        associated_token::mint = certificate_nft_mint,
        associated_token::authority = user,
    )]
    pub certificate_nft_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> SubscribeToService<'info> {
    pub fn subscribe_to_service(
        &mut self,
        provider: Pubkey,
        service_id: u64,
        bumps: &SubscribeToServiceBumps,
    ) -> Result<()> {
        require!(!self.global_state.is_paused, ErrorCode::ProtocolPaused);

        let subscription_service = &mut self.subscription_service;
        let user_account = &mut self.user_account;
        let provider_account = &mut self.provider_account;

        // Check if service has reached max subscribers
        if let Some(max_subscribers) = subscription_service.max_subscribers {
            require!(
                subscription_service.current_subscribers < max_subscribers,
                ErrorCode::SubscriptionLimitReached
            );
        }

        // Calculate required locked amount (12 months of subscription fees)
        let monthly_fee_lamports = subscription_service.fee_usd * 1_000_000; // Assuming 1 USD = 1M lamports for now
        let required_locked_amount = monthly_fee_lamports * 12; // Lock 12 months worth

        // Check if user has sufficient available balance
        let available_balance = user_account
            .deposited_sol
            .checked_sub(user_account.locked_sol)
            .unwrap_or(0);

        require!(
            available_balance >= required_locked_amount,
            ErrorCode::InsufficientAvailableBalance
        );

        let current_time = Clock::get()?.unix_timestamp;
        let next_payment_due =
            current_time + (subscription_service.billing_frequency_days as i64 * 86400);

        // Create subscription
        self.user_subscription.set_inner(UserSubscription {
            user: self.user.key(),
            provider,
            service_id,
            subscription_id: service_id, // Use service_id as subscription_id for simplicity
            subscribed_at: current_time,
            last_payment_at: None,
            next_payment_due,
            total_payments_made: 0,
            is_active: true,
            unsubscribed_at: None,
            bumps: bumps.user_subscription,
        });

        // Lock funds for subscription
        user_account.locked_sol = user_account
            .locked_sol
            .checked_add(required_locked_amount)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        // Mint subscription certificate NFT
        let cpi_accounts = MintTo {
            mint: self.certificate_nft_mint.to_account_info(),
            to: self.certificate_nft_token_account.to_account_info(),
            authority: self.user.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        mint_to(cpi_ctx, 1)?;

        // Update counters
        subscription_service.current_subscribers += 1;
        provider_account.total_subscribers += 1;

        msg!(
            "User {} subscribed to service '{}' from provider {} (Fee: ${:.2}/{} days)",
            self.user.key(),
            subscription_service.name,
            provider,
            subscription_service.fee_usd as f64 / 100.0,
            subscription_service.billing_frequency_days
        );

        msg!(
            "Subscription certificate NFT minted: {}",
            self.certificate_nft_mint.key()
        );

        Ok(())
    }
}
