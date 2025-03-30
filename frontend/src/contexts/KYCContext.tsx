'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { withErrorHandling } from '../utils/errorUtils';
import { toast } from 'react-hot-toast';

export enum KYCStatus {
    NONE = 'none',
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export enum KYCLevel {
    BASIC = 'basic',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced'
}

export interface KYCFormData {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    idType: string;
    idNumber: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    phoneNumber: string;
    email: string;
    idDocumentHash?: string;
    proofOfAddressHash?: string;
    selfieHash?: string;
}

type KYCContextType = {
    kycStatus: KYCStatus;
    kycLevel: KYCLevel;
    formData: KYCFormData;
    isLoading: boolean;
    error: string | null;
    currentStep: number;
    totalSteps: number;
    isSubmitting: boolean;
    setFormData: (data: Partial<KYCFormData>) => void;
    submitKYC: () => Promise<boolean>;
    resetForm: () => void;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
    fetchKYCStatus: () => Promise<void>;
    uploadDocument: (fieldName: keyof KYCFormData, file: File) => Promise<string>;
    canTrade: boolean;
};

const defaultContext: KYCContextType = {
    kycStatus: KYCStatus.NONE,
    kycLevel: KYCLevel.BASIC,
    formData: {
        fullName: '',
        dateOfBirth: '',
        nationality: '',
        idType: '',
        idNumber: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        phoneNumber: '',
        email: '',
    },
    isLoading: false,
    error: null,
    currentStep: 1,
    totalSteps: 3,
    isSubmitting: false,
    setFormData: () => { },
    submitKYC: async () => false,
    resetForm: () => { },
    goToNextStep: () => { },
    goToPreviousStep: () => { },
    fetchKYCStatus: async () => { },
    uploadDocument: async () => '',
    canTrade: false,
};

const KYCContext = createContext<KYCContextType>(defaultContext);

export const useKYC = () => useContext(KYCContext);

interface KYCProviderProps {
    children: ReactNode;
}

export const KYCProvider: React.FC<KYCProviderProps> = ({ children }) => {
    const { isConnected, accountId, smartWalletId, executeTransaction, client } = useWallet();
    const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.NONE);
    const [kycLevel, setKycLevel] = useState<KYCLevel>(KYCLevel.BASIC);
    const [formData, setFormDataState] = useState<KYCFormData>(defaultContext.formData);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [canTrade, setCanTrade] = useState<boolean>(false);

    const totalSteps = 3;

    // Fetch KYC status when wallet is connected
    useEffect(() => {
        if (isConnected && accountId) {
            fetchKYCStatus();
        }
    }, [isConnected, accountId]);

    // Check if the user can trade based on KYC status
    useEffect(() => {
        // User can trade if KYC is approved or if they have basic KYC with status pending
        setCanTrade(
            kycStatus === KYCStatus.APPROVED ||
            (kycStatus === KYCStatus.PENDING && kycLevel === KYCLevel.BASIC)
        );
    }, [kycStatus, kycLevel]);

    const fetchKYCStatus = async () => {
        if (!isConnected || !accountId) return;

        return withErrorHandling(
            async () => {
                setIsLoading(true);

                // In a production environment, this would call a backend API or smart contract
                // For now, we'll check localStorage for demo purposes
                const storedStatus = localStorage.getItem(`kyc-status-${accountId}`);
                const storedLevel = localStorage.getItem(`kyc-level-${accountId}`);

                if (storedStatus) {
                    setKycStatus(storedStatus as KYCStatus);
                }

                if (storedLevel) {
                    setKycLevel(storedLevel as KYCLevel);
                }

                // If user has submitted KYC before, load their data
                const storedFormData = localStorage.getItem(`kyc-data-${accountId}`);
                if (storedFormData) {
                    try {
                        const parsedData = JSON.parse(storedFormData);
                        setFormDataState(prevData => ({
                            ...prevData,
                            ...parsedData
                        }));
                    } catch (err) {
                        console.error('Error parsing stored KYC data:', err);
                    }
                }
            },
            setIsLoading,
            setError,
            'Failed to fetch KYC status',
            undefined
        );
    };

    const setFormData = (data: Partial<KYCFormData>) => {
        setFormDataState(prevData => ({
            ...prevData,
            ...data
        }));
    };

    const uploadDocument = async (fieldName: keyof KYCFormData, file: File): Promise<string> => {
        setIsLoading(true);
        try {
            // In a production environment, this would upload to IPFS or a secure storage
            // For demo purposes, we'll create a hash of the file name
            const fileReader = new FileReader();
            return new Promise((resolve, reject) => {
                fileReader.onload = () => {
                    // Create a simple hash using the name and size
                    const mockHash = `hash_${file.name.replace(/\s/g, '')}_${file.size}`;
                    setIsLoading(false);
                    resolve(mockHash);
                };
                fileReader.onerror = () => {
                    setIsLoading(false);
                    reject(new Error('Failed to read file'));
                };
                fileReader.readAsArrayBuffer(file);
            });
        } catch (error) {
            setIsLoading(false);
            setError('Failed to upload document');
            console.error('Document upload error:', error);
            throw error;
        }
    };

    const submitKYC = async () => {
        if (!isConnected || !accountId) {
            setError('Wallet not connected');
            return false;
        }

        return withErrorHandling(
            async () => {
                setIsSubmitting(true);

                // Validate form data
                const requiredFields = [
                    'fullName', 'dateOfBirth', 'nationality', 'idType',
                    'idNumber', 'address', 'city', 'country', 'postalCode',
                    'phoneNumber', 'email'
                ];

                for (const field of requiredFields) {
                    if (!formData[field as keyof KYCFormData]) {
                        throw new Error(`${field.replace(/([A-Z])/g, ' $1').trim()} is required`);
                    }
                }

                // In a production environment, this would call a backend API or smart contract
                // For now, we'll simulate by storing in localStorage
                localStorage.setItem(`kyc-status-${accountId}`, KYCStatus.PENDING);
                localStorage.setItem(`kyc-level-${accountId}`, kycLevel);
                localStorage.setItem(`kyc-data-${accountId}`, JSON.stringify(formData));

                // Update state
                setKycStatus(KYCStatus.PENDING);

                // Show success message
                toast.success('KYC verification submitted successfully');

                return true;
            },
            setIsLoading,
            setError,
            'Failed to submit KYC',
            false
        ).finally(() => {
            setIsSubmitting(false);
        });
    };

    const resetForm = () => {
        setFormDataState(defaultContext.formData);
        setCurrentStep(1);
        setError(null);
    };

    const goToNextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <KYCContext.Provider
            value={{
                kycStatus,
                kycLevel,
                formData,
                isLoading,
                error,
                currentStep,
                totalSteps,
                isSubmitting,
                setFormData,
                submitKYC,
                resetForm,
                goToNextStep,
                goToPreviousStep,
                fetchKYCStatus,
                uploadDocument,
                canTrade
            }}
        >
            {children}
        </KYCContext.Provider>
    );
}; 