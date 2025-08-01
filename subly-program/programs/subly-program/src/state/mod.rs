use anchor_lang::prelude::*;

#[account]
pub struct Provider {
    pub wallet: Pubkey,
    pub service_count: u64,
}

impl Provider {
    pub const LEN: usize = 8 + 32 + 8; // discriminator + Pubkey + u64
}

#[account]
pub struct SubscriptionService {
    pub provider: Pubkey,
    pub service_id: u64,
    pub name: String,
    pub fee_usd: u64, // USDセント単位で保存
    pub billing_frequency_days: u64,
    pub image_url: String,
    pub created_at: i64,
}

impl SubscriptionService {
    pub const LEN: usize = 8 + // discriminator
        32 + // provider
        8 + // service_id
        4 + 64 + // name (String length + content)
        8 + // fee_usd
        8 + // billing_frequency_days
        4 + 200 + // image_url (String length + content)
        8; // created_at
}

#[account]
pub struct User {
    pub wallet: Pubkey,
    pub deposited_sol: u64, // lamports
    pub subscription_count: u64,
}

impl User {
    pub const LEN: usize = 8 + 32 + 8 + 8; // discriminator + Pubkey + u64 + u64
}

#[account]
pub struct UserSubscription {
    pub user: Pubkey,
    pub provider: Pubkey,
    pub service_id: u64,
    pub subscription_id: u64, // ユーザーの契約ID
    pub subscribed_at: i64,
    pub is_active: bool,
}

impl UserSubscription {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        32 + // provider  
        8 + // service_id
        8 + // subscription_id
        8 + // subscribed_at
        1; // is_active
}
