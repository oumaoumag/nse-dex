/**
 * Utility functions for formatting values
 */

/**
 * Format a number as currency with optional currency symbol
 * @param value - The number to format
 * @param currency - Optional currency symbol (defaults to $)
 * @param decimals - Number of decimal places (defaults to 2)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = '$', decimals = 2): string {
    if (value === undefined || value === null) return `${currency}0.00`;
    return `${currency}${value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Format HBAR value (converts from tinybars to HBAR)
 * @param value - The value in tinybars
 * @param showSymbol - Whether to include the ℏ symbol
 * @param decimals - Number of decimal places to display
 * @returns Formatted HBAR string
 */
export function formatHbar(value: number | string, showSymbol = true, decimals = 4): string {
    if (value === undefined || value === null) return showSymbol ? 'ℏ0' : '0';

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    // Convert from tinybars to HBAR (8 decimal places)
    const hbarValue = numValue / 100000000;

    const formatted = hbarValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return showSymbol ? `ℏ${formatted}` : formatted;
}

/**
 * Format a number as a percentage
 * @param value - The number to format (0-1)
 * @param decimals - Number of decimal places (defaults to 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 2): string {
    if (value === undefined || value === null) return '0%';
    return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number with commas for thousands
 * @param value - The number to format
 * @param decimals - Number of decimal places (defaults to 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals = 2): string {
    if (value === undefined || value === null) return '0';
    return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format a number as compact representation (e.g. 1.2K, 5.3M)
 * @param value - The number to format
 * @returns Compact formatted number
 */
export function formatCompact(value: number): string {
    if (value === undefined || value === null) return '0';

    const formatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
    });

    return formatter.format(value);
}

/**
 * Format a date to a human-readable string
 * @param date - The date to format
 * @param includeTime - Whether to include the time
 * @returns Formatted date string
 */
export function formatDate(date: Date, includeTime = false): string {
    if (!date) return '';

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return new Date(date).toLocaleDateString('en-US', options);
}

/**
 * Format a large number representing tokens (like HBAR) with proper decimals
 * @param value - The token amount (often in tinybars or smallest unit)
 * @param decimals - Number of decimal places in the token (8 for HBAR)
 * @param displayDecimals - Number of decimals to display
 * @returns Formatted token amount
 */
export function formatTokenAmount(value: number | string, decimals = 8, displayDecimals = 4): string {
    if (value === undefined || value === null) return '0';

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const convertedValue = numValue / Math.pow(10, decimals);

    return convertedValue.toFixed(displayDecimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
} 