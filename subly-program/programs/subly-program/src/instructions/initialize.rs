use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + GlobalState::INIT_SPACE,
        seeds = [b"global_state"],
        
        bump
    )]
    pub global_state: Account<'info, GlobalState>,

    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn handler(
        ctx: Context<Initialize>,
        jito_stake_pool: Pubkey,
        jito_sol_mint: Pubkey,
        spl_stake_pool_program: Pubkey,
    ) -> Result<()> {
        ctx.accounts.initialize(
            &ctx.bumps,
            jito_stake_pool,
            jito_sol_mint,
            spl_stake_pool_program,
        )
    }

    pub fn initialize(
        &mut self, 
        bumps: &InitializeBumps,
        jito_stake_pool: Pubkey,
        jito_sol_mint: Pubkey,
        spl_stake_pool_program: Pubkey,
    ) -> Result<()> {
        let global_state = &mut self.global_state;

        global_state.authority = self.authority.key();
        global_state.protocol_fee_bps = 100; // 1% protocol fee
        global_state.is_paused = false;
        
        // Set Jito configuration (can be mainnet or devnet)
        global_state.jito_stake_pool = jito_stake_pool;
        global_state.jito_sol_mint = jito_sol_mint;
        global_state.spl_stake_pool_program = spl_stake_pool_program;
        
        global_state.bump = bumps.global_state;

        msg!(
            "Subly protocol initialized by authority: {}",
            self.authority.key()
        );
        msg!(
            "Jito config - Pool: {}, Mint: {}, Program: {}", 
            jito_stake_pool,
            jito_sol_mint,
            spl_stake_pool_program
        );

        Ok(())
    }
}
