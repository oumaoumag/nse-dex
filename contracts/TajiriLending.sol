// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./TajiriWallet.sol";
import "./safaricomStock.sol";

/**
 * @title TajiriLending
 * @dev Smart contract for peer-to-peer lending using Tajiri tokens as collateral
 */
contract TajiriLending {
    // ======== State Variables ========
    address public owner;
    
    // Supported tokens as collateral
    mapping(address => bool) public supportedCollateralTokens;
    
    // Supported stablecoins for lending
    mapping(address => bool) public supportedStablecoins;
    
    // Collateral ratio required (in percentage, e.g. 150 means 150%)
    uint256 public collateralRatio = 150;
    
    // Fee percentage (in basis points, e.g. 50 means 0.5%)
    uint256 public platformFee = 50;
    
    // Liquidation threshold (in percentage, e.g. 120 means 120%)
    uint256 public liquidationThreshold = 120;
    
    // Loan duration options in days
    uint256[] public loanDurationOptions = [7, 14, 30, 60, 90];
    
    // Minimum and maximum loan amounts in USD (scaled by 1e6 for USDC/USDT decimals)
    uint256 public minLoanAmount = 10 * 1e6; // $10
    uint256 public maxLoanAmount = 10000 * 1e6; // $10,000
    
    // ======== Data Structures ========
    enum LoanStatus {
        PENDING,      // Offer created but not accepted
        ACTIVE,       // Loan is active
        REPAID,       // Loan has been repaid
        DEFAULTED,    // Loan defaulted, collateral liquidated
        CANCELLED     // Loan offer cancelled
    }
    
    enum LoanType {
        LENDER_OFFER, // Lender created an offer for borrowers
        BORROWER_REQUEST // Borrower requested a loan from lenders
    }
    
    struct LoanOffer {
        uint256 id;
        address creator;
        LoanType offerType;
        address stablecoinAddress;    // Address of the stablecoin used for the loan
        uint256 loanAmount;           // Amount in stablecoin
        uint256 interestRate;         // Annual interest rate in basis points (1% = 100)
        uint256 duration;             // Loan duration in days
        address collateralTokenAddress; // Address of the token used as collateral
        uint256 collateralAmount;     // Amount of collateral tokens
        uint256 createdAt;            // Timestamp when offer was created
        LoanStatus status;            // Current status of the loan
        address borrower;             // Address of the borrower (if accepted)
        address lender;               // Address of the lender (if accepted)
        uint256 startTime;            // Timestamp when loan started
        uint256 endTime;              // Timestamp when loan should be repaid
        uint256 repaidAmount;         // Amount already repaid
        bool collateralLocked;        // Whether collateral is locked in contract
    }
    
    // ======== Storage ========
    // Mapping from loan ID to loan offer
    mapping(uint256 => LoanOffer) public loans;
    
    // Counter for generating loan IDs
    uint256 private nextLoanId = 1;
    
    // Mapping of user's active loans (address => loan IDs)
    mapping(address => uint256[]) public userActiveLoans;
    
    // Mapping to track collateral balances stored in this contract
    mapping(address => mapping(address => uint256)) public collateralBalances;
    
    // ======== Events ========
    event LoanOfferCreated(uint256 indexed loanId, address indexed creator, LoanType offerType);
    event LoanOfferAccepted(uint256 indexed loanId, address indexed borrower, address indexed lender);
    event CollateralDeposited(uint256 indexed loanId, address indexed tokenAddress, uint256 amount);
    event LoanFunded(uint256 indexed loanId, address indexed lender, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, uint256 amount, bool fullyRepaid);
    event CollateralReleased(uint256 indexed loanId, address indexed recipient, uint256 amount);
    event CollateralLiquidated(uint256 indexed loanId, address indexed liquidator, uint256 amount);
    event LoanCancelled(uint256 indexed loanId);
    event TokenAdded(address indexed tokenAddress, bool isSupportedCollateral, bool isSupportedStablecoin);
    event TokenRemoved(address indexed tokenAddress, bool wasCollateral, bool wasStablecoin);
    
    // ======== Constructor ========
    constructor() {
        owner = msg.sender;
    }
    
    // ======== Modifiers ========
    modifier onlyOwner() {
        require(msg.sender == owner, "TajiriLending: caller is not the owner");
        _;
    }
    
    modifier validLoan(uint256 loanId) {
        require(loans[loanId].id == loanId, "TajiriLending: loan does not exist");
        _;
    }
    
    modifier onlyLoanParticipant(uint256 loanId) {
        require(
            msg.sender == loans[loanId].borrower || 
            msg.sender == loans[loanId].lender ||
            msg.sender == loans[loanId].creator, 
            "TajiriLending: caller is not a participant in this loan"
        );
        _;
    }
    
    // ======== Admin Functions ========
    /**
     * @dev Add a token to the supported list
     * @param tokenAddress Address of the token
     * @param isCollateral Whether the token can be used as collateral
     * @param isStablecoin Whether the token can be used as a stablecoin for loans
     */
    function addSupportedToken(
        address tokenAddress, 
        bool isCollateral, 
        bool isStablecoin
    ) external onlyOwner {
        if (isCollateral) {
            supportedCollateralTokens[tokenAddress] = true;
        }
        
        if (isStablecoin) {
            supportedStablecoins[tokenAddress] = true;
        }
        
        emit TokenAdded(tokenAddress, isCollateral, isStablecoin);
    }
    
    /**
     * @dev Remove a token from the supported list
     * @param tokenAddress Address of the token
     * @param removeCollateral Whether to remove as collateral
     * @param removeStablecoin Whether to remove as stablecoin
     */
    function removeSupportedToken(
        address tokenAddress, 
        bool removeCollateral, 
        bool removeStablecoin
    ) external onlyOwner {
        bool wasCollateral = supportedCollateralTokens[tokenAddress];
        bool wasStablecoin = supportedStablecoins[tokenAddress];
        
        if (removeCollateral && wasCollateral) {
            supportedCollateralTokens[tokenAddress] = false;
        }
        
        if (removeStablecoin && wasStablecoin) {
            supportedStablecoins[tokenAddress] = false;
        }
        
        emit TokenRemoved(tokenAddress, wasCollateral, wasStablecoin);
    }
    
    /**
     * @dev Update platform parameters
     */
    function updateParameters(
        uint256 _collateralRatio,
        uint256 _platformFee,
        uint256 _liquidationThreshold,
        uint256 _minLoanAmount,
        uint256 _maxLoanAmount
    ) external onlyOwner {
        collateralRatio = _collateralRatio;
        platformFee = _platformFee;
        liquidationThreshold = _liquidationThreshold;
        minLoanAmount = _minLoanAmount;
        maxLoanAmount = _maxLoanAmount;
    }
    
    // ======== Loan Creation Functions ========
    /**
     * @dev Create a loan offer as a lender
     * @param stablecoinAddress Address of the stablecoin used for the loan
     * @param loanAmount Amount in stablecoin
     * @param interestRate Annual interest rate in basis points
     * @param duration Loan duration in days
     * @param collateralTokenAddress Address of the token used as collateral
     * @param collateralAmount Minimum amount of collateral tokens required
     * @return loanId ID of the created loan offer
     */
    function createLenderOffer(
        address stablecoinAddress,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 duration,
        address collateralTokenAddress,
        uint256 collateralAmount
    ) external returns (uint256 loanId) {
        require(supportedStablecoins[stablecoinAddress], "TajiriLending: stablecoin not supported");
        require(supportedCollateralTokens[collateralTokenAddress], "TajiriLending: collateral token not supported");
        require(loanAmount >= minLoanAmount && loanAmount <= maxLoanAmount, "TajiriLending: invalid loan amount");
        require(isValidDuration(duration), "TajiriLending: invalid loan duration");
        
        // Ensure sufficient collateral value relative to loan amount
        require(isCollateralSufficient(collateralTokenAddress, collateralAmount, stablecoinAddress, loanAmount), 
            "TajiriLending: insufficient collateral for loan amount");
        
        loanId = nextLoanId++;
        
        LoanOffer storage loan = loans[loanId];
        loan.id = loanId;
        loan.creator = msg.sender;
        loan.offerType = LoanType.LENDER_OFFER;
        loan.stablecoinAddress = stablecoinAddress;
        loan.loanAmount = loanAmount;
        loan.interestRate = interestRate;
        loan.duration = duration;
        loan.collateralTokenAddress = collateralTokenAddress;
        loan.collateralAmount = collateralAmount;
        loan.createdAt = block.timestamp;
        loan.status = LoanStatus.PENDING;
        loan.lender = msg.sender;
        
        // Add to user's active loans
        userActiveLoans[msg.sender].push(loanId);
        
        emit LoanOfferCreated(loanId, msg.sender, LoanType.LENDER_OFFER);
        return loanId;
    }
    
    /**
     * @dev Create a loan request as a borrower
     * @param stablecoinAddress Address of the stablecoin requested
     * @param loanAmount Amount in stablecoin
     * @param interestRate Maximum interest rate willing to pay (in basis points)
     * @param duration Loan duration in days
     * @param collateralTokenAddress Address of the token used as collateral
     * @param collateralAmount Amount of collateral tokens offered
     * @return loanId ID of the created loan request
     */
    function createBorrowerRequest(
        address stablecoinAddress,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 duration,
        address collateralTokenAddress,
        uint256 collateralAmount
    ) external returns (uint256 loanId) {
        require(supportedStablecoins[stablecoinAddress], "TajiriLending: stablecoin not supported");
        require(supportedCollateralTokens[collateralTokenAddress], "TajiriLending: collateral token not supported");
        require(loanAmount >= minLoanAmount && loanAmount <= maxLoanAmount, "TajiriLending: invalid loan amount");
        require(isValidDuration(duration), "TajiriLending: invalid loan duration");
        
        // Ensure sufficient collateral value relative to loan amount
        require(isCollateralSufficient(collateralTokenAddress, collateralAmount, stablecoinAddress, loanAmount), 
            "TajiriLending: insufficient collateral for loan amount");
        
        loanId = nextLoanId++;
        
        LoanOffer storage loan = loans[loanId];
        loan.id = loanId;
        loan.creator = msg.sender;
        loan.offerType = LoanType.BORROWER_REQUEST;
        loan.stablecoinAddress = stablecoinAddress;
        loan.loanAmount = loanAmount;
        loan.interestRate = interestRate;
        loan.duration = duration;
        loan.collateralTokenAddress = collateralTokenAddress;
        loan.collateralAmount = collateralAmount;
        loan.createdAt = block.timestamp;
        loan.status = LoanStatus.PENDING;
        loan.borrower = msg.sender;
        
        // Add to user's active loans
        userActiveLoans[msg.sender].push(loanId);
        
        emit LoanOfferCreated(loanId, msg.sender, LoanType.BORROWER_REQUEST);
        return loanId;
    }
    
    /**
     * @dev Accept a loan offer as a borrower
     * @param loanId ID of the loan offer
     */
    function acceptLoanOfferAsBorrower(uint256 loanId) external validLoan(loanId) {
        LoanOffer storage loan = loans[loanId];
        
        require(loan.status == LoanStatus.PENDING, "TajiriLending: loan offer is not pending");
        require(loan.offerType == LoanType.LENDER_OFFER, "TajiriLending: not a lender offer");
        require(loan.borrower == address(0), "TajiriLending: loan already has a borrower");
        
        loan.borrower = msg.sender;
        
        // Add to borrower's active loans
        userActiveLoans[msg.sender].push(loanId);
        
        emit LoanOfferAccepted(loanId, msg.sender, loan.lender);
    }
    
    /**
     * @dev Accept a loan request as a lender
     * @param loanId ID of the loan request
     */
    function acceptLoanRequestAsLender(uint256 loanId) external validLoan(loanId) {
        LoanOffer storage loan = loans[loanId];
        
        require(loan.status == LoanStatus.PENDING, "TajiriLending: loan request is not pending");
        require(loan.offerType == LoanType.BORROWER_REQUEST, "TajiriLending: not a borrower request");
        require(loan.lender == address(0), "TajiriLending: loan already has a lender");
        
        loan.lender = msg.sender;
        
        // Add to lender's active loans
        userActiveLoans[msg.sender].push(loanId);
        
        emit LoanOfferAccepted(loanId, loan.borrower, msg.sender);
    }
    
    /**
     * @dev Deposit collateral for a loan
     * @param loanId ID of the loan
     * @param amount Amount of collateral to deposit
     */

    address constant HTS_PRECOMPILE = address(0x167);

    function depositCollateral(uint256 loanId, uint256 amount) external validLoan(loanId) {
        LoanOffer storage loan = loans[loanId];
        
        require(loan.status == LoanStatus.PENDING, "TajiriLending: loan not in pending state");
        require(loan.borrower == msg.sender, "TajiriLending: only borrower can deposit collateral");
        require(!loan.collateralLocked, "TajiriLending: collateral already locked");
        require(amount >= loan.collateralAmount, "TajiriLending: insufficient collateral amount");
        
        // Transfer collateral tokens from borrower to this contract
        (bool success, bytes memory result) = HTS_PRECOMPILE.call(
            abi.encodeWithSelector(
                "transferToken(address, address, address, int64)",
                loan.collateralTokenAddress,
                msg.sender,condition
                address(this),
                int64(uint64(amount))
            )
        );
        require(success, "TajiriLending: collateral transfer call failed");

        // Update collateral balance
        collateralBalances[msg.sender][loan.collateralTokenAddress] += amount;
        
        loan.collateralAmount = amount;
        loan.collateralLocked = true;
        
        emit CollateralDeposited(loanId, loan.collateralTokenAddress, amount);
    }
    
    /**
     * @dev Fund a loan as a lender
     * @param loanId ID of the loan
     */
    function fundLoan(uint256 loanId) external validLoan(loanId) {
        LoanOffer storage loan = loans[loanId];
        
        require(loan.status == LoanStatus.PENDING, "TajiriLending: loan not in pending state");
        require(loan.lender == msg.sender, "TajiriLending: only lender can fund the loan");
        require(loan.collateralLocked, "TajiriLending: collateral not yet deposited");
        require(loan.borrower != address(0), "TajiriLending: borrower not set");
        
        // Transfer stablecoins from lender to borrower
        TajiriWallet wallet = TajiriWallet(payable(loan.borrower));
        bool success = wallet.transferToken(loan.stablecoinAddress, loan.loanAmount, loan.borrower);
        require(success, "TajiriLending: loan funding failed");
        
        // Update loan status
        loan.status = LoanStatus.ACTIVE;
        loan.startTime = block.timestamp;
        loan.endTime = block.timestamp + (loan.duration * 1 days);
        
        emit LoanFunded(loanId, msg.sender, loan.loanAmount);
    }
    
    /**
     * @dev Repay a loan (partially or fully)
     * @param loanId ID of the loan
     * @param amount Amount to repay
     */
    function repayLoan(uint256 loanId, uint256 amount) external validLoan(loanId) {
        LoanOffer storage loan = loans[loanId];
        
        require(loan.status == LoanStatus.ACTIVE, "TajiriLending: loan not active");
        require(loan.borrower == msg.sender, "TajiriLending: only borrower can repay");
        
        uint256 totalDue = calculateTotalDue(loanId);
        uint256 remaining = totalDue - loan.repaidAmount;
        
        require(amount <= remaining, "TajiriLending: amount exceeds remaining debt");
        
        // Transfer repayment from borrower to lender
        TajiriWallet wallet = TajiriWallet(payable(msg.sender));
        bool success = wallet.transferToken(loan.stablecoinAddress, amount, loan.lender);
        require(success, "TajiriLending: repayment transfer failed");
        
        // Update repaid amount
        loan.repaidAmount += amount;
        
        bool fullyRepaid = (loan.repaidAmount >= totalDue);
        
        if (fullyRepaid) {
            // Release collateral back to borrower
            releaseCollateral(loanId);
            loan.status = LoanStatus.REPAID;
        }
        
        emit LoanRepaid(loanId, amount, fullyRepaid);
    }
    
    /**
     * @dev Release collateral back to the borrower
     * @param loanId ID of the loan
     */
    function releaseCollateral(uint256 loanId) internal validLoan(loanId) {
        LoanOffer storage loan = loans[loanId];
        
        require(loan.collateralLocked, "TajiriLending: no collateral to release");
        
        // Transfer collateral back to borrower
        SafaricomStock collateralToken = SafaricomStock(loan.collateralTokenAddress);
        bool success = collateralToken.transfer(loan.borrower, loan.collateralAmount);
        require(success, "TajiriLending: collateral release failed");
        
        // Update collateral balance
        collateralBalances[loan.borrower][loan.collateralTokenAddress] -= loan.collateralAmount;
        
        loan.collateralLocked = false;
        
        emit CollateralReleased(loanId, loan.borrower, loan.collateralAmount);
    }
    
    /**
     * @dev Liquidate collateral for a defaulted loan
     * @param loanId ID of the loan
     */
    function liquidateCollateral(uint256 loanId) external validLoan(loanId) {
        LoanOffer storage loan = loans[loanId];
        
        require(loan.status == LoanStatus.ACTIVE, "TajiriLending: loan not active");
        require(loan.lender == msg.sender || owner == msg.sender, "TajiriLending: only lender or owner can liquidate");
        require(loan.endTime < block.timestamp, "TajiriLending: loan not yet defaulted");
        require(loan.collateralLocked, "TajiriLending: no collateral to liquidate");
        
        // Transfer collateral to the lender
        SafaricomStock collateralToken = SafaricomStock(loan.collateralTokenAddress);
        bool success = collateralToken.transfer(loan.lender, loan.collateralAmount);
        require(success, "TajiriLending: collateral liquidation failed");
        
        // Update collateral balance
        collateralBalances[loan.borrower][loan.collateralTokenAddress] -= loan.collateralAmount;
        
        loan.status = LoanStatus.DEFAULTED;
        loan.collateralLocked = false;
        
        emit CollateralLiquidated(loanId, msg.sender, loan.collateralAmount);
    }
    
    /**
     * @dev Cancel a pending loan offer
     * @param loanId ID of the loan offer
     */
    function cancelLoanOffer(uint256 loanId) external validLoan(loanId) {
        LoanOffer storage loan = loans[loanId];
        
        require(loan.status == LoanStatus.PENDING, "TajiriLending: loan not in pending state");
        require(loan.creator == msg.sender || owner == msg.sender, "TajiriLending: only creator or owner can cancel");
        
        // If collateral is locked, release it
        if (loan.collateralLocked) {
            // Transfer collateral back to borrower
            SafaricomStock collateralToken = SafaricomStock(loan.collateralTokenAddress);
            bool success = collateralToken.transfer(loan.borrower, loan.collateralAmount);
            require(success, "TajiriLending: collateral release failed");
            
            // Update collateral balance
            collateralBalances[loan.borrower][loan.collateralTokenAddress] -= loan.collateralAmount;
            
            loan.collateralLocked = false;
        }
        
        loan.status = LoanStatus.CANCELLED;
        
        emit LoanCancelled(loanId);
    }
    
    // ======== View Functions ========
    /**
     * @dev Calculate total amount due for a loan (principal + interest)
     * @param loanId ID of the loan
     * @return totalDue Total amount due
     */
    function calculateTotalDue(uint256 loanId) public view validLoan(loanId) returns (uint256 totalDue) {
        LoanOffer storage loan = loans[loanId];
        
        // Calculate interest based on annual rate
        uint256 interestAmount = (loan.loanAmount * loan.interestRate * loan.duration) / (10000 * 365);
        
        // Add platform fee
        uint256 feeAmount = (loan.loanAmount * platformFee) / 10000;
        
        totalDue = loan.loanAmount + interestAmount + feeAmount;
        return totalDue;
    }
    
    /**
     * @dev Get all active loans for a user
     * @param user Address of the user
     * @return loanIds Array of loan IDs
     */
    function getUserActiveLoans(address user) external view returns (uint256[] memory) {
        return userActiveLoans[user];
    }
    
    /**
     * @dev Get detailed loan information
     * @param loanId ID of the loan
     * @return loan Loan information
     */
    function getLoanDetails(uint256 loanId) external view validLoan(loanId) returns (LoanOffer memory) {
        return loans[loanId];
    }
    
    /**
     * @dev Check if loan duration is valid
     * @param duration Duration in days
     * @return isValid True if valid
     */
    function isValidDuration(uint256 duration) public view returns (bool isValid) {
        for (uint256 i = 0; i < loanDurationOptions.length; i++) {
            if (loanDurationOptions[i] == duration) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Check if collateral is sufficient for the loan amount
     * @param collateralTokenAddress Address of the collateral token
     * @param collateralAmount Amount of collateral
     * @param stablecoinAddress Address of the stablecoin
     * @param loanAmount Loan amount
     * @return isSufficient True if sufficient
     */
    function isCollateralSufficient(
        address collateralTokenAddress,
        uint256 collateralAmount,
        address stablecoinAddress,
        uint256 loanAmount
    ) public view returns (bool isSufficient) {
        // This would typically involve an oracle to get token prices
        // For simplicity, using a mock implementation that assumes:
        // 1. Both collateral token and stablecoin have 6 decimals
        // 2. A fixed collateral:loan ratio requirement
        
        // In a real implementation, you'd use an oracle to get current prices
        uint256 collateralValue = getCollateralValue(collateralTokenAddress, collateralAmount);
        
        // Check if collateral value meets the required ratio
        return (collateralValue * 100) >= (loanAmount * collateralRatio);
    }
    
    /**
     * @dev Get the value of collateral in USD
     * @param tokenAddress Address of the token
     * @param amount Amount of tokens
     * @return value Value in USD (scaled by 1e6)
     */
    function getCollateralValue(address tokenAddress, uint256 amount) public view returns (uint256 value) {
        // Mock price calculation - in production, use an oracle
        if (tokenAddress == address(0x1)) {
            // Example SAFCOM token
            return (amount * 5 * 1e6) / 1e18; // Assume 1 SAFCOM = $5 USD and has 18 decimals
        } else if (tokenAddress == address(0x2)) {
            // Example EQTY token
            return (amount * 3 * 1e6) / 1e18; // Assume 1 EQTY = $3 USD and has 18 decimals
        } else {
            // Default case
            return (amount * 1 * 1e6) / 1e18; // Assume 1:1 with USD and 18 decimals
        }
    }
} 