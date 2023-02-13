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

contract Wholesaler is SupplyPlayers, Admin {
    IProductVerification productVerificationContract;

    constructor(address _productVerification) {
        productVerificationContract = IProductVerification(
            _productVerification
        );
    }

    event WholesalerCreated(address _wholesalerAddress);

    mapping(address => SupplyPlayer) public wholesalers;

    modifier onlyWholesaler() {
        require(
            wholesalers[msg.sender].isValue == true,
            "Only valid wholesalers are allowed."
        );
        _;
    }

    function createSupplyPlayer(
        address _wholesalerAddress,
        string memory _name,
        string memory _owner,
        string memory _contactAddress,
        uint _phone,
        string[] memory _ipfsHashs
    ) external onlyAdmin {
        SupplyPlayer storage wholesaler = wholesalers[_wholesalerAddress];
        wholesalersAddress.push(_wholesalerAddress);

        wholesaler.role = "wholesaler";
        wholesaler.name = _name;
        wholesaler.owner = _owner;
        wholesaler.contactAddress = _contactAddress;
        wholesaler.phone = _phone;
        wholesaler.createdTimestamp = block.timestamp;
        wholesaler.isValue = true;

        for (uint8 i = 0; i < _ipfsHashs.length; i++) {
            wholesaler.ipfsHashs.push(_ipfsHashs[i]);
        }
    }

    function addToCodeSupplyChain(
        uint _codeId,
        uint _manufactureTimestamp,
        address _transferAddrees,
        uint _transferTimestamp
    ) public onlyWholesaler {
        productVerificationContract.addToSupplyChain(
            _codeId,
            _manufactureTimestamp,
            _transferAddrees,
            _transferTimestamp
        );
    }

    function updateName(
        address _wholesalerAddress,
        string memory _name
    ) external {
        SupplyPlayer storage wholesaler = wholesalers[_wholesalerAddress];
        string memory oldName = wholesaler.name;
        wholesaler.name = _name;

        emit UpdateName(_wholesalerAddress, oldName, _name);
    }

    function updateOwner(
        address _wholesalerAddress,
        string memory _owner
    ) external {
        SupplyPlayer storage wholesaler = wholesalers[_wholesalerAddress];
        string memory oldOwner = wholesaler.owner;
        wholesaler.name = _owner;

        emit UpdateName(_wholesalerAddress, oldOwner, _owner);
    }

    function updateContactAddress(
        address _wholesalerAddress,
        string memory _contactAddress
    ) external {
        SupplyPlayer storage wholesaler = wholesalers[_wholesalerAddress];
        string memory oldContactAddress = wholesaler.contactAddress;
        wholesaler.contactAddress = _contactAddress;

        emit UpdateContactAddress(
            _wholesalerAddress,
            oldContactAddress,
            _contactAddress
        );
    }

    function changeToBlocked(address _wholesalerAddress) external {
        SupplyPlayer storage wholesaler = wholesalers[_wholesalerAddress];
        bool status = !wholesaler.isBlocked;
        wholesaler.isBlocked = status;

        emit BlockStatus(_wholesalerAddress, status);
    }

    function updatePhone(address _wholesalerAddress, uint _phone) external {
        SupplyPlayer storage wholesaler = wholesalers[_wholesalerAddress];
        uint oldPhone = wholesaler.phone;
        wholesaler.phone = _phone;

        emit UpdatePhone(_wholesalerAddress, oldPhone, _phone);
    }

    function addToIpfsHash(
        address _wholesalerAddress,
        string memory _ipfsHash
    ) external {
        SupplyPlayer storage wholesaler = wholesalers[_wholesalerAddress];
        wholesaler.ipfsHashs.push(_ipfsHash);

        emit AddToIpfsHash(_wholesalerAddress, _ipfsHash);
    }

    function removeFromIpfsHash(
        address _wholesalerAddress,
        uint index
    ) external {
        SupplyPlayer storage wholesaler = wholesalers[_wholesalerAddress];
        string memory ipfsHash = wholesaler.ipfsHashs[index];
        delete wholesaler.ipfsHashs[index];

        emit RemoveFromIpfsHash(_wholesalerAddress, ipfsHash);
    }
}
