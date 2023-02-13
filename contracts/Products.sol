// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Admin.sol";

/*
 * @title Products
 * @dev The Product contract contains a Product struct which stores details of each products and
 * a mapping to access the details.
 */
contract Products is Admin {
    uint prductId = 0;

    event ProductCreated(uint productId);
    event ProductNoLongerInProduction(uint productId);

    struct Product {
        string model;
        string name;
        string brand;
        string description;
        string[] ipfsHashs;
        bool isInProduction;
        bool isValue;
    }

    modifier validId(uint productId) {
        require(
            products[productId].isValue == true,
            "No product exists in this id."
        );
        _;
    }

    mapping(uint => Product) public products;

    /*
     * @dev create a new product and add it to the mapping.
     */
    function createProduct(
        string memory _brand,
        string memory _name,
        string memory _model,
        string memory _description,
        string[] memory _ipfsHashs
    ) public onlyAdmin {
        prductId++;
        Product storage product = products[prductId];

        product.isValue = true;
        product.isInProduction = true;
        product.name = _name;
        product.brand = _brand;
        product.model = _model;
        product.description = _description;

        for (uint8 i = 0; i < _ipfsHashs.length; i++) {
            product.ipfsHashs.push(_ipfsHashs[i]);
        }

        emit ProductCreated(prductId);
    }

    /*
     * @dev sets the product to not longer in production.
     */
    function setProductionStatus(
        uint _productId
    ) public onlyAdmin validId(_productId) {
        Product storage product = products[_productId];
        product.isInProduction = !product.isInProduction;

        emit ProductNoLongerInProduction(_productId);
    }

    /*
     * @return sets the product to not longer in production.
     */
    function getProduct(
        uint _productId
    )
        public
        view
        validId(_productId)
        returns (
            bool,
            string memory,
            string memory,
            string memory,
            string memory,
            string[] memory
        )
    {
        return (
            products[_productId].isInProduction,
            products[_productId].brand,
            products[_productId].name,
            products[_productId].model,
            products[_productId].description,
            products[_productId].ipfsHashs
        );
    }

    function isValidProduct(uint _id) public view returns (bool) {
        return products[_id].isValue;
    }
}
