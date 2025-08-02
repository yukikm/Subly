# Subly User Mobile App

A React Native Expo mobile application for the Subly subscription protocol built on Solana. This app allows users to deposit SOL and subscribe to various services using their deposited funds.

## Features

### 1. SOL Deposit

- Connect your Solana mobile wallet
- Deposit SOL to your Subly account
- View your current Subly balance
- Automatic balance updates after transactions

### 2. Subscription Services

- Browse available subscription services
- Subscribe to services using deposited SOL
- Receive NFT certificates for active subscriptions
- Modern, intuitive UI for service selection

## Architecture

### Key Components

- **DepositSol**: Handles SOL deposits to the Subly program
- **SubscriptionServices**: Displays available services and handles subscriptions
- **SublyFeature**: Main component with tab navigation between deposit and services
- **SublyButton**: Custom button component with modern styling

### Solana Integration

- **Program ID**: `w23po5aYmi7q71u7dwS2NfEL4otC7Ff7LnRFeCKywCG` (Devnet)
- **Mobile Wallet Adapter**: For secure wallet connections
- **Transaction Building**: Manual instruction creation for program interactions
- **PDA Management**: Automatic Program Derived Address calculation

### Program Instructions Used

1. **depositSol**: Deposits SOL to user's Subly account
2. **subscribeToService**: Subscribes user to a service and mints certificate NFT

## Setup & Installation

### Prerequisites

- Node.js 18+
- Expo CLI
- Android device with Solana mobile wallet (like Phantom, Solflare)
- Access to Solana Devnet

### Installation

```bash
cd subly-user-app
npm install
```

### Running the App

```bash
# Start the development server
npm run dev

# For Android
npm run android

# For iOS (requires Mac)
npm run ios
```

## Usage

### Getting Started

1. **Connect Wallet**: Open the app and connect your Solana mobile wallet
2. **Switch to Devnet**: Ensure your wallet is connected to Solana Devnet
3. **Fund Wallet**: Get some devnet SOL from a faucet if needed

### Depositing SOL

1. Navigate to the "Deposit SOL" tab
2. Enter the amount of SOL you want to deposit (max 10 SOL for safety)
3. Use quick amount buttons (0.1, 0.5, 1.0, 2.0) for convenience
4. Tap "Deposit" and confirm the transaction in your wallet
5. Your Subly balance will update automatically

### Subscribing to Services

1. Navigate to the "Services" tab
2. Browse the available subscription services
3. Review service details, pricing, and features
4. Tap "Subscribe" on your chosen service
5. Confirm the subscription in the popup
6. Approve the transaction in your wallet
7. Receive an NFT certificate for your subscription

## Technical Details

### Program Interactions

The app interacts with the Subly Solana program using:

- **Manual Transaction Building**: Creates raw instructions for the program
- **PDA Derivation**: Calculates Program Derived Addresses for accounts
- **Mobile Wallet Integration**: Uses Solana Mobile Stack for secure signing

### Account Structure

- **User Account**: Tracks deposited SOL and subscription count
- **SOL Vault**: Holds deposited SOL from all users
- **Subscription Service**: Service metadata and configuration
- **User Subscription**: Individual user subscription records

### Security Features

- **Wallet-based Authentication**: No password required
- **Transaction Signing**: All transactions signed by user's wallet
- **Program Validation**: All logic validated on-chain
- **Devnet Safety**: Limited to 10 SOL deposits for testing

## Mock Data

The app currently uses hardcoded subscription services for demonstration:

- **Netflix Protocol**: Streaming Premium ($15.99/month)
- **Spotify Protocol**: Music Premium ($9.99/month)
- **GitHub Protocol**: Developer Pro ($20.00/month)
- **Cloud Storage Protocol**: Storage Plus ($5.99/month)

## Development Notes

### Key Files

- `constants/subly-program.ts`: Program constants and mock data
- `utils/subly-program-enhanced.ts`: Enhanced program interaction utilities
- `components/subly/`: Main Subly components
- `constants/colors.ts`: Extended color palette for modern UI

### Styling

The app uses a modern gradient-based design with:

- Primary colors: Indigo (#6366f1) and Purple (#8b5cf6)
- Card-based layouts with shadows and rounded corners
- Responsive button states and loading indicators
- Theme-aware components supporting light/dark modes

## Future Enhancements

- **Real Service Integration**: Connect to actual service providers
- **Automatic Payments**: Scheduled payments from deposited SOL
- **Yield Integration**: Stake deposited SOL for yield generation
- **Push Notifications**: Payment reminders and service updates
- **Service Management**: Cancel/pause subscriptions
- **Payment History**: Transaction and subscription history

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**: Ensure you have a Solana mobile wallet installed
2. **Transaction Failed**: Check you have enough SOL for transaction fees
3. **Program Error**: Verify you're connected to Devnet and program is deployed
4. **Balance Not Updating**: Wait a few seconds and pull to refresh

### Debug Mode

Enable debug logging by setting `__DEV__` in your environment to see detailed transaction logs.

## Support

For technical issues or questions about the Subly protocol, please refer to the main project documentation or create an issue in the repository.
