// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

// Hedera Token Service precompile addresses
address constant HTS_PRECOMPILE = address(0x167);
address constant EXCHANGE_RATE_PRECOMPILE = address(0x168); // Exchange Rate Service

// Updated for Hedera Token Service
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

contract ManageStock is Ownable {

    constructor(address initialOwner)
        Ownable(initialOwner) {}

    struct Stock {
        string shortName;
        string longName;
        address contractAddress;
        uint256 stockPriceHbar; // Changed from ETH to HBAR
        bool isHederaToken;    // Flag to identify proper HTS tokens
    }

    Stock[] public stocks;

    event AddedStock(string shortName, string longName, address indexed contractAddress, uint256 stockPriceHbar, bool isHederaToken);
    event RemovedStock(string shortName, string longName, address indexed contractAddress, uint256 stockPriceHbar);
    event UpdatedStockPrice(address indexed contractAddress, uint256 oldPrice, uint256 newPrice);

    function addStock(string memory shortName, string memory longName, address contractAddress, uint256 stockPriceHbar, bool isHederaToken) onlyOwner public {
        Stock memory stock;
        stock.shortName = shortName;
        stock.longName = longName;
        stock.contractAddress = contractAddress;
        stock.stockPriceHbar = stockPriceHbar;
        stock.isHederaToken = isHederaToken;

        stocks.push(stock);

        emit AddedStock(shortName, longName, contractAddress, stockPriceHbar, isHederaToken);
    }

    function removeStock(address contractAddress) onlyOwner public {
        uint stockIndex = findStockIndexByAddress(contractAddress);
        require(stockIndex < stocks.length, "Stock not found");

        Stock memory removedStock = stocks[stockIndex];

        // Replace the stock to be removed with the last stock in the array
        stocks[stockIndex] = stocks[stocks.length - 1];

        // Remove the last stock (duplicate) from the array
        stocks.pop();

        emit RemovedStock(removedStock.shortName, removedStock.longName, removedStock.contractAddress, removedStock.stockPriceHbar);
    }

    function setStockPrice(address contractAddress, uint256 newPrice) public onlyOwner {
        uint length = stocks.length;

        for (uint i = 0; i < length; i++) {
            if (stocks[i].contractAddress == contractAddress) {
                uint256 oldPrice = stocks[i].stockPriceHbar; // Save old price
                stocks[i].stockPriceHbar = newPrice; // Update the price
                emit UpdatedStockPrice(contractAddress, oldPrice, newPrice); // Emit event
                return;
            }
        }

        revert("Stock with this contract address not found");
    }

    // Function to get all stocks
    function getAllStocks() public view returns (Stock[] memory) {
        return stocks;
    }
    
    // Get current HBAR exchange rate to USD cents
    function getHbarExchangeRate() public view returns (int64) {
        (bool success, bytes memory result) = EXCHANGE_RATE_PRECOMPILE.staticcall(
            abi.encodeWithSignature("hbarToTinyCents()")
        );
        require(success, "Exchange rate query failed");
        return abi.decode(result, (int64));
    }

    function findStockIndexByAddress(address contractAddress) internal view returns (uint) {
        for (uint i = 0; i < stocks.length; i++) {
            if (stocks[i].contractAddress == contractAddress) {
                return i;
            }
        }
        revert("Stock not found");
    }
}
