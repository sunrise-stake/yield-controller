use crate::utils::errors::ErrorCode;
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::utils::seeds::INPUT_YIELD_ACCOUNT;

pub fn check_proportions(spend_proportions: &[u8]) -> Result<()> {
    // check proportions sum to 100
    let mut sum = 0;
    for proportion in spend_proportions.iter() {
        sum += proportion;
    }
    if sum != 100 {
        return Err(ErrorCode::InvalidProportions.into());
    }
    Ok(())
}

pub fn transfer_native_cpi<'a>(
    state: &Pubkey,
    source: &AccountInfo<'a>,
    dest: &AccountInfo<'a>,
    amount: u64,
    source_bump: u8,
    system_program: &Program<'a, System>,
) -> Result<()> {
    let state_bytes = state.to_bytes();
    let bump_bytes = &[source_bump];
    let seeds = &[INPUT_YIELD_ACCOUNT, &state_bytes[..], bump_bytes][..];
    let signer_seeds = &[&seeds[..]];
    let cpi_ctx = CpiContext::new(
        system_program.to_account_info(),
        system_program::Transfer {
            from: source.clone(),
            to: dest.clone(),
        })
        .with_signer(signer_seeds);
    system_program::transfer(cpi_ctx, amount)
}
