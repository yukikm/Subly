# SUBLY Protocol - Solana Subscription Management with Yield Generation

## Overview

SUBLY is a decentralized subscription management protocol built on Solana using the Anchor framework. The protocol enables users to stake their SOL tokens to generate yield, which automatically covers their subscription fees without the need to convert crypto back to fiat.

## Architecture Design

### Core Components

#### 1. Global State Management

- **GlobalState**: Central protocol configuration and statistics
- **Treasury**: Protocol fee collection
- **Authority**: Protocol governance and administration

#### 2. Provider Management

- **Provider Registration**: Service providers can register and create subscription services
- **Provider Verification**: NFT-based verification system for trusted providers
- **Service Creation**: Providers can create multiple subscription services with different pricing tiers

#### 3. User Management

- **User Accounts**: Track deposits, staked amounts, and subscription history
- **SOL Deposits**: Users deposit SOL tokens into the protocol
- **Subscription Tracking**: Monitor active subscriptions and payment schedules

#### 4. Staking & Yield Generation

- **Jito Integration**: Stake user SOL through Jito for yield generation
- **Automatic Yield Calculation**: Smart contracts calculate and distribute yield
- **Subscription Coverage**: Yield automatically covers subscription fees

#### 5. Subscription Management

- **Service Subscription**: Users can subscribe to provider services
- **Payment Automation**: Automated payments from yield generated
- **Subscription Certificates**: NFT certificates for active subscriptions

## Key Features

### 1. **Seamless Subscription Payments**

- Users deposit SOL once and subscriptions are automatically paid from yield
- No need to manually manage subscription renewals
- Crypto-native payment solution without fiat conversion

### 2. **Yield-Powered Model**

- Integration with Jito for SOL staking
- 5% APY target for sustainable subscription coverage
- Excess yield remains with users for withdrawal

### 3. **Provider Benefits**

- Guaranteed payment from locked user funds
- Access to crypto-native customer base
- Reduced churn through automated payments

### 4. **Transparent & Decentralized**

- All transactions on-chain and verifiable
- Smart contract automation reduces counterparty risk
- Open protocol for any service provider

## Technical Implementation

### State Structures

```rust
// Global protocol state
pub struct GlobalState {
    pub authority: Pubkey,
    pub total_providers: u64,
    pub total_users: u64,
    pub total_subscription_services: u64,
    pub total_active_subscriptions: u64,
    pub protocol_fee_bps: u16,
    pub is_paused: bool,
}

// Provider account
pub struct Provider {
    pub wallet: Pubkey,
    pub name: String,
    pub description: String,
    pub website: String,
    pub service_count: u64,
    pub total_subscribers: u64,
    pub is_verified: bool,
}

// Subscription service
pub struct SubscriptionService {
    pub provider: Pubkey,
    pub service_id: u64,
    pub name: String,
    pub description: String,
    pub fee_usd: u64, // USD cents
    pub billing_frequency_days: u64,
    pub max_subscribers: Option<u64>,
    pub is_active: bool,
}

// User account
pub struct User {
    pub wallet: Pubkey,
    pub deposited_sol: u64,
    pub locked_sol: u64,     // Locked for subscriptions
    pub staked_sol: u64,     // Staked for yield
    pub subscription_count: u64,
}

// User subscription
pub struct UserSubscription {
    pub user: Pubkey,
    pub provider: Pubkey,
    pub service_id: u64,
    pub subscription_id: u64,
    pub next_payment_due: i64,
    pub is_active: bool,
}

// Staking account
pub struct StakeAccount {
    pub user: Pubkey,
    pub staked_amount: u64,
    pub jito_sol_amount: u64,
    pub total_yield_earned: u64,
    pub is_active: bool,
}
```

### Core Instructions

#### Protocol Management

- `initialize()` - Initialize the protocol with global state
- `process_subscription_payments()` - Process periodic subscription payments

#### Provider Operations

- `register_provider()` - Register as a service provider
- `register_subscription_service()` - Create a new subscription service

#### User Operations

- `deposit()` - Deposit SOL into the protocol
- `withdraw()` - Withdraw available SOL balance
- `stake_sol()` - Stake SOL for yield generation
- `unstake_sol()` - Unstake SOL from yield generation
- `claim_yield()` - Claim generated yield

#### Subscription Management

- `subscribe_to_service()` - Subscribe to a provider's service
- `unsubscribe_from_service()` - Cancel an active subscription

### Security Features

#### Access Controls

- Provider-only service creation
- User-only subscription management
- Authority-only protocol administration

#### Financial Safeguards

- Locked funds for active subscriptions
- Minimum stake requirements
- Overflow/underflow protection
- Insufficient balance checks

#### Validation

- Service existence verification
- Subscription status validation
- Provider authorization checks
- Payment schedule enforcement

## Usage Flow

### For Users

1. **Initial Setup**

   ```typescript
   // Deposit SOL
   await program.methods.deposit(amount).rpc();

   // Stake for yield
   await program.methods.stakeSol(stakeAmount).rpc();
   ```

2. **Subscribe to Services**

   ```typescript
   // Subscribe to a service
   await program.methods.subscribeToService(providerId, serviceId).rpc();
   ```

3. **Manage Subscriptions**

   ```typescript
   // Claim yield
   await program.methods.claimYield().rpc();

   // Unsubscribe if needed
   await program.methods.unsubscribeFromService(subscriptionId).rpc();
   ```

### For Providers

1. **Registration**

   ```typescript
   // Register as provider
   await program.methods.registerProvider(name, description, website).rpc();
   ```

2. **Service Creation**
   ```typescript
   // Create subscription service
   await program.methods
     .registerSubscriptionService(
       name,
       description,
       feeUsd,
       billingDays,
       imageUrl,
       maxSubscribers
     )
     .rpc();
   ```

## Economic Model

### Revenue Streams

- **Protocol Fees**: 1% fee on all transactions
- **Staking Yield**: Users earn ~5% APY on staked SOL
- **Provider Fees**: Subscription fees paid by users

### Risk Management

- **Locked Funds**: 12 months of subscription fees locked per subscription
- **Yield Buffer**: Excess yield provides payment security
- **Gradual Unstaking**: Prevents mass exits affecting yield

## Future Enhancements

### v2 Features

- **Multi-token Support**: Accept USDC, USDT for subscriptions
- **Dynamic Pricing**: Adjust fees based on SOL price volatility
- **Governance Token**: SUBLY token for protocol governance
- **Advanced Staking**: Integration with multiple liquid staking protocols

### v3 Features

- **Cross-chain Support**: Expand to other blockchains
- **DeFi Integration**: Yield farming strategies
- **Analytics Dashboard**: Provider and user analytics
- **Mobile SDK**: Easy integration for mobile apps

## Testing

The protocol includes comprehensive tests covering:

- Protocol initialization
- Provider registration and service creation
- User deposit, staking, and yield generation
- Subscription lifecycle management
- Error handling and edge cases

```bash
# Run tests
anchor test

# Run specific test
anchor test -- --grep "Subscription Management"
```

## Deployment

### Mainnet Deployment

1. Configure program ID in `Anchor.toml`
2. Update cluster to mainnet-beta
3. Deploy with sufficient SOL for rent exemption
4. Initialize protocol with production parameters

### Security Audits

- Smart contract security audit recommended before mainnet
- Economic model review for sustainable yield generation
- Penetration testing for frontend applications

## Contributing

1. Fork the repository
2. Create feature branch
3. Add comprehensive tests
4. Submit pull request with detailed description

## License

MIT License - see LICENSE file for details

---

**Disclaimer**: This protocol involves financial transactions and yield generation. Users should understand the risks involved with DeFi protocols and liquid staking before participation.
