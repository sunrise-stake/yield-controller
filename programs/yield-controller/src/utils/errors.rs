use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("An error occurred when calculating an MSol value")]
    CalculationFailure,
}
