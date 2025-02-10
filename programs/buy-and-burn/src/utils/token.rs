use crate::utils::seeds::{STATE, YIELD_ACCOUNT};
use crate::utils::state::State;
use anchor_lang::prelude::*;
use anchor_spl::{token, token::Mint, token::TokenAccount};
use solana_program::system_instruction;

pub fn burn<'a>(
    amount: u64,
    state_account: &Account<'a, State>,
    mint: &Account<'a, Mint>,
    token_account: &Account<'a, TokenAccount>,
    token_program: &AccountInfo<'a>,
) -> Result<()> {
    let seeds = [
        STATE,
        state_account.mint.as_ref(),
        &state_account.index.to_le_bytes(),
        &[state_account.bump],
    ];

    let cpi_program = token_program.clone();
    let accounts = token::Burn {
        mint: mint.to_account_info(),
        authority: state_account.to_account_info(),
        from: token_account.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, accounts);

    token::burn(cpi_ctx.with_signer(&[&seeds]), amount)
}

pub fn transfer_signed<'a>(
    state_account: &Account<'a, State>,
    yield_account: &AccountInfo<'a>,
    destination: &AccountInfo<'a>,
    amount: u64,
) -> Result<()> {
    let ix = system_instruction::transfer(&yield_account.key(), &destination.key(), amount);

    let bump = &[state_account.yield_account_bump][..];
    let state = state_account.key();
    let seeds = &[YIELD_ACCOUNT, state.as_ref(), bump][..];
    solana_program::program::invoke_signed(
        &ix,
        &[yield_account.clone(), destination.clone()],
        &[seeds],
    )?;

    Ok(())
}

/*
pub fn _transfer_token<'a>(
    amount: u64,
    authority: &Account<'a, State>,
    source: &Account<'a, TokenAccount>,
    destination: &Account<'a, TokenAccount>,
    seeds: &[&[u8]],
    token_program: &AccountInfo<'a>,
) -> Result<()> {
    let cpi_program = token_program.clone();
    let accounts = token::Transfer {
        from: source.to_account_info(),
        to: destination.to_account_info(),
        authority: authority.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(cpi_program, accounts);
    token::transfer(cpi_ctx.with_signer(&[seeds]), amount)
}
*/
