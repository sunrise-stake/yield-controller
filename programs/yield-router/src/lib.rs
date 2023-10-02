#![allow(clippy::result_large_err)]
use crate::utils::errors::ErrorCode;
use crate::utils::spend::*;
use crate::utils::state::*;
use anchor_lang::prelude::*;
mod utils;

declare_id!("syriqUnUPcFQjRSaxdFo2wPnXXPjbRsLmhiWUVoGdTo");

#[program]
pub mod yield_router {
    use super::*;

    pub fn register_state(
        ctx: Context<RegisterState>,
        sunrise_state: Pubkey,
        state_in: GenericStateInput,
    ) -> Result<()> {
        // register state account on chain, only need to ever be done once
        let state = &mut ctx.accounts.state;
        state.sunrise_state = sunrise_state;
        state.update_authority = state_in.update_authority;
        state.output_yield_accounts = state_in.output_yield_accounts;
        state.spend_threshold = state_in.spend_threshold;
        state.spend_proportions = state_in.spend_proportions;
        state.input_yield_account_bump = *ctx.bumps.get("input_yield_account").unwrap();

        // make sure the input proportions sum up to 100
        check_proportions(&state.spend_proportions)?;

        state.total_spent = 0;

        Ok(())
    }

    pub fn update_state(ctx: Context<UpdateState>, state_in: GenericStateInput) -> Result<()> {
        // update state account parameters
        let state = &mut ctx.accounts.state;
        state.update_authority = state_in.update_authority;
        state.output_yield_accounts = state_in.output_yield_accounts;
        state.spend_threshold = state_in.spend_threshold;
        state.spend_proportions = state_in.spend_proportions;

        // make sure the new proportions sum up to 100
        check_proportions(&state.spend_proportions)?;

        Ok(())
    }

    pub fn allocate_yield<'info>(
        ctx: Context<'_, '_, '_, 'info, AllocateYield<'info>>,
        amount: u64,
    ) -> Result<()> {
        // send yield to output_yield_accounts with specified proportions
        let state = &mut ctx.accounts.state;
        let input_yield_account = &mut ctx.accounts.input_yield_account;

        // check output yield accounts
        // Question: why do we need in additional input `remaining_accounts`?
        // Why not just loop through the `output_yield_accounts`?
        if ctx.remaining_accounts.len() != state.output_yield_accounts.len() {
            return Err(ErrorCode::IncorrectOutputYieldAccount.into());
        }

        // loop through all output yield accounts
        for i in 0..ctx.remaining_accounts.len() {
            let output_yield_account = &ctx.remaining_accounts[i];
            let proportion = state.spend_proportions[i];

            if output_yield_account.key() != state.output_yield_accounts[i] {
                return Err(ErrorCode::IncorrectOutputYieldAccount.into());
            }

            // compute the amount to be send to this output_yield_account based on the specifed proportion
            let amount_to_send = (amount as f64 * (proportion as f64 / 100.0)) as u64;

            // send appropriate fund to this output_yield_account
            transfer_native_cpi(
                &state.key(),
                &input_yield_account.to_account_info(),
                output_yield_account,
                amount_to_send,
                state.input_yield_account_bump,
                &ctx.accounts.system_program,
            )?;
        }
        // update total sol spent
        state.total_spent += amount;

        Ok(())
    }
}
