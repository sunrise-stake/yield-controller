use crate::utils::errors::ErrorCode;
use crate::utils::seeds::{INPUT_YIELD_ACCOUNT, STATE};
use anchor_lang::prelude::*;

/* This struct will be used for both registering and updating the state account */
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct GenericStateInput {
    pub update_authority: Pubkey,
    pub output_yield_accounts: Vec<Pubkey>,
    pub spend_proportions: Vec<u8>, // sum to 100
    pub spend_threshold: u64,
}

#[account]
pub struct State {
    pub sunrise_state: Pubkey,
    pub update_authority: Pubkey,
    pub output_yield_accounts: Vec<Pubkey>,
    pub spend_proportions: Vec<u8>, // sum to 100
    pub spend_threshold: u64,
    pub total_spent: u64,
    pub input_yield_account_bump: u8,
}

impl State {
    pub fn space(output_yield_account_count: u8) -> usize {
        32 + 32
            + (32 * output_yield_account_count as usize)
            + 4
            + (output_yield_account_count as usize)
            + 4
            + 8
            + 8
            + 1
            + 8 /* Discriminator */
    }
}

#[derive(Accounts)]
#[instruction(sunrise_state: Pubkey, state_in: GenericStateInput)]
pub struct RegisterState<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
    init,
    space = State::space(state_in.output_yield_accounts.len() as u8),
    seeds = [STATE, sunrise_state.key().as_ref()],
    payer = payer,
    bump
    )]
    pub state: Account<'info, State>,
    #[account(
    seeds = [INPUT_YIELD_ACCOUNT, state.key().as_ref()],
    bump,
    )]
    /// CHECK: Must be correctly derived from the state
    pub input_yield_account: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(state_in: GenericStateInput)]
pub struct UpdateState<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
    mut,
    constraint = state.update_authority == payer.key() @ ErrorCode::Unauthorized,
    // resize the state account if necessary
    realloc = State::space(state_in.output_yield_accounts.len() as u8),
    realloc::payer = payer,
    realloc::zero = false,
    )]
    pub state: Account<'info, State>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct AllocateYield<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub state: Account<'info, State>,
    #[account(
        mut,
        seeds = [INPUT_YIELD_ACCOUNT, state.key().as_ref()],
        bump = state.input_yield_account_bump,
    )]
    /// CHECK: Must be correctly derived from the state
    pub input_yield_account: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}
