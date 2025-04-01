/**
 * Error handling utilities
 */

/**
 * Format an error into a user-friendly message
 */
export function formatError(error: unknown): string {
    if (error instanceof Error) {
        if (error.message.includes('CostQuery has not been loaded yet')) {
            return 'Network is busy. Please try again in a moment.';
        }

        if (error.message.includes('INSUFFICIENT_TX_FEE')) {
            return 'Transaction fee too low. Please try again or increase your gas limit.';
        }

        if (error.message.includes('INVALID_SIGNATURE')) {
            return 'Invalid signature. Please check your credentials and try again.';
        }

        if (error.message.includes('BUSY')) {
            return 'The network is congested. Please try again later.';
        }

        if (error.message.includes('PLATFORM_TRANSACTION_NOT_CREATED')) {
            return 'Transaction creation failed. Please try again.';
        }

        if (error.message.includes('failed to parse entity id')) {
            return 'Invalid contract ID format. Please check your configuration.';
        }

        if (error.message.includes('INVALID_CONTRACT_ID')) {
            return 'The specified contract does not exist on the network.';
        }

        if (error.message.includes('CONTRACT_REVERT_EXECUTED')) {
            return 'The contract operation was reverted. Please check your inputs.';
        }

        if (error.message.includes('INSUFFICIENT_GAS')) {
            return 'Not enough gas provided for this operation.';
        }

        if (error.message.includes('INSUFFICIENT_ACCOUNT_BALANCE')) {
            return 'Insufficient account balance to perform this operation.';
        }

        return error.message;
    }

    return 'An unknown error occurred';
}

/**
 * Log an error with appropriate context
 */
export function logError(context: string, error: unknown): void {
    console.error(`Error in ${context}:`, error);
}

/**
 * Check if an error is retryable (temporary)
 */
export function isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    return (
        error.message.includes('CostQuery has not been loaded yet') ||
        error.message.includes('BUSY') ||
        error.message.includes('PLATFORM_TRANSACTION_NOT_CREATED') ||
        error.message.includes('PLATFORM_NOT_ACTIVE') ||
        error.message.includes('network connection issues')
    );
}

/**
 * Wraps an async operation with consistent error handling
 */
export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void,
    errorMessage: string,
    defaultValue: T
): Promise<T> {
    setIsLoading(true);
    setError(null);

    try {
        const result = await operation();
        return result;
    } catch (err: any) {
        logError(errorMessage, err);
        setError(`${errorMessage}: ${formatError(err)}`);
        return defaultValue;
    } finally {
        setIsLoading(false);
    }
}

/**
 * Validates wallet connection state
 */
export function validateWallet(
    client: any,
    smartWalletId: string | null,
    isConnected: boolean,
    setError: (error: string | null) => void
): boolean {
    if (!client || !smartWalletId || !isConnected) {
        setError('Wallet not connected or initialized');
        return false;
    }
    return true;
}

/**
 * Validates a Hedera contract ID
 */
export function validateContractId(
    contractId: string | null,
    description?: string,
    setError?: (error: string | null) => void
): boolean {
    if (!contractId) {
        if (description && setError) {
            setError(`Invalid or missing contract ID for ${description}`);
        }
        return false;
    }

    const contractIdRegex = /^0\.0\.\d+$/;
    const isValid = contractIdRegex.test(contractId);

    if (!isValid && description && setError) {
        setError(`Invalid contract ID format for ${description}`);
    }

    return isValid;
}

/**
 * Validates contract dependencies for a component
 */
export function validateContractDependencies(
    dependencies: Record<string, string>,
    setError: (error: string | null) => void
): boolean {
    for (const [contractId, description] of Object.entries(dependencies)) {
        if (!validateContractId(contractId, description, setError)) {
            return false;
        }
    }
    return true;
} 