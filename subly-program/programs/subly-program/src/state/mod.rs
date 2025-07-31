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
