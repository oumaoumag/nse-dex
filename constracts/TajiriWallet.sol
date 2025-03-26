// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TajiriWallet {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function excecute(address target, uint256 value, bytes calldata data) external payable {
        require(msg.sender == owner, "Not authorized");
        (bool success, ) = target.call{value: value}(data);
        require(success, "Execution failed");
    }    
    receive() external payable{}
}