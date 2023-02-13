// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface SupplyPlayers {
    event UpdateName(address _address, string _oldName, string _newName);
    event UpdateOwner(address _address, string _oldOwner, string _newOwner);
    event UpdateContactAddress(
        address _address,
        string _oldContactAddress,
        string _newContactAddress
    );
    event BlockStatus(address _address, bool _status);
    event UpdatePhone(address _address, uint _oldPhone, uint _newPhone);
    event AddToIpfsHash(address _address, string _ipfsHash);
    event RemoveFromIpfsHash(address _address, string _ipfsHash);

    struct SupplyPlayer {
        string role;
        string name;
        string owner;
        string contactAddress;
        string[] ipfsHashs;
        uint phone;
        uint createdTimestamp;
        bool isBlocked;
        bool isValue;
    }

    function createSupplyPlayer(
        address,
        string memory,
        string memory,
        string memory,
        uint,
        string[] memory
    ) external;

    function updateName(
        address _manufacturerAddress,
        string memory _name
    ) external;

    function updateOwner(
        address _manufacturerAddress,
        string memory _owner
    ) external;

    function updateContactAddress(
        address _manufacturerAddress,
        string memory _contactAddress
    ) external;

    function changeToBlocked(address _manufacturerAddress) external;

    function updatePhone(address _manufacturerAddress, uint _phone) external;

    function addToIpfsHash(
        address _manufacturerAddress,
        string memory _ipfsHash
    ) external;

    function removeFromIpfsHash(address _manufacturerAddress, uint) external;
}
