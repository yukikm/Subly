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
        register_subscription_service::handler(ctx, name, fee_usd, billing_frequency_days, image_url)
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
}
