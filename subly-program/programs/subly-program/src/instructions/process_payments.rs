use crate::{constants::*, error::ErrorCode, state::*};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};
use pyth_sdk_solana::state::SolanaPriceAccount;

#[derive(Accounts)]
pub struct ProcessSubscriptionPayments<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump,
        constraint = global_state.authority == authority.key() @ ErrorCode::UnauthorizedAuthority
    )]
    pub global_state: Account<'info, GlobalState>,

    /// CHECK: Treasury account to collect protocol fees
    #[account(
        mut,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    /// Pyth SOL/USD price feed account
    /// CHECK: Pyth price feed account
    pub sol_usd_price_feed: AccountInfo<'info>,

    /// USDC mint account
    #[account(
        constraint = usdc_mint.key() == global_state.usdc_mint @ ErrorCode::InvalidPriceFeed
    )]
    pub usdc_mint: Account<'info, Mint>,

    /// Protocol's USDC treasury account
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = treasury
    )]
    pub protocol_usdc_treasury: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(user: Pubkey, provider: Pubkey, service_id: u64)]
pub struct ExecuteSubscriptionPayment<'info> {
    /// Protocol authority executing the payment
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"global_state"],
        bump = global_state.bump,
        constraint = global_state.authority == authority.key() @ ErrorCode::UnauthorizedAuthority
    )]
    pub global_state: Account<'info, GlobalState>,

    /// User's account
    #[account(
        mut,
        seeds = [USER_SEED.as_bytes(), user.as_ref()],
        bump = user_account.bump,
        constraint = user_account.wallet == user @ ErrorCode::UnauthorizedUser
    )]
    pub user_account: Account<'info, User>,

    /// User's subscription account
    #[account(
        mut,
        seeds = [
            USER_SUBSCRIPTION_SEED.as_bytes(),
            user.as_ref(),
            provider.as_ref(),
            &service_id.to_le_bytes(),
        ],
        bump = user_subscription.bumps,
        constraint = user_subscription.user == user @ ErrorCode::UnauthorizedUser,
        constraint = user_subscription.provider == provider @ ErrorCode::InvalidProvider,
        constraint = user_subscription.service_id == service_id @ ErrorCode::InvalidServiceId,
        constraint = user_subscription.is_active @ ErrorCode::SubscriptionNotActive
    )]
    pub user_subscription: Account<'info, UserSubscription>,

    /// Subscription service details
    #[account(
        seeds = [
            SUBSCRIPTION_SERVICE_SEED.as_bytes(),
            provider.as_ref(),
            &service_id.to_le_bytes(),
        ],
        bump = subscription_service.bumps,
        constraint = subscription_service.provider == provider @ ErrorCode::InvalidProvider,
        constraint = subscription_service.service_id == service_id @ ErrorCode::InvalidServiceId,
        constraint = subscription_service.is_active @ ErrorCode::ServiceNotActive
    )]
    pub subscription_service: Account<'info, SubscriptionService>,

    /// Provider's account
    #[account(
        mut,
        seeds = [PROVIDER_SEED.as_bytes(), provider.as_ref()],
        bump = provider_account.bump,
        constraint = provider_account.wallet == provider @ ErrorCode::InvalidProvider
    )]
    pub provider_account: Account<'info, Provider>,

    /// User's SOL vault
    #[account(
        mut,
        seeds = [b"vault", user.as_ref()],
        bump,
    )]
    pub user_sol_vault: SystemAccount<'info>,

    /// Provider's USDC account
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = provider
    )]
    pub provider_usdc_account: Account<'info, TokenAccount>,

    /// Protocol's USDC treasury
    #[account(
        mut,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    /// Protocol's USDC treasury token account
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = treasury
    )]
    pub protocol_usdc_treasury: Account<'info, TokenAccount>,

    /// USDC mint
    pub usdc_mint: Account<'info, Mint>,

    /// Pyth SOL/USD price feed
    /// CHECK: Pyth price feed account
    pub sol_usd_price_feed: AccountInfo<'info>,

    /// Jupiter program for SOL to USDC swap
    /// CHECK: Jupiter aggregator program
    pub jupiter_program: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> ProcessSubscriptionPayments<'info> {
    pub fn process_subscription_payments(&mut self) -> Result<()> {
        require!(
            !self.global_state.is_paused,
            ErrorCode::ProtocolPaused
        );

        let current_time = Clock::get()?.unix_timestamp;

        msg!(
            "Starting subscription payment processing at timestamp: {}",
            current_time
        );

        // This is the main entry point for the daily batch process
        // In practice, this would be called by the Subly System with a list of
        // subscription accounts that need payment processing

        // Update the last payment processing timestamp
        self.global_state.last_payment_processed = current_time;

        msg!("Subscription payment processing completed");

        Ok(())
    }

    /// Check if a payment is due for a specific subscription
    /// This implements the "Check payment date function" from the diagram
    pub fn check_payment_due(subscription: &UserSubscription, current_time: i64) -> Result<bool> {
        // Payment is due if current time >= next_payment_due
        let is_due = current_time >= subscription.next_payment_due;

        msg!(
            "Payment due check for user {} provider {} service {}: {} (due: {}, current: {})",
            subscription.user,
            subscription.provider,
            subscription.service_id,
            is_due,
            subscription.next_payment_due,
            current_time
        );

        Ok(is_due)
    }
}

impl<'info> ExecuteSubscriptionPayment<'info> {
    /// Execute payment for a specific subscription
    /// This implements the full "Pay Subscription Fee 2" flow from the diagram
    pub fn execute_payment(&mut self, bumps: &ExecuteSubscriptionPaymentBumps) -> Result<()> {
        let current_time = Clock::get()?.unix_timestamp;

        // 1. Check if payment is due
        require!(
            current_time >= self.user_subscription.next_payment_due,
            ErrorCode::PaymentNotDue
        );

        // 2. Check if subscription is still active
        require!(
            self.user_subscription.is_active,
            ErrorCode::SubscriptionNotActive
        );

        // 3. Get subscription service fee details
        let fee_usd = self.subscription_service.fee_usd; // in cents
        let billing_frequency_days = self.subscription_service.billing_frequency_days;

        // 4. Calculate SOL/USD required for payment fees
        let sol_usd_price = Self::get_sol_usd_price_from_pyth(&self.sol_usd_price_feed)?;

        // 5. Calculate the SOL amount needed (convert USD to SOL)
        let sol_amount_needed = Self::convert_usd_to_sol_lamports(fee_usd, sol_usd_price)?;

        // 6. Check if user has sufficient SOL in vault
        require!(
            self.user_sol_vault.lamports() >= sol_amount_needed,
            ErrorCode::InsufficientBalance
        );

        // 7. Calculate protocol fee (using global state protocol fee)
        let protocol_fee_bps = self.global_state.protocol_fee_bps;
        let protocol_fee_amount = sol_amount_needed
            .checked_mul(protocol_fee_bps as u64)
            .ok_or(ErrorCode::ArithmeticOverflow)?
            .checked_div(10000)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        let provider_payment_amount = sol_amount_needed
            .checked_sub(protocol_fee_amount)
            .ok_or(ErrorCode::ArithmeticUnderflow)?;

        // 8. Transfer SOL from user vault to treasury (for conversion to USDC)
        let user_vault_bump = bumps.user_sol_vault;
        let user_key = self.user_account.wallet;

        let transfer_to_treasury = anchor_lang::system_program::Transfer {
            from: self.user_sol_vault.to_account_info(),
            to: self.treasury.to_account_info(),
        };

        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                self.system_program.to_account_info(),
                transfer_to_treasury,
                &[&[b"vault", user_key.as_ref(), &[user_vault_bump]]],
            ),
            sol_amount_needed,
        )?;

        // 9. Convert SOL to USDC (simplified - in reality would call Jupiter)
        let usdc_amount_for_provider =
            Self::convert_sol_to_usdc_amount(provider_payment_amount, sol_usd_price)?;

        let _usdc_amount_for_protocol =
            Self::convert_sol_to_usdc_amount(protocol_fee_amount, sol_usd_price)?;

        // 10. Simulate USDC transfer to provider (in real implementation, this would involve Jupiter swap)
        // For now, we'll assume the treasury has USDC and transfer it
        self.transfer_usdc_to_provider(usdc_amount_for_provider, bumps)?;

        // 11. Update subscription account
        self.update_subscription_after_payment(billing_frequency_days, current_time)?;

        // 12. Update user account
        self.user_account.deposited_sol = self
            .user_account
            .deposited_sol
            .checked_sub(sol_amount_needed)
            .ok_or(ErrorCode::InsufficientBalance)?;

        msg!(
            "Payment executed: User {} paid {} SOL ({} USDC) to provider {} for service {} (protocol fee: {} SOL)",
            user_key,
            sol_amount_needed as f64 / 1_000_000_000.0,
            usdc_amount_for_provider as f64 / 1_000_000.0, // USDC has 6 decimals
            self.subscription_service.provider,
            self.subscription_service.service_id,
            protocol_fee_amount as f64 / 1_000_000_000.0
        );

        Ok(())
    }

    /// Transfer USDC to provider account
    fn transfer_usdc_to_provider(
        &self,
        usdc_amount: u64,
        bumps: &ExecuteSubscriptionPaymentBumps,
    ) -> Result<()> {
        let treasury_bump = bumps.treasury;
        let signer_seeds: &[&[&[u8]]] = &[&[b"treasury", &[treasury_bump]]];

        let transfer_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            Transfer {
                from: self.protocol_usdc_treasury.to_account_info(),
                to: self.provider_usdc_account.to_account_info(),
                authority: self.treasury.to_account_info(),
            },
            signer_seeds,
        );

        transfer(transfer_ctx, usdc_amount)?;

        msg!(
            "Transferred {} USDC to provider {}",
            usdc_amount as f64 / 1_000_000.0,
            self.subscription_service.provider
        );

        Ok(())
    }

    /// Update subscription account after successful payment
    fn update_subscription_after_payment(
        &mut self,
        billing_frequency_days: u64,
        current_time: i64,
    ) -> Result<()> {
        // Update payment tracking
        self.user_subscription.last_payment_at = Some(current_time);
        self.user_subscription.total_payments_made = self
            .user_subscription
            .total_payments_made
            .checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        // Calculate next payment due date
        let seconds_in_day = 86400_i64;
        let billing_period_seconds = billing_frequency_days as i64 * seconds_in_day;

        self.user_subscription.next_payment_due = current_time
            .checked_add(billing_period_seconds)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        msg!(
            "Updated subscription: next payment due at timestamp {}",
            self.user_subscription.next_payment_due
        );

        Ok(())
    }

    /// Get SOL/USD price from Pyth Network
    fn get_sol_usd_price_from_pyth(price_feed_account: &AccountInfo) -> Result<u64> {
        let price_feed = SolanaPriceAccount::account_info_to_feed(price_feed_account)
            .map_err(|_| ErrorCode::InvalidPriceFeed)?;

        let current_time = Clock::get()?.unix_timestamp;
        let max_age = 3600; // 1 hour

        let price = price_feed
            .get_price_no_older_than(current_time, max_age)
            .ok_or(ErrorCode::PriceNotAvailable)?;

        require!(price.price > 0, ErrorCode::InvalidPrice);

        // Convert to USD cents
        let price_cents = if price.expo >= 0 {
            (price.price as u64)
                .checked_mul(10_u64.pow(price.expo as u32))
                .ok_or(ErrorCode::ArithmeticOverflow)?
                .checked_mul(100)
                .ok_or(ErrorCode::ArithmeticOverflow)?
        } else {
            let divisor = 10_u64.pow((-price.expo) as u32);
            (price.price as u64)
                .checked_mul(100)
                .ok_or(ErrorCode::ArithmeticOverflow)?
                .checked_div(divisor)
                .ok_or(ErrorCode::ArithmeticOverflow)?
        };

        require!(
            price_cents >= 1000 && price_cents <= 100000,
            ErrorCode::InvalidPrice
        );

        Ok(price_cents)
    }

    /// Convert USD cents to SOL lamports
    fn convert_usd_to_sol_lamports(usd_cents: u64, sol_usd_cents: u64) -> Result<u64> {
        let lamports = (usd_cents as u128)
            .checked_mul(1_000_000_000) // LAMPORTS_PER_SOL
            .ok_or(ErrorCode::ArithmeticOverflow)?
            .checked_div(sol_usd_cents as u128)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        Ok(u64::try_from(lamports).map_err(|_| ErrorCode::ArithmeticOverflow)?)
    }

    /// Convert SOL lamports to USDC amount (6 decimals)
    fn convert_sol_to_usdc_amount(sol_lamports: u64, sol_usd_cents: u64) -> Result<u64> {
        let usdc_amount = (sol_lamports as u128)
            .checked_mul(sol_usd_cents as u128)
            .ok_or(ErrorCode::ArithmeticOverflow)?
            .checked_div(1_000_000_000) // LAMPORTS_PER_SOL
            .ok_or(ErrorCode::ArithmeticOverflow)?
            .checked_mul(10000) // Convert cents to USDC (6 decimals): cents * 10000 = micro-dollars
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        Ok(u64::try_from(usdc_amount).map_err(|_| ErrorCode::ArithmeticOverflow)?)
    }
}
