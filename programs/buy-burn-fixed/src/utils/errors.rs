use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("insufficient funds for transaction")]
    InsufficientFundsForTransaction,

    #[msg("invalid treasury account")]
    InvalidTreasury,

    #[msg("invalid mint")]
    InvalidMint,

    #[msg("purchase threshold exceeded")]
    PurchaseThresholdExceeded,
}
