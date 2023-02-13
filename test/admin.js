const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Admin', () => {
  let admin,
    manufacturer,
    distributor,
    wholesaler,
    retailer,
    adminContract,
    productContract,
    productVerificationContract,
    manufacturerContract,
    distributorContract;

  before(async () => {
    [admin, manufacturer, distributor, wholesaler, retailer] =
      await ethers.getSigners();
    const Admin = await ethers.getContractFactory('Admin');
    adminContract = await Admin.deploy();

    const Product = await ethers.getContractFactory('Products');
    productContract = await Product.deploy(adminContract.address);

    const ProductVerification = await ethers.getContractFactory(
      'ProductVerification',
    );
    productVerificationContract = await ProductVerification.deploy(
      admin.address,
    );

    const Manufacturer = await ethers.getContractFactory('Manufacturers');
    manufacturerContract = await Manufacturer.deploy(
      adminContract.address,
      productVerificationContract.address,
      productContract.address,
    );

    const DistributorContract = await ethers.getContractFactory('Distributors');
    distributorContract = await DistributorContract.deploy(
      adminContract.address,
      productVerificationContract.address,
    );
  });

  describe('admin', () => {
    it('should return the admin address', async () => {
      const adminAddress = await adminContract.getAdmin();
      // console.log(adminAddress);
      // console.log(admin.address);
      expect(adminAddress).to.be.eq(admin.address);
    });

    it('Should add a new product', async () => {
      const tx = await productContract.createProduct(
        'Nike',
        'Air Jordan',
        'Shoe',
        'Really good shoe.',
        ['Anoop'],
      );
      await tx.wait();

      const [isInProduction, brand, name, model, description, iphsHashs] =
        await productContract.getProduct(1);

      expect(isInProduction).to.be.eq(true);
      expect(brand).to.be.eq('Nike');
      expect(name).to.be.eq('Air Jordan');
      expect(model).to.be.eq('Shoe');
      expect(description).to.be.eq('Really good shoe.');
      expect(iphsHashs[0]).to.be.eq('Anoop');
    });

    it('Should Change the address of manufacturer contract', async () => {
      // console.log(manufacturerContract.address);
      const tx = await productVerificationContract.changeManufacturer(
        manufacturerContract.address,
      );
      await tx.wait();

      const check = await productVerificationContract.ischange();

      expect(check).to.be.eq(true);
    });

    it('Should add a new manufacturer', async () => {
      const tx = await manufacturerContract.createSupplyPlayer(
        manufacturer.address,
        'ITC',
        'Anoop',
        'BDB202',
        12345678,
        ['Anoop'],
      );
      await tx.wait();

      const manufacturerData = await manufacturerContract.manufacturers(
        manufacturer.address,
      );

      // console.log(manufacturer.address);
      // console.log(manufacturer);
      // console.log(manufacturerData);

      expect(manufacturerData.role).to.be.eq('manufacturer');
      expect(manufacturerData.name).to.be.eq('ITC');
      expect(manufacturerData.owner).to.be.eq('Anoop');
      expect(manufacturerData.contactAddress).to.be.eq('BDB202');
      expect(manufacturerData.phone).to.be.eq(12345678);
      expect(manufacturerData.isBlocked).to.be.eq(false);
      expect(manufacturerData.isValue).to.be.eq(true);
    });

    it('Should create a product code', async () => {
      const tx = await manufacturerContract
        .connect(manufacturer)
        .createNewCode(1, 1676286378, distributor.address, 1676287378);
      await tx.wait();

      const [productId, status, supplyChain, currentOwner, isValue] =
        await productVerificationContract.getCode(1);
      // console.log(productId, status, supplyChain, currentOwner, isValue);

      expect(productId).to.be.eq(1);
      expect(status).to.be.eq(0);
      expect(supplyChain[0].entityAddress).to.be.eq(manufacturer.address);
      expect(supplyChain[0].recivalTimestamp).to.be.eq(1676286378);
      expect(supplyChain[0].transferTo).to.be.eq(distributor.address);
      expect(supplyChain[0].transferTimestamp).to.be.eq(1676287378);
      // expect(currentOwner).to.be.eq(0x0000000000000000000000000000000000000000);
      expect(isValue).to.be.eq(true);
    });

    it('Should create a distributor', async () => {
      const tx = await distributorContract.createSupplyPlayer(
        distributor.address,
        'Shivam & Sons',
        'Shivam',
        'BDD225',
        123456789,
        ['Shivam'],
      );
      await tx.wait();

      const [name, owner, contactAddress, phone, isValue, ipfsHashs] =
        await distributorContract.getDistributor(distributor.address);

      // console.log(name, owner, contactAddress, phone, isValue, ipfsHashs);
      expect(name).to.be.eq('Shivam & Sons');
      expect(owner).to.be.eq('Shivam');
      expect(contactAddress).to.be.eq('BDD225');
      expect(phone).to.be.eq(123456789);
      expect(isValue).to.be.eq(true);
      expect(ipfsHashs[0]).to.be.eq('Shivam');
    });

    it('Should add the distributor to supply chain of code', async () => {
      const tx = await distributorContract
        .connect(distributor)
        .addToCodeSupplyChain(1, 1676321483, wholesaler.address, 1675464237);
      await tx.wait();

      const [productId, status, supplyChain, currentOwner, isValue] =
        await productVerificationContract.getCode(1);
      // console.log(productId, status, supplyChain, currentOwner, isValue);

      expect(productId).to.be.eq(1);
      expect(status).to.be.eq(0);
      expect(supplyChain[0].entityAddress).to.be.eq(manufacturer.addresss);
      expect(supplyChain[0].recivalTimestamp).to.be.eq(1676286378);
      expect(supplyChain[0].transferTo).to.be.eq(distribustor.address);
      expect(supplyChain[0].transferTimestamp).to.be.eq(1676287378);
      expect(supplyChain[1].entityAddress).to.be.eq(distributor.address);
      expect(supplyChain[1].recivalTimestamp).to.be.eq(1676321483);
      expect(supplyChain[1].transferTo).to.be.eq(wholesaler.address);
      expect(supplyChain[1].transferTimestamp).to.be.eq(1675464237);
      // expect(currentOwner).to.be.eq(0x0000000000000000000000000000000000000000);
      expect(isValue).to.be.eq(true);
    });

    it('Should create a new wholesaler', async () => {});
  });
});
