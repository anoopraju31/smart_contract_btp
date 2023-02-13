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

contract Distributors is SupplyPlayers, Admin {
    IProductVerification productVerificationContract;

    constructor(address _productVerification) {
        productVerificationContract = IProductVerification(
            _productVerification
        );
    }

    mapping(address => SupplyPlayer) public distributors;

    modifier onlyDistributor() {
        require(
            distributors[msg.sender].isValue == true,
            "Only valid distributors are allowed."
        );
        _;
    }

    function createSupplyPlayer(
        address _distributorAddress,
        string memory _name,
        string memory _owner,
        string memory _contactAddress,
        uint _phone,
        string[] memory _ipfsHashs
    ) external onlyAdmin {
        SupplyPlayer storage distributor = distributors[_distributorAddress];
        distributorsAddress.push(_distributorAddress);

        distributor.role = "distributor";
        distributor.name = _name;
        distributor.owner = _owner;
        distributor.contactAddress = _contactAddress;
        distributor.phone = _phone;
        distributor.createdTimestamp = block.timestamp;
        distributor.isValue = true;

        for (uint8 i = 0; i < _ipfsHashs.length; i++) {
            distributor.ipfsHashs.push(_ipfsHashs[i]);
        }
    }

    function addToCodeSupplyChain(
        uint _codeId,
        uint _manufactureTimestamp,
        address _transferAddrees,
        uint _transferTimestamp
    ) public onlyDistributor {
        productVerificationContract.addToSupplyChain(
            _codeId,
            _manufactureTimestamp,
            _transferAddrees,
            _transferTimestamp
        );
    }

    function updateName(
        address _distributorAddress,
        string memory _name
    ) external {
        SupplyPlayer storage distributor = distributors[_distributorAddress];
        string memory oldName = distributor.name;
        distributor.name = _name;

        emit UpdateName(_distributorAddress, oldName, _name);
    }

    function updateOwner(
        address _distributorAddress,
        string memory _owner
    ) external {
        SupplyPlayer storage distributor = distributors[_distributorAddress];
        string memory oldOwner = distributor.owner;
        distributor.name = _owner;

        emit UpdateName(_distributorAddress, oldOwner, _owner);
    }

    function updateContactAddress(
        address _distributorAddress,
        string memory _contactAddress
    ) external {
        SupplyPlayer storage distributor = distributors[_distributorAddress];
        string memory oldContactAddress = distributor.contactAddress;
        distributor.contactAddress = _contactAddress;

        emit UpdateContactAddress(
            _distributorAddress,
            oldContactAddress,
            _contactAddress
        );
    }

    function changeToBlocked(address _distributorAddress) external {
        SupplyPlayer storage distributor = distributors[_distributorAddress];
        bool status = !distributor.isBlocked;
        distributor.isBlocked = status;

        emit BlockStatus(_distributorAddress, status);
    }

    function updatePhone(address _distributorAddress, uint _phone) external {
        SupplyPlayer storage distributor = distributors[_distributorAddress];
        uint oldPhone = distributor.phone;
        distributor.phone = _phone;

        emit UpdatePhone(_distributorAddress, oldPhone, _phone);
    }

    function addToIpfsHash(
        address _distributorAddress,
        string memory _ipfsHash
    ) external {
        SupplyPlayer storage distributor = distributors[_distributorAddress];
        distributor.ipfsHashs.push(_ipfsHash);

        emit AddToIpfsHash(_distributorAddress, _ipfsHash);
    }

    function removeFromIpfsHash(
        address _distributorAddress,
        uint index
    ) external {
        SupplyPlayer storage distributor = distributors[_distributorAddress];
        string memory ipfsHash = distributor.ipfsHashs[index];
        delete distributor.ipfsHashs[index];

        emit RemoveFromIpfsHash(_distributorAddress, ipfsHash);
    }
}
