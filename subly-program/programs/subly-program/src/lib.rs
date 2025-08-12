pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("5DpoKLMkQSBTi3n6hnjB7RPhzjhovfDZbEHJvFJBXKL9");

#[program]
pub mod subly_program {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        jito_stake_pool: Pubkey,
        jito_sol_mint: Pubkey,
        spl_stake_pool_program: Pubkey,
    ) -> Result<()> {
        Initialize::handler(ctx, jito_stake_pool, jito_sol_mint, spl_stake_pool_program)
    }

    pub fn register_provider(
        ctx: Context<RegisterProvider>,
        name: String,
        description: String,
        website: String,
    ) -> Result<()> {
        RegisterProvider::handler(ctx, name, description, website)
    }

    pub fn register_subscription_service(
        ctx: Context<RegisterSubscriptionService>,
        name: String,
        description: String,
        fee_usd: u64,
        billing_frequency_days: u64,
        image_url: String,
        max_subscribers: Option<u64>,
    ) -> Result<()> {
        ctx.accounts.register_subscription_service(
            name,
            description,
            fee_usd,
            billing_frequency_days,
            image_url,
            max_subscribers,
            &ctx.bumps,
        )
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        ctx.accounts.deposit(amount, &ctx.bumps)
    }

    pub fn withdraw(ctx: Context<WithdrawSol>, amount: u64) -> Result<()> {
        WithdrawSol::handler(ctx, amount)
    }

    pub fn subscribe_to_service(
        ctx: Context<SubscribeToService>,
        provider: Pubkey,
        service_id: u64,
    ) -> Result<()> {
        ctx.accounts
            .subscribe_to_service(provider, service_id, &ctx.bumps)
    }

    pub fn unsubscribe_from_service(
        ctx: Context<UnsubscribeFromService>,
        subscription_id: u64,
    ) -> Result<()> {
        UnsubscribeFromService::handler(ctx, subscription_id)
    }

    pub fn process_subscription_payments(ctx: Context<ProcessSubscriptionPayments>) -> Result<()> {
        ProcessSubscriptionPayments::handler(ctx)
    }

    pub fn stake_sol(ctx: Context<StakeSol>, amount: u64) -> Result<()> {
        StakeSol::handler(ctx, amount)
    }

    pub fn unstake_sol(ctx: Context<UnstakeSol>, amount: u64) -> Result<()> {
        UnstakeSol::handler(ctx, amount)
    }

    pub fn claim_yield(ctx: Context<ClaimYield>) -> Result<()> {
        ClaimYield::handler(ctx)
    }
}
