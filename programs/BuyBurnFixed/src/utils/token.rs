use crate::utils::errors::ErrorCode;
use crate::utils::seeds::STATE;
use crate::utils::state::State;
use anchor_lang::prelude::*;
use anchor_spl::{token, token::Mint, token::TokenAccount};

pub fn burn<'a>(
    amount: u64,
    yield_account: &Account<'a, State>,
    mint: &Account<'a, Mint>,
    token_account: &Account<'a, TokenAccount>,
    token_program: &AccountInfo<'a>,
) -> Result<()> {
    let seeds = [STATE, yield_account.mint.as_ref(), &[yield_account.bump]];

    let cpi_program = token_program.clone();
    let accounts = token::Burn {
        mint: mint.to_account_info(),
        authority: yield_account.to_account_info(),
        from: token_account.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, accounts);

    token::burn(cpi_ctx.with_signer(&[&seeds]), amount)
}

pub fn transfer_native<'a>(
    source: &AccountInfo<'a>,
    dest: &AccountInfo<'a>,
    amount: u64,
) -> Result<()> {
    if **source.try_borrow_lamports()? < amount {
        return Err(ErrorCode::InsufficientFundsForTransaction.into());
    }

    **source.try_borrow_mut_lamports()? -= amount;
    **dest.try_borrow_mut_lamports()? += amount;
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
