// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./TajiriWallet.sol";

/// @title TajiriWalletFactory - Factory contract for deploying Tajiri Wallets
/// @notice Creates and manages Tajiri wallet contracts for users on Hedera
contract TajiriWalletFactory {
    // State variables
    mapping(address => address) public accountToWallet;
    mapping(address => bool) public isWallet;
    mapping(address => uint256) public walletCreationTime;
    address[] public allWallets;
    uint256 public totalWallets;
    address public owner;
    
    // Hedera service precompile addresses
    address constant PRNG_PRECOMPILE = address(0x169); // Pseudo Random Generator Service

    // Events
    event WalletCreated(address indexed owner, address indexed wallet, uint256 timestamp);
    event FactoryOwnerChanged(address indexed oldOwner, address indexed newOwner);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner {
        require(msg.sender == owner, "Not factory owner");
        _;
    }

    /// @notice Deploy a new Tajiri wallet for a user
    /// @param owner Address of the wallet owner
    /// @return Address of the newly created wallet
    function deployWallet(address owner) external returns (address) {
        return _createWallet(owner);
    }

    /// @notice Internal function to create a new wallet
    /// @param owner The owner of the new wallet
    /// @return Address of the newly created wallet
    function _createWallet(address owner) internal returns (address) {
        require(accountToWallet[owner] == address(0), "Wallet already exists for this account");

        // Create new wallet
        TajiriWallet wallet = new TajiriWallet(owner);
        address walletAddress = address(wallet);

        // Update mappings
        accountToWallet[owner] = walletAddress;
        isWallet[walletAddress] = true;
        walletCreationTime[walletAddress] = block.timestamp;
        
        // Update array and counter
        allWallets.push(walletAddress);
        totalWallets++;

        // Emit event with timestamp
        emit WalletCreated(owner, walletAddress, block.timestamp);

        return walletAddress;
    }

    /// @notice Get the wallet address for a specific owner
    /// @param owner The owner address to lookup
    /// @return The wallet address associated with the owner
    function getWallet(address owner) external view returns (address) {
        return accountToWallet[owner];
    }

    /// @notice Check if a wallet exists for the given owner
    /// @param owner The owner address to check
    /// @return True if the owner has a wallet
    function walletExists(address owner) external view returns (bool) {
        return accountToWallet[owner] != address(0);
    }
    
    /// @notice Get all wallets created by this factory
    /// @param startIndex The starting index for pagination
    /// @param count The number of wallets to return
    /// @return Array of wallet addresses
    function getWallets(uint256 startIndex, uint256 count) external view returns (address[] memory) {
        // Handle pagination boundaries
        if (startIndex >= allWallets.length) {
            return new address[](0);
        }
        
        uint256 endIndex = startIndex + count;
        if (endIndex > allWallets.length) {
            endIndex = allWallets.length;
        }
        
        uint256 resultLength = endIndex - startIndex;
        address[] memory result = new address[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allWallets[startIndex + i];
        }
        
        return result;
    }
    
    /// @notice Change the factory owner
    /// @param newOwner The new owner address
    function changeOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        address oldOwner = owner;
        owner = newOwner;
        emit FactoryOwnerChanged(oldOwner, newOwner);
    }
}