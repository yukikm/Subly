use anchor_lang::prelude::*;
use crate::{constants::*, state::*};

#[derive(Accounts)]
pub struct GetUserSubscriptions<'info> {
    #[account(
        seeds = [USER_SEED.as_bytes(), user_wallet.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, User>,
    
    /// CHECK: This is the user wallet we're querying for
    pub user_wallet: UncheckedAccount<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UserSubscriptionInfo {
    pub subscription_id: u64,
    pub provider_wallet: Pubkey,
    pub service_name: String,
    pub fee_usd: u64,
    pub billing_frequency_days: u64,
    pub image_url: String,
    pub subscribed_at: i64,
    pub is_active: bool,
}

pub fn handler(ctx: Context<GetUserSubscriptions>) -> Result<Vec<UserSubscriptionInfo>> {
    let user_account = &ctx.accounts.user_account;
    let subscriptions = Vec::new();

    msg!("User {} has {} subscriptions", 
         user_account.wallet, 
         user_account.subscription_count);
    
    // このfunction は、フロントエンド側で個別にサブスクリプション情報を取得するための
    // ヘルパー情報を提供します
    Ok(subscriptions)
}

// 個別のユーザーサブスクリプション情報を取得
#[derive(Accounts)]
#[instruction(subscription_id: u64)]
pub struct GetUserSubscription<'info> {
    #[account(
        seeds = [
            USER_SUBSCRIPTION_SEED.as_bytes(),
            user_wallet.key().as_ref(),
            subscription_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub user_subscription: Account<'info, UserSubscription>,

    #[account(
        seeds = [
            SUBSCRIPTION_SERVICE_SEED.as_bytes(),
            user_subscription.provider.as_ref(),
            user_subscription.service_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub subscription_service: Account<'info, SubscriptionService>,
    
    /// CHECK: This is the user wallet
    pub user_wallet: UncheckedAccount<'info>,
}

pub fn get_user_subscription_handler(
    ctx: Context<GetUserSubscription>,
    _subscription_id: u64,
) -> Result<UserSubscriptionInfo> {
    let user_subscription = &ctx.accounts.user_subscription;
    let subscription_service = &ctx.accounts.subscription_service;
    
    Ok(UserSubscriptionInfo {
        subscription_id: user_subscription.subscription_id,
        provider_wallet: user_subscription.provider,
        service_name: subscription_service.name.clone(),
        fee_usd: subscription_service.fee_usd,
        billing_frequency_days: subscription_service.billing_frequency_days,
        image_url: subscription_service.image_url.clone(),
        subscribed_at: user_subscription.subscribed_at,
        is_active: user_subscription.is_active,
    })
}
