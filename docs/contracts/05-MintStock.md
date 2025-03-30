# MintStock

## Overview

`MintStock` extends the `ManageStock` contract to provide functionality for minting new stock tokens. It allows users to exchange HBAR for tokenized stock, supporting both Hedera Token Service (HTS) tokens and standard ERC20 tokens.

## Contract Details

- **License**: MIT
- **Solidity Version**: ^0.8.20
- **Hedera Compatibility**: Full native support for Hedera network
- **Inherits From**: ManageStock

## Inheritance Structure

```
Ownable
  ↑
ManageStock
  ↑
MintStock
```

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `MintedStockForUser` | recipient, stockContract, stockAmount | Emitted when tokens are minted for a user |

## Functions

### Constructor

```solidity
constructor(address initialOwner) ManageStock(initialOwner)
```

Initializes the contract with the specified owner, passing the address to the parent constructor.

### Minting Functions

#### mintNewStock

```solidity
function mintNewStock(address stockContractAddress) public payable
```

Allows a user to mint new stock tokens by sending HBAR.

- **Parameters**:
  - `stockContractAddress`: Address of the stock token contract
- **Payable**: Requires HBAR to be sent with the transaction
- **Process**:
  1. Verifies HBAR was sent
  2. Calculates equivalent stock amount
  3. Handles differently based on token type (HTS or ERC20)
  4. Mints tokens to the sender
  5. Emits event

#### findEquivalentStockAmount

```solidity
function findEquivalentStockAmount(uint256 hbarSent, address stockContractAddress) internal view returns (uint256)
```

Internal function to calculate how many stock tokens the user should receive for the HBAR sent.

- **Parameters**:
  - `hbarSent`: Amount of HBAR sent
  - `stockContractAddress`: Address of the stock token contract
- **Returns**: Amount of stock tokens to mint
- **Process**:
  1. Finds the stock by address
  2. Gets the stock price in HBAR
  3. Calculates: stockAmount = hbarSent / stockPrice

## Usage Examples

### Minting Stock Tokens

```solidity
// Mint tokens by sending HBAR
// Let's say stock price is 100 HBAR and we want 5 tokens
mintStock.mintNewStock{value: 500 HBAR}(stockContractAddress);
```

### Contract-to-Contract Integration

```solidity
// Deploy MintStock with admin as owner
MintStock mintStock = new MintStock(adminAddress);

// First register a stock in the system
mintStock.addStock(
    "SCOM",              // shortName
    "Safaricom Limited", // longName
    tokenAddress,        // stockContractAddress
    100000000,           // stockPriceHbar (100 HBAR)
    true                 // isHederaToken
);

// Then users can mint by sending HBAR
// This is typically called directly by end users via a frontend
```

## Technical Process

When a user calls `mintNewStock`:

1. **Input Validation**:
   - Verifies HBAR amount is greater than zero
   - Finds the stock by contract address

2. **Token Type Handling**:
   - For HTS tokens: Uses `int64` for amount and calls HTS-specific mint
   - For ERC20 tokens: Uses `uint256` with 18 decimals and calls ERC20 mint

3. **Event Emission**:
   - Emits `MintedStockForUser` with details

## Economic Considerations

- The contract serves as an escrow, holding HBAR sent by users
- HBAR received can later be used for redemption by the `RedeemStock` contract
- Price accuracy is critical for fair exchange rates

## Security Considerations

1. **Price Manipulation**: Only the owner can update stock prices
2. **Token Compatibility**: Works with both HTS and ERC20 tokens
3. **Error Handling**: Proper validation before processing transactions

## Integration with the Trading System

This contract is the first step in the stock trading lifecycle:

1. **Mint**: Users mint tokens with HBAR (this contract)
2. **Trade**: Users trade tokens through P2P offers (subsequent contracts)
3. **Redeem**: Users redeem tokens back to HBAR (RedeemStock contract)

## Extending the Contract

This contract is extended by `RedeemStock` to complete the token lifecycle with redemption functionality.
