# Hedera Client Usage in Tajiri

This document explains how to use and configure the Hedera client in the Tajiri application.

## Overview

The Tajiri application uses the Hedera JavaScript SDK to interact with the Hedera network. The client setup is centralized in the `hederaConfig.ts` utility and the `hederaService.ts` service, providing a consistent and optimized way to connect to the Hedera network.

## Configuration

### Environment Variables

The Hedera client is configured using the following environment variables in `.env.local`:

```
# Hedera Network Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet  # Options: mainnet, testnet, previewnet
NEXT_PUBLIC_MY_ACCOUNT_ID=0.0.xxxxx  # Your Hedera account ID
NEXT_PUBLIC_MY_PRIVATE_KEY=302e020100xxxxx  # Your private key
NEXT_PUBLIC_MIRROR_NODE=testnet.mirrornode.hedera.com:443  # Optional custom mirror node
```

### Client Configuration Options

The client is configured with optimal settings for each network type:

- **Default Max Transaction Fee**: 5 HBAR (configurable)
- **Default Max Query Payment**: 2 HBAR (configurable)
- **Request Timeout**: 15 seconds
- **Min/Max Backoff**: 250ms-8000ms for retry operations
- **Node Attempts**: 5 retries per node before considering it unavailable
- **Transport Security**: Enabled for secure communications

## Using the Hedera Client

### Basic Usage

The simplest way to use the Hedera client is through the `hederaService`:

```typescript
import { getClient } from '@/services/hederaService';

// Get the client
const client = getClient();

// Use the client for operations
const balance = await new AccountBalanceQuery()
  .setAccountId(accountId)
  .execute(client);
```

### Advanced Configuration

For custom client configuration, you can use the `hederaConfig` utility:

```typescript
import { createClient, HederaNetworkConfig } from '@/utils/hederaConfig';

// Define custom configuration
const customConfig: HederaNetworkConfig = {
  network: 'testnet',
  operatorId: '0.0.xxxxx',
  operatorKey: 'yourPrivateKey',
  maxTransactionFee: 10, // Higher than default
  maxQueryPayment: 3,    // Higher than default
  mirrorNode: 'custom.mirror.node:443' // Optional
};

// Create a client with custom config
const customClient = createClient(customConfig);
```

### Executing Smart Contracts

The `hederaService` provides helper functions for contract interactions:

```typescript
import { 
  queryContract, 
  executeContract 
} from '@/services/hederaService';

// Query a contract (read-only)
const result = await queryContract(
  'contractId',  // Contract ID
  'functionName', // Function to call
  params         // Optional ContractFunctionParameters
);

// Execute a contract transaction
const receipt = await executeContract(
  'contractId',   // Contract ID
  'functionName',  // Function to call
  params,         // Optional ContractFunctionParameters
  payableAmount   // Optional HBAR amount to send
);
```

## Testing Connectivity

You can test your Hedera connection using the provided script:

```bash
node scripts/test-hedera-connection.js
```

This will validate that your environment variables are correctly set up and that your account can connect to the Hedera network.

## Network Selection

The application supports multiple Hedera networks:

- **Mainnet**: Production environment (Client.forMainnet())
- **Testnet**: Test environment (Client.forTestnet())
- **Previewnet**: Preview of upcoming releases (Client.forPreviewnet())

Switch between them by changing the `NEXT_PUBLIC_HEDERA_NETWORK` environment variable.

## Best Practices

1. **Reuse Clients**: Always use the singleton pattern through `getClient()` instead of creating new clients
2. **Handle Errors**: All network operations should be wrapped in try/catch blocks
3. **Retry Logic**: Use the built-in retry logic in the `queryContract` and `executeContract` functions
4. **Cost Management**: Set appropriate transaction fees and query payments to avoid unnecessary costs
5. **Testing**: Test your Hedera setup before deploying to production

## Troubleshooting

Common issues and solutions:

- **BUSY errors**: The network is congested; retry logic will handle this automatically
- **CostQuery errors**: May indicate network issues or insufficient query payment
- **PLATFORM_TRANSACTION_NOT_CREATED**: Usually temporary, retry logic will handle this
- **Connection errors**: Check your internet connection and the network configuration

## References

- [Hedera JS SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis/sdks/javascript)
- [Hedera Mirror Node API](https://docs.hedera.com/hedera/sdks-and-apis/mirror-node-api)
- [Tajiri hederaService.ts](../src/services/hederaService.ts)
- [Tajiri hederaConfig.ts](../src/utils/hederaConfig.ts) 