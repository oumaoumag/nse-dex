'use client';

import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { StatusMessage } from './ui/StatusMessage';
import { useForm } from '../utils/formUtils';

interface Transaction {
    targetContract: string;
    functionName: string;
    params: any[];
    value: number;
}

const BatchedTransactions: React.FC = () => {
    const { executeBatchedTransactions, smartWalletId } = useWallet();

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const {
        values: currentTransaction,
        handleChange,
        handleNumberChange,
        setFieldValue,
        resetForm,
        formState,
        setFormLoading,
        setFormError,
        setFormSuccess,
        clearFormStatus
    } = useForm({
        targetContract: '',
        functionName: '',
        params: '',
        value: 0,
    });

    const addTransaction = () => {
        if (!currentTransaction.targetContract || !currentTransaction.functionName) {
            setFormError('Target contract and function name are required');
            return;
        }

        // Convert string params to array
        let parsedParams: any[] = [];
        try {
            if (currentTransaction.params) {
                parsedParams = JSON.parse('[' + currentTransaction.params + ']');
            }
        } catch (err) {
            setFormError('Invalid parameter format. Use comma-separated values.');
            return;
        }

        const newTransaction: Transaction = {
            targetContract: currentTransaction.targetContract,
            functionName: currentTransaction.functionName,
            params: parsedParams,
            value: currentTransaction.value || 0
        };

        setTransactions([...transactions, newTransaction]);
        resetForm();
        clearFormStatus();
    };

    const removeTransaction = (index: number) => {
        setTransactions(transactions.filter((_, i) => i !== index));
    };

    const executeBatch = async () => {
        if (!smartWalletId) {
            setFormError('Smart wallet is required');
            return;
        }

        if (transactions.length === 0) {
            setFormError('At least one transaction is required');
            return;
        }

        setFormLoading('Executing batch transaction...');

        try {
            await executeBatchedTransactions(transactions);
            setFormSuccess('Batch transaction executed successfully!');
            setTransactions([]);
        } catch (err: any) {
            setFormError(`Failed to execute batch: ${err.message}`);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Batched Transactions</h2>

            {!smartWalletId && (
                <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded">
                    You need to create a smart wallet first to use batched transactions.
                </div>
            )}

            <StatusMessage
                status={formState.status}
                message={formState.message}
                onDismiss={clearFormStatus}
            />

            <div className="mb-6 p-4 border border-gray-200 rounded">
                <h3 className="font-medium mb-3">Add Transaction</h3>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Target Contract</label>
                        <input
                            type="text"
                            name="targetContract"
                            value={currentTransaction.targetContract}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="0.0.12345"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Function Name</label>
                        <input
                            type="text"
                            name="functionName"
                            value={currentTransaction.functionName}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="transfer"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Parameters (comma separated)</label>
                        <input
                            type="text"
                            name="params"
                            value={currentTransaction.params}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder='"0.0.12345", 100'
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">HBAR Value</label>
                        <input
                            type="number"
                            name="value"
                            value={currentTransaction.value}
                            onChange={(e) => handleNumberChange('value', parseFloat(e.target.value))}
                            min="0"
                            step="0.1"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <button
                        onClick={addTransaction}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add to Batch
                    </button>
                </div>
            </div>

            {transactions.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-medium mb-3">Transaction Batch</h3>
                    <div className="space-y-2">
                        {transactions.map((tx, index) => (
                            <div key={index} className="p-3 border border-gray-200 rounded flex justify-between items-center">
                                <div>
                                    <div><span className="font-medium">Contract:</span> {tx.targetContract}</div>
                                    <div><span className="font-medium">Function:</span> {tx.functionName}</div>
                                    <div><span className="font-medium">Params:</span> {JSON.stringify(tx.params)}</div>
                                    <div><span className="font-medium">Value:</span> {tx.value} HBAR</div>
                                </div>
                                <button
                                    onClick={() => removeTransaction(index)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={executeBatch}
                            disabled={!smartWalletId || formState.status === 'loading'}
                            className={`${!smartWalletId || formState.status === 'loading'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                                } text-white px-4 py-2 rounded w-full`}
                        >
                            {formState.status === 'loading' ? 'Processing...' : 'Execute Batch'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchedTransactions; 