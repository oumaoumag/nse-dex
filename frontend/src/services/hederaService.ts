// Let's avoid directly importing from @hashgraph/sdk to prevent browser issues
// const { Client, ContractId, ... } = require('@hashgraph/sdk');

// Mock implementation of ContractFunctionResult for demo mode
export class MockContractFunctionResult {
    private bytes: Uint8Array;

    constructor(bytes: Uint8Array) {
        this.bytes = bytes;
    }

    getString(index: number): string {
        return `MockString_${index}`;
    }

    getAddress(index: number): string {
        return `0x${Array.from(Array(40)).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    }

    getUint256(index: number): bigint {
        return BigInt(Math.floor(Math.random() * 1000000));
    }

    getUint32(index: number): number {
        return Math.floor(Math.random() * 1000);
    }

    getInt64(index: number): bigint {
        return BigInt(Math.floor(Math.random() * 1000000));
    }

    getBool(index: number): boolean {
        return Math.random() > 0.5;
    }
}

/**
 * Creates a client for interacting with Hedera network
 * @returns A client object
 */
export function createClient() {
    // For demo purposes, return a mock client
    return {
        contractExecute: async (contractId: string, functionName: string, params: any[]) => {
            console.log(`Mock executing contract ${contractId}.${functionName}(${params.join(', ')})`);
            return {
                receipt: {
                    logs: [{ data: '1234' }],
                    status: 'SUCCESS'
                }
            };
        },
        contractCall: async (contractId: string, functionName: string, params: any[]) => {
            console.log(`Mock calling contract ${contractId}.${functionName}(${params.join(', ')})`);
            // Return mock data based on function name
            if (functionName === 'getLoanDetails') {
                return {
                    id: params[0],
                    creator: '0x1234567890abcdef',
                    offerType: 0,
                    stablecoinAddress: '0xUSDC12345',
                    loanAmount: '1000000000',
                    interestRate: 500, // 5.00%
                    duration: 30,
                    collateralTokenAddress: '0xCOLLATERAL12345',
                    collateralAmount: '500000000',
                    createdAt: Date.now() - 86400000,
                    status: 1,
                    borrower: '0x2345678901abcdef',
                    lender: '0x3456789012abcdef',
                    startTime: Date.now() - 86400000,
                    endTime: Date.now() + 86400000 * 29,
                    repaidAmount: '100000000',
                    collateralLocked: true
                };
            } else if (functionName === 'getUserActiveLoans') {
                return [1, 2, 3];
            } else if (functionName === 'calculateTotalDue') {
                return '1050000000'; // Principal + interest
            }
            return null;
        }
    };
}

/**
 * Query a smart contract
 */
export async function queryContract(
    contractId: string,
    functionName: string,
    params: any[] = [],
    gasLimit = 100000
): Promise<any> {
    if (typeof window !== 'undefined') {
        // For browser/demo mode, return mock data
        console.log(`Demo: Querying contract ${contractId}.${functionName}`);

        // Create a mock result
        const mockBytes = new Uint8Array(32);
        return new MockContractFunctionResult(mockBytes);
    }

    console.log(`Querying contract ${contractId}.${functionName}`);
    const client = createClient();

    try {
        return await client.contractCall(contractId, functionName, params);
    } catch (err) {
        console.warn(`Contract query failed: ${err}`);
        // Return a mock result on failure
        const mockBytes = new Uint8Array(32);
        return new MockContractFunctionResult(mockBytes);
    }
}

// Mock implementations for demo mode
export function getClient() {
    if (typeof window !== 'undefined') {
        console.log('Using demo client for browser');
        return createClient();
    }

    console.warn('No client available');
    return createClient();
}

export function getOperatorAccountId() {
    // Return a mock implementation for demo mode
    return {
        toString: () => '0.0.12345'
    };
}

export function getOperatorPrivateKey() {
    // Return a mock implementation for demo mode
    return {
        toString: () => 'mock-private-key',
        sign: (message: Uint8Array) => new Uint8Array(64),
    };
}

/**
 * Get the balance of a contract
 */
export async function getContractBalance(contractId: string): Promise<string> {
    // For browser/demo mode, return a mock balance
    if (typeof window !== 'undefined') {
        console.log(`Demo: Getting balance for contract ${contractId}`);
        return "100.00";
    }

    try {
        const client = createClient();
        if (!client) {
            console.warn("Hedera client not initialized");
            return "0.00";
        }

        // For demo purposes, always return a mock balance
        return "100.00";
    } catch (err) {
        console.warn(`Failed to get contract balance: ${err}`);
        return "0.00";
    }
}

/**
 * Get the balance of an account
 */
export async function getAccountBalance(accountId: string): Promise<string> {
    // For browser/demo mode, return a mock balance
    if (typeof window !== 'undefined') {
        console.log(`Demo: Getting balance for account ${accountId}`);
        return "100.00";
    }

    try {
        // For demo purposes, always return a mock balance
        return "100.00";
    } catch (err) {
        console.warn(`Failed to get account balance: ${err}`);
        return "0.00";
    }
}

/**
 * Execute a smart contract transaction
 * @param contractId Contract to execute
 * @param functionName Function to call
 * @param params Optional parameters
 * @param gas Optional gas limit
 * @returns Transaction receipt or null in demo mode
 */
export async function executeContractTransaction(
    contractId: string,
    functionName: string,
    params?: any[],
    gas?: number,
    maxAttempts: number = 5
): Promise<any> {
    // For browser/demo mode, return mock success
    if (typeof window !== 'undefined') {
        console.log(`Demo: Executing contract ${contractId}.${functionName}`);
        return {
            status: "SUCCESS"
        };
    }

    console.log(`Executing contract ${contractId}.${functionName}`);
    const client = createClient();

    try {
        return await client.contractExecute(contractId, functionName, params || []);
    } catch (err) {
        console.warn(`Contract execution failed: ${err}`);
        // Return a mock result on failure
        return {
            status: "FAILURE"
        };
    }
}

/**
 * Verify that the client has valid operator credentials
 */
export function verifyClientOperator(client: any): boolean {
    // For demo mode, always return true
    return true;
}

/**
 * Test network connectivity by attempting to query the network
 */
export async function testNetworkConnectivity(client?: any, maxAttempts: number = 3): Promise<boolean> {
    // For demo mode, always return true
    return true;
}

/**
 * Ensures the client is properly initialized and ready for use
 * @returns Verified client
 */
export async function getVerifiedClient(): Promise<any> {
    return createClient();
}

/**
 * Converts a string to a bytes32 representation
 * @param functionName The string to convert
 * @returns The bytes32 representation
 */
export function stringToBytes32(functionName: string): string {
    // Convert the function name to hex and pad to 32 bytes
    let hex = '';
    for (let i = 0; i < functionName.length; i++) {
        const code = functionName.charCodeAt(i);
        const n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
    }

    // Pad to 64 characters (32 bytes)
    hex = hex.padEnd(64, '0');

    return '0x' + hex;
}

/**
 * Converts a string to a ContractId object with better error handling
 * @param id The ID string
 * @returns The ContractId object or null if conversion fails
 */
export function getContractId(id: string): any {
    // In browser, return mock ContractId
    return {
        toString: () => id,
        toSolidityAddress: () => id.startsWith('0x') ? id : `0x${id.replace(/\./g, '')}`,
    };
}

/**
 * Alias for executeContractTransaction for backward compatibility
 * @param contractId Contract to interact with
 * @param functionName Function to call
 * @param params Optional parameters
 * @param gas Optional gas limit
 * @returns Transaction receipt or null in demo mode
 */
export const executeContract = executeContractTransaction; 