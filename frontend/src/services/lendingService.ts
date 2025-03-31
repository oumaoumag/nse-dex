import { CONTRACT_IDS } from '../contract-addresses.json';
import TajiriLendingABI from '../abis/TajiriLending.json';
import { createClient } from '@/utils/hederaClient';

export interface LoanOffer {
    id: number;
    creator: string;
    offerType: 'lender' | 'borrower'; // 0 for lender offer, 1 for borrower request
    stablecoinAddress: string;
    loanAmount: string;
    interestRate: number;
    duration: number; // in days
    collateralTokenAddress: string;
    collateralAmount: string;
    createdAt: number;
    status: 'pending' | 'active' | 'repaid' | 'defaulted' | 'cancelled'; // 0, 1, 2, 3, 4
    borrower: string;
    lender: string;
    startTime: number;
    endTime: number;
    repaidAmount: string;
    collateralLocked: boolean;
}

/**
 * Service for interacting with the TajiriLending smart contract
 */
class LendingService {
    private client: any;
    private contractId: string;

    constructor() {
        this.client = createClient();
        this.contractId = CONTRACT_IDS.TajiriLending || '';
    }

    /**
     * Create a loan offer as a lender
     */
    async createLenderOffer(
        stablecoinAddress: string,
        loanAmount: string,
        interestRate: number,
        duration: number,
        collateralTokenAddress: string,
        collateralAmount: string
    ): Promise<number> {
        try {
            const contract = await this.client.contractExecute(
                this.contractId,
                'createLenderOffer',
                [stablecoinAddress, loanAmount, interestRate * 100, duration, collateralTokenAddress, collateralAmount]
            );

            // Parse the loan ID from the contract response
            return parseInt(contract.receipt.logs[0].data); // This is a simplified example
        } catch (err) {
            console.error('Error creating lender offer:', err);
            throw err;
        }
    }

    /**
     * Create a loan request as a borrower
     */
    async createBorrowerRequest(
        stablecoinAddress: string,
        loanAmount: string,
        interestRate: number,
        duration: number,
        collateralTokenAddress: string,
        collateralAmount: string
    ): Promise<number> {
        try {
            const contract = await this.client.contractExecute(
                this.contractId,
                'createBorrowerRequest',
                [stablecoinAddress, loanAmount, interestRate * 100, duration, collateralTokenAddress, collateralAmount]
            );

            // Parse the loan ID from the contract response
            return parseInt(contract.receipt.logs[0].data); // This is a simplified example
        } catch (err) {
            console.error('Error creating borrower request:', err);
            throw err;
        }
    }

    /**
     * Accept a loan offer as a borrower
     */
    async acceptLoanOfferAsBorrower(loanId: number): Promise<boolean> {
        try {
            await this.client.contractExecute(
                this.contractId,
                'acceptLoanOfferAsBorrower',
                [loanId]
            );
            return true;
        } catch (err) {
            console.error('Error accepting loan offer:', err);
            throw err;
        }
    }

    /**
     * Accept a loan request as a lender
     */
    async acceptLoanRequestAsLender(loanId: number): Promise<boolean> {
        try {
            await this.client.contractExecute(
                this.contractId,
                'acceptLoanRequestAsLender',
                [loanId]
            );
            return true;
        } catch (err) {
            console.error('Error accepting loan request:', err);
            throw err;
        }
    }

    /**
     * Deposit collateral for a loan
     */
    async depositCollateral(loanId: number, amount: string): Promise<boolean> {
        try {
            await this.client.contractExecute(
                this.contractId,
                'depositCollateral',
                [loanId, amount]
            );
            return true;
        } catch (err) {
            console.error('Error depositing collateral:', err);
            throw err;
        }
    }

    /**
     * Fund a loan as a lender
     */
    async fundLoan(loanId: number): Promise<boolean> {
        try {
            await this.client.contractExecute(
                this.contractId,
                'fundLoan',
                [loanId]
            );
            return true;
        } catch (err) {
            console.error('Error funding loan:', err);
            throw err;
        }
    }

    /**
     * Repay a loan as a borrower
     */
    async repayLoan(loanId: number, amount: string): Promise<boolean> {
        try {
            await this.client.contractExecute(
                this.contractId,
                'repayLoan',
                [loanId, amount]
            );
            return true;
        } catch (err) {
            console.error('Error repaying loan:', err);
            throw err;
        }
    }

    /**
     * Liquidate collateral for a defaulted loan
     */
    async liquidateCollateral(loanId: number): Promise<boolean> {
        try {
            await this.client.contractExecute(
                this.contractId,
                'liquidateCollateral',
                [loanId]
            );
            return true;
        } catch (err) {
            console.error('Error liquidating collateral:', err);
            throw err;
        }
    }

    /**
     * Cancel a pending loan offer or request
     */
    async cancelLoanOffer(loanId: number): Promise<boolean> {
        try {
            await this.client.contractExecute(
                this.contractId,
                'cancelLoanOffer',
                [loanId]
            );
            return true;
        } catch (err) {
            console.error('Error cancelling loan offer:', err);
            throw err;
        }
    }

    /**
     * Get loan details
     */
    async getLoanDetails(loanId: number): Promise<LoanOffer> {
        try {
            const result = await this.client.contractCall(
                this.contractId,
                'getLoanDetails',
                [loanId]
            );

            // Parse the loan details from the contract response
            return this.parseLoanOffer(result);
        } catch (err) {
            console.error('Error getting loan details:', err);
            throw err;
        }
    }

    /**
     * Get all active loans for a user
     */
    async getUserActiveLoans(userAddress: string): Promise<number[]> {
        try {
            const result = await this.client.contractCall(
                this.contractId,
                'getUserActiveLoans',
                [userAddress]
            );

            // Parse the loan IDs from the contract response
            return result.map((id: any) => parseInt(id));
        } catch (err) {
            console.error('Error getting user active loans:', err);
            throw err;
        }
    }

    /**
     * Calculate total amount due for a loan
     */
    async calculateTotalDue(loanId: number): Promise<string> {
        try {
            const result = await this.client.contractCall(
                this.contractId,
                'calculateTotalDue',
                [loanId]
            );

            return result.toString();
        } catch (err) {
            console.error('Error calculating total due:', err);
            throw err;
        }
    }

    /**
     * Check if collateral is sufficient for a loan
     */
    async isCollateralSufficient(
        collateralTokenAddress: string,
        collateralAmount: string,
        stablecoinAddress: string,
        loanAmount: string
    ): Promise<boolean> {
        try {
            const result = await this.client.contractCall(
                this.contractId,
                'isCollateralSufficient',
                [collateralTokenAddress, collateralAmount, stablecoinAddress, loanAmount]
            );

            return result;
        } catch (err) {
            console.error('Error checking collateral sufficiency:', err);
            throw err;
        }
    }

    /**
     * Parse loan offer response from the contract
     */
    private parseLoanOffer(response: any): LoanOffer {
        const statusMap = ['pending', 'active', 'repaid', 'defaulted', 'cancelled'];
        const offerTypeMap = ['lender', 'borrower'];

        return {
            id: parseInt(response[0]),
            creator: response[1],
            offerType: offerTypeMap[parseInt(response[2])],
            stablecoinAddress: response[3],
            loanAmount: response[4].toString(),
            interestRate: parseInt(response[5]) / 100, // Convert from basis points to percentage
            duration: parseInt(response[6]),
            collateralTokenAddress: response[7],
            collateralAmount: response[8].toString(),
            createdAt: parseInt(response[9]) * 1000, // Convert to milliseconds
            status: statusMap[parseInt(response[10])],
            borrower: response[11],
            lender: response[12],
            startTime: parseInt(response[13]) * 1000, // Convert to milliseconds
            endTime: parseInt(response[14]) * 1000, // Convert to milliseconds
            repaidAmount: response[15].toString(),
            collateralLocked: response[16]
        };
    }
}

export const lendingService = new LendingService();
export default lendingService; 