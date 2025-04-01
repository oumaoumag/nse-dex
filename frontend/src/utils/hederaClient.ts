// This is a simplified client for demonstration purposes
// In a real application, you would use the Hedera JavaScript SDK

/**
 * Creates a client for interacting with Hedera network
 * @returns A client object
 */
export function createClient() {
    // For demo purposes, return a mock client
    return {
        contractExecute: async (contractId: string, functionName: string, params: any[]) => {
            console.log(`Mock executing contract ${contractId}.${functionName}(${params.join(', ')})`);
            return {
                receipt: {
                    logs: [{ data: '1234' }],
                    status: 'SUCCESS'
                }
            };
        },
        contractCall: async (contractId: string, functionName: string, params: any[]) => {
            console.log(`Mock calling contract ${contractId}.${functionName}(${params.join(', ')})`);
            // Return mock data based on function name
            if (functionName === 'getLoanDetails') {
                return {
                    id: params[0],
                    creator: '0x1234567890abcdef',
                    offerType: 0,
                    stablecoinAddress: '0xUSDC12345',
                    loanAmount: '1000000000',
                    interestRate: 500, // 5.00%
                    duration: 30,
                    collateralTokenAddress: '0xCOLLATERAL12345',
                    collateralAmount: '500000000',
                    createdAt: Date.now() - 86400000,
                    status: 1,
                    borrower: '0x2345678901abcdef',
                    lender: '0x3456789012abcdef',
                    startTime: Date.now() - 86400000,
                    endTime: Date.now() + 86400000 * 29,
                    repaidAmount: '100000000',
                    collateralLocked: true
                };
            } else if (functionName === 'getUserActiveLoans') {
                return [1, 2, 3];
            } else if (functionName === 'calculateTotalDue') {
                return '1050000000'; // Principal + interest
            }
            return null;
        }
    };
} 