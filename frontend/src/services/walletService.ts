import {
    ContractId,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    PrivateKey,
    ContractCallQuery
} from '@hashgraph/sdk';
import { getClient, executeContract, queryContract } from './hederaService';
import { signTransaction } from '../utils/signatureUtils';
import { encodeFunctionCall } from '../utils/contractUtils';
import axios from 'axios';

/**
 * Finds a smart wallet for the specified account owner
 * @param accountId Account ID to find wallet for
 * @returns Contract ID of the wallet or null if not found
 */
export async function findSmartWalletForOwner(accountId: string): Promise<string | null> {
    const factoryContractId = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID || '';
    if (!factoryContractId) {
        throw new Error('Factory contract ID not configured');
    }

    try {
        // Query the factory contract to find the wallet address
        const result = await queryContract(
            factoryContractId,
            "getWalletForOwner",
            new ContractFunctionParameters().addString(accountId)
        );

        // Extract address from result
        const address = result.getAddress(0);

        if (address && address !== '0x0000000000000000000000000000000000000000') {
            return ContractId.fromSolidityAddress(address).toString();
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
    const factoryContractId = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID || '';
    if (!factoryContractId) {
        throw new Error('Factory contract ID not configured');
    }

    const client = getClient();

    const txResponse = await new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(factoryContractId))
        .setGas(1000000)
        .setFunction(
            "deployWallet",
            new ContractFunctionParameters().addString(accountId)
        )
        .execute(client);

    const receipt = await txResponse.getReceipt(client);

    if (!receipt.contractId) {
        throw new Error('Failed to create smart wallet: Contract ID not returned');
    }

    return receipt.contractId.toString();
}

/**
 * Executes a transaction through the smart wallet
 * @param smartWalletId Smart wallet contract ID
 * @param targetContract Target contract for execution
 * @param functionName Function to call
 * @param params Parameters for the function
 * @param value HBAR amount to send
 * @returns Transaction receipt
 */
export async function executeTransaction(
    smartWalletId: string,
    targetContract: string,
    functionName: string,
    params: any[],
    value: number = 0
): Promise<any> {
    if (!smartWalletId) {
        throw new Error('No smart wallet ID provided');
    }

    const functionCallData = encodeFunctionCall(functionName, params);

    const executeParams = new ContractFunctionParameters()
        .addAddress(targetContract)
        .addUint256(value)
        .addBytes(functionCallData);

    return executeContract(smartWalletId, "execute", executeParams, value);
}

/**
 * Executes multiple transactions in a batch through the smart wallet
 * @param smartWalletId Smart wallet contract ID
 * @param transactions Array of transactions to execute
 * @returns Transaction receipt
 */
export async function executeBatchedTransactions(
    smartWalletId: string,
    transactions: Array<{
        targetContract: string;
        functionName: string;
        params: any[];
        value: number;
    }>
): Promise<any> {
    if (!smartWalletId) {
        throw new Error('No smart wallet ID provided');
    }

    const targetContracts: string[] = transactions.map(t => t.targetContract);
    const values: number[] = transactions.map(t => t.value);
    const functionCallsData: Uint8Array[] = transactions.map(t =>
        encodeFunctionCall(t.functionName, t.params)
    );

    const totalValue = values.reduce((sum, val) => sum + val, 0);

    const batchParams = new ContractFunctionParameters()
        .addAddressArray(targetContracts)
        .addUint256Array(values.map(v => v))
        .addBytesArray(functionCallsData);

    return executeContract(smartWalletId, "executeBatch", batchParams, totalValue);
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
 * @param smartWalletId Smart wallet contract ID
 * @param guardianAddress Guardian address to add
 * @returns Transaction receipt
 */
export async function addGuardian(
    smartWalletId: string,
    guardianAddress: string
): Promise<any> {
    const params = new ContractFunctionParameters()
        .addAddress(guardianAddress);

    return executeContract(smartWalletId, "addGuardian", params);
}

/**
 * Removes a guardian from the smart wallet
 * @param smartWalletId Smart wallet contract ID
 * @param guardianAddress Guardian address to remove
 * @returns Transaction receipt
 */
export async function removeGuardian(
    smartWalletId: string,
    guardianAddress: string
): Promise<any> {
    const params = new ContractFunctionParameters()
        .addAddress(guardianAddress);

    return executeContract(smartWalletId, "removeGuardian", params);
} 