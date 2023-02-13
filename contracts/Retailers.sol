// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SupplyPlayers.sol";
import "./Admin.sol";

interface IProductVerification {
    function addToSupplyChain(
        uint _codeId,
        uint _manufactureTimestamp,
        address _transferAddrees,
        uint _transferTimestamp
    ) external;
}

contract Retailer is SupplyPlayers, Admin {
    IProductVerification productVerificationContract;

    constructor(address _productVerification) {
        productVerificationContract = IProductVerification(
            _productVerification
        );
    }

    event RetailerCreated(address _retailerAddress);

    mapping(address => SupplyPlayer) public retailers;

    modifier onlyRetailers() {
        require(
            retailers[msg.sender].isValue == true,
            "Only valid retailers are allowed."
        );
        _;
    }

    function createSupplyPlayer(
        address _retailerAddress,
        string memory _name,
        string memory _owner,
        string memory _contactAddress,
        uint _phone,
        string[] memory _ipfsHashs
    ) external onlyAdmin {
        SupplyPlayer storage retailer = retailers[_retailerAddress];
        retailersAddress.push(_retailerAddress);

        retailer.role = "retailer";
        retailer.name = _name;
        retailer.owner = _owner;
        retailer.contactAddress = _contactAddress;
        retailer.phone = _phone;
        retailer.createdTimestamp = block.timestamp;
        retailer.isValue = true;

        for (uint8 i = 0; i < _ipfsHashs.length; i++) {
            retailer.ipfsHashs.push(_ipfsHashs[i]);
        }
    }

    function addToCodeSupplyChain(
        uint _codeId,
        uint _manufactureTimestamp,
        address _transferAddrees,
        uint _transferTimestamp
    ) public onlyRetailers {
        productVerificationContract.addToSupplyChain(
            _codeId,
            _manufactureTimestamp,
            _transferAddrees,
            _transferTimestamp
        );
    }

    function updateName(
        address _retailerAddress,
        string memory _name
    ) external {
        SupplyPlayer storage retailer = retailers[_retailerAddress];
        string memory oldName = retailer.name;
        retailer.name = _name;

        emit UpdateName(_retailerAddress, oldName, _name);
    }

    function updateOwner(
        address _retailerAddress,
        string memory _owner
    ) external {
        SupplyPlayer storage retailer = retailers[_retailerAddress];
        string memory oldOwner = retailer.owner;
        retailer.name = _owner;

        emit UpdateName(_retailerAddress, oldOwner, _owner);
    }

    function updateContactAddress(
        address _retailerAddress,
        string memory _contactAddress
    ) external {
        SupplyPlayer storage retailer = retailers[_retailerAddress];
        string memory oldContactAddress = retailer.contactAddress;
        retailer.contactAddress = _contactAddress;

        emit UpdateContactAddress(
            _retailerAddress,
            oldContactAddress,
            _contactAddress
        );
    }

    function changeToBlocked(address _retailerAddress) external {
        SupplyPlayer storage retailer = retailers[_retailerAddress];
        bool status = !retailer.isBlocked;
        retailer.isBlocked = status;

        emit BlockStatus(_retailerAddress, status);
    }

    function updatePhone(address _retailerAddress, uint _phone) external {
        SupplyPlayer storage retailer = retailers[_retailerAddress];
        uint oldPhone = retailer.phone;
        retailer.phone = _phone;

        emit UpdatePhone(_retailerAddress, oldPhone, _phone);
    }

    function addToIpfsHash(
        address _retailerAddress,
        string memory _ipfsHash
    ) external {
        SupplyPlayer storage retailer = retailers[_retailerAddress];
        retailer.ipfsHashs.push(_ipfsHash);

        emit AddToIpfsHash(_retailerAddress, _ipfsHash);
    }

    function removeFromIpfsHash(address _retailerAddress, uint index) external {
        SupplyPlayer storage retailer = retailers[_retailerAddress];
        string memory ipfsHash = retailer.ipfsHashs[index];
        delete retailer.ipfsHashs[index];

        emit RemoveFromIpfsHash(_retailerAddress, ipfsHash);
    }
}
