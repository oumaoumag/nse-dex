# Tajiri v2 - Smart Wallet Platform

Tajiri is a smart wallet platform built on the Hedera network that enables users to create and manage smart contract wallets with advanced features like batched transactions, gasless transactions (fee abstraction), and social recovery.

## Features

- **Smart Wallet Creation**: Create a smart contract wallet that gives you advanced functionality beyond standard accounts
- **Batched Transactions**: Execute multiple transactions in a single operation to save time and gas
- **Gasless Transactions**: Execute transactions without paying gas fees (relayer pays on your behalf)
- **Social Recovery**: Add guardians who can help you recover access to your wallet if you lose your private key
- **Token Management**: Associate, transfer, and manage Hedera tokens with ease

## Project Structure

The project is divided into two main parts:

- **Frontend** (`/frontend`): Next.js web application
- **Contracts** (`/contracts`): Solidity smart contracts

### Frontend Directory Structure

- `/src/components`: React components
- `/src/contexts`: React contexts for state management
- `/src/services`: Services for interacting with Hedera and contracts
- `/src/utils`: Utility functions
- `/src/app`: Next.js application and page routes

### Smart Contracts

- `SmartWallet.sol`: The main smart wallet contract
- `SmartWalletFactory.sol`: Factory contract for deploying new smart wallets
- `ISmartWallet.sol`: Interface for smart walletp

## Setup and Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Hedera testnet account and private key

### Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_MY_ACCOUNT_ID=your-account-id
NEXT_PUBLIC_MY_PRIVATE_KEY=your-private-key
NEXT_PUBLIC_FACTORY_CONTRACT_ID=your-factory-contract-id
NEXT_PUBLIC_RELAYER_URL=your-relayer-url
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tajiri-v2.git
   cd tajiri-v2
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Deploying Smart Contracts

1. Install contract dependencies:
   ```bash
   cd contracts
   npm install
   ```

2. Compile the contracts:
   ```bash
   npx hardhat compile
   ```

3. Deploy to Hedera testnet:
   ```bash
   npx hardhat run scripts/deploy.js --network testnet
   ```

## Relayer Setup

The relayer is a service that enables gasless transactions. It verifies user signatures and submits transactions on their behalf.

1. Set up your relayer environment variables in `.env.local`:
   ```
   RELAYER_ACCOUNT_ID=your-relayer-account-id
   RELAYER_PRIVATE_KEY=your-relayer-private-key
   ```

2. The API route for the relayer is defined in `frontend/src/app/api/relayer/route.ts`

## Usage

1. Connect your wallet
2. Create a smart wallet if you don't have one
3. Use the various features:
   - Execute transactions from your smart wallet
   - Add guardians for social recovery
   - Batch multiple transactions
   - Execute gasless transactions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
