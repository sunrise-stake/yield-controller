use crate::utils::state::State;
use anchor_lang::prelude::*;
use anchor_spl::{token, token::Mint, token::TokenAccount};

pub fn burn<'a>(
    amount: u64,
    mint: &Account<'a, Mint>,
    authority: &Account<'a, State>,
    token_account: &Account<'a, TokenAccount>,
    seeds: &[&[u8]],
    token_program: &AccountInfo<'a>,
) -> Result<()> {
    let cpi_program = token_program.clone();
    let accounts = token::Burn {
        mint: mint.to_account_info(),
        authority: authority.to_account_info(),
        from: token_account.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, accounts);
    token::burn(cpi_ctx.with_signer(&[seeds]), amount)
}

pub fn transfer<'a>(
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
