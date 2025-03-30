import { PrivateKey, PublicKey } from '@hashgraph/sdk';
import crypto from 'crypto';

/**
 * Creates a deterministic message hash for transaction signing
 * @param payload - Transaction data to be signed
 * @returns A string hash representation of the payload
 */
export function createMessageHash(payload: any): string {
    // Create a deterministic string representation
    const orderedPayload = orderObject(payload);
    const payloadString = JSON.stringify(orderedPayload);

    // Create SHA-256 hash of the payload string
    return crypto
        .createHash('sha256')
        .update(payloadString)
        .digest('hex');
}

/**
 * Signs a transaction payload with a private key
 * @param payload - Transaction data to be signed
 * @param privateKeyString - Hedera private key as a string
 * @returns Signature as a hex string
 */
export function signTransaction(payload: any, privateKeyString: string): string {
    try {
        // Remove signature and timestamp fields if they exist
        const { signature, ...payloadWithoutSignature } = payload;

        // Add timestamp if not present
        const payloadToSign = {
            ...payloadWithoutSignature,
            timestamp: payloadWithoutSignature.timestamp || Date.now()
        };

        // Create message hash
        const messageHash = createMessageHash(payloadToSign);

        // Convert the private key string to a PrivateKey object
        const privateKey = PrivateKey.fromString(privateKeyString);

        // Sign the message hash
        const signatureBuffer = privateKey.sign(Buffer.from(messageHash, 'hex'));

        // Convert signature to hex string
        return Buffer.from(signatureBuffer).toString('hex');
    } catch (error) {
        console.error('Error signing transaction:', error);
        throw new Error('Failed to sign transaction');
    }
}

/**
 * Verifies a transaction signature
 * @param payload - The transaction payload with signature
 * @param signatureHex - The signature as a hex string
 * @param publicKeyString - The signer's Hedera public key as a string
 * @returns Boolean indicating if signature is valid
 */
export function verifySignature(
    payload: any,
    signatureHex: string,
    publicKeyString: string
): boolean {
    try {
        // Extract payload without signature field
        const { signature, ...payloadWithoutSignature } = payload;

        // Create message hash using the same algorithm as signing
        const messageHash = createMessageHash(payloadWithoutSignature);

        // Convert the public key string to a PublicKey object
        const publicKey = PublicKey.fromString(publicKeyString);

        // Convert hex signature to buffer
        const signatureBuffer = Buffer.from(signatureHex, 'hex');

        // Verify the signature
        return publicKey.verify(Buffer.from(messageHash, 'hex'), signatureBuffer);
    } catch (error) {
        console.error('Error verifying signature:', error);
        return false;
    }
}

/**
 * Creates a consistent ordering of object properties for deterministic hashing
 * @param obj - Object to be ordered
 * @returns Ordered object with properties sorted alphabetically
 */
function orderObject(obj: any): any {
    // Handle non-objects
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // Handle arrays by ordering each element
    if (Array.isArray(obj)) {
        return obj.map(orderObject);
    }

    // For objects, create a new object with keys sorted alphabetically
    return Object.keys(obj)
        .sort()
        .reduce((result: any, key) => {
            result[key] = orderObject(obj[key]);
            return result;
        }, {});
} 