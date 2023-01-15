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
    pub bump: u8,
}

impl State {
    const SPACE: usize = 32 + 32 + 32 + 32 + 4 + 1 + 8 /* Discriminator */;
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
        seeds = [STATE, state_in.mint.key().as_ref()],
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
        seeds = [STATE, state.mint.key().as_ref()],
        bump = state.bump,
        constraint = state.update_authority == payer.key()
    )]
    pub state: Account<'info, State>,
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
        seeds = [STATE, state.mint.key().as_ref()],
        bump = state.bump,
    )]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    /// CHECK: checked in program
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    /// CHECK: checked in program
    #[account(mut)]
    pub holding_account: AccountInfo<'info>,
    #[account(mut)]
    pub holding_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
