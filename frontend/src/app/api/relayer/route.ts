import { NextRequest, NextResponse } from 'next/server';
import {
    Client,
    AccountId,
    PrivateKey,
    PublicKey,
    ContractId,
    ContractExecuteTransaction,
    Hbar,
    ContractFunctionParameters
} from '@hashgraph/sdk';
import { encodeFunctionCall } from '../../../utils/contractUtils';
import { verifySignature } from '../../../utils/signatureUtils';

// Singleton Hedera client for better resource management
let hederaClient: Client | null = null;

/**
 * Retrieves or initializes the Hedera client
 * @returns Initialized Hedera client
 */
function getClient(): Client {
    if (hederaClient) return hederaClient;

    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
    const myAccountId = process.env.NEXT_PUBLIC_MY_ACCOUNT_ID;
    const myPrivateKey = process.env.NEXT_PUBLIC_MY_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error('Environment variables for Hedera client not set');
    }

    if (network === 'testnet') {
        hederaClient = Client.forTestnet();
    } else {
        hederaClient = Client.forMainnet();
    }

    const accountId = AccountId.fromString(myAccountId);
    const privateKey = PrivateKey.fromString(myPrivateKey);
    hederaClient.setOperator(accountId, privateKey);
    hederaClient.setDefaultMaxQueryPayment(new Hbar(0.1));

    return hederaClient;
}

/**
 * Get the public key corresponding to an account ID
 * @param accountId Hedera account ID
 * @returns Public key as string or null if not found
 */
async function getAccountPublicKey(accountId: string): Promise<string | null> {
    try {
        // In a production environment, you would retrieve the public key from your database
        // or from the Hedera network using AccountInfoQuery

        // For this implementation, we'll derive it from the environment variable for demo purposes
        const myAccountId = process.env.NEXT_PUBLIC_MY_ACCOUNT_ID;
        const myPrivateKey = process.env.NEXT_PUBLIC_MY_PRIVATE_KEY;

        if (accountId === myAccountId && myPrivateKey) {
            const privateKey = PrivateKey.fromString(myPrivateKey);
            return privateKey.publicKey.toString();
        }

        return null;
    } catch (error) {
        console.error('Error getting account public key:', error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            accountId,
            smartWalletId,
            targetContract,
            functionName,
            params,
            value,
            timestamp,
            signature
        } = body;

        // Basic validation
        if (!accountId || !smartWalletId || !targetContract || !functionName) {
            return NextResponse.json({
                success: false,
                error: "Missing required parameters"
            }, { status: 400 });
        }

        // Validate signature is present
        if (!signature) {
            return NextResponse.json({
                success: false,
                error: "Request must be signed"
            }, { status: 401 });
        }

        // Check for stale requests (prevent replay attacks)
        const requestTimestamp = timestamp || 0;
        const currentTime = Date.now();
        const maxRequestAge = 5 * 60 * 1000; // 5 minutes

        if (currentTime - requestTimestamp > maxRequestAge) {
            return NextResponse.json({
                success: false,
                error: "Request has expired"
            }, { status: 401 });
        }

        // Get the account's public key for verification
        const publicKey = await getAccountPublicKey(accountId);
        if (!publicKey) {
            return NextResponse.json({
                success: false,
                error: "Could not retrieve public key for account"
            }, { status: 401 });
        }

        // Verify the signature
        const isValid = verifySignature(body, signature, publicKey);
        if (!isValid) {
            return NextResponse.json({
                success: false,
                error: "Invalid signature"
            }, { status: 401 });
        }

        // Get Hedera client
        const client = getClient();

        // Encode function call data
        const functionCallData = encodeFunctionCall(functionName, params);

        try {
            // Execute transaction on behalf of the user
            const tx = new ContractExecuteTransaction()
                .setContractId(ContractId.fromString(smartWalletId))
                .setGas(1000000)
                .setFunction(
                    "execute",
                    new ContractFunctionParameters()
                        .addAddress(targetContract)
                        .addUint256(value || 0)
                        .addBytes(functionCallData)
                );

            // Add payable amount if specified
            if (value && value > 0) {
                tx.setPayableAmount(Hbar.fromTinybars(value));
            }

            // Execute the transaction
            const response = await tx.execute(client);
            const receipt = await response.getReceipt(client);

            return NextResponse.json({
                success: true,
                transactionId: response.transactionId.toString(),
                status: receipt.status.toString()
            });
        } catch (err: any) {
            console.error("Relayer execution error:", err);
            return NextResponse.json({
                success: false,
                error: `Transaction execution failed: ${err.message}`
            }, { status: 500 });
        }
    } catch (err: any) {
        console.error("Relayer error:", err);
        return NextResponse.json({
            success: false,
            error: `Server error: ${err.message}`
        }, { status: 500 });
    }
} 