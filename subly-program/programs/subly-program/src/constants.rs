use anchor_lang::prelude::*;

#[constant]
pub const SEED: &str = "anchor";

// Provider関連のシード
pub const PROVIDER_SEED: &str = "provider";
pub const SUBSCRIPTION_SERVICE_SEED: &str = "subscription_service";

// User関連のシード
pub const USER_SEED: &str = "user";
pub const USER_SUBSCRIPTION_SEED: &str = "user_subscription";

// 最大文字列長
pub const MAX_NAME_LENGTH: usize = 64;
pub const MAX_URL_LENGTH: usize = 200;
