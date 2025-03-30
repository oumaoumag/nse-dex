'use client';

import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { StatusMessage } from './ui/StatusMessage';
import { useForm } from '../utils/formUtils';

const GaslessTransactions: React.FC = () => {
    const { executeGaslessTransaction, accountId, smartWalletId } = useWallet();

    const {
        values,
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!values.targetContract || !values.functionName) {
            setFormError('Target contract and function name are required');
            return;
        }

        setFormLoading('Executing gasless transaction...');

        try {
            // Parse parameters from the comma-separated string
            let params: any[] = [];
            try {
                if (values.params) {
                    params = JSON.parse('[' + values.params + ']');
                }
            } catch (err) {
                throw new Error('Invalid parameter format. Use comma-separated values.');
            }

            // Call the gasless transaction function
            await executeGaslessTransaction(
                values.targetContract,
                values.functionName,
                params,
                values.value
            );

            setFormSuccess('Transaction executed successfully!');
            resetForm();
        } catch (err: any) {
            setFormError(`Transaction failed: ${err.message}`);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Gasless Transactions</h2>

            {!accountId && (
                <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded">
                    Connect your wallet to use gasless transactions.
                </div>
            )}

            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                    Gasless transactions let you execute contract calls without paying for gas.
                    The relayer service will pay the gas fees on your behalf.
                </p>
                <p className="text-sm text-gray-600">
                    Your signature is required to authorize the transaction.
                </p>
            </div>

            <StatusMessage
                status={formState.status}
                message={formState.message}
                onDismiss={clearFormStatus}
            />

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Contract
                    </label>
                    <input
                        type="text"
                        name="targetContract"
                        value={values.targetContract}
                        onChange={handleChange}
                        placeholder="0.0.12345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Function Name
                    </label>
                    <input
                        type="text"
                        name="functionName"
                        value={values.functionName}
                        onChange={handleChange}
                        placeholder="transfer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parameters (comma separated)
                    </label>
                    <input
                        type="text"
                        name="params"
                        value={values.params}
                        onChange={handleChange}
                        placeholder='"0.0.12345", 100'
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Example: "0.0.12345", 100, true
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        HBAR Value
                    </label>
                    <input
                        type="number"
                        name="value"
                        value={values.value}
                        onChange={(e) => handleNumberChange('value', parseFloat(e.target.value))}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={!accountId || formState.status === 'loading'}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!accountId || formState.status === 'loading'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                >
                    {formState.status === 'loading' ? 'Processing...' : 'Execute Gasless Transaction'}
                </button>
            </form>
        </div>
    );
};

export default GaslessTransactions; 