use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

#[derive(Accounts)]
pub struct DepositSol<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    // #[account(
    //     init_if_needed,
    //     payer = user,
    //     space = User::LEN,
    //     seeds = [USER_SEED.as_bytes(), user.key().as_ref()],
    //     bump
    // )]
    // pub user_account: Account<'info, User>,
    /// CHECK: This is the program's SOL vault
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump,
    )]
    pub sol_vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> DepositSol<'info> {
    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        let ctx = CpiContext::new(
            self.system_program.to_account_info(),
            Transfer {
                from: self.user.to_account_info(),
                to: self.sol_vault.to_account_info(),
            },
        );
        transfer(ctx, amount)?;
        // let user_account = &mut ctx.accounts.user_account;

        // // Initialize user account if needed
        // if user_account.wallet == Pubkey::default() {
        //     user_account.wallet = ctx.accounts.user.key();
        //     user_account.deposited_sol = 0;
        //     user_account.subscription_count = 0;
        // }

        // // Transfer SOL from user to vault
        // let transfer_instruction = system_program::Transfer {
        //     from: ctx.accounts.user.to_account_info(),
        //     to: ctx.accounts.sol_vault.to_account_info(),
        // };

        // let cpi_ctx = CpiContext::new(
        //     ctx.accounts.system_program.to_account_info(),
        //     transfer_instruction,
        // );

        // system_program::transfer(cpi_ctx, amount)?;

        // // Update deposited amount
        // user_account.deposited_sol = user_account.deposited_sol.checked_add(amount).unwrap();

        // msg!(
        //     "User {} deposited {} SOL (total: {} SOL)",
        //     ctx.accounts.user.key(),
        //     amount as f64 / 1_000_000_000.0,
        //     user_account.deposited_sol as f64 / 1_000_000_000.0
        // );

        Ok(())
    }
}
