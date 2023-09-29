use crate::utils::errors::ErrorCode;
use crate::utils::seeds::{INPUT_YIELD_ACCOUNT, STATE};
use anchor_lang::prelude::*;

/* This struct will be used for both registering and updating the state account */
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct GenericStateInput {
    // an account that can update the `output_yield_accounts` and `spend_proportions`
    pub update_authority: Pubkey,
    // a vector of accounts to which we will send yields to
    pub output_yield_accounts: Vec<Pubkey>,
    // proportions of sum to send to each of the accounts in `output_yield_accounts` (sum to 100)
    pub spend_proportions: Vec<u8>,
    // minimum threshold of yield in input_yield_account before it is allowed to send funds
    pub spend_threshold: u64,
}

#[account]
pub struct State {
    // the state account holding all the configs from GenericStateInput and the info of total yields spent
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
        // find space needed for state account for current config
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
    // to be used for registering state account on chain, only need to ever be done once
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
    // to be used for updating parameters of state account
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
    // to allocate correct yield proportion to various output_yield_accounts
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
