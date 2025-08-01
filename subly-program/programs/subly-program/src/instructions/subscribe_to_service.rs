use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

use crate::{constants::*, error::ErrorCode, state::*};

#[derive(Accounts)]
#[instruction(provider_wallet: Pubkey, service_id: u64)]
pub struct SubscribeToService<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = User::LEN,
        seeds = [USER_SEED.as_bytes(), user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, User>,

    #[account(
        seeds = [
            SUBSCRIPTION_SERVICE_SEED.as_bytes(),
            provider_wallet.as_ref(),
            service_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub subscription_service: Account<'info, SubscriptionService>,

    #[account(
        init,
        payer = user,
        space = UserSubscription::LEN,
        seeds = [
            USER_SUBSCRIPTION_SEED.as_bytes(),
            user.key().as_ref(),
            user_account.subscription_count.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub user_subscription: Account<'info, UserSubscription>,

    // NFT関連（契約証明書）
    #[account(
        init,
        payer = user,
        mint::decimals = 0,
        mint::authority = user,
        mint::freeze_authority = user,
    )]
    pub certificate_nft_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = user,
        associated_token::mint = certificate_nft_mint,
        associated_token::authority = user,
    )]
    pub certificate_nft_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<SubscribeToService>,
    provider_wallet: Pubkey,
    service_id: u64,
) -> Result<()> {
    let user_account = &mut ctx.accounts.user_account;
    let subscription_service = &ctx.accounts.subscription_service;
    let user_subscription = &mut ctx.accounts.user_subscription;

    // Initialize user account if needed
    if user_account.wallet == Pubkey::default() {
        user_account.wallet = ctx.accounts.user.key();
        user_account.deposited_sol = 0;
        user_account.subscription_count = 0;
    }

    // Verify the service exists and matches the provider
    require!(
        subscription_service.provider == provider_wallet,
        ErrorCode::CustomError
    );

    // Set subscription details
    user_subscription.user = ctx.accounts.user.key();
    user_subscription.provider = provider_wallet;
    user_subscription.service_id = service_id;
    user_subscription.subscription_id = user_account.subscription_count;
    user_subscription.subscribed_at = Clock::get()?.unix_timestamp;
    user_subscription.is_active = true;

    // Increment subscription count
    user_account.subscription_count += 1;

    // Mint subscription certificate NFT
    let cpi_accounts = MintTo {
        mint: ctx.accounts.certificate_nft_mint.to_account_info(),
        to: ctx.accounts.certificate_nft_token_account.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    mint_to(cpi_ctx, 1)?;

    msg!(
        "User {} subscribed to service '{}' from provider {} (Fee: ${}/{}days)",
        ctx.accounts.user.key(),
        subscription_service.name,
        provider_wallet,
        subscription_service.fee_usd as f64 / 100.0,
        subscription_service.billing_frequency_days
    );

    msg!("Subscription certificate NFT minted: {}", ctx.accounts.certificate_nft_mint.key());

    Ok(())
}
