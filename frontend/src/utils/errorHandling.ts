/**
 * Utility functions for consistent error handling across the application
 */

/**
 * Wraps an async operation with consistent error handling
 * 
 * @param operation - The async operation to execute
 * @param setIsLoading - Loading state setter function
 * @param setError - Error state setter function
 * @param errorMessage - Custom error message prefix
 * @returns The result of the operation or the default value on error
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
    console.error(`${errorMessage}:`, err);

    // Format user-friendly error messages for common errors
    let userMessage = err.message;

    if (err.message.includes('failed to parse entity id')) {
      userMessage = 'Invalid contract ID format. Please check your configuration.';
    } else if (err.message.includes('INVALID_CONTRACT_ID')) {
      userMessage = 'The specified contract does not exist on the network.';
    } else if (err.message.includes('CONTRACT_REVERT_EXECUTED')) {
      userMessage = 'The contract operation was reverted. Please check your inputs.';
    } else if (err.message.includes('INSUFFICIENT_GAS')) {
      userMessage = 'Not enough gas provided for this operation.';
    } else if (err.message.includes('INSUFFICIENT_ACCOUNT_BALANCE')) {
      userMessage = 'Insufficient account balance to perform this operation.';
    }

    setError(`${errorMessage}: ${userMessage}`);
    return defaultValue;
  } finally {
    setIsLoading(false);
  }
}

/**
 * Validates wallet connection state
 * 
 * @param client - The Hedera client
 * @param smartWalletId - The smart wallet ID
 * @param isConnected - Connection state
 * @param setError - Error state setter function
 * @returns True if wallet is valid, false otherwise
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
 * 
 * @param contractId - The contract ID to validate
 * @returns True if the contract ID is valid, false otherwise
 */
export function validateContractId(contractId: string | null): boolean {
  if (!contractId) return false;

  // Valid Hedera contract ID format is 0.0.number
  const contractIdRegex = /^0\.0\.\d+$/;
  return contractIdRegex.test(contractId);
}

/**
 * Validates contract dependencies for a component
 * 
 * @param dependencies - Object containing contract IDs and their descriptions
 * @param setError - Error state setter function
 * @returns True if all dependencies are valid, false otherwise
 */
export function validateContractDependencies(
  dependencies: Record<string, string>,
  setError: (error: string | null) => void
): boolean {
  for (const [contractId, description] of Object.entries(dependencies)) {
    if (!validateContractId(contractId)) {
      setError(`Invalid or missing contract ID for ${description}`);
      return false;
    }
  }
  return true;
}
