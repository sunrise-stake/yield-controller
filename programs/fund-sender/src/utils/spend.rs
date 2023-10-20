use crate::utils::seeds::OUTPUT_YIELD_ACCOUNT;
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token, Transfer as SplTransfer};

pub fn transfer_native_cpi<'a>(
    state: &Pubkey,
    source: &AccountInfo<'a>,
    dest: &AccountInfo<'a>,
    amount: u64,
    source_bump: u8,
    destination_seed: &[u8],
    system_program: &Program<'a, System>,
) -> Result<()> {
    // transfer `amount` (in lamports) from `source` account to `dest` account
    let state_bytes = state.to_bytes();
    let bump_bytes = &[source_bump];
    let seeds = &[
        OUTPUT_YIELD_ACCOUNT,
        destination_seed,
        &state_bytes[..],
        bump_bytes,
    ][..];
    let signer_seeds = &[seeds];
    let cpi_ctx = CpiContext::new(
        system_program.to_account_info(),
        system_program::Transfer {
            from: source.clone(),
            to: dest.clone(),
        },
    )
    .with_signer(signer_seeds);
    system_program::transfer(cpi_ctx, amount)
}

pub struct AccountsTokenTransfer<'a> {
    pub source: AccountInfo<'a>,
    pub dest: AccountInfo<'a>,
    pub authority: AccountInfo<'a>,
}

pub fn transfer_token<'a>(
    state: &Pubkey,
    accounts_token_transfer: &AccountsTokenTransfer<'a>,
    // source: &AccountInfo<'a>,
    // dest: &AccountInfo<'a>,
    // authority: &AccountInfo<'a>,
    amount: u64,
    source_bump: u8,
    destination_seed: &[u8],
    token_program: &Program<'a, Token>,
) -> Result<()> {
    let state_bytes = state.to_bytes();
    let bump_bytes = &[source_bump];
    let seeds = &[
        OUTPUT_YIELD_ACCOUNT,
        destination_seed,
        &state_bytes[..],
        bump_bytes,
    ][..];
    let signer_seeds = &[seeds];
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        SplTransfer {
            from: accounts_token_transfer.source.clone(),
            to: accounts_token_transfer.dest.clone(),
            authority: accounts_token_transfer.authority.clone(),
        },
    )
    .with_signer(signer_seeds);
    token::transfer(cpi_ctx, amount)
}
