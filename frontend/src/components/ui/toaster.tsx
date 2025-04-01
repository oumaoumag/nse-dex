'use client';

import {
    Toast,
} from './toast';
import { useToast } from './use-toast';

export function Toaster() {
    const { toasts } = useToast();

    return (
        <div className="fixed top-0 z-[100] flex flex-col gap-2 px-4 sm:right-0 sm:top-4 sm:bottom-auto sm:w-auto max-w-[420px]">
            {toasts.map(function ({ id, title, description, action, ...props }) {
                return (
                    <Toast
                        key={id}
                        {...props}
                        title={title}
                        description={description}
                        action={action}
                    />
                );
            })}
        </div>
    );
} 