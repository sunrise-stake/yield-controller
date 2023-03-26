#![allow(clippy::result_large_err)]
use crate::utils::errors::ErrorCode;
use crate::utils::state::*;
use crate::utils::token::*;
use anchor_lang::prelude::*;
mod utils;

declare_id!("sbnbpcN3HVfcj9jTwzncwLeNvCzSwbfMwNmdAgX36VW");

#[program]
pub mod buy_and_burn {
    use crate::utils::switchboard::get_latest_price;
    use super::*;

    pub fn register_state(ctx: Context<RegisterState>, state: GenericStateInput) -> Result<()> {
        let state_account = &mut ctx.accounts.state;
        state_account.mint = state.mint;
        state_account.update_authority = state.update_authority;
        state_account.treasury = state.treasury;
        state_account.purchase_threshold = state.purchase_threshold;
        state_account.purchase_proportion = state.purchase_proportion;
        state_account.holding_account = state.holding_account;
        state_account.holding_token_account = state.holding_token_account;
        state_account.sol_usd_price_feed = state.sol_usd_price_feed;
        state_account.nct_usd_price_feed = state.nct_usd_price_feed;
        state_account.feed_staleness_threshold = state.feed_staleness_threshold;
        state_account.index = state.index;
        state_account.yield_account_bump = state.yield_account_bump;
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
        state_account.holding_account = state.holding_account;
        state_account.holding_token_account = state.holding_token_account;
        state_account.sol_usd_price_feed = state.sol_usd_price_feed;
        state_account.nct_usd_price_feed = state.nct_usd_price_feed;
        state_account.feed_staleness_threshold = state.feed_staleness_threshold;
        state_account.yield_account_bump = state.yield_account_bump;
        Ok(())
    }

    pub fn allocate_yield(ctx: Context<AllocateYield>) -> Result<()> {
        let mint_account = &ctx.accounts.mint;
        let state_account = &mut ctx.accounts.state;
        let treasury = &mut ctx.accounts.treasury;
        let token_program = &ctx.accounts.token_program;
        let holding_account = &mut ctx.accounts.holding_account;
        let holding_token_account = &mut ctx.accounts.holding_token_account;

        let yield_account = &ctx.accounts.yield_account;

        if state_account.treasury != treasury.key() {
            return Err(ErrorCode::InvalidTreasury.into());
        }

        if state_account.mint != mint_account.key() {
            return Err(ErrorCode::InvalidMint.into());
        }

        let available_amount = yield_account.to_account_info().try_lamports()?;

        // for now, we'll just assume the total amount is passed in as an argument
        // "Purchase_proportion" of the amount will go to purchasing
        let amount_used_for_token_purchase =
            (available_amount as f64 * state_account.purchase_proportion as f64) as u64;

        let amount_sent_to_treasury = available_amount
            .checked_sub(amount_used_for_token_purchase)
            .unwrap();

        let price = get_latest_price(&ctx.accounts.sol_usd_price_feed, &ctx.accounts.nct_usd_price_feed, state_account.feed_staleness_threshold)?;
        msg!("Latest oracle price: {}", price);

        // Price is token price in SOL
        // Amount is in lamports (9 dp)
        // We need to convert to the token amount in minor units
        // token amount = lamports / (10^(9-decimals)) * price
        // Note, this works even if decimals > 9
        let token_decimal_denominator = (10_f64).powi(9_i32 - mint_account.decimals as i32);
        let token_amount_to_buy_and_burn = (amount_used_for_token_purchase as f64
            / (token_decimal_denominator * price))
            as u64;

        msg!("Available amount: {}", available_amount);
        msg!(
            "Proportion used for purchase: {}",
            state_account.purchase_proportion
        );
        msg!("Purchase threshold: {}", state_account.purchase_threshold);
        msg!(
            "Amount used for token purchase: {}",
            amount_used_for_token_purchase
        );

        require_gte!(
            available_amount,
            state_account.purchase_threshold,
            ErrorCode::PurchaseThresholdExceeded
        );

        msg!("Buying and burning {} tokens", token_amount_to_buy_and_burn);

        burn(
            token_amount_to_buy_and_burn,
            state_account,
            mint_account,
            holding_token_account,
            token_program,
        )?;

        msg!(
            "Sending {} to holding account",
            amount_used_for_token_purchase
        );
        transfer_signed(
            state_account,
            &yield_account.to_account_info(),
            holding_account,
            amount_used_for_token_purchase,
        )?;

        msg!("Sending {} to treasury", amount_sent_to_treasury);

        transfer_signed(
            state_account,
            &yield_account.to_account_info(),
            treasury,
            amount_sent_to_treasury,
        )?;

        // update total tokens purchased
        state_account.total_tokens_purchased += token_amount_to_buy_and_burn;

        Ok(())
    }
}
