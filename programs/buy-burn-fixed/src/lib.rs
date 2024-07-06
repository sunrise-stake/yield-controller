#![allow(clippy::result_large_err)]
use crate::utils::errors::ErrorCode;
use crate::utils::state::*;
use crate::utils::token::*;
use anchor_lang::prelude::*;
mod utils;

declare_id!("stcGmoLCBsr2KSu2vvcSuqMiEZx36F32ySUtCXjab5B");

#[program]
pub mod buy_burn_fixed {
    use super::*;

    pub fn register_state(ctx: Context<RegisterState>, state: GenericStateInput) -> Result<()> {
        let yield_account = &mut ctx.accounts.yield_account;
        yield_account.mint = state.mint;
        yield_account.update_authority = state.update_authority;
        yield_account.treasury = state.treasury;
        yield_account.purchase_threshold = state.purchase_threshold;
        yield_account.purchase_proportion = state.purchase_proportion;
        yield_account.price = state.price;
        yield_account.holding_account = state.holding_account;
        yield_account.holding_token_account = state.holding_token_account;
        yield_account.bump = ctx.bumps.yield_account;
        Ok(())
    }

    pub fn update_state(ctx: Context<UpdateState>, state: GenericStateInput) -> Result<()> {
        let yield_account = &mut ctx.accounts.yield_account;
        //yield_account.market = state.market;
        yield_account.update_authority = state.update_authority;
        yield_account.treasury = state.treasury;
        yield_account.purchase_threshold = state.purchase_threshold;
        yield_account.purchase_proportion = state.purchase_proportion;
        yield_account.holding_account = state.holding_account;
        yield_account.holding_token_account = state.holding_token_account;
        yield_account.price = state.price;
        Ok(())
    }

    pub fn update_price(ctx: Context<UpdatePrice>, price: u64) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.price = price;
        Ok(())
    }

    pub fn allocate_yield(ctx: Context<AllocateYield>, args: AllocateYieldInput) -> Result<()> {
        let mint_account = &ctx.accounts.mint;
        let state = &mut ctx.accounts.state;
        let treasury = &mut ctx.accounts.treasury;
        let token_program = &ctx.accounts.token_program;
        let holding_account = &mut ctx.accounts.holding_account;
        let holding_token_account = &mut ctx.accounts.holding_token_account;

        if args.token_amount < state.purchase_threshold {
            return Err(ErrorCode::PurchaseThresholdExceeded.into());
        }

        // for now, we'll just assume the total amount is passed in as an argument
        let treasury_amount = (args.sol_amount as f64 * state.purchase_proportion as f64) as u64;

        let holding_account_amount = args.sol_amount - treasury_amount;

        let burn_amount = args.token_amount / state.price;

        burn(
            burn_amount,
            state,
            mint_account,
            holding_token_account,
            token_program,
        )?;

        transfer_native(&state.to_account_info(), treasury, treasury_amount)?;
        transfer_native(
            &state.to_account_info(),
            holding_account,
            holding_account_amount,
        )?;

        // update total sol spent
        state.total_spent += holding_account_amount;

        Ok(())
    }
}
