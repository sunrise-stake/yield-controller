#![allow(clippy::result_large_err)]
use crate::utils::seeds::*;
use crate::utils::state::*;
use crate::utils::token::*;
use anchor_lang::prelude::*;
mod utils;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod treasury_controller {
    use super::*;

    pub fn register_state(ctx: Context<RegisterState>, state: GenericStateInput) -> Result<()> {
        let state_account = &mut ctx.accounts.state;
        state_account.market = state.market;
        state_account.update_authority = state.update_authority;
        state_account.treasury = state.treasury;
        state_account.purchase_threshold = state.purchase_threshold;
        state_account.purchase_proportion = state.purchase_proportion;
        state_account.bump = *ctx.bumps.get("state").unwrap();
        Ok(())
    }

    pub fn update_state(ctx: Context<UpdateState>, state: GenericStateInput) -> Result<()> {
        let state_account = &mut ctx.accounts.state;
        state_account.market = state.market;
        state_account.update_authority = state.update_authority;
        state_account.treasury = state.treasury;
        state_account.purchase_threshold = state.purchase_threshold;
        state_account.purchase_proportion = state.purchase_proportion;
        Ok(())
    }

    pub fn allocate_yield(ctx: Context<AllocateYield>, amount: u64) -> Result<()> {
        let treasury_token_account = &mut ctx.accounts.treasury_token_account;
        let holding_token_account = &mut ctx.accounts.holding_token_account;
        let mint_account = &ctx.accounts.mint;
        let token_program = &ctx.accounts.token_program;
        let state_account = &ctx.accounts.state;

        /*
         * we should probably verify that the treasury token account is owned by the treasury state account
         * and that the holding token account has the state account set as the delegate
         * and that the mint is the expected mint
         * the amount should be assumed to be correct in terms of decimals?

        let mint_decimals = mint_account.decimals;

        let purchase_amount =
            (amount as f64 * state_account.purchase_proportion as f64) as u64 / 10f64.powi(mint_decimals);
        */

        // for now, we'll just assume the total amount is passed in as an argument
        let transfer_amount = (amount as f64 * state_account.purchase_proportion as f64) as u64;

        let burn_amount = amount - transfer_amount;

        let seeds = [STATE, state_account.market.as_ref()];

        if transfer_amount > 0 {
            transfer(
                transfer_amount,
                state_account,
                holding_token_account,
                treasury_token_account,
                &seeds,
                token_program,
            )?;
        }

        if burn_amount > 0 {
            burn(
                burn_amount,
                mint_account,
                state_account,
                holding_token_account,
                &seeds,
                token_program,
            )?;
        }

        Ok(())
    }
}
