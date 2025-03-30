// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockTajiriWallet {
    address public owner;
    
    constructor(address _owner) {
        owner = _owner;
    }
    
    function getName() public pure returns (string memory) {
        return "MockTajiriWallet";
    }
} 