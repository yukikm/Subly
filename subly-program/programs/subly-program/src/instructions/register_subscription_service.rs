use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::Token};

use crate::state::SubscriptionService;
#[derive(Accounts)]
// #[instruction(name: String, fee_usd: u64, billing_frequency_days: u64, image_url: String)]
pub struct RegisterSubscriptionService<'info> {
    #[account(mut)]
    pub provider: Signer<'info>,

    // #[account(
    //     init_if_needed,
    //     payer = provider,
    //     space = Provider::LEN,
    //     seeds = [PROVIDER_SEED.as_bytes(), provider.key().as_ref()],
    //     bump
    // )]
    // pub provider_account: Account<'info, Provider>,
    #[account(
        init,
        payer = provider,
        space = SubscriptionService::LEN,
        seeds = [
            b"subscription_service",
            provider.key().as_ref(),
        ],
        bump
    )]
    pub subscription_service: Account<'info, SubscriptionService>,

    // // NFT関連
    // #[account(
    //     init,
    //     payer = provider,
    //     mint::decimals = 0,
    //     mint::authority = provider,
    //     mint::freeze_authority = provider,
    // )]
    // pub nft_mint: Account<'info, Mint>,

    // #[account(
    //     init,
    //     payer = provider,
    //     associated_token::mint = nft_mint,
    //     associated_token::authority = provider,
    // )]
    // pub nft_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    // pub rent: Sysvar<'info, Rent>,
}

impl<'info> RegisterSubscriptionService<'info> {
    pub fn register_subscription_service(
        &mut self,
        name: String,
        fee_usd: u64,
        billing_frequency_days: u64,
        provider: Pubkey,
        bumps: &RegisterSubscriptionServiceBumps,
    ) -> Result<()> {
        // バリデーション
        // require!(name.len() <= MAX_NAME_LENGTH, ErrorCode::NameTooLong);
        // require!(fee_usd > 0, ErrorCode::InvalidFeeAmount);
        // require!(
        //     billing_frequency_days > 0,
        //     ErrorCode::InvalidBillingFrequency
        // );

        self.subscription_service.set_inner(SubscriptionService {
            provider,
            service_id: 1,
            name,
            fee_usd,
            billing_frequency_days,
            created_at: Clock::get()?.unix_timestamp,
            bumps: bumps.subscription_service,
        });
        // let provider_account = &mut ctx.accounts.provider_account;
        // let subscription_service = &mut ctx.accounts.subscription_service;

        // // Provider情報の更新
        // if provider_account.wallet == Pubkey::default() {
        //     provider_account.wallet = ctx.accounts.provider.key();
        //     provider_account.service_count = 0;
        // }

        // // サブスクリプションサービス情報の保存
        // subscription_service.provider = ctx.accounts.provider.key();
        // subscription_service.service_id = provider_account.service_count;
        // subscription_service.name = name.clone();
        // subscription_service.fee_usd = fee_usd;
        // subscription_service.billing_frequency_days = billing_frequency_days;
        // subscription_service.image_url = image_url.clone();
        // subscription_service.created_at = Clock::get()?.unix_timestamp;

        // // サービスカウントを増加
        // provider_account.service_count += 1;

        // // NFTをミント（証明書として）
        // let cpi_accounts = MintTo {
        //     mint: ctx.accounts.nft_mint.to_account_info(),
        //     to: ctx.accounts.nft_token_account.to_account_info(),
        //     authority: ctx.accounts.provider.to_account_info(),
        // };
        // let cpi_program = ctx.accounts.token_program.to_account_info();
        // let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        // mint_to(cpi_ctx, 1)?;

        // msg!(
        //     "Subscription service registered: {} with fee ${} per {} days",
        //     name,
        //     fee_usd as f64 / 100.0,
        //     billing_frequency_days
        // );
        // msg!(
        //     "Provider certificate NFT minted: {}",
        //     ctx.accounts.nft_mint.key()
        // );

        Ok(())
    }
}
