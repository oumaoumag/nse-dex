# SafaricomStock

## Overview

`SafaricomStock` is a Hedera Token Service (HTS) wrapper contract for Safaricom stock tokens. It provides an interface to interact with a Safaricom stock token on the Hedera network, enabling token creation, minting, burning, and transferring.

## Contract Details

- **License**: MIT
- **Solidity Version**: ^0.8.20
- **Hedera Compatibility**: Full native support for HTS

## Hedera Precompile Addresses

The contract uses the following Hedera precompile:
- `HTS_PRECOMPILE`: Hedera Token Service (address 0x167)

## State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `tokenAddress` | address | The address of the created HTS token |
| `name` | string | The token name ("Safaricom") |
| `symbol` | string | The token symbol ("SCOM") |
| `decimals` | uint8 | The number of decimal places (8) |
| `owner` | address | The owner of the token contract |

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `TokenCreated` | tokenId | Emitted when a new token is created |
| `TokensMinted` | to, amount | Emitted when tokens are minted to an address |
| `TokensBurned` | amount | Emitted when tokens are burned |
| `OwnershipTransferred` | previousOwner, newOwner | Emitted when contract ownership changes |

## Modifiers

| Modifier | Description |
|----------|-------------|
| `onlyOwner` | Restricts function access to the contract owner |

## Functions

### Constructor

```solidity
constructor()
```

Initializes the contract with the deployer as the owner.

### Token Management

#### createToken

```solidity
function createToken(int64 initialSupply, address treasuryAccount) external onlyOwner returns (address)
```

Creates a new Safaricom token using the Hedera Token Service.

- **Parameters**:
  - `initialSupply`: The initial token supply
  - `treasuryAccount`: The account that will receive the initial supply
- **Returns**: The address of the created token

#### mint

```solidity
function mint(address to, int64 amount) external onlyOwner
```

Mints new tokens to a specific address.

- **Parameters**:
  - `to`: Address receiving the minted tokens
  - `amount`: Amount to mint (as int64)

#### burn

```solidity
function burn(int64 amount) external onlyOwner
```

Burns a specified amount of tokens.

- **Parameters**:
  - `amount`: Amount to burn (as int64)

#### transferToken

```solidity
function transferToken(address to, int64 amount) public onlyOwner
```

Transfers tokens to a specified address.

- **Parameters**:
  - `to`: Recipient address
  - `amount`: Amount to transfer (as int64)

### Contract Management

#### transferOwnership

```solidity
function transferOwnership(address newOwner) external onlyOwner
```

Transfers ownership of the contract to a new address.

- **Parameters**:
  - `newOwner`: Address of the new owner

### Informational Functions

#### getTokenInfo

```solidity
function getTokenInfo() external view returns (string memory, string memory, uint8, address)
```

Returns basic information about the token.

- **Returns**: Tuple containing (name, symbol, decimals, tokenAddress)

## Usage Examples

### Creating a New Token

```solidity
// Deploy the contract
SafaricomStock tokenContract = new SafaricomStock();

// Create a new token with initial supply
address tokenAddress = tokenContract.createToken(10000000, treasuryAddress);
```

### Minting Tokens

```solidity
// Mint tokens to a recipient
tokenContract.mint(recipientAddress, 1000);
```

### Transferring Tokens

```solidity
// Transfer tokens to a recipient
tokenContract.transferToken(recipientAddress, 500);
```

### Burning Tokens

```solidity
// Burn tokens
tokenContract.burn(200);
```

## Integration with Stock Trading System

This token contract is designed to work with the Tajiri stock trading system. After deployment:

1. The token address should be registered with `ManageStock.addStock`
2. Users can then mint, trade, and redeem these tokens through the stock trading contracts

## Hedera Token Service Integration

The contract uses HTS precompiles for all token operations, ensuring:

1. **Compliance**: Fully compliant with Hedera token standards
2. **Efficiency**: Optimized gas usage through direct precompile calls
3. **Security**: Enhanced security through Hedera's native token service

## Error Handling

The contract includes robust error handling with HTS response codes:
- Code 22 indicates successful operations
- Other codes trigger specific error messages

## Upgradeability Considerations

This contract is not upgradeable. Once deployed:
- The token name and symbol cannot be changed
- The contract owner can be changed via `transferOwnership`
- New tokens can be minted as needed by the owner
