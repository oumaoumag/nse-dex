// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./TajiriWallet.sol";

contract TajiriWalletFactory {
    mapping(address => address) public accountToWallet;
    mapping(address => bool) public isWallet;

    event WalletCreated(address indexed owner, address indexed wallet);

    function deployWallet(address owner) external returns (address) {
        // This is the function called by our WalletContext
        return _createWallet(owner);
    }

    function _createWallet(address owner) internal returns (address) {
        require(accountToWallet[owner] == address(0), "Wallet already exists for this account");

        TajiriWallet wallet = new TajiriWallet(owner);
        address walletAddress = address(wallet);

        accountToWallet[owner] = walletAddress;
        isWallet[walletAddress] = true;

        emit WalletCreated(owner, walletAddress);

        return walletAddress;
    }

    function getWallet(address owner) external view returns (address) {
        return accountToWallet[owner];
    }

    function walletExists(address owner) external view returns (bool) {
        return accountToWallet[owner] != address(0);
    }
}