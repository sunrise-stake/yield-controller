#![allow(clippy::result_large_err)]
use crate::utils::errors::ErrorCode;
use crate::utils::spend::*;
use crate::utils::state::*;
use anchor_lang::prelude::*;
mod utils;

declare_id!("sfsH2CVS2SaXwnrGwgTVrG7ytZAxSCsTnW82BvjWTGz");

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
        state.destination_name = state_in.destination_name;
        state.destination_account = state_in.destination_account;
        state.certificate_vault = state_in.certificate_vault;
        state.spend_threshold = state_in.spend_threshold;
        state.input_account_bump = ctx.bumps.input_account;
        state.total_spent = 0;

        Ok(())
    }

    pub fn update_state(ctx: Context<UpdateState>, state_in: GenericStateInput) -> Result<()> {
        // update state account parameters
        let state = &mut ctx.accounts.state;
        state.update_authority = state_in.update_authority;
        state.destination_account = state_in.destination_account;
        state.certificate_vault = state_in.certificate_vault;
        state.spend_threshold = state_in.spend_threshold;

        Ok(())
    }

    pub fn send_fund<'info>(
        ctx: Context<'_, '_, '_, 'info, SendFund<'info>>,
        amount: u64,
    ) -> Result<()> {
        // send yield to input_accounts with specified proportions
        let state = &mut ctx.accounts.state;
        let input_account = &mut ctx.accounts.input_account;
        let destination_account = &mut ctx.accounts.destination_account;
        if destination_account.key() != state.destination_account {
            return Err(ErrorCode::IncorrectDestinationAccount.into());
        }

        if amount >= state.spend_threshold {
            transfer_native_cpi(
                &state.key(),
                &input_account.to_account_info(),
                // state.destination_account.to_account_info(), <- this leads to error trait bounds not satisfied, why?
                &destination_account.to_account_info(),
                amount,
                state.input_account_bump,
                &ctx.accounts.system_program,
            )?;
            state.total_spent += amount;
        } else {
            return Err(ErrorCode::InsufficientFundsForTransaction.into());
        }

        Ok(())
    }

    pub fn store_certificates<'info>(
        ctx: Context<'_, '_, '_, 'info, StoreCertificates<'info>>,
    ) -> Result<()> {
        // send received climate tokens in input_account to a hold account
        let state = &mut ctx.accounts.state;
        let input_account = &mut ctx.accounts.input_account;
        let input_token_account = &mut ctx.accounts.input_token_account;
        let certificate_vault_ata = &mut ctx.accounts.certificate_vault_ata;

        let amount: u64 = input_token_account.amount;

        if amount == 0 {
            return Err(ErrorCode::NoCertificatesFound.into());
        }

        transfer_token(
            &state.key(),
            &AccountsTokenTransfer {
                source: input_token_account.to_account_info(),
                dest: certificate_vault_ata.to_account_info(),
                authority: input_account.to_account_info(),
            },
            amount,
            state.input_account_bump,
            &ctx.accounts.token_program,
        )?;

        Ok(())
    }
}
