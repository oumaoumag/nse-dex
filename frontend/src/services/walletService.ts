import * as hederaService from './hederaService';
import { signTransaction } from '../utils/signatureUtils';
import { encodeFunctionCall } from '../utils/contractUtils';
import { formatAddressForContract, thirdPartyIdToEvmAddress } from '../utils/addressUtils';
import axios from 'axios';

// Smart Wallet Factory contract address
const SMART_WALLET_FACTORY = process.env.NEXT_PUBLIC_SMART_WALLET_FACTORY_ADDRESS || '0.0.1234567';

// Get exchange rate from oracle contract
const EXCHANGE_RATE_ORACLE = process.env.NEXT_PUBLIC_EXCHANGE_RATE_ORACLE_ADDRESS || '0.0.1234568';

/**
 * Finds a smart wallet for the specified account owner
 * @param accountId Account ID to find wallet for
 * @returns Contract ID of the wallet or null if not found
 */
export async function findSmartWalletForOwner(accountId: string): Promise<string | null> {
    try {
        // Convert the account ID to an EVM-compatible address
        const evmFormattedAddress = thirdPartyIdToEvmAddress(accountId);

        console.log(`Looking for wallet with formatted address: ${evmFormattedAddress}`);

        // Query the factory contract to find the wallet address
        const result = await hederaService.queryContract(
            SMART_WALLET_FACTORY,
            "getWalletForOwner",
            [evmFormattedAddress]
        );

        // Extract address from result
        const address = result.getAddress(0);

        if (address && address !== '0x0000000000000000000000000000000000000000') {
            return address;
        }

        return null;
    } catch (err) {
        console.error('Error finding wallet:', err);
        return null;
    }
}

/**
 * Creates a smart wallet for the specified account
 * @param accountId Account ID to create wallet for
 * @returns Contract ID of the new wallet
 */
export async function createSmartWallet(accountId: string): Promise<string> {
    try {
        // Convert the account ID to an EVM-compatible address
        const evmFormattedAddress = thirdPartyIdToEvmAddress(accountId);

        console.log(`Creating wallet with formatted address: ${evmFormattedAddress}`);

        // First check if wallet already exists
        const existingWallet = await findSmartWalletForOwner(accountId);

        if (existingWallet) {
            console.log("Smart wallet already exists for owner:", existingWallet);
            return existingWallet;
        }

        // Create parameters for wallet creation
        const params = [evmFormattedAddress]; // Owner address properly formatted for EVM

        // Call the factory to create a new wallet
        const receipt = await hederaService.executeContractTransaction(
            SMART_WALLET_FACTORY,
            "createWallet",
            params
        );

        console.log("Created new smart wallet with receipt:", receipt);

        // Mock wallet address for demo
        const newWalletAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
        console.log("Created new smart wallet:", newWalletAddress);

        return newWalletAddress;
    } catch (err: any) {
        console.error("Error creating smart wallet:", err);
        throw new Error(`Failed to create smart wallet: ${err.message}`);
    }
}

/**
 * Funds a newly created wallet with a small amount of HBAR
 * @param walletAddress The address of the wallet to fund
 */
const fundNewWallet = async (walletAddress: string): Promise<void> => {
    try {
        console.log(`Mock funding new wallet ${walletAddress} with 0.5 HBAR`);
    } catch (err) {
        console.error("Error funding new wallet:", err);
        // Failure to fund shouldn't prevent wallet creation
    }
};

/**
 * Executes a transaction through the smart wallet
 * @param walletId The ID of the smart wallet
 * @param targetContract The contract to interact with
 * @param functionName The function to call
 * @param params The parameters to pass
 * @param value The amount of HBAR to send (in tiny bars)
 * @returns The transaction receipt
 */
export const executeTransaction = async (
    walletId: string,
    targetContract: string,
    functionName: string,
    params: any[] = [],
    value: number = 0
): Promise<any> => {
    try {
        console.log(`Executing transaction through wallet ${walletId} to ${targetContract}.${functionName}`);

        // For demo purposes, we'll just return a successful receipt
        return {
            status: "SUCCESS",
            transactionId: `mock-tx-${Date.now()}`
        };
    } catch (err) {
        console.error("Error executing transaction through wallet:", err);
        throw err;
    }
};

/**
 * Executes multiple transactions in a batch through the smart wallet
 */
export const executeBatchedTransactions = async (
    smartWalletId: string,
    transactions: Array<{
        targetContract: string;
        functionName: string;
        params: any[];
        value: number;
    }>
): Promise<any> => {
    console.log(`Executing batched transactions through wallet ${smartWalletId}`);

    // For demo purposes, we'll just return a successful receipt
    return {
        status: "SUCCESS",
        transactionId: `mock-batch-tx-${Date.now()}`
    };
}

/**
 * Executes a transaction through the relayer service
 * @param accountId User's account ID
 * @param smartWalletId Smart wallet contract ID
 * @param privateKey User's private key for signing
 * @param targetContract Target contract for execution
 * @param functionName Function to call
 * @param params Parameters for the function
 * @param value HBAR amount to send
 * @returns Transaction response
 */
export async function executeGaslessTransaction(
    accountId: string,
    smartWalletId: string | null,
    privateKey: string,
    targetContract: string,
    functionName: string,
    params: any[],
    value: number = 0
): Promise<any> {
    if (!smartWalletId) {
        throw new Error('No smart wallet ID provided');
    }

    const transactionData = {
        accountId,
        smartWalletId,
        targetContract,
        functionName,
        params,
        value,
        timestamp: Date.now()
    };

    // Sign the transaction data
    const signature = signTransaction(transactionData, privateKey);

    // Add signature to the request payload
    const signedTransactionData = {
        ...transactionData,
        signature
    };

    // Send the transaction to the relayer service
    const relayerResponse = await axios.post(
        '/api/relayer',
        signedTransactionData,
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );

    const { success, error } = relayerResponse.data;

    if (!success) {
        throw new Error(`Relayer error: ${error}`);
    }

    return relayerResponse.data;
}

/**
 * Adds a guardian to the smart wallet
 * @param walletId The ID of the smart wallet
 * @param guardianAddress The address to add as a guardian
 */
export async function addGuardian(smartWalletId: string, guardianAddress: string) {
    console.log(`Adding guardian ${guardianAddress} to wallet ${smartWalletId}`);
    return hederaService.executeContractTransaction(smartWalletId, "addGuardian", [guardianAddress]);
}

/**
 * Removes a guardian from the smart wallet
 * @param walletId The ID of the smart wallet
 * @param guardianAddress The address to remove as a guardian
 */
export async function removeGuardian(smartWalletId: string, guardianAddress: string) {
    console.log(`Removing guardian ${guardianAddress} from wallet ${smartWalletId}`);
    return hederaService.executeContractTransaction(smartWalletId, "removeGuardian", [guardianAddress]);
}

/**
 * Get guardians for a smart wallet
 * @param walletId The ID of the smart wallet
 * @returns An array of guardian addresses
 */
export const getGuardians = async (walletId: string): Promise<string[]> => {
    try {
        console.log(`Getting guardians for wallet ${walletId}`);
        // Return mock guardians for demo
        return [
            "0x1234567890123456789012345678901234567890",
            "0x2345678901234567890123456789012345678901"
        ];
    } catch (err) {
        console.error('Failed to fetch guardians:', err);
        return [];
    }
};

/**
 * Get recovery status for a smart wallet
 * @param walletId The ID of the smart wallet
 * @returns The recovery status
 */
export const getRecoveryStatus = async (walletId: string): Promise<{
    inProgress: boolean;
    initiator: string | null;
    proposedOwner: string | null;
}> => {
    try {
        console.log(`Getting recovery status for wallet ${walletId}`);

        // Return mock recovery status for demo
        return {
            inProgress: false,
            initiator: null,
            proposedOwner: null
        };
    } catch (err) {
        console.error('Failed to check recovery status:', err);
        return {
            inProgress: false,
            initiator: null,
            proposedOwner: null
        };
    }
};

/**
 * Initiate recovery for a smart wallet
 * @param walletId The ID of the smart wallet
 * @param newOwnerAddress The address of the new owner
 */
export const initiateRecovery = async (walletId: string, newOwnerAddress: string): Promise<void> => {
    console.log(`Initiating recovery for wallet ${walletId} with new owner ${newOwnerAddress}`);
    await hederaService.executeContractTransaction(walletId, "initiateRecovery", [newOwnerAddress]);
};

/**
 * Approve recovery for a smart wallet
 * @param walletId The ID of the smart wallet
 * @param newOwnerAddress The address of the new owner
 */
export const approveRecovery = async (walletId: string, newOwnerAddress: string): Promise<void> => {
    console.log(`Approving recovery for wallet ${walletId} with new owner ${newOwnerAddress}`);
    await hederaService.executeContractTransaction(walletId, "approveRecovery", [newOwnerAddress]);
};

/**
 * Cancel recovery for a smart wallet
 * @param walletId The ID of the smart wallet
 */
export const cancelRecovery = async (walletId: string): Promise<void> => {
    console.log(`Canceling recovery for wallet ${walletId}`);
    await hederaService.executeContractTransaction(walletId, "cancelRecovery", []);
};

/**
 * Get token balance for a smart wallet
 * @param walletId The ID of the smart wallet
 * @param tokenId The ID of the token
 * @returns The token balance
 */
export const getTokenBalance = async (walletId: string, tokenId: string): Promise<string> => {
    try {
        console.log(`Getting token balance for wallet ${walletId} and token ${tokenId}`);
        return "100.00"; // Mock balance
    } catch (err) {
        console.error('Failed to get token balance:', err);
        return "0";
    }
};

/**
 * Associate a token with a smart wallet
 * @param walletId The ID of the smart wallet
 * @param tokenId The ID of the token
 */
export const associateToken = async (walletId: string, tokenId: string): Promise<void> => {
    console.log(`Associating token ${tokenId} with wallet ${walletId}`);
    await hederaService.executeContractTransaction(walletId, "associateToken", [tokenId]);
};

/**
 * Transfer tokens from a smart wallet
 * @param walletId The ID of the smart wallet
 * @param tokenId The ID of the token
 * @param recipientId The ID of the recipient
 * @param amount The amount to transfer
 */
export const transferToken = async (
    walletId: string,
    tokenId: string,
    recipientId: string,
    amount: number
): Promise<void> => {
    console.log(`Transferring ${amount} of token ${tokenId} from wallet ${walletId} to ${recipientId}`);
    await hederaService.executeContractTransaction(walletId, "transferToken", [tokenId, recipientId, amount]);
};

/**
 * Get HBAR exchange rate from oracle
 * @returns The exchange rate in USD
 */
export const getHbarExchangeRate = async (): Promise<number> => {
    try {
        console.log(`Getting HBAR exchange rate from oracle`);
        return 0.15; // Mock exchange rate
    } catch (err) {
        console.error('Failed to get HBAR exchange rate:', err);
        return 0;
    }
};

/**
 * Load funds to the user's wallet in demo mode
 * @param tokenType Type of token to add (HBAR, USDC, USDT)
 * @param amount Amount to add
 * @returns Success status
 */
export async function loadDemoFunds(tokenType: 'HBAR' | 'USDC' | 'USDT', amount: number): Promise<boolean> {
    // Only works in demo mode
    if (typeof window === 'undefined' || localStorage.getItem('tajiri-demo-mode') !== 'true') {
        console.warn('loadDemoFunds can only be used in demo mode');
        return false;
    }

    try {
        // Get current demo balances
        const demoBalancesJson = localStorage.getItem('tajiri-demo-balances') || '{}';
        const demoBalances = JSON.parse(demoBalancesJson);

        // Add or update balance
        if (!demoBalances[tokenType]) {
            demoBalances[tokenType] = amount.toString();
        } else {
            const currentAmount = parseFloat(demoBalances[tokenType]);
            demoBalances[tokenType] = (currentAmount + amount).toString();
        }

        // Save updated balances
        localStorage.setItem('tajiri-demo-balances', JSON.stringify(demoBalances));
        console.log(`Added ${amount} ${tokenType} to demo wallet`);
        return true;
    } catch (error) {
        console.error('Error loading demo funds:', error);
        return false;
    }
}

/**
 * Get current demo wallet balances
 * @returns Object with token balances
 */
export function getDemoBalances(): Record<string, string> {
    if (typeof window === 'undefined') {
        return {};
    }

    try {
        const demoBalancesJson = localStorage.getItem('tajiri-demo-balances') || '{}';
        return JSON.parse(demoBalancesJson);
    } catch (error) {
        console.error('Error getting demo balances:', error);
        return {};
    }
}

/**
 * Load real tokens to a wallet - only available on testnet
 * This is a placeholder that would require integration with a faucet service
 * @param tokenType Type of token (HBAR, USDC, USDT)
 * @param accountId Account ID to load
 * @returns Status of operation
 */
export async function loadRealTokens(tokenType: 'HBAR' | 'USDC' | 'USDT', accountId: string): Promise<{
    success: boolean;
    message: string;
    txId?: string;
}> {
    // Return immediately if in demo mode
    if (typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true') {
        return {
            success: false,
            message: "Cannot load real tokens in demo mode. Use loadDemoFunds instead."
        };
    }

    // Check if we're on testnet
    const networkType = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
    if (networkType !== 'testnet') {
        return {
            success: false,
            message: "Token loading is only available on testnet"
        };
    }

    try {
        // This is just a placeholder - in a real implementation, you would:
        // 1. Call a faucet service API
        // 2. Or implement token transfer from a treasury account

        // Mock implementation
        console.log(`Would load ${tokenType} to account ${accountId}`);

        // For now, just return success with a fake transaction ID
        // In a real implementation, return the actual transaction ID
        const fakeTransactionId = `0.0.${Math.floor(Math.random() * 1000000)}@${Date.now()}`;

        return {
            success: true,
            message: `Successfully requested ${tokenType} tokens for your account. They will arrive shortly.`,
            txId: fakeTransactionId
        };
    } catch (error: any) {
        console.error("Error loading real tokens:", error);
        return {
            success: false,
            message: `Failed to load tokens: ${error.message}`
        };
    }
} 