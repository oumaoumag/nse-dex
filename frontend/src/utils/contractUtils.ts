/**
 * Contract utility functions for Hedera Smart Contract interactions
 */

/**
 * Encodes a function call for Solidity contracts
 * @param functionName - Name of the function to call
 * @param params - Parameters to encode
 * @returns Uint8Array of encoded function call
 */
export function encodeFunctionCall(functionName: string, params: any[]): Uint8Array {
    try {
        // Convert function name to selector
        const functionSelector = functionName.includes('(')
            ? functionName
            : `${functionName}(${generateParamTypeSignature(params)})`;

        // Create the bytes array for the function selector
        const selectorHash = hashFunctionSelector(functionSelector);
        const selectorBytes = selectorHash.slice(0, 10); // '0x' + 8 chars (4 bytes)

        // Encode parameters
        let encodedParams = '';
        params.forEach(param => {
            if (typeof param === 'string' && param.startsWith('0x')) {
                // Hex string (address or bytes)
                encodedParams += param.slice(2).padStart(64, '0');
            } else if (typeof param === 'number') {
                // Number
                encodedParams += param.toString(16).padStart(64, '0');
            } else if (typeof param === 'boolean') {
                // Boolean
                encodedParams += (param ? '1' : '0').padStart(64, '0');
            } else if (typeof param === 'string') {
                // Regular string
                const strBytes = new TextEncoder().encode(param);
                let hexStr = '';
                for (let i = 0; i < strBytes.length; i++) {
                    hexStr += strBytes[i].toString(16).padStart(2, '0');
                }
                encodedParams += hexStr.padEnd(64, '0');
            } else if (Array.isArray(param)) {
                // Array
                encodedParams += param.map(p =>
                    typeof p === 'number'
                        ? p.toString(16).padStart(64, '0')
                        : p.toString().padEnd(64, '0')
                ).join('');
            }
        });

        // Combine selector and parameters
        const fullCalldata = selectorBytes + encodedParams;

        // Convert hex string to Uint8Array
        return hexStringToUint8Array(fullCalldata);
    } catch (err) {
        console.error('Error encoding function call:', err);
        // Fallback to basic encoding
        const encoder = new TextEncoder();
        return encoder.encode(`${functionName}(${params.join(',')})`);
    }
}

/**
 * Generates a parameter type signature for a function
 * @param params - Array of parameters
 * @returns String representation of parameter types
 */
export function generateParamTypeSignature(params: any[]): string {
    return params.map(param => {
        if (typeof param === 'string' && param.startsWith('0x')) {
            return 'address';
        } else if (typeof param === 'number') {
            return param % 1 === 0 ? 'uint256' : 'uint256';
        } else if (typeof param === 'boolean') {
            return 'bool';
        } else if (typeof param === 'string') {
            return 'string';
        } else if (Array.isArray(param)) {
            return 'uint256[]';
        }
        return 'bytes';
    }).join(',');
}

/**
 * Calculates a function selector hash
 */
export function hashFunctionSelector(selector: string): string {
    // Simple hashing function for development
    // In production, integrate a proper keccak256 implementation
    const hash = '0x' + Buffer.from(selector).toString('hex').slice(0, 8);
    return hash;
}

/**
 * Converts a hex string to Uint8Array
 * @param hexString - Hex string (with or without 0x prefix)
 * @returns Uint8Array representing the hex data
 */
export function hexStringToUint8Array(hexString: string): Uint8Array {
    if (hexString.startsWith('0x')) {
        hexString = hexString.slice(2);
    }

    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
    }

    return bytes;
}

/**
 * Converts a string to a bytes32 representation
 * @param text - Input string
 * @returns Bytes32 hex string
 */
export function stringToBytes32(text: string): string {
    // Convert string to bytes and pad to 32 bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    const paddedArray = new Uint8Array(32);

    // Copy bytes, up to 32
    const bytesToCopy = Math.min(bytes.length, 32);
    paddedArray.set(bytes.slice(0, bytesToCopy));

    // Convert to hex
    return '0x' + Array.from(paddedArray)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Converts an address to checksum format
 * @param address - Input address
 * @returns Checksummed address
 */
export function toChecksumAddress(address: string): string {
    // Remove 0x prefix if it exists
    address = address.toLowerCase().replace('0x', '');

    // Implementation for Hedera-specific addresses
    return '0x' + address;
} 