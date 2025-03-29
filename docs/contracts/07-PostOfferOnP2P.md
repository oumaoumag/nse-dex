# PostOfferOnP2P

## Overview

`PostOfferOnP2P` extends the `RedeemStock` contract to provide functionality for creating, managing, and canceling peer-to-peer trading offers. It enables users to create buy and sell offers for stock tokens at specified prices, supporting both Hedera Token Service (HTS) tokens and standard ERC20 tokens.

## Contract Details

- **License**: MIT
- **Solidity Version**: ^0.8.20
- **Hedera Compatibility**: Full native support for Hedera network
- **Inherits From**: RedeemStock, ReentrancyGuard

## Inheritance Structure

```
Ownable           ReentrancyGuard
  ↑                    ↑
ManageStock            |
  ↑                    |
MintStock              |
  ↑                    |
RedeemStock            |
  ↑                    |
  ----------PostOfferOnP2P----------
```

## Libraries Used

- `Counters`: For generating unique offer IDs

## Structures

### BuyOffer

```solidity
struct BuyOffer {
    address stockContract;   // Token contract address
    uint stockAmount;        // Amount of tokens to buy
    uint offerPriceHbar;     // Price per token in HBAR
    uint offerID;            // Unique identifier
    address createdByUser;   // Creator of the offer
    bool isHederaToken;      // Whether it's an HTS token
}
```

### SellOffer

```solidity
struct SellOffer {
    address stockContract;   // Token contract address
    uint stockAmount;        // Amount of tokens to sell
    uint offerPriceHbar;     // Price per token in HBAR
    uint offerID;            // Unique identifier
    address createdByUser;   // Creator of the offer
    bool isHederaToken;      // Whether it's an HTS token
}
```

## State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `_offerIDCounter` | Counters.Counter | Counter for unique offer IDs |
| `buyOffers` | BuyOffer[] | Array of all buy offers |
| `sellOffers` | SellOffer[] | Array of all sell offers |

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `BuyOfferPosted` | stockContract, stockAmount, offerPriceHbar, offerID, isHederaToken | Emitted when a buy offer is created |
| `SellOfferPosted` | stockContract, stockAmount, offerPriceHbar, offerID, isHederaToken | Emitted when a sell offer is created |
| `BuyOfferDeleted` | stockContract, stockAmount, offerPriceHbar, offerID | Emitted when a buy offer is canceled |
| `SellOfferDeleted` | stockContract, stockAmount, offerPriceHbar, offerID | Emitted when a sell offer is canceled |
| `PriceOfOfferChanged` | offerID, oldPrice, newPrice | Emitted when an offer price is updated |

## Functions

### Constructor

```solidity
constructor(address initialOwner) RedeemStock(initialOwner)
```

Initializes the contract with the specified owner, passing the address to the parent constructor.

### Trade Offer Creation

#### createBuyOffer

```solidity
function createBuyOffer(
    address stockContractAddress, 
    uint256 stockAmount, 
    uint256 offerPriceHbar
) external payable nonReentrant returns (uint256)
```

Creates a buy offer for a stock token.

- **Parameters**:
  - `stockContractAddress`: Address of the token contract
  - `stockAmount`: Amount of tokens to buy
  - `offerPriceHbar`: Price per token in HBAR
- **Payable**: Requires HBAR (total value = stockAmount * offerPriceHbar) to be sent
- **Returns**: The unique offer ID
- **Modifiers**: nonReentrant (prevents reentrancy attacks)

#### createSellOffer

```solidity
function createSellOffer(
    address stockContractAddress, 
    uint256 stockAmount, 
    uint256 offerPriceHbar
) external nonReentrant returns (uint256)
```

Creates a sell offer for a stock token.

- **Parameters**:
  - `stockContractAddress`: Address of the token contract
  - `stockAmount`: Amount of tokens to sell
  - `offerPriceHbar`: Price per token in HBAR
- **Returns**: The unique offer ID
- **Modifiers**: nonReentrant (prevents reentrancy attacks)
- **Process**:
  1. Transfers tokens from user to contract (escrow)
  2. Creates and stores the sell offer
  3. Emits event

### Offer Management

#### deleteBuyOffer

```solidity
function deleteBuyOffer(uint offerIDToDelete) external payable nonReentrant returns (bool)
```

Cancels a buy offer and refunds the escrowed HBAR.

- **Parameters**:
  - `offerIDToDelete`: ID of the buy offer to cancel
- **Returns**: Success indicator
- **Modifiers**: nonReentrant (prevents reentrancy attacks)
- **Restrictions**: Only the offer creator can cancel

#### deleteSellOffer

```solidity
function deleteSellOffer(uint offerIDToDelete) external nonReentrant returns (bool)
```

Cancels a sell offer and returns the escrowed tokens.

- **Parameters**:
  - `offerIDToDelete`: ID of the sell offer to cancel
- **Returns**: Success indicator
- **Modifiers**: nonReentrant (prevents reentrancy attacks)
- **Restrictions**: Only the offer creator can cancel

#### changePriceOfOffer

```solidity
function changePriceOfOffer(
    uint offerIDToUpdate, 
    string memory offerType, 
    uint newOfferPrice
) external nonReentrant returns (bool)
```

Updates the price of an existing offer.

- **Parameters**:
  - `offerIDToUpdate`: ID of the offer to update
  - `offerType`: "buyOffer" or "sellOffer"
  - `newOfferPrice`: New price in HBAR
- **Returns**: Success indicator
- **Modifiers**: nonReentrant (prevents reentrancy attacks)
- **Restrictions**: Only the offer creator can update

## Usage Examples

### Creating a Buy Offer

```solidity
// Create a buy offer for 10 tokens at 5 HBAR each
uint256 offerID = p2pContract.createBuyOffer{value: 50 HBAR}(
    tokenAddress,  // Stock token contract
    10,            // Amount of tokens to buy
    5 * 10^18      // Price per token (5 HBAR)
);
```

### Creating a Sell Offer

```solidity
// First approve tokens for transfer (for ERC20-compatible tokens)
stockToken.approve(p2pContractAddress, 10 * 10^18);

// Then create a sell offer
uint256 offerID = p2pContract.createSellOffer(
    tokenAddress,  // Stock token contract
    10,            // Amount of tokens to sell
    6 * 10^18      // Price per token (6 HBAR)
);
```

### Canceling an Offer

```solidity
// Cancel a buy offer
p2pContract.deleteBuyOffer(offerID);

// Cancel a sell offer
p2pContract.deleteSellOffer(offerID);
```

### Changing an Offer Price

```solidity
// Update a buy offer price
p2pContract.changePriceOfOffer(offerID, "buyOffer", 5.5 * 10^18);
```

## Technical Process

### Buy Offer Creation

1. User sends HBAR to the contract
2. Contract verifies the HBAR amount matches the total offer value
3. Offer is created and stored with a unique ID
4. HBAR is held in escrow until the offer is executed or canceled

### Sell Offer Creation

1. For HTS tokens:
   - Contract checks user's token balance
   - Tokens are transferred to contract using HTS precompile
2. For ERC20 tokens:
   - Contract checks allowance
   - Tokens are transferred to contract using transferFrom
3. Offer is created and stored with a unique ID
4. Tokens are held in escrow until the offer is executed or canceled

## Security Considerations

1. **Reentrancy Protection**: All external functions use the nonReentrant modifier
2. **Escrow Mechanism**: HBAR and tokens are held in escrow by the contract
3. **Owner Verification**: Only offer creators can cancel or modify their offers
4. **Token Type Handling**: Different handling for HTS and ERC20 tokens
5. **Error Handling**: Proper validation and revert messages

## Integration with the Trading System

This contract extends the token lifecycle with P2P trading:

1. **Mint**: Users mint tokens with HBAR (`MintStock`)
2. **Create Offers**: Users create buy/sell offers (this contract)
3. **Execute Trades**: Users execute trades (`DoP2PTrade`)
4. **Redeem**: Users redeem tokens back to HBAR (`RedeemStock`)

## Extending the Contract

This contract is extended by `DoP2PTrade`, which provides functionality to execute the created offers.
