const { 
  Client, 
  AccountBalanceQuery,
  AccountId, 
  PrivateKey,
  Hbar,
  LedgerId
} = require("@hashgraph/sdk");
require('dotenv').config({ path: './.env.local' });

// Import the configuration utility (adding a transpiled version for Node.js)
const path = require('path');
const fs = require('fs');

// Function to dynamically create configuration utility for Node.js
function getHederaConfig() {
  // This is a simplified version of the TypeScript utility
  function createClient(config) {
    let client;

    // Select network
    switch (config.network) {
      case 'mainnet':
        client = Client.forMainnet();
        client.setLedgerId(LedgerId.MAINNET);
        break;
      case 'testnet':
        client = Client.forTestnet();
        client.setLedgerId(LedgerId.TESTNET);
        break;
      case 'previewnet':
        client = Client.forPreviewnet();
        client.setLedgerId(LedgerId.PREVIEWNET);
        break;
      default:
        client = Client.forTestnet();
        client.setLedgerId(LedgerId.TESTNET);
    }

    // Set mirror node if provided
    if (config.mirrorNode) {
      client.setMirrorNetwork([config.mirrorNode]);
    }

    // Set operator account
    const operatorId = AccountId.fromString(config.operatorId);
    const operatorKey = PrivateKey.fromString(config.operatorKey);
    client.setOperator(operatorId, operatorKey);

    // Configure client parameters
    client.setDefaultMaxTransactionFee(new Hbar(config.maxTransactionFee));
    client.setDefaultMaxQueryPayment(new Hbar(config.maxQueryPayment));

    // Set network resilience parameters - only use methods available in current SDK version
    client.setMaxNodeAttempts(5);
    client.setRequestTimeout(15000);

    // These methods may not exist in older SDK versions
    if (typeof client.setMinBackoff === 'function') {
      client.setMinBackoff(250);
    }
    if (typeof client.setMaxBackoff === 'function') {
      client.setMaxBackoff(8000);
    }
    // Skip setMinNodeReadmitTime as it may not be available
    if (typeof client.setTransportSecurity === 'function') {
      client.setTransportSecurity(true);
    }

    return client;
  }

  function createClientFromEnv() {
    const networkType = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet').toLowerCase();
    const operatorId = process.env.NEXT_PUBLIC_MY_ACCOUNT_ID;
    const operatorKey = process.env.NEXT_PUBLIC_MY_PRIVATE_KEY;
    const mirrorNode = process.env.NEXT_PUBLIC_MIRROR_NODE;

    if (!operatorId || !operatorKey) {
      throw new Error('Environment variables for Hedera client not set (NEXT_PUBLIC_MY_ACCOUNT_ID, NEXT_PUBLIC_MY_PRIVATE_KEY)');
    }

    // Default configurations
    const DEFAULT_CONFIGS = {
      mainnet: {
        network: 'mainnet',
        mirrorNode: 'mainnet-public.mirrornode.hedera.com:443',
        maxTransactionFee: 5,
        maxQueryPayment: 2
      },
      testnet: {
        network: 'testnet',
        maxTransactionFee: 5,
        maxQueryPayment: 2
      },
      previewnet: {
        network: 'previewnet',
        maxTransactionFee: 5,
        maxQueryPayment: 2
      }
    };

    // Get default config for this network type
    const defaultConfig = DEFAULT_CONFIGS[networkType] || DEFAULT_CONFIGS.testnet;

    // Create final config
    const config = {
      network: defaultConfig.network,
      operatorId,
      operatorKey,
      maxTransactionFee: defaultConfig.maxTransactionFee || 1,
      maxQueryPayment: defaultConfig.maxQueryPayment || 1,
      mirrorNode: mirrorNode || defaultConfig.mirrorNode
    };

    return createClient(config);
  }

  return { createClientFromEnv };
}

async function testConnection() {
  console.log("Testing connection to Hedera network...");
  
  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_MY_ACCOUNT_ID || !process.env.NEXT_PUBLIC_MY_PRIVATE_KEY) {
    throw new Error("Environment variables NEXT_PUBLIC_MY_ACCOUNT_ID and NEXT_PUBLIC_MY_PRIVATE_KEY must be set");
  }

  try {
    // Get the config utility and create a client
    const { createClientFromEnv } = getHederaConfig();
    const client = createClientFromEnv();

    console.log(`Using account: ${process.env.NEXT_PUBLIC_MY_ACCOUNT_ID}`);
    console.log(`Network: ${process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}`);

    // Simple query to test connectivity
    console.log("Checking account balance...");
    const balance = await new AccountBalanceQuery()
      .setAccountId(process.env.NEXT_PUBLIC_MY_ACCOUNT_ID)
      .execute(client);
    
    console.log(`Account balance: ${balance.hbars.toString()}`);
    console.log("✅ Connection to Hedera network successful!");
    
    return true;
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    console.error("Error details:", error.message);
    return false;
  }
}

// Execute the script if called directly
if (require.main === module) {
  testConnection()
    .then(success => {
      if (success) {
        console.log("Connection test passed!");
        process.exit(0);
      } else {
        console.error("Connection test failed!");
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  testConnection
}; 