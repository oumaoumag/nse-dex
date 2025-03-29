// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./manageStock.sol";

contract MintStock is ManageStock {

    constructor(address initialOwner) ManageStock(initialOwner) {}

    event MintedStockForUser(address indexed recipient, address indexed stockContract, uint256 stockAmount);
    
    function mintNewStock(address stockContractAddress) public payable {
        StockInterface stockContract;
        uint256 hbarSent = msg.value;

        // Ensure that hbarSent is greater than zero
        require(hbarSent > 0, "You must send HBAR to mint stocks");

        // Find the stock using the contractAddress
        uint stockIndex = findStockIndexByAddress(stockContractAddress);
        Stock memory stock = stocks[stockIndex];

        uint256 amountOfStocksToMint = findEquivalentStockAmount(hbarSent, stockContractAddress);

        stockContract = StockInterface(stockContractAddress);
        
        // Handle depending on whether it's an HTS token or ERC20-compatible token
        if (stock.isHederaToken) {
            // For Hedera tokens, use int64 amount
            int64 amountToMint = int64(uint64(amountOfStocksToMint));
            stockContract.mint(msg.sender, amountToMint);
        } else {
            // For ERC20-compatible tokens, use the uint256 version
            uint256 amountOfStocksToMintInTokens = amountOfStocksToMint * 10**18;
            stockContract.mint(msg.sender, amountOfStocksToMintInTokens);
        }

        emit MintedStockForUser(msg.sender, stockContractAddress, amountOfStocksToMint);
    }

    function findEquivalentStockAmount(uint256 hbarSent, address stockContractAddress) internal view returns (uint256){
        // Find the stock using the contractAddress
        uint stockIndex = findStockIndexByAddress(stockContractAddress);

        // Get the stock's price in HBAR
        uint256 stockPrice = stocks[stockIndex].stockPriceHbar;

        require(stockPrice > 0, "Stock price must be greater than zero");

        // Calculate the equivalent stock amount by dividing HBAR sent by stock price
        uint256 equivalentStockAmount = hbarSent / stockPrice;

        return equivalentStockAmount;
    }
}
