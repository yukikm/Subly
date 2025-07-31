use crate::{constants::*, state::*};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct GetSubscriptionServices<'info> {
    #[account(
        seeds = [PROVIDER_SEED.as_bytes(), provider_wallet.key().as_ref()],
        bump
    )]
    pub provider_account: Account<'info, Provider>,

    /// CHECK: This is the provider wallet we're querying for
    pub provider_wallet: UncheckedAccount<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SubscriptionServiceInfo {
    pub provider: Pubkey,
    pub service_id: u64,
    pub name: String,
    pub fee_usd: u64,
    pub billing_frequency_days: u64,
    pub image_url: String,
    pub created_at: i64,
}

pub fn handler(ctx: Context<GetSubscriptionServices>) -> Result<Vec<SubscriptionServiceInfo>> {
    let provider_account = &ctx.accounts.provider_account;
    let services = Vec::new();

    // 本来であれば、ここでプロバイダーの全サービスを取得する処理を実装します
    // Anchor frameworkではPDAから直接複数のアカウントを取得するのは制限があるため、
    // フロントエンド側でservice_countを使用して個別にサービス情報を取得することを想定します

    msg!(
        "Provider {} has {} services",
        provider_account.wallet,
        provider_account.service_count
    );

    // この関数は実際にはフロントエンド側で各サービスを個別に取得するための
    // ヘルパー情報を提供する目的で使用されます
    Ok(services)
}

// 個別のサブスクリプションサービス情報を取得する関数
#[derive(Accounts)]
#[instruction(service_id: u64)]
pub struct GetSubscriptionService<'info> {
    #[account(
        seeds = [
            SUBSCRIPTION_SERVICE_SEED.as_bytes(),
            provider_wallet.key().as_ref(),
            service_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub subscription_service: Account<'info, SubscriptionService>,

    /// CHECK: This is the provider wallet
    pub provider_wallet: UncheckedAccount<'info>,
}

pub fn get_subscription_service_handler(
    ctx: Context<GetSubscriptionService>,
    _service_id: u64,
) -> Result<SubscriptionServiceInfo> {
    let service = &ctx.accounts.subscription_service;

    Ok(SubscriptionServiceInfo {
        provider: service.provider,
        service_id: service.service_id,
        name: service.name.clone(),
        fee_usd: service.fee_usd,
        billing_frequency_days: service.billing_frequency_days,
        image_url: service.image_url.clone(),
        created_at: service.created_at,
    })
}
