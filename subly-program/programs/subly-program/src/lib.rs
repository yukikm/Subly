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

    // pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    //     initialize::handler(ctx)
    // }

    pub fn register_subscription_service(
        ctx: Context<RegisterSubscriptionService>,
        name: String,
        fee_usd: u64,
        billing_frequency_days: u64,
        provider: Pubkey,
    ) -> Result<()> {
        ctx.accounts.register_subscription_service(
            name,
            fee_usd,
            billing_frequency_days,
            provider,
            &ctx.bumps,
        )
    }

    // pub fn get_subscription_services(
    //     ctx: Context<GetSubscriptionServices>,
    // ) -> Result<Vec<get_subscription_services::SubscriptionServiceInfo>> {
    //     get_subscription_services::handler(ctx)
    // }

    // pub fn get_subscription_service(
    //     ctx: Context<GetSubscriptionService>,
    //     service_id: u64,
    // ) -> Result<get_subscription_services::SubscriptionServiceInfo> {
    //     get_subscription_services::get_subscription_service_handler(ctx, service_id)
    // }

    pub fn deposit(ctx: Context<DepositSol>, amount: u64) -> Result<()> {
        ctx.accounts.deposit(amount)
    }

    // pub fn get_user_balance(
    //     ctx: Context<GetUserBalance>,
    // ) -> Result<get_user_balance::UserBalanceInfo> {
    //     get_user_balance::handler(ctx)
    // }

    pub fn subscribe_to_service(
        ctx: Context<SubscribeToService>,
        provider: Pubkey,
        service_id: u64,
        subscription_id: u64,
    ) -> Result<()> {
        ctx.accounts
            .subscribe_to_service(provider, service_id, subscription_id, &ctx.bumps)
    }

    // pub fn get_user_subscriptions(
    //     ctx: Context<GetUserSubscriptions>,
    // ) -> Result<Vec<get_user_subscriptions::UserSubscriptionInfo>> {
    //     get_user_subscriptions::handler(ctx)
    // }

    // pub fn get_user_subscription(
    //     ctx: Context<GetUserSubscription>,
    //     subscription_id: u64,
    // ) -> Result<get_user_subscriptions::UserSubscriptionInfo> {
    //     get_user_subscriptions::get_user_subscription_handler(ctx, subscription_id)
    // }
}
