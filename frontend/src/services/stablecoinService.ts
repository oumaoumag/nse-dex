import { ethers } from 'ethers';
import * as hederaService from './hederaService';

// Standard ERC20 ABI for token interactions
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function transferFrom(address from, address to, uint256 amount) returns (bool)'
];

// Token configurations
export const SUPPORTED_TOKENS = {
    USDC: {
        name: 'USD Coin',
        symbol: 'USDC',
        address: process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS || '',
        decimals: 6
    },
    USDT: {
        name: 'Tether USD',
        symbol: 'USDT',
        address: process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS || '',
        decimals: 6
    }
};

/**
 * Get a token contract instance
 */
export const getTokenContract = (tokenAddress: string, provider: ethers.providers.Provider) => {
    return new ethers.Contract(tokenAddress, ERC20_ABI, provider);
};

/**
 * Convert stablecoin amount to HBAR based on current exchange rate
 */
export const convertToHbar = async (
    amount: number,
    tokenSymbol: 'USDC' | 'USDT'
): Promise<number> => {
    // Get the current exchange rate (USD per HBAR)
    const result = await hederaService.queryContract(
        process.env.NEXT_PUBLIC_MANAGE_STOCK_CONTRACT_ID || '',
        'getHbarExchangeRate'
    );

    // The exchange rate is returned as tiny cents per tiny bar (8 decimal places)
    const rateValue = Number(result.getInt64(0));
    const usdPerHbar = rateValue / 100000000;

    // Convert stablecoin amount to HBAR
    // stablecoin amount / USD per HBAR = HBAR amount
    return amount / usdPerHbar;
};

/**
 * Approve the contract to spend stablecoins
 */
export const approveTokenSpend = async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    signer: ethers.Signer
): Promise<boolean> => {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const tx = await tokenContract.approve(spenderAddress, amount);
        await tx.wait();
        return true;
    } catch (error) {
        console.error('Error approving token spend:', error);
        return false;
    }
};

/**
 * Get user's token balance
 */
export const getTokenBalance = async (
    tokenAddress: string,
    userAddress: string,
    provider: ethers.providers.Provider
): Promise<string> => {
    try {
        const tokenContract = getTokenContract(tokenAddress, provider);
        const decimals = await tokenContract.decimals();
        const balance = await tokenContract.balanceOf(userAddress);
        return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
        console.error('Error getting token balance:', error);
        return '0';
    }
};

/**
 * Check if user has given allowance to spender
 */
export const checkAllowance = async (
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    provider: ethers.providers.Provider
): Promise<string> => {
    try {
        const tokenContract = getTokenContract(tokenAddress, provider);
        const decimals = await tokenContract.decimals();
        const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
        return ethers.utils.formatUnits(allowance, decimals);
    } catch (error) {
        console.error('Error checking allowance:', error);
        return '0';
    }
}; 