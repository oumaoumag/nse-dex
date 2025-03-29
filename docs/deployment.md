# Smart Contract Deployment Process

This document provides a detailed explanation of the contract deployment process for the Tajiri platform on the Hedera network.

## Overview

The deployment process involves deploying multiple smart contracts to the Hedera testnet, handling large contract sizes through chunking, and managing environment variables for contract addresses.

## Contract Structure

The platform consists of the following smart contracts:

1. **Core Contracts**
   - `TajiriWallet`: Main wallet contract for managing user funds and transactions
   - `TajiriWalletFactory`: Factory contract for creating new wallet instances

2. **Stock Management Contracts**
   - `ManageStock`: Handles stock management operations
   - `MintStock`: Manages stock minting operations
   - `RedeemStock`: Handles stock redemption processes

3. **P2P Trading Contracts**
   - `PostOfferOnP2P`: Manages P2P trading offers
   - `DoP2PTrade`: Handles P2P trade execution
   - `SafaricomStock`: Specific implementation for Safaricom stock

## Deployment Script

The deployment process is managed by `frontend/scripts/deploy-contracts.js`, which handles:
- Contract bytecode file creation
- Chunking of large contract files
- Contract deployment with constructor parameters
- Environment variable updates
- Contract address management

### Key Components

#### 1. Contract Configuration

```javascript
const contractsToDeploy = [
  { 
    name: "TajiriWallet", 
    file: "../contracts/TajiriWallet.bin", 
    constructor: true, 
    params: ["address"] 
  },
  // ... other contracts
];
```

Each contract is configured with:
- `name`: Contract identifier
- `file`: Path to the compiled bytecode
- `constructor`: Whether the contract requires constructor parameters
- `params`: Array of required constructor parameters

#### 2. File Chunking Strategy

Large contract files are handled through a chunking mechanism:

```javascript
const MAX_CHUNK_SIZE = 6000; // Conservative size for chunks

if (bytecode.length <= MAX_CHUNK_SIZE) {
  // Single transaction deployment
} else {
  // Chunked deployment process
}
```

The chunking process:
1. Creates an empty file
2. Splits bytecode into 6KB chunks
3. Appends each chunk sequentially
4. Adds delays between chunks to avoid rate limiting

#### 3. Contract Deployment Process

For each contract:
1. Create file with bytecode (chunked if necessary)
2. Wait for file creation confirmation
3. Create contract with constructor parameters
4. Wait for contract creation confirmation
5. Store contract ID

#### 4. Environment Management

The script updates two files:
1. `contract-addresses.json`: Stores all contract IDs with timestamp
2. `.env.local`: Updates environment variables for the frontend

## Deployment Steps

1. **Preparation**
   ```bash
   cd frontend
   ```

2. **Run Deployment**
   ```bash
   node scripts/deploy-contracts.js
   ```

3. **Verify Deployment**
   - Check `contract-addresses.json` for deployed contract IDs
   - Verify `.env.local` has updated environment variables

## Contract IDs

After successful deployment, the following contract IDs are generated:
- `NEXT_PUBLIC_FACTORY_CONTRACT_ID`: Factory contract address
- `NEXT_PUBLIC_WALLET_CONTRACT_ID`: Main wallet contract address
- `NEXT_PUBLIC_MANAGE_STOCK_CONTRACT_ID`: Stock management contract
- `NEXT_PUBLIC_MINT_STOCK_CONTRACT_ID`: Stock minting contract
- `NEXT_PUBLIC_REDEEM_STOCK_CONTRACT_ID`: Stock redemption contract
- `NEXT_PUBLIC_P2P_OFFERS_CONTRACT_ID`: P2P offers contract
- `NEXT_PUBLIC_P2P_TRADE_CONTRACT_ID`: P2P trading contract

## Error Handling

The deployment script includes comprehensive error handling:
- Retries for failed transactions (up to 3 attempts)
- Exponential backoff between retries
- Detailed error logging
- Balance checks before deployment

## Network Configuration

The deployment uses the following network settings:
- Network: Hedera Testnet
- Account ID: Specified in `.env.local`
- Transaction fees: 2 HBAR per transaction
- Gas limit: 8,000,000 units
- Request timeout: 30 seconds

## Best Practices

1. **File Size Management**
   - Break large contracts into smaller chunks
   - Use conservative chunk sizes (6KB)
   - Add delays between chunk uploads

2. **Transaction Management**
   - Set appropriate gas limits
   - Use sufficient transaction fees
   - Implement retry mechanisms

3. **Environment Management**
   - Keep contract addresses in version control
   - Maintain separate development and production configurations
   - Document all environment variables

## Troubleshooting

Common issues and solutions:

1. **UNKNOWN Error**
   - Increase transaction fees
   - Implement chunking for large files
   - Add delays between transactions

2. **File Creation Failures**
   - Check account balance
   - Verify file permissions
   - Ensure correct file paths

3. **Contract Deployment Failures**
   - Verify constructor parameters
   - Check gas limits
   - Ensure sufficient HBAR balance

## Security Considerations

1. **Private Key Management**
   - Store private keys securely in `.env.local`
   - Never commit private keys to version control
   - Use environment variables for sensitive data

2. **Contract Verification**
   - Verify contract bytecode before deployment
   - Test contracts on testnet before mainnet
   - Keep deployment logs for audit purposes

## Maintenance

Regular maintenance tasks:
1. Monitor contract deployments
2. Update contract addresses in documentation
3. Verify environment variables
4. Check account balances
5. Review deployment logs

## References

- [Hedera Documentation](https://docs.hedera.com/)
- [Hedera SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
- [Smart Contract Development Guide](https://docs.hedera.com/hedera/sdks-and-apis/sdks/smart-contracts) 