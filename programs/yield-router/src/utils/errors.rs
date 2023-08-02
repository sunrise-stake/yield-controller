use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds for transaction")]
    InsufficientFundsForTransaction,

    #[msg("Incorrect input yield account")]
    IncorrectInputYieldAccount,

    #[msg("Incorrect output yield account")]
    IncorrectOutputYieldAccount,

    #[msg("Invalid spend proportions")]
    InvalidProportions,

    #[msg("Incorrect update authority")]
    Unauthorized,
}
