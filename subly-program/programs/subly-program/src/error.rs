use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Custom error message")]
    CustomError,

    // Validation errors
    #[msg("Service name is too long")]
    NameTooLong,
    #[msg("Description is too long")]
    DescriptionTooLong,
    #[msg("Image URL is too long")]
    UrlTooLong,
    #[msg("Invalid fee amount")]
    InvalidFeeAmount,
    #[msg("Invalid billing frequency")]
    InvalidBillingFrequency,
    #[msg("Invalid amount")]
    InvalidAmount,

    // Authorization errors
    #[msg("Unauthorized user")]
    UnauthorizedUser,
    #[msg("Unauthorized authority")]
    UnauthorizedAuthority,
    #[msg("Unauthorized provider")]
    UnauthorizedProvider,

    // Balance and payment errors
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Insufficient available balance (funds locked for subscriptions)")]
    InsufficientAvailableBalance,
    #[msg("Insufficient staked funds")]
    InsufficientStakedFunds,

    // Subscription errors
    #[msg("Invalid subscription ID")]
    InvalidSubscriptionId,
    #[msg("Subscription not active")]
    SubscriptionNotActive,
    #[msg("Subscription already exists")]
    SubscriptionAlreadyExists,
    #[msg("Subscription limit reached")]
    SubscriptionLimitReached,
    #[msg("Cannot subscribe to own service")]
    CannotSubscribeToOwnService,

    // Service errors
    #[msg("Service not found")]
    ServiceNotFound,
    #[msg("Service not active")]
    ServiceNotActive,
    #[msg("Service limit reached")]
    ServiceLimitReached,

    // Staking errors
    #[msg("Minimum stake amount not met")]
    MinimumStakeNotMet,
    #[msg("No staked funds available")]
    NoStakedFunds,
    #[msg("Staking not available")]
    StakingNotAvailable,
    #[msg("Stake pool operation failed")]
    StakePoolError,

    // Protocol errors
    #[msg("Protocol is paused")]
    ProtocolPaused,
    #[msg("Invalid protocol fee")]
    InvalidProtocolFee,

    // Time related errors
    #[msg("Payment not yet due")]
    PaymentNotDue,
    #[msg("Payment already processed")]
    PaymentAlreadyProcessed,

    // Math errors
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Arithmetic underflow")]
    ArithmeticUnderflow,
}
