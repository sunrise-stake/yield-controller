#![allow(clippy::result_large_err)]
use crate::utils::errors::ErrorCode;
use crate::utils::spend::*;
use crate::utils::state::*;
use anchor_lang::prelude::*;
mod utils;

// how to write it to leave it to be filled with new id for each deployed program for each climate project?
declare_id!("rodTth5pXjkUfQpqMp7tEFdN1sdv2JwqhXg8RH9YrWD");

#[program]
pub mod fund_sender {
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
        state.destination_seed = state_in.destination_seed;
        state.destination_account = state_in.destination_account;
        state.spend_threshold = state_in.spend_threshold;
        state.output_yield_account_bump = *ctx.bumps.get("output_yield_account").unwrap();
        state.total_spent = 0;

        Ok(())
    }

    pub fn update_state(ctx: Context<UpdateState>, state_in: GenericStateInput) -> Result<()> {
        // update state account parameters
        let state = &mut ctx.accounts.state;
        state.update_authority = state_in.update_authority;
        state.destination_account = state_in.destination_account;
        state.spend_threshold = state_in.spend_threshold;

        Ok(())
    }

    pub fn send_fund<'info>(ctx: Context<'_, '_, '_, 'info, SendFund<'info>>) -> Result<()> {
        // send yield to output_yield_accounts with specified proportions
        let state = &mut ctx.accounts.state;
        let output_yield_account = &mut ctx.accounts.output_yield_account;
        let destination_account = &mut ctx.accounts.destination_account;
        if destination_account.key() != state.destination_account {
            return Err(ErrorCode::IncorrectDestinationAccount.into());
        }

        let amount: u64 = output_yield_account.lamports();
        if amount >= state.spend_threshold {
            transfer_native_cpi(
                &state.key(),
                &output_yield_account.to_account_info(),
                // state.destination_account.to_account_info(), <- this leads to error trait bounds not satisfied, why?
                &destination_account.to_account_info(),
                amount,
                state.output_yield_account_bump,
                &state.destination_seed,
                &ctx.accounts.system_program,
            )?;
            state.total_spent += amount;
        } else {
            return Err(ErrorCode::InsufficientFundsForTransaction.into());
        }

        Ok(())
    }
}
