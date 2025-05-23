// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TajiriWallet - Smart Contract Wallet with Account Abstraction Features
/// @notice This contract enables account abstraction wallets for the Tajiri platform on Hedera
contract TajiriWallet {
    address public owner;
    mapping(address => bool) public guardians;
    uint256 public guardianCount;
    uint256 public recoveryThreshold;
    uint256 public nonce;
    
    // New recovery state tracking
    bool public recoveryInProgress;
    address public recoveryInitiator;
    address public proposedNewOwner;
    mapping(address => bool) public recoveryApprovals;
    uint256 public recoveryApprovalCount;
    uint256 public recoveryTimestamp;
    uint256 public constant RECOVERY_TIMELOCK = 2 days;

    mapping(bytes32 => bool) public executedTxs;

    // Hedera service precompile addresses
address constant HTS_PRECOMPILE = address(0x167); // Hedera Token Service
address constant EXCHANGE_RATE_PRECOMPILE = address(0x168); // Exchange Rate Service
address constant HBAR_TRANSFER_PRECOMPILE = address(0x169); // HBAR Transfer Service

    event Executed(address indexed target, uint256 value, bytes data, bytes response);
    event BatchExecuted(address[] targets, uint256[] values, bytes[] data);
    event GuardianAdded(address indexed guardian);
    event GuardianRemoved(address indexed guardian);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event RecoveryInitiated(address indexed initiator, address indexed proposedOwner);
    event RecoveryApproved(address indexed guardian, address indexed proposedOwner);
    event RecoveryCancelled();
    event RecoveryCompleted(address indexed oldOwner, address indexed newOwner);

    /// @notice Constructor to initialize the wallet with an owner
    /// @param _owner The initial owner of the wallet
    constructor(address _owner) {
        require(_owner != address(0), "Invalid owner address");
        owner = _owner;
        recoveryThreshold = 1;
    }

    /// @notice Execute a transaction directly by the owner
    /// @param target The contract or address to call
    /// @param value Amount of HBAR to send (in tinybars)
    /// @param data Calldata for the target
    /// @return response The response data from the call
    function execute(address target, uint256 value, bytes calldata data) 
        external 
        payable 
        onlyOwner 
        returns (bytes memory) 
    {
        require(target != address(0), "Invalid target address");
        (bool success, bytes memory response) = target.call{value: value}(data);
        require(success, "Execution failed");
        emit Executed(target, value, data, response);
        return response;
    }
    
    /// @notice Execute multiple transactions in a single call (batched transactions)
    /// @param targets Array of target addresses to call
    /// @param values Array of HBAR amounts to send with each call
    /// @param data Array of calldata for each target
    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata data
    ) external payable onlyOwner {
        require(targets.length > 0, "Empty batch");
        require(targets.length == values.length && values.length == data.length, "Array length mismatch");
        
        // Execute each transaction in the batch
        for (uint256 i = 0; i < targets.length; i++) {
            require(targets[i] != address(0), "Invalid target address");
            (bool success, ) = targets[i].call{value: values[i]}(data[i]);
            require(success, "Batch execution failed");
        }
        
        emit BatchExecuted(targets, values, data);
    }

    /// @notice Add a guardian for social recovery
    /// @param guardian The address to add as a guardian
    function addGuardian(address guardian) external onlyOwner {
        require(guardian != address(0), "Invalid guardian address");
        require(!guardians[guardian], "Already a guardian");
        guardians[guardian] = true;
        guardianCount++;
        emit GuardianAdded(guardian);
    }

    /// @notice Remove a guardian
    /// @param guardian The address to remove as a guardian
    function removeGuardian(address guardian) external onlyOwner {
        require(guardians[guardian], "Not a guardian");
        guardians[guardian] = false;
        guardianCount--;
        emit GuardianRemoved(guardian);
    }

    /// @notice Set the recovery threshold
    /// @param newThreshold Number of guardians required for recovery
    function setRecoveryThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0 && newThreshold <= guardianCount, "Invalid threshold");
        recoveryThreshold = newThreshold;
    }
    
    /// @notice Get all guardians
    /// @return Array of guardian addresses
    function getGuardians() external view returns (address[] memory) {
        address[] memory result = new address[](guardianCount);
        uint256 index = 0;
        
        // This is inefficient in a real-world scenario but works for our demo
        for (uint i = 0; i < 100; i++) {
            address potentialGuardian = address(uint160(i));
            if (guardians[potentialGuardian]) {
                result[index] = potentialGuardian;
                index++;
                if (index >= guardianCount) break;
            }
        }
        
        return result;
    }
    
    /// @notice Get the current recovery status
    /// @return inProgress Whether recovery is in progress
    /// @return initiator The address that initiated recovery
    /// @return newOwner The proposed new owner
    /// @return approvalCount Current number of approvals
    /// @return timeRemaining Time remaining until the recovery can be completed
    function getRecoveryStatus() external view returns (
        bool inProgress,
        address initiator,
        address newOwner,
        uint256 approvalCount,
        uint256 timeRemaining
    ) {
        if (recoveryInProgress) {
            uint256 elapsed = block.timestamp - recoveryTimestamp;
            uint256 remaining = elapsed >= RECOVERY_TIMELOCK ? 0 : RECOVERY_TIMELOCK - elapsed;
            return (
                true,
                recoveryInitiator,
                proposedNewOwner,
                recoveryApprovalCount,
                remaining
            );
        } else {
            return (false, address(0), address(0), 0, 0);
        }
    }
    
    /// @notice Initiate the social recovery process
    /// @param newOwner The proposed new owner address
    function initiateRecovery(address newOwner) external {
        require(guardians[msg.sender], "Only guardians can initiate recovery");
        require(newOwner != address(0), "Invalid new owner address");
        require(!recoveryInProgress, "Recovery already in progress");
        
        // Initialize recovery state
        recoveryInProgress = true;
        recoveryInitiator = msg.sender;
        proposedNewOwner = newOwner;
        recoveryTimestamp = block.timestamp;
        
        // Reset approvals and add the initiator's approval
        recoveryApprovalCount = 1;
        recoveryApprovals[msg.sender] = true;
        
        emit RecoveryInitiated(msg.sender, newOwner);
    }
    
    /// @notice Approve an ongoing recovery process
    /// @param newOwner Must match the currently proposed owner
    function approveRecovery(address newOwner) external {
        require(guardians[msg.sender], "Only guardians can approve recovery");
        require(recoveryInProgress, "No recovery in progress");
        require(newOwner == proposedNewOwner, "Proposed owner mismatch");
        require(!recoveryApprovals[msg.sender], "Already approved");
        
        recoveryApprovals[msg.sender] = true;
        recoveryApprovalCount++;
        
        emit RecoveryApproved(msg.sender, newOwner);
        
        // If we have enough approvals and timelock has passed, complete recovery
        if (recoveryApprovalCount >= recoveryThreshold && 
            (block.timestamp - recoveryTimestamp) >= RECOVERY_TIMELOCK) {
            _completeRecovery();
        }
    }
    
    /// @notice Complete the recovery process after timelock and threshold are met
    function completeRecovery() external {
        require(recoveryInProgress, "No recovery in progress");
        require(recoveryApprovalCount >= recoveryThreshold, "Not enough approvals");
        require((block.timestamp - recoveryTimestamp) >= RECOVERY_TIMELOCK, "Timelock not expired");
        
        _completeRecovery();
    }
    
    /// @notice Internal function to complete the recovery
    function _completeRecovery() internal {
        address oldOwner = owner;
        owner = proposedNewOwner;
        
        // Reset recovery state
        _resetRecoveryState();
        
        emit RecoveryCompleted(oldOwner, owner);
        emit OwnerChanged(oldOwner, owner);
    }
    
    /// @notice Cancel an ongoing recovery process
    function cancelRecovery() external {
        require(recoveryInProgress, "No recovery in progress");
        require(msg.sender == owner || guardians[msg.sender], "Unauthorized");
        
        _resetRecoveryState();
        
        emit RecoveryCancelled();
    }
    
    /// @notice Reset the recovery state
    function _resetRecoveryState() internal {
        recoveryInProgress = false;
        recoveryInitiator = address(0);
        proposedNewOwner = address(0);
        recoveryApprovalCount = 0;
        recoveryTimestamp = 0;
    }

    /// @notice Recover wallet ownership using guardian signatures (legacy method)
    /// @param newOwner The new owner address
    /// @param signatures Array of guardian signatures
    function recoverWallet(address newOwner, bytes[] calldata signatures) external {
        require(newOwner != address(0), "Invalid new owner");
        require(signatures.length >= recoveryThreshold, "Not enough signatures");

        bytes32 messageHash = keccak256(abi.encodePacked(address(this), newOwner));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));

        address[] memory signers = new address[](signatures.length);
        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = recoverSigner(prefixedHash, signatures[i]);
            require(guardians[signer], "Signer is not a guardian");
            // Check for duplicate signatures
            for (uint256 j = 0; j < i; j++) {
                require(signers[j] != signer, "Duplicate signature");
            }
            signers[i] = signer;
        }

        address oldOwner = owner;
        owner = newOwner;
        emit OwnerChanged(oldOwner, newOwner);
    }

    /// @notice Execute a gasless meta-transaction
    /// @param target The contract or address to call
    /// @param value Amount of HBAR to send (in tinybars)
    /// @param data Calldata for the target
    /// @param userSignature Owner's signature for the transaction
    /// @return response The response data from the call
    function executeMetaTransaction(
        address target,
        uint256 value,
        bytes calldata data,
        bytes calldata userSignature
    ) external payable returns (bytes memory) {
        require(target != address(0), "Invalid target address");
        bytes32 txHash = keccak256(abi.encodePacked(target, value, data, nonce));
        require(!executedTxs[txHash], "Transaction already executed");

        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", txHash));
        address signer = recoverSigner(prefixedHash, userSignature);
        require(signer == owner, "Invalid signature");

        nonce++;
        executedTxs[txHash] = true;

        (bool success, bytes memory response) = target.call{value: value}(data);
        require(success, "Execution failed");

        emit Executed(target, value, data, response);
        return response;
    }

    /// @notice Approve token spending
    /// @param tokenContract The token contract address
    /// @param spender The address approved to spend tokens
    /// @param amount The amount to approve
    function approveToken(address tokenContract, address spender, uint256 amount) 
        external 
        onlyOwner 
    {
        require(tokenContract != address(0), "Invalid token address");
        (bool success,) = tokenContract.call(
            abi.encodeWithSignature("approve(address,uint256)", spender, amount)
        );
        require(success, "Token approval failed");
    }

    /// @notice Associate an HTS token with the wallet
    /// @param tokenId The HTS token address to associate
    function associateToken(address tokenId) external onlyOwner {
        (bool success, bytes memory result) = HTS_PRECOMPILE.call(
            abi.encodeWithSignature("associateToken(address,address)", address(this), tokenId)
        );
        // Better error handling with response code
        if (!success) {
            revert("Token association call failed");
        }
        int32 responseCode = abi.decode(result, (int32));
        require(responseCode == 22, string(abi.encodePacked("Token association failed with code: ", responseCode)));
    }
    
    /// @notice Check token balance
    /// @param tokenId The HTS token address
    /// @return The token balance
    function getTokenBalance(address tokenId) external view returns (uint256) {
        (bool success, bytes memory result) = HTS_PRECOMPILE.staticcall(
            abi.encodeWithSignature(
                "balanceOf(address,address)",
                tokenId,
                address(this)
            )
        );
        require(success, "Token balance query failed");
        int64 balance = abi.decode(result, (int64));
        return uint256(uint64(balance));
    }

    /// @notice Transfer an HTS token
    /// @param tokenId The HTS token address
    /// @param recipient The recipient address
    /// @param amount The amount to transfer
    function transferToken(address tokenId, address recipient, uint256 amount) 
        external 
        onlyOwner 
    {
        (bool success, bytes memory result) = HTS_PRECOMPILE.call(
            abi.encodeWithSignature(
                "transferToken(address,address,address,int64)",
                tokenId,
                address(this),
                recipient,
                int64(uint64(amount))
            )
        );
        // Better error handling with response code
        if (!success) {
            revert("Token transfer call failed");
        }
        int32 responseCode = abi.decode(result, (int32));
        require(responseCode == 22, string(abi.encodePacked("Token transfer failed with code: ", responseCode)));
    }
    
    /// @notice Recover the signer from a signature
    /// @param messageHash The hash of the signed message
    /// @param signature The signature bytes
    /// @return The address of the signer
    function recoverSigner(bytes32 messageHash, bytes memory signature) 
        internal 
        pure 
        returns (address) 
    {
        require(signature.length == 65, "Invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        if (v < 27) {
            v += 27;
        }
        require(v == 27 || v == 28, "Invalid signature version");
        address signer = ecrecover(messageHash, v, r, s);
        require(signer != address(0), "Invalid signer");
        return signer;
    }
    
    /// @notice Get current HBAR exchange rate to USD cents
    /// @return Rate in tiny USD cents (1/100 of a cent)
    function getHbarExchangeRate() public view returns (int64) {
        (bool success, bytes memory result) = EXCHANGE_RATE_PRECOMPILE.staticcall(
            abi.encodeWithSignature("hbarToTinyCents()")
        );
        require(success, "Exchange rate query failed");
        return abi.decode(result, (int64));
    }

    /// @notice Modifier to restrict access to the owner
    modifier onlyOwner {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    /// @notice Receive function to accept HBAR
    receive() external payable {}
}