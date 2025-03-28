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

    mapping(bytes32 => bool) public executedTxs;

    address constant HTS_PRECOMPILE = address(0x167);

    event Executed(address indexed target, uint256 value, bytes data, bytes response);
    event GuardianAdded(address indexed guardian);
    event GuardianRemoved(address indexed guardian);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

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

    /// @notice Recover wallet ownership using guardian signatures
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
        (bool success,) = HTS_PRECOMPILE.call(
            abi.encodeWithSignature("associateToken(address,address)", address(this), tokenId)
        );
        require(success, "Token association failed");
    }

    /// @notice Transfer an HTS token
    /// @param tokenId The HTS token address
    /// @param recipient The recipient address
    /// @param amount The amount to transfer
    function transferToken(address tokenId, address recipient, uint256 amount) 
        external 
        onlyOwner 
    {
        (bool success,) = HTS_PRECOMPILE.call(
            abi.encodeWithSignature(
                "transferToken(address,address,address,int64)",
                tokenId,
                address(this),
                recipient,
                int64(uint64(amount))
            )
        );
        require(success, "Token transfer failed");
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

    /// @notice Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    receive() external payable {}
    fallback() external payable {}
}