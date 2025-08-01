pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("w23po5aYmi7q71u7dwS2NfEL4otC7Ff7LnRFeCKywCG");

#[program]
pub mod subly_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn register_subscription_service(
        ctx: Context<RegisterSubscriptionService>,
        name: String,
        fee_usd: u64,
        billing_frequency_days: u64,
        image_url: String,
    ) -> Result<()> {
        register_subscription_service::handler(
            ctx,
            name,
            fee_usd,
            billing_frequency_days,
            image_url,
        )
    }

    pub fn get_subscription_services(
        ctx: Context<GetSubscriptionServices>,
    ) -> Result<Vec<get_subscription_services::SubscriptionServiceInfo>> {
        get_subscription_services::handler(ctx)
    }

    pub fn get_subscription_service(
        ctx: Context<GetSubscriptionService>,
        service_id: u64,
    ) -> Result<get_subscription_services::SubscriptionServiceInfo> {
        get_subscription_services::get_subscription_service_handler(ctx, service_id)
    }

    pub fn deposit_sol(ctx: Context<DepositSol>, amount: u64) -> Result<()> {
        deposit_sol::handler(ctx, amount)
    }

    pub fn get_user_balance(
        ctx: Context<GetUserBalance>,
    ) -> Result<get_user_balance::UserBalanceInfo> {
        get_user_balance::handler(ctx)
    }

    pub fn subscribe_to_service(
        ctx: Context<SubscribeToService>,
        provider_wallet: Pubkey,
        service_id: u64,
    ) -> Result<()> {
        subscribe_to_service::handler(ctx, provider_wallet, service_id)
    }

    pub fn get_user_subscriptions(
        ctx: Context<GetUserSubscriptions>,
    ) -> Result<Vec<get_user_subscriptions::UserSubscriptionInfo>> {
        get_user_subscriptions::handler(ctx)
    }

    pub fn get_user_subscription(
        ctx: Context<GetUserSubscription>,
        subscription_id: u64,
    ) -> Result<get_user_subscriptions::UserSubscriptionInfo> {
        get_user_subscriptions::get_user_subscription_handler(ctx, subscription_id)
    }
}
