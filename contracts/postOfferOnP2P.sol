// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./redeemStock.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PostOfferOnP2P is RedeemStock, ReentrancyGuard {

    using Counters for Counters.Counter;
    Counters.Counter private _offerIDCounter; // Counter for unique offer IDs

    constructor(address initialOnwer) RedeemStock(initialOnwer) {}

    struct BuyOffer {
        address stockContract;
        uint stockAmount;
        uint offerPriceHbar;  // Changed from ETH to HBAR
        uint offerID;
        address createdByUser;
        bool isHederaToken;   // New field for HTS tokens
    }

    struct SellOffer {
        address stockContract;
        uint stockAmount;
        uint offerPriceHbar;  // Changed from ETH to HBAR
        uint offerID;
        address createdByUser;
        bool isHederaToken;   // New field for HTS tokens
    }

    BuyOffer[] public buyOffers;
    SellOffer[] public sellOffers;

    event BuyOfferPosted(address indexed stockContract, uint stockAmount, uint offerPriceHbar, uint offerID, bool isHederaToken);
    event SellOfferPosted(address indexed stockContract, uint stockAmount, uint offerPriceHbar, uint offerID, bool isHederaToken);
    event BuyOfferDeleted(address indexed stockContract, uint stockAmount, uint offerPriceHbar, uint offerID);
    event SellOfferDeleted(address indexed stockContract, uint stockAmount, uint offerPriceHbar, uint offerID);
    event PriceOfOfferChanged(uint256 offerID, uint oldPrice, uint newPrice);

    function createBuyOffer(address stockContractAddress, uint256 stockAmount, uint256 offerPriceHbar) external payable nonReentrant returns (uint256) {
        // Buyer should pay for the stocks they want to buy upfront 
        // The HBAR will be locked in the escrow function until a trader takes the offer

        uint totalOfferPrice = (stockAmount * offerPriceHbar) / (10**18);
        require(msg.value == totalOfferPrice, "You have to send exact HBAR value for the stocks you want to buy!"); 

        // Find stock by address to determine if it's a Hedera token
        uint stockIndex = findStockIndexByAddress(stockContractAddress);
        bool isHederaToken = stocks[stockIndex].isHederaToken;

        // Increment the counter safely
        _offerIDCounter.increment();
        uint newOfferID = _offerIDCounter.current();

        BuyOffer memory buyOffer;
        buyOffer.stockContract = stockContractAddress;
        buyOffer.stockAmount = stockAmount;
        buyOffer.offerPriceHbar = offerPriceHbar;
        buyOffer.offerID = newOfferID;
        buyOffer.createdByUser = msg.sender;
        buyOffer.isHederaToken = isHederaToken;

        buyOffers.push(buyOffer);

        emit BuyOfferPosted(stockContractAddress, stockAmount, offerPriceHbar, newOfferID, isHederaToken);

        return newOfferID;
    }

    function createSellOffer(address stockContractAddress, uint256 stockAmount, uint256 offerPriceHbar) external nonReentrant returns (uint256) {
        StockInterface stockContract;
        stockContract = StockInterface(stockContractAddress);

        // Find stock by address to determine if it's a Hedera token
        uint stockIndex = findStockIndexByAddress(stockContractAddress);
        bool isHederaToken = stocks[stockIndex].isHederaToken;

        if (isHederaToken) {
            // For Hedera tokens, use HTS precompile for transfer
            // First check user's token balance
            (bool balanceSuccess, bytes memory balanceResult) = HTS_PRECOMPILE.staticcall(
                abi.encodeWithSignature(
                    "balanceOf(address,address)",
                    stockContractAddress,
                    msg.sender
                )
            );
            require(balanceSuccess, "Balance check failed");
            int64 userBalance = abi.decode(balanceResult, (int64));
            require(userBalance >= int64(uint64(stockAmount)), "Insufficient token balance");

            // Transfer tokens from user to contract
            (bool transferSuccess, bytes memory transferResult) = HTS_PRECOMPILE.call(
                abi.encodeWithSignature(
                    "transferToken(address,address,address,int64)",
                    stockContractAddress,
                    msg.sender,
                    address(this),
                    int64(uint64(stockAmount))
                )
            );
            require(transferSuccess, "Token transfer failed");
            int32 responseCode = abi.decode(transferResult, (int32));
            require(responseCode == 22, "Transfer failed with non-success response code");
        } else {
            // For legacy tokens, use ERC20 allowance and transferFrom
            // Check if we have enough allowance
            uint256 allowance = stockContract.allowance(msg.sender, address(this));
            require(allowance >= stockAmount, "Insufficient token allowance");

            // Transfer the stock from user to contract
            stockContract.transferFrom(msg.sender, address(this), stockAmount);
        }

        // Increment the counter safely
        _offerIDCounter.increment();
        uint newOfferID = _offerIDCounter.current();

        SellOffer memory sellOffer;
        sellOffer.stockContract = stockContractAddress;
        sellOffer.stockAmount = stockAmount;
        sellOffer.offerPriceHbar = offerPriceHbar;
        sellOffer.offerID = newOfferID;
        sellOffer.createdByUser = msg.sender;
        sellOffer.isHederaToken = isHederaToken;

        sellOffers.push(sellOffer);

        emit SellOfferPosted(stockContractAddress, stockAmount, offerPriceHbar, newOfferID, isHederaToken);

        return newOfferID;
    }

    function deleteBuyOffer(uint offerIDToDelete) external payable nonReentrant returns (bool) {
        // Find the offer by its ID and check ownership
        for (uint i = 0; i < buyOffers.length; i++) {
            if (buyOffers[i].offerID == offerIDToDelete) {

                require(msg.sender == buyOffers[i].createdByUser, "You do not have permissions for this offer!");
                uint256 hbarToRefund = (buyOffers[i].stockAmount * buyOffers[i].offerPriceHbar) / (10**18);

                BuyOffer memory buyOfferToDelete = buyOffers[i];

                // Remove the offer by moving the last element into the current slot and popping the last element
                buyOffers[i] = buyOffers[buyOffers.length - 1];
                buyOffers.pop();

                // Check if the contract has enough HBAR to refund the user
                require(address(this).balance >= hbarToRefund, "Contract does not have enough HBAR for the refund");

                // Refund the HBAR to the user
                (bool success, ) = payable(msg.sender).call{value: hbarToRefund}("");
                require(success, "Refund failed");

                emit BuyOfferDeleted(buyOfferToDelete.stockContract, buyOfferToDelete.stockAmount, buyOfferToDelete.offerPriceHbar, buyOfferToDelete.offerID);
                return true;
            }
        }

        revert("Offer not found!");
    }

    function deleteSellOffer(uint offerIDToDelete) external nonReentrant returns (bool) {
        // Find the offer by its ID and check ownership
        for (uint i = 0; i < sellOffers.length; i++) {
            if (sellOffers[i].offerID == offerIDToDelete) {
                require(msg.sender == sellOffers[i].createdByUser, "You do not have permissions for this offer!");
                uint256 stockAmountToRefund = sellOffers[i].stockAmount;

                SellOffer memory sellOfferToDelete = sellOffers[i];

                // Handle differently based on token type
                if (sellOfferToDelete.isHederaToken) {
                    // For Hedera tokens, use HTS precompile for transfer
                    (bool transferSuccess, bytes memory transferResult) = HTS_PRECOMPILE.call(
                        abi.encodeWithSignature(
                            "transferToken(address,address,address,int64)",
                            sellOfferToDelete.stockContract,
                            address(this),
                            msg.sender,
                            int64(uint64(stockAmountToRefund))
                        )
                    );
                    require(transferSuccess, "Token transfer failed");
                    int32 responseCode = abi.decode(transferResult, (int32));
                    require(responseCode == 22, "Transfer failed with non-success response code");
                } else {
                    // For legacy tokens, use ERC20 transfer
                    StockInterface stockContract;
                    stockContract = StockInterface(sellOfferToDelete.stockContract);
                    stockContract.transfer(msg.sender, stockAmountToRefund);
                }

                // Remove the offer
                sellOffers[i] = sellOffers[sellOffers.length - 1];
                sellOffers.pop();

                emit SellOfferDeleted(sellOfferToDelete.stockContract, sellOfferToDelete.stockAmount, sellOfferToDelete.offerPriceHbar, sellOfferToDelete.offerID);
                return true;
            }
        }

        revert("Offer not found!");
    }

    function changePriceOfOffer(uint offerIDToUpdate, string memory offerType, uint newOfferPrice) external nonReentrant returns (bool) {
        // offerType = [buyOffer/sellOffer]

        if(keccak256(abi.encodePacked(offerType)) == keccak256(abi.encodePacked("buyOffer"))){
            for(uint i = 0; i < buyOffers.length; i++){
                if(buyOffers[i].offerID == offerIDToUpdate){
                    require(msg.sender == buyOffers[i].createdByUser, "Not authorized to change this offer");
                    uint256 oldOfferPrice = buyOffers[i].offerPriceHbar;
                    buyOffers[i].offerPriceHbar = newOfferPrice;
                    emit PriceOfOfferChanged(offerIDToUpdate, oldOfferPrice, newOfferPrice);
                    return true;
                }
            }
            revert("Buy offer not found!");

        } else if(keccak256(abi.encodePacked(offerType)) == keccak256(abi.encodePacked("sellOffer"))){
            for(uint i = 0; i < sellOffers.length; i++){
                if(sellOffers[i].offerID == offerIDToUpdate){
                    require(msg.sender == sellOffers[i].createdByUser, "Not authorized to change this offer");
                    uint256 oldOfferPrice = sellOffers[i].offerPriceHbar;
                    sellOffers[i].offerPriceHbar = newOfferPrice;
                    emit PriceOfOfferChanged(offerIDToUpdate, oldOfferPrice, newOfferPrice);
                    return true;
                }
            }
            revert("Sell offer not found!");

        } else {
            revert("Invalid offer type!");
        }
    }
}
