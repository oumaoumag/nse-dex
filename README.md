# Tajiri - Blockchain-Based Stock Trading Platform

Tajiri is a cutting-edge, blockchain-based financial platform designed to tokenize and trade stocks from the Nairobi Securities Exchange (NSE), with a mission to democratize wealth creation in Africa. Deployed on the Hedera blockchain, this app leverages stablecoins for transactions, incorporates account abstraction for user-friendliness, and features a modern Next.js frontend.

## Features

- **Hedera Blockchain**: Built on Hedera Hashgraph for high throughput, low fees, and enterprise-grade reliability
- **Stablecoin Trading**: Purchase and trade tokenized NSE stocks using stablecoins (USDC, USDT)
- **Account Abstraction**: Simplified blockchain interactions, making the app intuitive for all users
- **Advanced Trading Tools**: Interactive charts, technical analysis, and market data
- **Lending Protocol**: Borrow against tokenized stocks or lend stablecoins for interest
- **Educational Resources**: Comprehensive learning tools for investors of all experience levels

## Account Abstraction Implementation

Tajiri uses advanced account abstraction features to simplify user interaction with blockchain technology:

1. **Smart Contract Wallets**: Users interact with the blockchain through their personal smart contract wallet that handles transaction complexity and gas fees.

2. **Social Recovery**: Our smart wallets include guardian-based recovery, allowing users to regain access to their accounts if they lose their private keys.

3. **Gasless Transactions**: Tajiri can sponsor gas fees for certain transactions, removing the need for users to hold HBAR just for transaction fees.

4. **Batched Transactions**: Multiple actions (e.g., approve and swap) can be executed in a single transaction, reducing fees and improving UX.

5. **Enhanced Security**: Transaction authorization is more flexible, with options for multi-signature approvals and guardian-based recovery.

To deploy the smart contracts that power these features:

```bash
# In the frontend directory
npm run deploy-contracts
```

## Tech Stack

- **Frontend**: Next.js with TypeScript, Tailwind CSS
- **Blockchain**: Hedera Hashgraph with Hedera Token Service (HTS) and Smart Contract Service (HSCS)
- **Smart Contracts**: Solidity for trading and lending logic
- **Libraries**: @hashgraph/sdk, react-chartjs-2

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Hedera Testnet account (for development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/leakeyqq/tajiri-v2.git
   cd tajiri-v2
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the frontend directory with the following:
   ```
   NEXT_PUBLIC_HEDERA_NETWORK=testnet
   NEXT_PUBLIC_MY_ACCOUNT_ID=your-account-id
   NEXT_PUBLIC_MY_PRIVATE_KEY=your-private-key
   ```

4. Deploy contracts (optional, for a full development setup):
   ```bash
   npm run deploy-contracts
   ```
   
   Make sure to update the `.env.local` file with the contract IDs from the deployment.

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
tajiri-v2/
├── frontend/                  # Next.js frontend application
│   ├── src/
│   │   ├── app/               # App router pages
│   │   ├── components/        # Reusable UI components
│   │   ├── lib/               # Utility functions and libraries
│   ├── public/                # Static assets
├── contracts/                 # Solidity smart contracts (to be added)
├── README.md                  # Project documentation
```

## Roadmap

- **Q4 2024**: Launch Next.js frontend, set up Hedera Testnet environment
- **Q1 2025**: Tokenize first batch of NSE stocks, launch trading marketplace
- **Q2-Q3 2025**: Launch lending protocol, add advanced trading tools
- **Q4 2025 & Beyond**: Regional expansion, add more asset classes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For inquiries, please contact [your-email@example.com].

## Acknowledgements

- Nairobi Securities Exchange (NSE)
- Hedera Hashgraph
- All contributors and supporters of the project
