import { AccountId } from '@hashgraph/sdk';
import { ethers } from 'ethers';

/**
 * Converts a Hedera account ID (0.0.XXXXX) to an EVM compatible address (0x...)
 * 
 * @param hederaAccount - Hedera account ID (e.g. "0.0.1234")
 * @returns EVM compatible address (0x...)
 */
export function hederaIdToEvmAddress(hederaAccount: string): string {
    try {
        // Check if already in EVM format
        if (hederaAccount.startsWith('0x') && hederaAccount.length === 42) {
            return hederaAccount;
        }

        // Try to convert from Hedera format
        const accountId = AccountId.fromString(hederaAccount);

        // For solidity address we need 20 bytes (40 hex chars) with 0x prefix
        const shard = accountId.shard.toNumber();
        const realm = accountId.realm.toNumber();
        const num = accountId.num.toNumber();

        // Create an EVM address from the Hedera account components
        // Use the last 20 bytes (40 hex chars) with padding
        const evmAddress = `0x${shard.toString(16).padStart(4, '0')}${realm.toString(16).padStart(4, '0')}${num.toString(16).padStart(32, '0')}`;

        return evmAddress;
    } catch (error) {
        console.error('Error converting Hedera ID to EVM address:', error);

        // Fallback: generate a deterministic EVM address from the string
        // This ensures the same input always produces the same output
        const hash = ethers.utils.id(hederaAccount);
        return hash.slice(0, 42); // Take the first 42 chars (including 0x)
    }
}

/**
 * Converts a third-party identifier (like Google ID) to an EVM compatible address
 * 
 * @param thirdPartyId - Any string identifier
 * @returns EVM compatible address (0x...)
 */
export function thirdPartyIdToEvmAddress(thirdPartyId: string): string {
    try {
        // If already in correct format, return as is
        if (thirdPartyId.startsWith('0x') && thirdPartyId.length === 42) {
            return thirdPartyId;
        }

        // Hash the ID to generate a deterministic address
        const hash = ethers.utils.id(thirdPartyId);
        return hash.slice(0, 42); // Take the first 42 chars (including 0x)
    } catch (error) {
        console.error('Error converting ID to EVM address:', error);
        // Fallback: create a dummy valid address
        return '0x0000000000000000000000000000000000000000';
    }
}

/**
 * Checks if a string is a valid EVM address
 * 
 * @param address - String to check
 * @returns True if the address is a valid EVM address
 */
export function isValidEvmAddress(address: string): boolean {
    return /^0x[0-9a-fA-F]{40}$/.test(address);
}

/**
 * Formats any address input for contract call compatibility
 * 
 * @param address - Address in any format (Hedera ID, EVM address, or other string identifier)
 * @returns EVM compatible address
 */
export function formatAddressForContract(address: string): string {
    if (isValidEvmAddress(address)) {
        return address;
    }

    // Try to parse as Hedera ID first
    try {
        const evmAddress = hederaIdToEvmAddress(address);
        return evmAddress;
    } catch {
        // If not a valid Hedera ID, treat as third-party ID
        return thirdPartyIdToEvmAddress(address);
    }
}

/**
 * Creates a dummy/demo EVM address for testing without wallet connection
 * 
 * @returns A valid EVM address for demo/testing purposes
 */
export function createDemoAddress(): string {
    return '0x0000000000000000000000000000000000000001';
} 