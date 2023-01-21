use crate::utils::seeds::{STATE, YIELD_ACCOUNT};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

/* This argument will be used for both registering and updating the state account */
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct GenericStateInput {
    pub mint: Pubkey,
    // pub market: Pubkey,
    pub update_authority: Pubkey,
    pub treasury: Pubkey,
    pub holding_account: Pubkey,
    pub holding_token_account: Pubkey,
    pub price: f64, /* TODO: replace with oracle */
    pub purchase_threshold: u64,
    pub purchase_proportion: f32,
    pub index: u8,
    pub yield_account_bump: u8,
}

#[account]
pub struct State {
    pub update_authority: Pubkey,
    pub treasury: Pubkey,
    pub mint: Pubkey,
    pub price: f64,
    pub purchase_threshold: u64,
    pub purchase_proportion: f32,
    pub holding_account: Pubkey,
    pub holding_token_account: Pubkey,
    pub total_spent: u64,
    pub index: u8,
    pub bump: u8,
    pub yield_account_bump: u8,
}

impl State {
    pub const SPACE: usize = 32 + 32 + 32 + 32 + 32 + 32 + 4 + 1 + 1 + 1 + 8 /* Discriminator */;
}

#[derive(Accounts)]
#[instruction(state_in: GenericStateInput)]
pub struct RegisterState<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        space = State::SPACE,
        seeds = [STATE, state_in.mint.key().as_ref(), state_in.index.to_le_bytes().as_ref()],
        payer = payer,
        bump
    )]
    pub state: Account<'info, State>,
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(state_in: GenericStateInput)]
pub struct UpdateState<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [STATE, state_in.mint.key().as_ref(), state_in.index.to_le_bytes().as_ref()],
        bump = state.bump,
        constraint = state.update_authority == payer.key()
    )]
    pub state: Account<'info, State>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct UpdatePrice<'info> {
    #[account(
        mut,
        constraint = state.update_authority == payer.key()
    )]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct AllocateYield<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        has_one = holding_account,
        has_one = holding_token_account,
        has_one = treasury,
        has_one = mint
    )]
    pub state: Account<'info, State>,
    #[account(
        mut,
        seeds = [YIELD_ACCOUNT, state.key().as_ref()],
        bump = state.yield_account_bump,
    )]
    pub yield_account: SystemAccount<'info>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        constraint = treasury.key() == state.treasury.key(),
    )]
    pub treasury: SystemAccount<'info>,
    #[account(
        mut,
        constraint = holding_account.key() == state.holding_account.key(),
    )]
    pub holding_account: SystemAccount<'info>,
    #[account(
        mut,
        constraint = holding_token_account.key() == state.holding_token_account.key(),
        has_one = mint
    )]
    pub holding_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
