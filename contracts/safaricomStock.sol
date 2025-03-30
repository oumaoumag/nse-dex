// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SafaricomStock - Hedera Token Service (HTS) wrapper for Safaricom stock tokens
/// @notice This contract provides an interface to interact with a Safaricom stock token on Hedera
contract SafaricomStock {
    // Hedera Token Service precompile address
    address constant HTS_PRECOMPILE = address(0x167);
    
    // Token information
    address public tokenAddress;
    string public name = "Safaricom";
    string public symbol = "SCOM";
    uint8 public decimals = 8;
    address public owner;
    
    // Events
    event TokenCreated(address tokenId);
    event TokensMinted(address to, int64 amount);
    event TokensBurned(int64 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /// @notice Create a new Safaricom token using HTS
    /// @param initialSupply Initial token supply
    /// @param treasuryAccount Account that will receive the initial supply
    /// @return The address of the created token
    function createToken(int64 initialSupply, address treasuryAccount) external onlyOwner returns (address) {
        require(tokenAddress == address(0), "Token already created");
        
        // Prepare token creation parameters
        bytes memory parameters = abi.encode(
            name,                               // name
            symbol,                             // symbol
            treasuryAccount,                    // treasury
            address(this),                      // admin key (this contract)
            address(this),                      // KYC key (this contract)
            address(this),                      // freeze key (this contract)
            address(this),                      // wipe key (this contract)
            address(this),                      // supply key (this contract)
            address(0),                         // fee schedule key (none)
            initialSupply,                      // initial supply
            decimals                            // decimals
        );
        
        // Call HTS precompile to create token
        (bool success, bytes memory result) = HTS_PRECOMPILE.call(
            abi.encodeWithSignature("createToken(bytes)", parameters)
        );
        
        require(success, "Token creation failed");
        
        // Decode the response to get token address and response code
        (int32 responseCode, address createdToken) = abi.decode(result, (int32, address));
        require(responseCode == 22, string(abi.encodePacked("Token creation failed with code: ", responseCode)));
        
        tokenAddress = createdToken;
        emit TokenCreated(createdToken);
        
        return createdToken;
    }
    
    /// @notice Mint new tokens to a specific address
    /// @param to Address receiving the minted tokens
    /// @param amount Amount to mint
    function mint(address to, int64 amount) external onlyOwner {
        require(tokenAddress != address(0), "Token not created yet");
        require(amount > 0, "Amount must be positive");
        
        // Call HTS precompile to mint tokens
        (bool success, bytes memory result) = HTS_PRECOMPILE.call(
            abi.encodeWithSignature(
                "mintToken(address,int64)",
                tokenAddress,
                amount
            )
        );
        
        require(success, "Mint operation failed");
        
        // Decode the response to get response code
        int32 responseCode = abi.decode(result, (int32));
        require(responseCode == 22, string(abi.encodePacked("Mint failed with code: ", responseCode)));
        
        // Transfer the minted tokens to the recipient
        transferToken(to, amount);
        
        emit TokensMinted(to, amount);
    }
    
    /// @notice Burn tokens
    /// @param amount Amount to burn
    function burn(int64 amount) external onlyOwner {
        require(tokenAddress != address(0), "Token not created yet");
        require(amount > 0, "Amount must be positive");
        
        // Call HTS precompile to burn tokens
        (bool success, bytes memory result) = HTS_PRECOMPILE.call(
            abi.encodeWithSignature(
                "burnToken(address,int64)",
                tokenAddress,
                amount
            )
        );
        
        require(success, "Burn operation failed");
        
        // Decode the response to get response code
        int32 responseCode = abi.decode(result, (int32));
        require(responseCode == 22, string(abi.encodePacked("Burn failed with code: ", responseCode)));
        
        emit TokensBurned(amount);
    }
    
    /// @notice Transfer tokens to an address
    /// @param to Recipient address
    /// @param amount Amount to transfer
    function transferToken(address to, int64 amount) public onlyOwner {
        require(tokenAddress != address(0), "Token not created yet");
        
        // Call HTS precompile to transfer tokens
        (bool success, bytes memory result) = HTS_PRECOMPILE.call(
            abi.encodeWithSignature(
                "transferToken(address,address,address,int64)",
                tokenAddress,
                address(this),
                to,
                amount
            )
        );
        
        require(success, "Transfer call failed");
        
        // Decode the response to get response code
        int32 responseCode = abi.decode(result, (int32));
        require(responseCode == 22, string(abi.encodePacked("Transfer failed with code: ", responseCode)));
    }
    
    /// @notice Transfer ownership of the contract
    /// @param newOwner Address of the new owner
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    /// @notice Get token info
    /// @return tokenInfo Basic information about the token
    function getTokenInfo() external view returns (string memory, string memory, uint8, address) {
        return (name, symbol, decimals, tokenAddress);
    }
}
