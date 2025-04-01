'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    onValueChange?: (value: string) => void;
    value?: string;
    children: React.ReactNode;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
    ({ className, children, value, onValueChange, ...props }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [selectedValue, setSelectedValue] = React.useState(value);
        const containerRef = React.useRef<HTMLDivElement>(null);

        React.useEffect(() => {
            setSelectedValue(value);
        }, [value]);

        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        const handleSelectChange = (value: string) => {
            setSelectedValue(value);
            setIsOpen(false);
            if (onValueChange) {
                onValueChange(value);
            }
        };

        return (
            <div
                className={cn(
                    "relative",
                    className
                )}
                ref={containerRef}
            >
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        if (child.type === SelectTrigger) {
                            return React.cloneElement(child as React.ReactElement<any>, {
                                onClick: () => setIsOpen(!isOpen),
                                value: selectedValue,
                            });
                        } else if (child.type === SelectContent) {
                            return isOpen ? React.cloneElement(child as React.ReactElement<any>, {
                                handleSelectChange,
                            }) : null;
                        }
                        return child;
                    }
                    return child;
                })}
            </div>
        );
    }
);
Select.displayName = 'Select';

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    value?: string;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <button
                type="button"
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-decode-green/30 bg-decode-black/30 p-3 text-sm text-decode-white ring-offset-decode-black placeholder:text-decode-gray-400 focus:outline-none focus:ring-2 focus:ring-decode-green focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
                <svg className="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        );
    }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) => {
    return <span className="truncate">{children || placeholder}</span>;
};
SelectValue.displayName = 'SelectValue';

interface SelectContentProps {
    children: React.ReactNode;
    handleSelectChange?: (value: string) => void;
    className?: string;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
    ({ className, children, handleSelectChange, ...props }, ref) => {
        return (
            <div
                className={cn(
                    "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-decode-green/30 bg-decode-black/90 text-decode-white shadow-lg animate-in fade-in-80",
                    className
                )}
                ref={ref}
                {...props}
            >
                <div className="p-1">
                    {React.Children.map(children, (child) => {
                        if (React.isValidElement(child) && child.type === SelectItem && handleSelectChange) {
                            return React.cloneElement(child as React.ReactElement<any>, {
                                onClick: () => handleSelectChange(child.props.value),
                            });
                        }
                        return child;
                    })}
                </div>
            </div>
        );
    }
);
SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
    value: string;
}

const SelectItem = React.forwardRef<HTMLLIElement, SelectItemProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <li
                className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-decode-green/10 focus:bg-decode-green/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </li>
        );
    }
);
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }; 