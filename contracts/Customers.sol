// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IProductVerification {
    function changeStatus(uint _codeId) external;

    function changeOwner(uint _codeId, address _newOwner) external;
}

contract Customers {
    IProductVerification productVerificationContract;

    constructor(address _productVerification) {
        productVerificationContract = IProductVerification(
            _productVerification
        );
    }

    struct Customer {
        bool isValue;
        string name;
        string contactAddress;
        uint phoneNumber;
        uint timestamp;
        uint[] products;
    }

    mapping(address => Customer) public customers;

    modifier validCustomer() {
        require(
            customers[msg.sender].isValue == true,
            "Address not registered!"
        );
        _;
    }

    function createCustomer(
        string memory _name,
        string memory _contactAddress,
        uint _phoneNumber
    ) public {
        Customer storage customer = customers[msg.sender];

        customer.isValue = true;
        customer.name = _name;
        customer.contactAddress = _contactAddress;
        customer.phoneNumber = _phoneNumber;
        customer.timestamp = block.timestamp;
    }

    function getCustomer(
        address _customer
    ) public view returns (string memory, string memory, uint, uint[] memory) {
        return (
            customers[_customer].name,
            customers[_customer].contactAddress,
            customers[_customer].phoneNumber,
            customers[_customer].products
        );
    }

    function addProduct(address _customer, uint _codeId) public {
        Customer storage customer = customers[_customer];
        customer.products.push(_codeId);
    }

    function reportStolen(uint _codeId) public validCustomer {
        bool check;
        int idx;
        (check, idx) = checkProductOwnedByCustomer(_codeId);

        require(check == true, "Sorry, you don't own this product.");

        productVerificationContract.changeStatus(_codeId);
    }

    function changeOwnership(
        uint _codeId,
        address _newOwner
    ) public validCustomer {
        bool check;
        int idx;
        (check, idx) = checkProductOwnedByCustomer(_codeId);

        require(check == true, "Sorry, you don't own this product.");
        require(
            customers[_newOwner].isValue == true,
            "Please, Register the owner address."
        );

        productVerificationContract.changeOwner(_codeId, _newOwner);
        Customer storage newCustomer = customers[_newOwner];
        Customer storage oldCustomer = customers[msg.sender];
        newCustomer.products.push(_codeId);

        if (uint(idx) != oldCustomer.products.length) {
            for (uint i = uint(idx); i < oldCustomer.products.length - 1; i++) {
                oldCustomer.products[i] = oldCustomer.products[i + 1];
            }
        }

        oldCustomer.products.pop();
    }

    function checkProductOwnedByCustomer(
        uint _codeId
    ) public view returns (bool, int) {
        bool check;
        int idx = -1;
        uint[] memory codeArray = customers[msg.sender].products;

        for (uint i = 0; i < codeArray.length; i++) {
            if (codeArray[i] == _codeId) {
                check = true;
                idx = int(i);
                break;
            }
        }

        return (check, idx);
    }
}
