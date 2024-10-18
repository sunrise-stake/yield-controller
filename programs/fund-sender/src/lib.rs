#![allow(clippy::result_large_err)]
use crate::utils::errors::ErrorCode;
use crate::utils::spend::*;
use crate::utils::state::*;
use crate::utils::bubblegum::TRANSFER_DISCRIMINATOR;
use anchor_lang::prelude::*;
mod utils;
mod external_programs;

declare_id!("sfsH2CVS2SaXwnrGwgTVrG7ytZAxSCsTnW82BvjWTGz");

#[program]
pub mod fund_sender {
    use super::*;

    pub fn register_state(
        ctx: Context<RegisterState>,
        sunrise_state: Pubkey,
        state_in: GenericStateInput,
    ) -> Result<()> {
        // register state account on chain, only need to ever be done once
        let state = &mut ctx.accounts.state;
        state.sunrise_state = sunrise_state;
        state.update_authority = state_in.update_authority;
        state.destination_name = state_in.destination_name;
        state.destination_account = state_in.destination_account;
        state.certificate_vault = state_in.certificate_vault;
        state.spend_threshold = state_in.spend_threshold;
        state.input_account_bump = ctx.bumps.input_account;
        state.total_spent = 0;

        Ok(())
    }

    pub fn update_state(ctx: Context<UpdateState>, state_in: GenericStateInput) -> Result<()> {
        // update state account parameters
        let state = &mut ctx.accounts.state;
        state.update_authority = state_in.update_authority;
        state.destination_account = state_in.destination_account;
        state.certificate_vault = state_in.certificate_vault;
        state.spend_threshold = state_in.spend_threshold;

        Ok(())
    }

    pub fn send_from_state(
        ctx: Context<SendFromState>,
    ) -> Result<()> {
        let state = &ctx.accounts.state;
        let amount = state.get_lamports();

        if amount > 0 {
            **state.to_account_info().try_borrow_mut_lamports()? -= amount;
            **ctx.accounts.input_account.try_borrow_mut_lamports()? += amount;
        }

        Ok(())
    }

    pub fn send_fund<'info>(
        ctx: Context<'_, '_, '_, 'info, SendFund<'info>>,
        amount: u64,
    ) -> Result<()> {
        // send yield to input_accounts with specified proportions
        let state = &mut ctx.accounts.state;
        let input_account = &mut ctx.accounts.input_account;
        let destination_account = &mut ctx.accounts.destination_account;
        if destination_account.key() != state.destination_account {
            return Err(ErrorCode::IncorrectDestinationAccount.into());
        }

        if amount >= state.spend_threshold {
            transfer_native_cpi(
                &state.key(),
                &input_account.to_account_info(),
                // state.destination_account.to_account_info(), <- this leads to error trait bounds not satisfied, why?
                &destination_account.to_account_info(),
                amount,
                state.input_account_bump,
                &ctx.accounts.system_program,
            )?;
            state.total_spent += amount;
        } else {
            return Err(ErrorCode::InsufficientFundsForTransaction.into());
        }

        Ok(())
    }

    pub fn store_certificates<'info>(
        ctx: Context<'_, '_, '_, 'info, StoreCertificates<'info>>,
    ) -> Result<()> {
        // send received climate tokens in input_account to a hold account
        let state = &mut ctx.accounts.state;
        let input_account = &mut ctx.accounts.input_account;
        let input_token_account = &mut ctx.accounts.input_token_account;
        let certificate_vault_ata = &mut ctx.accounts.certificate_vault_ata;

        let amount: u64 = input_token_account.amount;

        if amount == 0 {
            return Err(ErrorCode::NoCertificatesFound.into());
        }

        transfer_token(
            &state.key(),
            &AccountsTokenTransfer {
                source: input_token_account.to_account_info(),
                dest: certificate_vault_ata.to_account_info(),
                authority: input_account.to_account_info(),
            },
            amount,
            state.input_account_bump,
            &ctx.accounts.token_program,
        )?;

        Ok(())
    }

    pub fn store_cnft_certificate<'info>(
        ctx: Context<'_, '_, '_, 'info, StoreCNFTCertificates<'info>>,
        root: [u8; 32],
        data_hash: [u8; 32],
        creator_hash: [u8; 32],
        nonce: u64,
        index: u32,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;

        let mut accounts: Vec<solana_program::instruction::AccountMeta> = vec![
            AccountMeta::new_readonly(ctx.accounts.tree_authority.key(), false),
            AccountMeta::new_readonly(ctx.accounts.input_account.key(), true),
            AccountMeta::new_readonly(ctx.accounts.input_account.key(), false),
            AccountMeta::new_readonly(ctx.accounts.certificate_vault.key(), false),
            AccountMeta::new(ctx.accounts.merkle_tree.key(), false),
            AccountMeta::new_readonly(ctx.accounts.log_wrapper.key(), false),
            AccountMeta::new_readonly(ctx.accounts.compression_program.key(), false),
            AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
        ];

        let mut data: Vec<u8> = vec![];
        data.extend(TRANSFER_DISCRIMINATOR);
        data.extend(root);
        data.extend(data_hash);
        data.extend(creator_hash);
        data.extend(nonce.to_le_bytes());
        data.extend(index.to_le_bytes());

        let mut account_infos: Vec<AccountInfo> = vec![
            ctx.accounts.tree_authority.to_account_info(),
            ctx.accounts.input_account.to_account_info(),
            ctx.accounts.input_account.to_account_info(),
            ctx.accounts.certificate_vault.to_account_info(),
            ctx.accounts.merkle_tree.to_account_info(),
            ctx.accounts.log_wrapper.to_account_info(),
            ctx.accounts.compression_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ];

        // add "accounts" (hashes) that make up the merkle proof
        for acc in ctx.remaining_accounts.iter() {
            accounts.push(AccountMeta::new_readonly(acc.key(), false));
            account_infos.push(acc.to_account_info());
        }

        let state_bytes = state.key().to_bytes();
        let bump_bytes = &[state.input_account_bump];
        let seeds = &[crate::utils::seeds::INPUT_ACCOUNT, &state_bytes[..], bump_bytes][..];
        let signer_seeds = &[seeds];

        msg!("manual cpi call");
        solana_program::program::invoke_signed(
            &solana_program::instruction::Instruction {
                program_id: ctx.accounts.bubblegum_program.key(),
                accounts,
                data,
            },
            &account_infos[..],
            signer_seeds,
        )
            .map_err(Into::into)
    }
}
