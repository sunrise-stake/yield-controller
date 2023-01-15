#![allow(clippy::result_large_err)]
use crate::utils::errors::ErrorCode;
use crate::utils::state::*;
use crate::utils::token::*;
use anchor_lang::prelude::*;
mod utils;

declare_id!("8Wbd1YbvX44jJHmBrythtrMWJiJH5u7NqT1EYspSYx78");

#[program]
pub mod treasury_controller {
    use super::*;

    pub fn register_state(ctx: Context<RegisterState>, state: GenericStateInput) -> Result<()> {
        let state_account = &mut ctx.accounts.state;
        state_account.mint = state.mint;
        state_account.update_authority = state.update_authority;
        state_account.treasury = state.treasury;
        state_account.purchase_threshold = state.purchase_threshold;
        state_account.purchase_proportion = state.purchase_proportion;
        state_account.price = state.price;
        state_account.bump = *ctx.bumps.get("state").unwrap();
        Ok(())
    }

    pub fn update_state(ctx: Context<UpdateState>, state: GenericStateInput) -> Result<()> {
        let state_account = &mut ctx.accounts.state;
        //state_account.market = state.market;
        state_account.update_authority = state.update_authority;
        state_account.treasury = state.treasury;
        state_account.purchase_threshold = state.purchase_threshold;
        state_account.purchase_proportion = state.purchase_proportion;
        state_account.price = state.price;
        Ok(())
    }

    pub fn update_price(ctx: Context<UpdatePrice>, price: u64) -> Result<()> {
        let state_account = &mut ctx.accounts.state;
        state_account.price = price;
        Ok(())
    }

    pub fn allocate_yield(ctx: Context<AllocateYield>, args: AllocateYieldInput) -> Result<()> {
        let mint_account = &ctx.accounts.mint;
        let state_account = &ctx.accounts.state;
        let treasury = &mut ctx.accounts.treasury;
        let token_program = &ctx.accounts.token_program;
        let holding_account = &mut ctx.accounts.holding_account;
        let holding_token_account = &mut ctx.accounts.holding_token_account;

        if state_account.treasury != treasury.key() {
            return Err(ErrorCode::InvalidTreasury.into());
        }

        if state_account.mint != mint_account.key() {
            return Err(ErrorCode::InvalidMint.into());
        }

        if args.token_amount < state_account.purchase_threshold {
            return Err(ErrorCode::PurchaseThresholdExceeded.into());
        }

        // for now, we'll just assume the total amount is passed in as an argument
        let treasury_amount =
            (args.sol_amount as f64 * state_account.purchase_proportion as f64) as u64;

        let holding_account_amount = args.sol_amount - treasury_amount;

        burn(
            args.token_amount,
            state_account,
            mint_account,
            holding_token_account,
            token_program,
        )?;

        transfer_native(&state_account.to_account_info(), treasury, treasury_amount)?;
        transfer_native(
            &state_account.to_account_info(),
            holding_account,
            holding_account_amount,
        )?;
        // transfer to holding account as well?

        Ok(())
    }
}
