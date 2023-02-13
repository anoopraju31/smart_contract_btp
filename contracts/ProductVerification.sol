// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

interface IManufacture {
    function isValidManufacturer() external view returns (bool);
}

contract ProductVerification {
    event CreateProductCode(uint _codeId);

    IManufacture manufacturerContract;
    uint codeId = 0;

    constructor(address _manufacturer) {
        manufacturerContract = IManufacture(_manufacturer);
    }

    struct SupplyChain {
        address entityAddress;
        uint recivalTimestamp;
        address transferTo;
        uint transferTimestamp;
    }

    struct Code {
        uint productId;
        uint8 status;
        SupplyChain[] supplyChain;
        address currentOwner;
        bool isvalue;
    }

    mapping(uint => Code) public codes;

    function createCode(
        uint _productId,
        uint _manufactureTimestamp,
        address _transferAddrees,
        uint _transferTimestamp
    ) external returns (uint) {
        require(
            manufacturerContract.isValidManufacturer() == true,
            "Only Manufacturer is allowed!"
        );

        SupplyChain memory supplyChain;
        supplyChain.entityAddress = msg.sender;
        supplyChain.recivalTimestamp = _manufactureTimestamp;
        supplyChain.transferTo = _transferAddrees;
        supplyChain.transferTimestamp = _transferTimestamp;

        codeId += 1;
        Code storage code = codes[codeId];
        code.productId = _productId;
        code.status = 0;
        code.isvalue = true;
        code.supplyChain.push(supplyChain);

        emit CreateProductCode(codeId);

        return codeId;
    }

    function addToSupplyChain(
        uint _codeId,
        uint _manufactureTimestamp,
        address _transferAddrees,
        uint _transferTimestamp
    ) external {
        require(codes[_codeId].isvalue == true, "Invalid Code Id!");
        SupplyChain memory supplyChain;
        supplyChain.entityAddress = msg.sender;
        supplyChain.recivalTimestamp = _manufactureTimestamp;
        supplyChain.transferTo = _transferAddrees;
        supplyChain.transferTimestamp = _transferTimestamp;

        Code storage code = codes[_codeId];
        code.supplyChain.push(supplyChain);
    }

    function changeStatus(uint _codeId) external {
        require(codes[_codeId].isvalue == true, "Invalid Code Id!");

        Code storage code = codes[_codeId];
        code.status = 2;
    }

    function changeOwner(uint _codeId, address _newOwner) external {
        require(
            codes[_codeId].currentOwner == msg.sender,
            "Only owner of the product is allowed"
        );

        Code storage code = codes[_codeId];
        code.currentOwner = _newOwner;
        uint len = code.supplyChain.length;
        code.supplyChain[len - 1].transferTo = _newOwner;
        code.supplyChain[len - 1].transferTimestamp = block.timestamp;
    }
}
