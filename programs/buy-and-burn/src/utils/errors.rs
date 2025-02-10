use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds for transaction")]
    InsufficientFundsForTransaction,

    #[msg("Invalid treasury account")]
    InvalidTreasury,

    #[msg("Invalid mint")]
    InvalidMint,

    #[msg("Purchase threshold exceeded")]
    PurchaseThresholdExceeded,

    #[msg("The switchboard feed account is invalid")]
    InvalidSwitchboardAccount,
}
