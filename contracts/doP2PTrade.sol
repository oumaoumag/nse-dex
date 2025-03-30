// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./postOfferOnP2P.sol";

contract DoP2PTrade is PostOfferOnP2P {
    constructor(address initialOwner) PostOfferOnP2P(initialOwner) {}

    event BuyOfferExecuted(address indexed stockContract, uint stockAmount, uint offerPrice, uint offerID);
    event SellOfferExecuted(address indexed stockContract, uint stockAmount, uint offerPrice, uint offerID);

    function getAllBuyOffers() external view returns (BuyOffer[] memory) { 
        return buyOffers;
    }
    
    function getAllSellOffers() external view returns (SellOffer[] memory) {
        return sellOffers;
    }

    function sellToABuyer(uint buyerOfferID) external payable returns (bool) {
        // Fetch offer
        for(uint i = 0; i < buyOffers.length; i++) {
            if(buyOffers[i].offerID == buyerOfferID) {
                // Fetch offer details
                BuyOffer memory buyOffer = buyOffers[i];
                StockInterface stockContract = StockInterface(buyOffer.stockContract);

                // Handle differently based on token type
                if (buyOffer.isHederaToken) {
                    // For Hedera tokens, use HTS precompile
                    // First check user's token balance
                    (bool balanceSuccess, bytes memory balanceResult) = HTS_PRECOMPILE.staticcall(
                        abi.encodeWithSignature(
                            "balanceOf(address,address)",
                            buyOffer.stockContract,
                            msg.sender
                        )
                    );
                    require(balanceSuccess, "Balance check failed");
                    int64 userBalance = abi.decode(balanceResult, (int64));
                    require(userBalance >= int64(uint64(buyOffer.stockAmount)), "Insufficient token balance");

                    // Transfer tokens from seller to contract
                    (bool transfer1Success, bytes memory transfer1Result) = HTS_PRECOMPILE.call(
                        abi.encodeWithSignature(
                            "transferToken(address,address,address,int64)",
                            buyOffer.stockContract,
                            msg.sender,
                            address(this),
                            int64(uint64(buyOffer.stockAmount))
                        )
                    );
                    require(transfer1Success, "Token transfer to contract failed");
                    int32 response1Code = abi.decode(transfer1Result, (int32));
                    require(response1Code == 22, "Transfer to contract failed with non-success response code");

                    // Transfer tokens from contract to buyer
                    (bool transfer2Success, bytes memory transfer2Result) = HTS_PRECOMPILE.call(
                        abi.encodeWithSignature(
                            "transferToken(address,address,address,int64)",
                            buyOffer.stockContract,
                            address(this),
                            buyOffer.createdByUser,
                            int64(uint64(buyOffer.stockAmount))
                        )
                    );
                    require(transfer2Success, "Token transfer to buyer failed");
                    int32 response2Code = abi.decode(transfer2Result, (int32));
                    require(response2Code == 22, "Transfer to buyer failed with non-success response code");
                } else {
                    // For legacy tokens, use ERC20 transferFrom and transfer
                    // Check if we have enough allowance to transfer stocks from the seller's wallet to contract
                    uint256 allowance = stockContract.allowance(msg.sender, address(this));
                    require(allowance >= buyOffer.stockAmount, "Insufficient token allowance");

                    stockContract.transferFrom(msg.sender, address(this), buyOffer.stockAmount); // Transfer the stocks from user to contract
                    stockContract.transfer(buyOffer.createdByUser, buyOffer.stockAmount);
                }

                // Calculate HBAR to send to seller
                uint hbarSellerShallReceive = (buyOffer.stockAmount * buyOffer.offerPriceHbar) / (10 ** 18);

                // Check if the contract has enough HBAR to send to seller
                require(address(this).balance >= hbarSellerShallReceive, "Contract does not have enough HBAR to send to seller!");

                // Send HBAR to the seller
                (bool success, ) = payable(msg.sender).call{value: hbarSellerShallReceive}("");
                require(success, "Failed to send HBAR to the seller!");

                // Delete the offer
                buyOffers[i] = buyOffers[buyOffers.length - 1];
                buyOffers.pop();

                emit BuyOfferExecuted(buyOffer.stockContract, buyOffer.stockAmount, buyOffer.offerPriceHbar, buyerOfferID);
                return true;
            }
        }
        revert("The buy offer was not found!");
    }

    function buyFromASeller(uint sellerOfferID) external payable returns (bool) {
        // Fetch offer
        for(uint i = 0; i < sellOffers.length; i++) {
            if(sellOffers[i].offerID == sellerOfferID) {
                SellOffer memory sellOffer = sellOffers[i];

                // Check if buyer has sent enough HBAR for the transaction
                uint hbarBuyerShallPay = (sellOffer.stockAmount * sellOffer.offerPriceHbar) / (10**18);
                require(msg.value == hbarBuyerShallPay, "The HBAR sent is not equal to what is required of you to send!");

                // Transfer HBAR to the seller
                (bool success, ) = payable(sellOffer.createdByUser).call{value: hbarBuyerShallPay}("");
                require(success, "Failed to send HBAR to the seller!");

                // Handle differently based on token type
                if (sellOffer.isHederaToken) {
                    // For Hedera tokens, use HTS precompile for transfer
                    (bool transferSuccess, bytes memory transferResult) = HTS_PRECOMPILE.call(
                        abi.encodeWithSignature(
                            "transferToken(address,address,address,int64)",
                            sellOffer.stockContract,
                            address(this),
                            msg.sender,
                            int64(uint64(sellOffer.stockAmount))
                        )
                    );
                    require(transferSuccess, "Token transfer failed");
                    int32 responseCode = abi.decode(transferResult, (int32));
                    require(responseCode == 22, "Transfer failed with non-success response code");
                } else {
                    // For legacy tokens, use ERC20 transfer
                    StockInterface stockContract = StockInterface(sellOffer.stockContract);
                    stockContract.transfer(msg.sender, sellOffer.stockAmount);
                }

                // Delete the offerID
                sellOffers[i] = sellOffers[sellOffers.length - 1];
                sellOffers.pop();

                emit SellOfferExecuted(sellOffer.stockContract, sellOffer.stockAmount, sellOffer.offerPriceHbar, sellerOfferID); 
                return true;
            }
        }
        revert("Seller offer was not found!");
    }
}
