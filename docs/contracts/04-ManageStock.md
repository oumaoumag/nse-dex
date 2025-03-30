# ManageStock

## Overview

`ManageStock` is the base contract for the Tajiri stock trading system. It provides core functionality for adding, removing, and managing tokenized stocks on the Hedera network, supporting both Hedera Token Service (HTS) tokens and standard ERC20 tokens.

## Contract Details

- **License**: MIT
- **Solidity Version**: ^0.8.20
- **Hedera Compatibility**: Full native support for Hedera network
- **Inherits From**: Ownable

## Hedera Precompile Addresses

The contract uses the following Hedera precompiles:
- `HTS_PRECOMPILE`: Hedera Token Service (address 0x167)
- `EXCHANGE_RATE_PRECOMPILE`: Exchange Rate Service (address 0x168)

## StockInterface

The contract defines a comprehensive interface for stock tokens with both HTS and ERC20 compatibility:

```solidity
interface StockInterface {
    // HTS token functions
    function tokenAddress() external view returns (address);
    function getTokenInfo() external view returns (string memory, string memory, uint8, address);
    function createToken(int64 initialSupply, address treasuryAccount) external returns (address);
    function mint(address to, int64 amount) external;
    function burn(int64 amount) external;
    function transferToken(address to, int64 amount) external;
    // For backward compatibility with ERC20 interface
    function mint(address to, uint256 amount) external;
    function burnFrom(address name, uint256 value) external;
    function allowance(address owner, address spender) external view returns(uint256);
    function transferFrom(address from, address to, uint256 value) external returns(bool);
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}
```

## Stock Structure

```solidity
struct Stock {
    string shortName;     // Short name/ticker for the stock
    string longName;      // Full name of the stock
    address contractAddress; // Address of the token contract
    uint256 stockPriceHbar;  // Price in HBAR
    bool isHederaToken;      // Whether it's an HTS token
}
```

## State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `stocks` | Stock[] | Array of all registered stock tokens |

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `AddedStock` | shortName, longName, contractAddress, stockPriceHbar, isHederaToken | Emitted when a stock is added |
| `RemovedStock` | shortName, longName, contractAddress, stockPriceHbar | Emitted when a stock is removed |
| `UpdatedStockPrice` | contractAddress, oldPrice, newPrice | Emitted when a stock price is updated |

## Functions

### Constructor

```solidity
constructor(address initialOwner)
```

Initializes the contract with the specified owner.

### Stock Management

#### addStock

```solidity
function addStock(
    string memory shortName, 
    string memory longName, 
    address contractAddress, 
    uint256 stockPriceHbar, 
    bool isHederaToken
) onlyOwner public
```

Adds a new stock to the platform.

- **Parameters**:
  - `shortName`: Ticker or short identifier for the stock
  - `longName`: Full name of the stock
  - `contractAddress`: Address of the token contract
  - `stockPriceHbar`: Initial price in HBAR
  - `isHederaToken`: Whether it's an HTS token

#### removeStock

```solidity
function removeStock(address contractAddress) onlyOwner public
```

Removes a stock from the platform.

- **Parameters**:
  - `contractAddress`: Address of the token contract to remove

#### setStockPrice

```solidity
function setStockPrice(address contractAddress, uint256 newPrice) public onlyOwner
```

Updates the price of a stock.

- **Parameters**:
  - `contractAddress`: Address of the token contract
  - `newPrice`: New price in HBAR

### Query Functions

#### getAllStocks

```solidity
function getAllStocks() public view returns (Stock[] memory)
```

Returns all stocks registered on the platform.

#### getHbarExchangeRate

```solidity
function getHbarExchangeRate() public view returns (int64)
```

Returns the current HBAR exchange rate to USD cents using the Hedera Exchange Rate Service.

#### findStockIndexByAddress

```solidity
function findStockIndexByAddress(address contractAddress) internal view returns (uint)
```

Internal function to find the index of a stock in the array by its contract address.

## Usage Examples

### Adding a Stock

```solidity
// Add a Hedera token stock
manageStock.addStock(
    "SCOM",                 // shortName
    "Safaricom Limited",    // longName
    tokenAddress,           // contractAddress
    1000000,                // price (in tinybars/HBAR subunits)
    true                    // isHederaToken
);
```

### Updating Stock Price

```solidity
// Update stock price
manageStock.setStockPrice(tokenAddress, 1100000); // 10% price increase
```

### Getting All Stocks

```solidity
// Get all registered stocks
Stock[] memory allStocks = manageStock.getAllStocks();
```

### Getting HBAR Exchange Rate

```solidity
// Get HBAR to USD exchange rate in tiny cents
int64 exchangeRate = manageStock.getHbarExchangeRate();
```

## Access Control

- All management functions (add, remove, update) are restricted to the contract owner
- Read functions are public and can be called by anyone

## Hedera Integration

The contract uses the Hedera Exchange Rate Service to get current HBAR prices, which can be used for:
1. Setting appropriate stock prices
2. Converting between HBAR and USD values
3. Calculating fair market values

## Extending the Contract

This is the base contract for the stock trading system. It is extended by:
1. `MintStock` - Adds minting capabilities
2. `RedeemStock` - Adds redemption capabilities
3. `PostOfferOnP2P` - Adds P2P trade offers
4. `DoP2PTrade` - Adds trade execution

Further customization can be achieved by extending this contract.
