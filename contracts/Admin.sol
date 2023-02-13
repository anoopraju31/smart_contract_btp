// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ISupplyRole {}

contract Admin {
    address private _admin;
    address[] public manufacturersAddress;
    address[] public distributorsAddress;
    address[] public wholesalersAddress;
    address[] public retailersAddress;

    constructor() {
        _admin = msg.sender;
    }

    function getAdmin() public view returns (address) {
        return _admin;
    }

    modifier onlyAdmin() {
        require(msg.sender == _admin, "Only amdin is allowed!");
        _;
    }
}
