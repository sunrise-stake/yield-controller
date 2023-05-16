use crate::utils::seeds::STATE;
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
    pub price: u64, /* TODO: replace with oracle */
    pub purchase_threshold: u64,
    pub purchase_proportion: f32,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AllocateYieldInput {
    pub sol_amount: u64,
    pub token_amount: u64,
}

#[account]
pub struct State {
    pub update_authority: Pubkey,
    pub treasury: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub purchase_threshold: u64,
    pub purchase_proportion: f32,
    pub holding_account: Pubkey,
    pub holding_token_account: Pubkey,
    pub total_spent: u64,
    pub bump: u8,
}

impl State {
    const SPACE: usize = 32 + 32 + 32 + 32 + 32 + 32 + 4 + 1 + 8 /* Discriminator */;
}

#[derive(Accounts)]
#[instruction(state_in: GenericStateInput)]
pub struct RegisterState<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        space = State::SPACE,
        seeds = [STATE, state_in.mint.key().as_ref()],
        payer = payer,
        bump
    )]
    pub yield_account: Account<'info, State>,
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
        seeds = [STATE, state_in.mint.key().as_ref()],
        bump = yield_account.bump,
        constraint = yield_account.update_authority == payer.key()
    )]
    pub yield_account: Account<'info, State>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct UpdatePrice<'info> {
    #[account(
        mut,
        seeds = [STATE, yield_account.mint.key().as_ref()],
        bump = yield_account.bump,
        constraint = yield_account.update_authority == payer.key()
    )]
    pub yield_account: Account<'info, State>,
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct AllocateYield<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [STATE, yield_account.mint.key().as_ref()],
        bump = yield_account.bump,
    )]
    pub yield_account: Account<'info, State>,
    #[account(
        mut,
        constraint = treasury.key() == yield_account.treasury.key(),
    )]
    pub mint: Account<'info, Mint>,
    /// CHECK: Assumes correct state setup
    #[account(
        mut,
        constraint = treasury.key() == yield_account.treasury.key(),
    )]
    pub treasury: AccountInfo<'info>,
    #[account(
        mut,
        constraint = holding_account.key() == yield_account.holding_account.key(),
    )]
    /// CHECK: Assumes correct state setup
    pub holding_account: AccountInfo<'info>,
    #[account(
        mut,
        constraint = holding_token_account.key() == yield_account.holding_token_account.key(),
    )]
    pub holding_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
