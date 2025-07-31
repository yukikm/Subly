use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Custom error message")]
    CustomError,
    #[msg("Service name is too long")]
    NameTooLong,
    #[msg("Image URL is too long")]
    UrlTooLong,
    #[msg("Invalid fee amount")]
    InvalidFeeAmount,
    #[msg("Invalid billing frequency")]
    InvalidBillingFrequency,
}
