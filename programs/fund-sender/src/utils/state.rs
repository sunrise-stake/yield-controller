use crate::utils::errors::ErrorCode;
use crate::utils::seeds::{INPUT_ACCOUNT, STATE};
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

/* This struct will be used for both registering and updating the state account */
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct GenericStateInput {
    // seed phrase specifying which climate product to send funds to
    pub destination_name: String, // Vec<u8>,
    // an account that can update the `destination_account` and `spend_threshold`
    pub update_authority: Pubkey,
    // the account of the climate token
    pub destination_account: Pubkey,
    // the hold account of retired climate token
    pub certificate_vault: Pubkey,
    // minimum threshold of yield in input_account before it is allowed to send funds (in lamports)
    pub spend_threshold: u64,
}

#[account]
pub struct State {
    // the state account holding all the configs from GenericStateInput and the info of total funds spent on the destination
    pub sunrise_state: Pubkey,
    pub update_authority: Pubkey,
    pub destination_name: String, // Vec<u8>,
    pub destination_account: Pubkey,
    pub certificate_vault: Pubkey,
    pub spend_threshold: u64,
    pub total_spent: u64,
    pub input_account_bump: u8,
}

impl State {
    pub fn space(len_destination_seed: u8) -> usize {
        // find space needed for state account for current config
        32 + 32 + 4 + (len_destination_seed as usize) + 32 + 32 + 8 + 8 + 1 + 8 /* Discriminator */
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
    space = State::space(state_in.destination_name.len() as u8),
    seeds = [STATE, &state_in.destination_name.as_bytes(), sunrise_state.key().as_ref()],
    payer = payer,
    bump,
    )]
    pub state: Account<'info, State>,
    #[account(
    seeds = [INPUT_ACCOUNT, state.key().as_ref()],
    bump,
    )]
    /// CHECK: Must be correctly derived from the state
    pub input_account: UncheckedAccount<'info>,
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
    )]
    pub state: Account<'info, State>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendFund<'info> {
    // to allocate correct yield proportion to various input_accounts
    #[account(mut)]
    pub payer: Signer<'info>,
    pub state: Account<'info, State>,
    #[account(
        mut,
        seeds = [INPUT_ACCOUNT, state.key().as_ref()],
        bump = state.input_account_bump,
    )]
    /// CHECK: Must be correctly derived from the state
    pub input_account: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Must be correct destination account (check is done in instruction)
    pub destination_account: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StoreCertificates<'info> {
    // to send the received retired climate token to a hold account
    #[account(mut)]
    pub payer: Signer<'info>,
    pub state: Account<'info, State>,
    #[account(
        seeds = [INPUT_ACCOUNT, state.key().as_ref()],
        bump = state.input_account_bump,
    )]
    /// CHECK: Must be correctly derived from the state
    pub input_account: UncheckedAccount<'info>,
    pub certificate_mint: Account<'info, Mint>,
    #[account(
        mut,
        token::mint = certificate_mint,
        constraint = input_token_account.owner.key() == input_account.key() @ ErrorCode::IncorrectTokenAccountOwner,
    )]
    ///  A token account owned by the input_account
    pub input_token_account: Account<'info, TokenAccount>,
    #[account(
        constraint = certificate_vault.key() == state.certificate_vault.key() @ ErrorCode::IncorrectHoldAccount,
    )]
    /// CHECK: must match the one stated in the state, but can be any account type
    pub certificate_vault: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = certificate_mint,
        associated_token::authority = certificate_vault,
    )]
    // the ATA of this particular mint of the account where we store all the certificates
    pub certificate_vault_ata: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
