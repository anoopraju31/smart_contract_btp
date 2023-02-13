const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Admin', () => {
  let admin,
    manufacturer,
    distributor,
    adminContract,
    productContract,
    productVerificationContract,
    manufacturerContract;

  before(async () => {
    [admin, manufacturer, distributor] = await ethers.getSigners();
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
    });
  });
});
