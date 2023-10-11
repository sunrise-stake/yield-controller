use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds for transaction")]
    InsufficientFundsForTransaction,

    #[msg("Incorrect output yield account")]
    IncorrectOutputYieldAccount,

    #[msg("Incorrect destination account")]
    IncorrectDestinationAccount,

    #[msg("Incorrect update authority")]
    Unauthorized,
}
