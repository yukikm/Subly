use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GlobalState {
    pub authority: Pubkey,
    pub protocol_fee_bps: u16, // Basis points (100 = 1%)
    pub is_paused: bool,
    // Jito configuration - can be changed for different networks
    pub jito_stake_pool: Pubkey,
    pub jito_sol_mint: Pubkey,
    pub spl_stake_pool_program: Pubkey,
    // Pyth price feed configuration
    pub sol_usd_price_feed: Pubkey, // SOL/USD price feed account
    // USDC configuration for payments
    pub usdc_mint: Pubkey, // USDC mint address
    // Global service counter for unique service IDs
    pub total_services: u64,
    pub last_payment_processed: i64, // Timestamp of last payment processing
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Provider {
    pub wallet: Pubkey,
    #[max_len(64)]
    pub name: String,
    #[max_len(200)]
    pub description: String,
    pub total_subscribers: u64,
    pub is_verified: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct SubscriptionService {
    pub provider: Pubkey,
    pub service_id: u64,
    #[max_len(64)]
    pub name: String,
    #[max_len(200)]
    pub description: String,
    pub fee_usd: u64, // USD cents
    pub billing_frequency_days: u64,
    #[max_len(200)]
    pub image_url: String,
    pub current_subscribers: u64,
    pub is_active: bool,
    pub created_at: i64,
    pub bumps: u8,
}

#[account]
#[derive(InitSpace)]
pub struct User {
    pub wallet: Pubkey,
    pub deposited_sol: u64, // lamports
    pub locked_sol: u64,    // lamports locked for active subscriptions
    pub staked_sol: u64,    // lamports staked for yield generation
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UserSubscription {
    pub user: Pubkey,
    pub provider: Pubkey,
    pub service_id: u64,
    pub subscription_id: u64, // User's subscription ID
    pub subscribed_at: i64,
    pub last_payment_at: Option<i64>,
    pub next_payment_due: i64,
    pub total_payments_made: u64,
    pub is_active: bool,
    pub unsubscribed_at: Option<i64>,
    pub bumps: u8,
}

#[account]
#[derive(InitSpace)]
pub struct PaymentRecord {
    pub user: Pubkey,
    pub provider: Pubkey,
    pub subscription_id: u64,
    pub amount: u64, // In lamports
    pub payment_date: i64,
    pub payment_type: PaymentType,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PaymentType {
    Subscription,
    ProtocolFee,
}

impl anchor_lang::Space for PaymentType {
    const INIT_SPACE: usize = 1; // 1 byte for enum discriminator
}

#[account]
#[derive(InitSpace)]
pub struct StakeAccount {
    pub user: Pubkey,
    pub staked_amount: u64,   // In lamports
    pub jito_sol_amount: u64, // JitoSOL received
    pub stake_date: i64,
    pub last_yield_claim: i64,
    pub total_yield_earned: u64,
    pub is_active: bool,
    pub bump: u8,
}
