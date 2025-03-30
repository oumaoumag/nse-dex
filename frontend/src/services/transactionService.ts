/**
 * Transaction service for contract interactions
 */

import { 
  Client, 
  ContractId, 
  ContractCallQuery, 
  ContractExecuteTransaction,
  Hbar, 
  ContractFunctionParameters,
  ContractFunctionResult
} from '@hashgraph/sdk';
import { TransactionResult } from '../types/stock';

/**
 * Execute a contract function with parameters
 * 
 * @param client - Hedera client
 * @param contractId - Contract ID
 * @param functionName - Function name to call
 * @param params - Parameters to pass to the function
 * @param payableAmount - HBAR amount to send with the transaction
 * @param operatorId - Operator account ID
 * @param smartWallet - Smart wallet ID
 * @returns Transaction result
 */
export async function executeContractFunction(
  client: Client,
  contractId: string,
  functionName: string,
  params: any[] = [],
  payableAmount: number = 0,
  operatorId: string,
  smartWallet: string
): Promise<TransactionResult> {
  try {
    const contractIdObj = ContractId.fromString(contractId);
    
    // Create transaction with parameters
    let transaction = new ContractExecuteTransaction()
      .setContractId(contractIdObj)
      .setGas(1000000);
      
    // Add function name and parameters
    if (params.length > 0) {
      const functionParams = new ContractFunctionParameters();
      
      // Add each parameter based on type
      params.forEach((param, index) => {
        if (typeof param === 'string' && param.startsWith('0x')) {
          functionParams.addAddress(param);
        } else if (typeof param === 'string' && param.includes('.')) {
          functionParams.addAddress(param);
        } else if (typeof param === 'string') {
          functionParams.addString(param);
        } else if (typeof param === 'number' && Number.isInteger(param)) {
          functionParams.addUint256(param);
        } else if (typeof param === 'number') {
          functionParams.addUint256(Math.floor(param * 1e18));
        } else if (typeof param === 'boolean') {
          functionParams.addBool(param);
        }
      });
      
      transaction.setFunction(functionName, functionParams);
    } else {
      transaction.setFunction(functionName);
    }
    
    // Set payable amount if needed
    if (payableAmount > 0) {
      transaction.setPayableAmount(Hbar.fromTinybars(Math.floor(payableAmount * 1e8)));
    }
    
    // Execute transaction
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    
    return {
      success: true,
      message: `Transaction completed successfully`,
      transactionId: txResponse.transactionId.toString()
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Unknown error during transaction',
    };
  }
}

/**
 * Query a contract function
 * 
 * @param client - Hedera client
 * @param contractId - Contract ID
 * @param functionName - Function name to call
 * @param params - Parameters to pass to the function
 * @returns Contract function result
 */
export async function queryContractFunction(
  client: Client,
  contractId: string,
  functionName: string,
  params: any[] = []
): Promise<ContractFunctionResult> {
  try {
    const contractIdObj = ContractId.fromString(contractId);
    
    // Create query with parameters
    let query = new ContractCallQuery()
      .setContractId(contractIdObj)
      .setGas(100000);
      
    // Add function name and parameters
    if (params.length > 0) {
      const functionParams = new ContractFunctionParameters();
      
      // Add each parameter based on type
      params.forEach(param => {
        if (typeof param === 'string' && param.startsWith('0x')) {
          functionParams.addAddress(param);
        } else if (typeof param === 'string' && param.includes('.')) {
          functionParams.addAddress(param);
        } else if (typeof param === 'string') {
          functionParams.addString(param);
        } else if (typeof param === 'number' && Number.isInteger(param)) {
          functionParams.addUint256(param);
        } else if (typeof param === 'number') {
          functionParams.addUint256(Math.floor(param * 1e18));
        } else if (typeof param === 'boolean') {
          functionParams.addBool(param);
        }
      });
      
      query.setFunction(functionName, functionParams);
    } else {
      query.setFunction(functionName);
    }
    
    // Execute query
    const response = await query.execute(client);
    return response;
  } catch (err: any) {
    throw new Error(`Query failed: ${err.message}`);
  }
}

/**
 * Parse contract results for stock data
 * 
 * @param result - Contract function result
 * @returns Parsed result
 */
export function parseContractResult(result: ContractFunctionResult): any {
  try {
    // This is a simplified implementation
    // You'll need to adjust based on your contract's return format
    const resultString = result.toString();
    return JSON.parse(resultString);
  } catch (err) {
    // If parsing fails, return the raw result
    return result;
  }
}
