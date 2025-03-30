'use client';

import React from 'react';
import { KYCStatus as KYCStatusEnum } from '@/contexts/KYCContext';

interface KYCStatusProps {
    status: KYCStatusEnum;
}

const KYCStatus: React.FC<KYCStatusProps> = ({ status }) => {
    const getStatusInfo = () => {
        switch (status) {
            case KYCStatusEnum.PENDING:
                return {
                    title: 'Verification In Progress',
                    message: 'Your KYC information is being reviewed. This process typically takes 1-2 business days.',
                    icon: (
                        <svg className="w-16 h-16 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    ),
                    color: 'yellow'
                };
            case KYCStatusEnum.APPROVED:
                return {
                    title: 'Verification Approved',
                    message: 'Your identity has been verified successfully. You now have full access to the Tajiri platform.',
                    icon: (
                        <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    ),
                    color: 'green'
                };
            case KYCStatusEnum.REJECTED:
                return {
                    title: 'Verification Rejected',
                    message: 'Your verification was not approved. Please review the feedback and resubmit with the correct information.',
                    icon: (
                        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    ),
                    color: 'red'
                };
            default:
                return {
                    title: 'Verification Required',
                    message: 'Please complete your KYC verification to access all features of the platform.',
                    icon: (
                        <svg className="w-16 h-16 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    ),
                    color: 'blue'
                };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <div className={`decode-card border border-decode-green/30 p-8 rounded-lg text-center`}>
            <div className="flex flex-col items-center justify-center">
                {statusInfo.icon}
                <h2 className={`text-2xl font-bold mb-4 text-${statusInfo.color}-500`}>
                    {statusInfo.title}
                </h2>
                <p className="text-gray-300 max-w-md mx-auto">
                    {statusInfo.message}
                </p>

                {status === KYCStatusEnum.PENDING && (
                    <div className="mt-8">
                        <div className="relative pt-1 w-64">
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-decode-green/20">
                                <div className="w-3/4 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-decode-green animate-pulse"></div>
                            </div>
                            <div className="text-sm text-gray-400">Estimated completion time: 24-48 hours</div>
                        </div>
                    </div>
                )}

                {status === KYCStatusEnum.REJECTED && (
                    <div className="mt-6">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-decode-green text-decode-black font-medium rounded-md hover:bg-decode-green/90"
                        >
                            Resubmit Verification
                        </button>
                    </div>
                )}

                {status === KYCStatusEnum.APPROVED && (
                    <div className="mt-6">
                        <a
                            href="/marketplace"
                            className="px-6 py-2 bg-decode-green text-decode-black font-medium rounded-md hover:bg-decode-green/90"
                        >
                            Go to Marketplace
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KYCStatus; 