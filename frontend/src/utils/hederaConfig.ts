/**
 * hederaConfig.ts
 * 
 * Utility functions and configuration options for Hedera client setup.
 * This file centralizes Hedera network configuration for the application.
 */

import {
    Client,
    AccountId,
    PrivateKey,
    Hbar,
    LedgerId
} from '@hashgraph/sdk';

/**
 * Network configuration type
 */
export type HederaNetworkConfig = {
    network: 'mainnet' | 'testnet' | 'previewnet' | 'local';
    mirrorNode?: string;
    operatorId: string;
    operatorKey: string;
    maxTransactionFee: number; // in HBAR
    maxQueryPayment: number;   // in HBAR
};

/**
 * Default configuration for different environments
 */
export const DEFAULT_CONFIGS: Record<string, Partial<HederaNetworkConfig>> = {
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
    },
    local: {
        network: 'local',
        maxTransactionFee: 10,
        maxQueryPayment: 5
    }
};

/**
 * Creates a properly configured Hedera client based on provided configuration
 * @param config The network configuration
 * @returns Initialized Hedera client
 */
export function createClient(config: HederaNetworkConfig): Client {
    let client: Client;

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
        case 'local':
            // For local development with a private network
            const nodes = process.env.NEXT_PUBLIC_LOCAL_NODES
                ? JSON.parse(process.env.NEXT_PUBLIC_LOCAL_NODES)
                : {};
            client = Client.forNetwork(nodes);
            break;
        default:
            throw new Error(`Unsupported network type: ${config.network}`);
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

    // Set network resilience parameters - with compatibility check
    client.setMaxNodeAttempts(5);
    client.setRequestTimeout(15000);

    // These methods may not exist in older SDK versions - check before using
    const safelySetMethod = (methodName: string, value: any) => {
        if (typeof (client as any)[methodName] === 'function') {
            (client as any)[methodName](value);
        }
    };

    // Apply settings that might not be available in all SDK versions
    safelySetMethod('setMinBackoff', 250);
    safelySetMethod('setMaxBackoff', 8000);
    safelySetMethod('setMinNodeReadmitTime', 5000);
    safelySetMethod('setMaxNodeReadmitTime', 60000);
    safelySetMethod('setTransportSecurity', true);

    return client;
}

/**
 * Creates a client from environment variables
 * @returns Configured Hedera client
 */
export function createClientFromEnv(): Client {
    const networkType = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet').toLowerCase();
    const operatorId = process.env.NEXT_PUBLIC_MY_ACCOUNT_ID;
    const operatorKey = process.env.NEXT_PUBLIC_MY_PRIVATE_KEY;
    const mirrorNode = process.env.NEXT_PUBLIC_MIRROR_NODE;

    if (!operatorId || !operatorKey) {
        throw new Error('Environment variables for Hedera client not set (NEXT_PUBLIC_MY_ACCOUNT_ID, NEXT_PUBLIC_MY_PRIVATE_KEY)');
    }

    // Get default config for this network type
    const defaultConfig = DEFAULT_CONFIGS[networkType] || DEFAULT_CONFIGS.testnet;

    // Create final config
    const config: HederaNetworkConfig = {
        network: defaultConfig.network as 'mainnet' | 'testnet' | 'previewnet' | 'local',
        operatorId,
        operatorKey,
        maxTransactionFee: defaultConfig.maxTransactionFee || 1,
        maxQueryPayment: defaultConfig.maxQueryPayment || 1,
        mirrorNode: mirrorNode || defaultConfig.mirrorNode
    };

    return createClient(config);
}

/**
 * Gets the LedgerId for a given network type
 * @param network The network name
 * @returns The corresponding LedgerId
 */
export function getLedgerId(network: string): LedgerId {
    switch (network.toLowerCase()) {
        case 'mainnet':
            return LedgerId.MAINNET;
        case 'testnet':
            return LedgerId.TESTNET;
        case 'previewnet':
            return LedgerId.PREVIEWNET;
        default:
            // Return testnet as default
            return LedgerId.TESTNET;
    }
}

/**
 * Maps a network name to Client creation method
 * @param network The network name
 * @returns The client factory function for that network
 */
export function getClientFactory(network: string): () => Client {
    switch (network.toLowerCase()) {
        case 'mainnet':
            return Client.forMainnet;
        case 'testnet':
            return Client.forTestnet;
        case 'previewnet':
            return Client.forPreviewnet;
        default:
            // Return testnet as default
            return Client.forTestnet;
    }
} 