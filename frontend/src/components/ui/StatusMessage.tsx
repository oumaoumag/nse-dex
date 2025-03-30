'use client';

import React from 'react';
import { getStatusClass, StatusType } from '@/utils/formUtils';

interface StatusMessageProps {
    status: StatusType | string;
    message: string | null;
    onDismiss?: () => void;
}

/**
 * A reusable status message component for displaying operation status
 */
export const StatusMessage: React.FC<StatusMessageProps> = ({
    status,
    message,
    onDismiss
}) => {
    if (!message) return null;

    const statusClass = getStatusClass(status);

    return (
        <div className={`mb-4 p-3 rounded-md text-sm ${statusClass}`}>
            {message}
            {onDismiss && (
                <button
                    className="ml-2 text-xs hover:underline"
                    onClick={onDismiss}
                >
                    Dismiss
                </button>
            )}
        </div>
    );
};

export default StatusMessage; 