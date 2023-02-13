// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "./SupplyPlayers.sol";
import "./Admin.sol";

interface IProductVerification {
    function createCode(
        uint _productId,
        uint _manufactureTimestamp,
        address _transferAddrees,
        uint _transferTimestamp
    ) external returns (uint);
}

interface IProduct {
    function isValidProduct(uint _id) external view returns (bool);
}

contract Manufacturers is SupplyPlayers, Admin {
    IProduct productContract;
    IProductVerification productVerificationContract;

    event CodeCreated(uint _id);

    constructor(address _productVerification, address _product) {
        productContract = IProduct(_product);
        productVerificationContract = IProductVerification(
            _productVerification
        );
    }

    mapping(address => SupplyPlayer) public manufacturers;

    modifier onlyManufacturer() {
        require(
            manufacturers[msg.sender].isValue == true,
            "Only manufacturer is allowed to perform this task!"
        );
        _;
    }

    function createSupplyPlayer(
        address _manufacturerAddress,
        string memory _name,
        string memory _owner,
        string memory _contactAddress,
        uint _phone,
        string[] memory _ipfsHashs
    ) external onlyAdmin {
        SupplyPlayer storage manufacturer = manufacturers[_manufacturerAddress];
        manufacturersAddress.push(_manufacturerAddress);

        manufacturer.role = "manufacturer";
        manufacturer.name = _name;
        manufacturer.owner = _owner;
        manufacturer.contactAddress = _contactAddress;
        manufacturer.phone = _phone;
        manufacturer.createdTimestamp = block.timestamp;
        manufacturer.isValue = true;

        for (uint8 i = 0; i < _ipfsHashs.length; i++) {
            manufacturer.ipfsHashs.push(_ipfsHashs[i]);
        }
    }

    function isValidManufacturer() public view returns (bool) {
        return manufacturers[msg.sender].isValue;
    }

    function createNewCode(
        uint _productId,
        uint _manufactureTimestamp,
        address _transferAddrees,
        uint _transferTimestamp
    ) external onlyManufacturer {
        require(
            productContract.isValidProduct(_productId) == true,
            "Not a valid product id."
        );

        uint codeId = productVerificationContract.createCode(
            _productId,
            _manufactureTimestamp,
            _transferAddrees,
            _transferTimestamp
        );

        emit CodeCreated(codeId);
    }

    function updateName(
        address _manufacturerAddress,
        string memory _name
    ) external {
        SupplyPlayer storage manufacturer = manufacturers[_manufacturerAddress];
        string memory oldName = manufacturer.name;
        manufacturer.name = _name;

        emit UpdateName(_manufacturerAddress, oldName, _name);
    }

    function updateOwner(
        address _manufacturerAddress,
        string memory _owner
    ) external {
        SupplyPlayer storage manufacturer = manufacturers[_manufacturerAddress];
        string memory oldOwner = manufacturer.owner;
        manufacturer.name = _owner;

        emit UpdateName(_manufacturerAddress, oldOwner, _owner);
    }

    function updateContactAddress(
        address _manufacturerAddress,
        string memory _contactAddress
    ) external {
        SupplyPlayer storage manufacturer = manufacturers[_manufacturerAddress];
        string memory oldContactAddress = manufacturer.contactAddress;
        manufacturer.contactAddress = _contactAddress;

        emit UpdateContactAddress(
            _manufacturerAddress,
            oldContactAddress,
            _contactAddress
        );
    }

    function changeToBlocked(address _manufacturerAddress) external {
        SupplyPlayer storage manufacturer = manufacturers[_manufacturerAddress];
        bool status = !manufacturer.isBlocked;
        manufacturer.isBlocked = status;

        emit BlockStatus(_manufacturerAddress, status);
    }

    function updatePhone(address _manufacturerAddress, uint _phone) external {
        SupplyPlayer storage manufacturer = manufacturers[_manufacturerAddress];
        uint oldPhone = manufacturer.phone;
        manufacturer.phone = _phone;

        emit UpdatePhone(_manufacturerAddress, oldPhone, _phone);
    }

    function addToIpfsHash(
        address _manufacturerAddress,
        string memory _ipfsHash
    ) external {
        SupplyPlayer storage manufacturer = manufacturers[_manufacturerAddress];
        manufacturer.ipfsHashs.push(_ipfsHash);

        emit AddToIpfsHash(_manufacturerAddress, _ipfsHash);
    }

    function removeFromIpfsHash(
        address _manufacturerAddress,
        uint index
    ) external {
        SupplyPlayer storage manufacturer = manufacturers[_manufacturerAddress];
        string memory ipfsHash = manufacturer.ipfsHashs[index];
        delete manufacturer.ipfsHashs[index];

        emit RemoveFromIpfsHash(_manufacturerAddress, ipfsHash);
    }
}
