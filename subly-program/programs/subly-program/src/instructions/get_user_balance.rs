use anchor_lang::prelude::*;
use crate::{constants::*, state::*};

#[derive(Accounts)]
pub struct GetUserBalance<'info> {
    #[account(
        seeds = [USER_SEED.as_bytes(), user_wallet.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, User>,
    
    /// CHECK: This is the user wallet we're querying for
    pub user_wallet: UncheckedAccount<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UserBalanceInfo {
    pub wallet: Pubkey,
    pub deposited_sol: u64,
    pub subscription_count: u64,
}

pub fn handler(ctx: Context<GetUserBalance>) -> Result<UserBalanceInfo> {
    let user_account = &ctx.accounts.user_account;
    
    msg!("User {} has deposited {} SOL and has {} subscriptions", 
         user_account.wallet, 
         user_account.deposited_sol as f64 / 1_000_000_000.0,
         user_account.subscription_count);
    
    Ok(UserBalanceInfo {
        wallet: user_account.wallet,
        deposited_sol: user_account.deposited_sol,
        subscription_count: user_account.subscription_count,
    })
}
