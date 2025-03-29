// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./mintStock.sol";

contract RedeemStock is MintStock {

    constructor(address initialOwner) MintStock(initialOwner) {}

    function redeemStock(address stockContractAddress, uint256 stockAmountInTokens) external payable {
        
        StockInterface stockContract;
        stockContract = StockInterface(stockContractAddress);
        
        // Find stock by address
        uint stockIndex = findStockIndexByAddress(stockContractAddress);
        Stock memory stock = stocks[stockIndex];
        
        if (stock.isHederaToken) {
            // For Hedera tokens, use HTS-specific redeem
            redeemHederaToken(stockContractAddress, int64(uint64(stockAmountInTokens)));
        } else {
            // Legacy ERC20 token redemption path
            // Check if the contract is allowed to burn the specified amount of tokens
            uint256 allowance = stockContract.allowance(msg.sender, address(this));
            require(allowance >= stockAmountInTokens, "Insufficient token allowance");

            stockContract.burnFrom(msg.sender, stockAmountInTokens);

            // Find the equivalent HBAR value of the burned stocks
            uint256 hbarToSendBack = findEquivalentHbarValue(stockAmountInTokens, stockContractAddress);

            // Ensure that the contract has enough HBAR to send back to the user
            require(address(this).balance >= hbarToSendBack, "Not enough HBAR to redeem stocks");

            // Transfer the equivalent HBAR value to the user
            payable(msg.sender).transfer(hbarToSendBack);
        }
    }
    
    // New function for Hedera token redemption
    function redeemHederaToken(address stockContractAddress, int64 stockAmount) internal {
        StockInterface stockContract = StockInterface(stockContractAddress);
        
        // Transfer tokens from user to this contract
        (bool transferSuccess, ) = HTS_PRECOMPILE.call(
            abi.encodeWithSignature(
                "transferToken(address,address,address,int64)",
                stockContractAddress,
                msg.sender,
                address(this),
                stockAmount
            )
        );
        require(transferSuccess, "Token transfer to contract failed");
        
        // Burn the tokens
        stockContract.burn(stockAmount);
        
        // Calculate HBAR to return
        uint256 hbarToSendBack = findEquivalentHbarValue(uint256(uint64(stockAmount)), stockContractAddress);
        
        // Ensure contract has enough HBAR
        require(address(this).balance >= hbarToSendBack, "Not enough HBAR to redeem stocks");
        
        // Send HBAR to user
        payable(msg.sender).transfer(hbarToSendBack);
    }

    function findEquivalentHbarValue(uint256 stockAmountInTokens, address stockContractAddress) internal view returns (uint256) {
        // Find the stock using the contractAddress
        uint stockIndex = findStockIndexByAddress(stockContractAddress);

        // Get the stock's price in HBAR
        uint256 stockPriceHbar = stocks[stockIndex].stockPriceHbar;

        // Calculate the equivalent HBAR value by multiplying the stock amount by the stock price
        uint256 hbarValue = (stockAmountInTokens * stockPriceHbar) / (10 ** 18); // Adjust for decimal places

        return hbarValue;
    }
}
