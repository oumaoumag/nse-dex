import { useState, ChangeEvent, FormEvent } from 'react';

/**
 * Status type for form operations
 */
export type StatusType = 'idle' | 'loading' | 'success' | 'error';

/**
 * Basic form state
 */
export interface FormState {
    status: StatusType;
    message: string | null;
}

/**
 * Gets the CSS class for a status message based on status type
 * @param status Current status
 * @returns CSS class string
 */
export function getStatusClass(status: StatusType | string): string {
    if (status === 'error' || (typeof status === 'string' && status.startsWith('Error'))) {
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    } else if (status === 'loading' || status === 'Processing...') {
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    } else if (status === 'success') {
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    }
    return '';
}

/**
 * Creates a form handler with state management
 * @param initialValues Initial form values
 * @returns Form state and handlers
 */
export function useForm<T extends Record<string, any>>(initialValues: T) {
    const [values, setValues] = useState<T>(initialValues);
    const [formState, setFormState] = useState<FormState>({
        status: 'idle',
        message: null
    });

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        setValues(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleNumberChange = (name: string, value: number) => {
        setValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;

        setValues(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleRadioChange = (name: string, value: string) => {
        setValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const setFieldValue = (name: string, value: any) => {
        setValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setValues(initialValues);
        setFormState({
            status: 'idle',
            message: null
        });
    };

    const setFormError = (message: string) => {
        setFormState({
            status: 'error',
            message
        });
    };

    const setFormSuccess = (message: string) => {
        setFormState({
            status: 'success',
            message
        });
    };

    const setFormLoading = (message: string = 'Processing...') => {
        setFormState({
            status: 'loading',
            message
        });
    };

    const clearFormStatus = () => {
        setFormState({
            status: 'idle',
            message: null
        });
    };

    return {
        values,
        handleChange,
        handleNumberChange,
        handleCheckboxChange,
        handleRadioChange,
        setFieldValue,
        resetForm,
        formState,
        setFormError,
        setFormSuccess,
        setFormLoading,
        clearFormStatus
    };
} 