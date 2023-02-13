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

    function addManufacturer(address _manufacturer) public {
        manufacturersAddress.push(_manufacturer);
    }

    function addDistributor(address _distributor) public onlyAdmin {
        distributorsAddress.push(_distributor);
    }

    function addWholesaler(address _wholesaler) public onlyAdmin {
        wholesalersAddress.push(_wholesaler);
    }

    function addRetailer(address _retailer) public onlyAdmin {
        retailersAddress.push(_retailer);
    }
}
