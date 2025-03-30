// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockTajiriWalletFactory {
    mapping(address => address) public wallets;
    
    function deployWallet(address owner) external returns (address) {
        wallets[owner] = address(0x123); // Mock address
        return address(0x123);
    }
    
    function getWallet(address owner) external view returns (address) {
        return wallets[owner];
    }
} 