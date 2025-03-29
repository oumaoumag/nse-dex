# RedeemStock

## Overview

`RedeemStock` extends the `MintStock` contract to provide functionality for redeeming stock tokens back to HBAR. It allows users to burn their tokens and receive an equivalent amount of HBAR, supporting both Hedera Token Service (HTS) tokens and standard ERC20 tokens.

## Contract Details

- **License**: MIT
- **Solidity Version**: ^0.8.20
- **Hedera Compatibility**: Full native support for Hedera network
- **Inherits From**: MintStock

## Inheritance Structure

```
Ownable
  ↑
ManageStock
  ↑
MintStock
  ↑
RedeemStock
```

## Functions

### Constructor

```solidity
constructor(address initialOwner) MintStock(initialOwner)
```

Initializes the contract with the specified owner, passing the address to the parent constructor.

### Redemption Functions

#### redeemStock

```solidity
function redeemStock(address stockContractAddress, uint256 stockAmountInTokens) external payable
```

Allows a user to redeem stock tokens back to HBAR.

- **Parameters**:
  - `stockContractAddress`: Address of the stock token contract
  - `stockAmountInTokens`: Amount of tokens to redeem
- **Process**:
  1. Identifies the stock token type (HTS or ERC20)
  2. Routes to appropriate redemption logic
  3. Burns tokens
  4. Transfers equivalent HBAR back to user

#### redeemHederaToken

```solidity
function redeemHederaToken(address stockContractAddress, int64 stockAmount) internal
```

Internal function for redeeming Hedera Token Service (HTS) tokens.

- **Parameters**:
  - `stockContractAddress`: Address of the HTS token contract
  - `stockAmount`: Amount of tokens to redeem (as int64)
- **Process**:
  1. Transfers tokens from user to contract using HTS precompile
  2. Burns the tokens
  3. Calculates equivalent HBAR value
  4. Transfers HBAR to user

#### findEquivalentHbarValue

```solidity
function findEquivalentHbarValue(uint256 stockAmountInTokens, address stockContractAddress) internal view returns (uint256)
```

Internal function to calculate how much HBAR should be returned for the redeemed tokens.

- **Parameters**:
  - `stockAmountInTokens`: Amount of tokens being redeemed
  - `stockContractAddress`: Address of the stock token contract
- **Returns**: Amount of HBAR to send back
- **Process**:
  1. Finds the stock by address
  2. Gets the stock price in HBAR
  3. Calculates: hbarValue = stockAmount * stockPrice

## Usage Examples

### Redeeming Stock Tokens

```solidity
// First approve tokens for burning (for ERC20-compatible tokens)
stockToken.approve(redeemStockAddress, 100 * 10^18);

// Then redeem tokens for HBAR
redeemStock.redeemStock(stockContractAddress, 100 * 10^18);
```

### For Hedera Token Service Tokens

```solidity
// For HTS tokens, no explicit approval is needed
// The contract will handle the transfer
redeemStock.redeemStock(htsTokenAddress, 100);
```

## Technical Process

The redemption process differs based on token type:

### For HTS Tokens

1. Tokens are transferred from user to contract using HTS precompile
2. Contract burns the tokens
3. Equivalent HBAR is calculated and sent to user

### For ERC20 Tokens

1. Contract checks token allowance
2. Contract burns tokens directly from user's account
3. Equivalent HBAR is calculated and sent to user

## Economic Considerations

- The contract must have sufficient HBAR balance to fulfill redemptions
- Redemption prices are based on the current stock price in the `ManageStock` contract
- Price changes between minting and redemption can result in profit or loss

## Security Considerations

1. **Contract Liquidity**: Ensure the contract has enough HBAR to fulfill redemptions
2. **Token Allowances**: For ERC20 tokens, users must approve token spending
3. **Price Fluctuation**: Be aware that redemption value is based on current price, not mint price

## Integration with the Trading System

This contract completes the token lifecycle:

1. **Mint**: Users mint tokens with HBAR (`MintStock`)
2. **Trade**: Users trade tokens P2P (`PostOfferOnP2P` and `DoP2PTrade`)
3. **Redeem**: Users redeem tokens back to HBAR (this contract)

## Extending the Contract

This contract is extended by:
- `PostOfferOnP2P`: Adds P2P trading offer functionality
- `DoP2PTrade`: Adds execution of P2P trades
