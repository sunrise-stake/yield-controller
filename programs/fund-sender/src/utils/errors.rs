use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds for transaction")]
    InsufficientFundsForTransaction,

    #[msg("Incorrect output yield account")]
    IncorrectOutputYieldAccount,

    #[msg("Token account not owned by output yield account")]
    IncorrectTokenAccountOwner,

    #[msg("Incorrect destination account")]
    IncorrectDestinationAccount,

    #[msg("Incorrect hold account")]
    IncorrectHoldAccount,

    #[msg("Incorrect update authority")]
    Unauthorized,

    #[msg("No certificates found")]
    NoCertificatesFound,
}
