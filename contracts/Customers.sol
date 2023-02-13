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
        uint16 phoneNumber;
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

    function reportStolen(uint _codeId) public validCustomer {
        bool check = checkProductOwnedByCustomer(_codeId);

        require(check == true, "Sorry, you don't own this product.");

        productVerificationContract.changeStatus(_codeId);
    }

    function changeOwnership(
        uint _codeId,
        address _newOwner
    ) public validCustomer {
        bool check = checkProductOwnedByCustomer(_codeId);

        require(check == true, "Sorry, you don't own this product.");
        require(
            customers[_newOwner].isValue == true,
            "Please, Register the owner address."
        );

        productVerificationContract.changeOwner(_codeId, _newOwner);
    }

    function checkProductOwnedByCustomer(
        uint _codeId
    ) public view returns (bool) {
        bool check;
        uint[] memory codeArray = customers[msg.sender].products;

        for (uint i = 0; i < codeArray.length; i++) {
            if (codeArray[i] == _codeId) {
                check = true;
                break;
            }
        }

        return check;
    }
}
