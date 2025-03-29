# DoP2PTrade

## Overview

`DoP2PTrade` is the final contract in the Tajiri stock trading system inheritance chain. It extends the `PostOfferOnP2P` contract by adding functionality to execute trades between buyers and sellers. This contract facilitates the actual exchange of tokens and HBAR between trading parties, supporting both Hedera Token Service (HTS) tokens and standard ERC20 tokens.

## Contract Details

- **License**: MIT
- **Solidity Version**: ^0.8.20
- **Hedera Compatibility**: Full native support for Hedera network
- **Inherits From**: PostOfferOnP2P

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
PostOfferOnP2P---------+
  ↑
DoP2PTrade
```

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `BuyOfferExecuted` | stockContract, stockAmount, offerPrice, offerID | Emitted when a buy offer is executed |
| `SellOfferExecuted` | stockContract, stockAmount, offerPrice, offerID | Emitted when a sell offer is executed |

## Functions

### Constructor

```solidity
constructor(address initialOwner) PostOfferOnP2P(initialOwner)
```

Initializes the contract with the specified owner, passing the address to the parent constructor.

### Query Functions

#### getAllBuyOffers

```solidity
function getAllBuyOffers() external view returns (BuyOffer[] memory)
```

Returns all active buy offers.

#### getAllSellOffers

```solidity
function getAllSellOffers() external view returns (SellOffer[] memory)
```

Returns all active sell offers.

### Trade Execution

#### sellToABuyer

```solidity
function sellToABuyer(uint buyerOfferID) external payable returns (bool)
```

Allows a seller to execute a buy offer by selling their tokens to the offer creator.

- **Parameters**:
  - `buyerOfferID`: ID of the buy offer to execute
- **Returns**: Success indicator
- **Process**:
  1. Finds the buy offer
  2. Handles token transfer based on token type (HTS or ERC20)
  3. Transfers HBAR from escrow to seller
  4. Deletes the executed offer
  5. Emits event

#### buyFromASeller

```solidity
function buyFromASeller(uint sellerOfferID) external payable returns (bool)
```

Allows a buyer to execute a sell offer by purchasing tokens from the offer creator.

- **Parameters**:
  - `sellerOfferID`: ID of the sell offer to execute
- **Payable**: Requires HBAR (total value = stockAmount * offerPriceHbar) to be sent
- **Returns**: Success indicator
- **Process**:
  1. Finds the sell offer
  2. Verifies correct HBAR amount was sent
  3. Transfers HBAR to the seller
  4. Transfers tokens from escrow to buyer based on token type
  5. Deletes the executed offer
  6. Emits event

## Usage Examples

### Executing a Buy Offer

```solidity
// As a seller, to sell tokens to a buyer with an existing buy offer
// First approve tokens for transfer (for ERC20-compatible tokens)
stockToken.approve(doP2PTradeAddress, 10 * 10^18);

// Then execute the buy offer
doP2PTrade.sellToABuyer(buyOfferID);
```

### Executing a Sell Offer

```solidity
// As a buyer, to buy tokens from a seller with an existing sell offer
// Need to send HBAR equal to tokens * price
doP2PTrade.buyFromASeller{value: 60 HBAR}(sellOfferID);
```

## Technical Process

### Executing a Buy Offer (sellToABuyer)

1. Seller calls `sellToABuyer` with a buy offer ID
2. Contract processes differently based on token type:
   - For HTS tokens:
     - Verifies seller's token balance
     - Transfers tokens from seller to contract then to buyer via HTS precompile
   - For ERC20 tokens:
     - Verifies allowance
     - Transfers tokens from seller to contract then to buyer
3. Contract transfers escrowed HBAR from contract to seller
4. Offer is removed from the buyOffers array
5. BuyOfferExecuted event is emitted

### Executing a Sell Offer (buyFromASeller)

1. Buyer calls `buyFromASeller` with a sell offer ID and sends HBAR
2. Contract verifies the HBAR amount matches the offer price
3. Contract transfers HBAR to the seller
4. Contract processes token transfer differently based on token type:
   - For HTS tokens: Uses HTS precompile to transfer tokens from contract to buyer
   - For ERC20 tokens: Uses transfer to move tokens from contract to buyer
5. Offer is removed from the sellOffers array
6. SellOfferExecuted event is emitted

## Economic Flow

The contract facilitates a complete P2P trading system:

1. **Buy Offers**: HBAR is escrowed in the contract until execution or cancellation
2. **Sell Offers**: Tokens are escrowed in the contract until execution or cancellation
3. **Trade Execution**: At execution, the escrowed assets are exchanged between parties

## Security Considerations

1. **Token Type Handling**: Different execution paths for HTS and ERC20 tokens
2. **Transfer Validation**: Proper validation of transfers and balances
3. **Error Handling**: Specific revert messages for different failure modes
4. **Response Code Validation**: For HTS operations, response codes are validated

## Integration with Frontend

The contract provides query functions to get all offers, which can be used by the frontend to:
1. Display all available buy and sell offers
2. Allow users to execute trades with a single click
3. Track trade history through events

## Complete Trading System

This contract completes the Tajiri stock trading system, providing a full lifecycle:

1. **Token Creation**: `SafaricomStock` creates the token
2. **Stock Registration**: `ManageStock` registers the token
3. **Token Acquisition**: `MintStock` allows users to acquire tokens
4. **Offer Creation**: `PostOfferOnP2P` allows users to create trading offers
5. **Trade Execution**: This contract (`DoP2PTrade`) executes the trades
6. **Token Redemption**: `RedeemStock` allows users to redeem tokens for HBAR
