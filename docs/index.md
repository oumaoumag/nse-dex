# Tajiri Platform Documentation

## Overview

Welcome to the Tajiri platform documentation. This comprehensive guide covers all aspects of the Tajiri decentralized finance platform, from smart contract architecture to frontend implementation details. This documentation is designed to help developers understand the system architecture, facilitate maintenance, and enable future enhancements.

## Documentation Structure

The documentation is organized into the following sections:

### Smart Contracts

- [00-Overview](contracts/00-Overview.md): High-level overview of the smart contract architecture
- [01-TajiriToken](contracts/01-TajiriToken.md): Details of the platform's native token implementation
- [02-StockMarketplace](contracts/02-StockMarketplace.md): Tokenized stock trading functionality
- [03-P2PTrading](contracts/03-P2PTrading.md): Peer-to-peer trading implementation
- [04-SmartWallet](contracts/04-SmartWallet.md): Smart wallet architecture and features
- [05-LendingSystem](contracts/05-LendingSystem.md): Decentralized lending platform details

### Frontend

- [00-Overview](frontend/00-Overview.md): High-level overview of the frontend architecture
- [01-Authentication](frontend/01-Authentication.md): Authentication system implementation
- [02-WalletSystem](frontend/02-WalletSystem.md): Wallet integration and management
- [03-StockTrading](frontend/03-StockTrading.md): Stock trading user interface and logic
- [04-P2PTrading](frontend/04-P2PTrading.md): Peer-to-peer trading user interface and logic
- [05-LendingSystem](frontend/05-LendingSystem.md): Lending platform user interface and logic
- [06-PortfolioManagement](frontend/06-PortfolioManagement.md): Portfolio tracking and management
- [07-ErrorHandling](frontend/07-ErrorHandling.md): Application-wide error handling system
- [08-UIComponentSystem](frontend/08-UIComponentSystem.md): Reusable UI component architecture

### API and Integration

- [00-Overview](api/00-Overview.md): API architecture and design principles
- [01-Endpoints](api/01-Endpoints.md): Detailed API endpoint documentation
- [02-MirrorNode](api/02-MirrorNode.md): Integration with Hedera mirror nodes
- [03-PriceFeed](api/03-PriceFeed.md): Price data integration and oracle usage

### Deployment and DevOps

- [00-Overview](devops/00-Overview.md): Deployment architecture overview
- [01-Infrastructure](devops/01-Infrastructure.md): Cloud infrastructure configuration
- [02-CI-CD](devops/02-CI-CD.md): Continuous integration and deployment pipeline
- [03-Monitoring](devops/03-Monitoring.md): Application monitoring and alerting

## Getting Started

### Development Environment Setup

To set up your development environment for the Tajiri platform:

1. Clone the repository:
   ```bash
   git clone https://github.com/tajiri/tajiri-platform.git
   cd tajiri-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with appropriate values
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Key Environment Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_NETWORK` | Hedera network to connect to | `testnet` or `mainnet` |
| `NEXT_PUBLIC_OPERATOR_ID` | Hedera account ID for operator | `0.0.123456` |
| `NEXT_PUBLIC_OPERATOR_KEY` | Private key for operator account | (private key) |
| `NEXT_PUBLIC_STOCK_CONTRACT_ID` | Contract ID for stock marketplace | `0.0.234567` |
| `NEXT_PUBLIC_P2P_CONTRACT_ID` | Contract ID for P2P trading | `0.0.345678` |
| `NEXT_PUBLIC_LENDING_CONTRACT_ID` | Contract ID for lending system | `0.0.456789` |
| `NEXT_PUBLIC_WALLET_FACTORY_ID` | Contract ID for wallet factory | `0.0.567890` |
| `NEXT_AUTH_SECRET` | Secret for NextAuth authentication | (random string) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | (client ID) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | (client secret) |

## Architecture Overview

The Tajiri platform is built on the following technology stack:

- **Blockchain**: Hedera Hashgraph (smart contracts, tokens, and consensus)
- **Frontend**: Next.js with TypeScript, Tailwind CSS, and React
- **Authentication**: NextAuth.js with Google OAuth
- **State Management**: React Context API with custom hooks
- **API Integration**: Custom REST API clients and Hedera SDK
- **Testing**: Jest and React Testing Library
- **CI/CD**: GitHub Actions with automated testing and deployment

The architecture follows these key design principles:

1. **Decentralization**: Core platform functionality operates on the Hedera blockchain
2. **Security**: Smart contract security, secure authentication, and data protection
3. **Modularity**: Separation of concerns with modular components
4. **Scalability**: Efficient blockchain operations and optimized frontend
5. **User Experience**: Intuitive interface with responsive design

## Contributing

When contributing to the Tajiri platform, please:

1. Follow the established code style and architecture patterns
2. Add tests for new functionality
3. Update documentation for your changes
4. Submit a pull request with a clear description of your changes

## Support and Contact

For technical support or questions about the platform, please contact:

- Technical Support: support@tajiri.io
- Development Team: dev@tajiri.io

## License

The Tajiri platform is licensed under the [MIT License](https://opensource.org/licenses/MIT). 