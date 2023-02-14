const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Admin', () => {
  let admin,
    manufacturer,
    distributor,
    wholesaler,
    retailer,
    customer,
    newCustomer,
    adminContract,
    productContract,
    productVerificationContract,
    manufacturerContract,
    distributorContract,
    wholesalerContract,
    retailerContract,
    customerContract;

  before(async () => {
    [
      admin,
      manufacturer,
      distributor,
      wholesaler,
      retailer,
      customer,
      newCustomer,
    ] = await ethers.getSigners();
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

    const Wholesaler = await ethers.getContractFactory('Wholesalers');
    wholesalerContract = await Wholesaler.deploy(
      productVerificationContract.address,
    );

    const Customer = await ethers.getContractFactory('Customers');
    customerContract = await Customer.deploy(
      productVerificationContract.address,
    );

    const Retailer = await ethers.getContractFactory('Retailers');
    retailerContract = await Retailer.deploy(
      productVerificationContract.address,
      customerContract.address,
    );
  });

  describe('full check', () => {
    it('should return the admin address', async () => {
      const adminAddress = await adminContract.getAdmin();
      // console.log(adminAddress);
      // console.log('Admin address: ', admin.address);
      expect(adminAddress).to.be.eq(admin.address);
    });

    it('Should add a new product', async () => {
      const tx = await productContract.createProduct(
        'Nike',
        'Air Jordan',
        'Shoe',
        'Really good shoe.',
        ['Nike'],
      );
      await tx.wait();

      const [isInProduction, brand, name, model, description, ipfsHashs] =
        await productContract.getProduct(1);

      // console.log('Product deatails:');
      // console.log('Brand : ', brand);
      // console.log('Name : ', name);
      // console.log('Model : ', model);
      // console.log('Description : ', description);
      // console.log('Ipfs Hashs : ', ipfsHashs[0]);
      // console.log('Is In Production : ', isInProduction);

      expect(isInProduction).to.be.eq(true);
      expect(brand).to.be.eq('Nike');
      expect(name).to.be.eq('Air Jordan');
      expect(model).to.be.eq('Shoe');
      expect(description).to.be.eq('Really good shoe.');
      expect(ipfsHashs[0]).to.be.eq('Nike');
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

      // console.log('Manufacture Data: ');
      // console.log('Name : ', manufacturerData.name);
      // console.log('Owner : ', manufacturerData.owner);
      // console.log('Contact Address : ', manufacturerData.contactAddress);
      // console.log('Phone Number : ', manufacturerData.phone);
      // console.log('Is Blocked : ', manufacturerData.isBlocked);
    });

    it('Should create a product code', async () => {
      const tx = await manufacturerContract
        .connect(manufacturer)
        .createNewCode(1, 1676286378, distributor.address, 1676287378);
      await tx.wait();

      const [productId, status, supplyChain, currentOwner, isValue] =
        await productVerificationContract.getCode(1);
      // console.log(productId, status, supplyChain, currentOwner, isValue);

      // console.log('Code - 1 details: ');
      // console.log('Product Id: ', productId);
      // console.log('Status: ', status);
      // console.log('Supply Chain Map:');
      // console.log('   Manufacturer:');
      // console.log('     Manufacture Address: ', supplyChain[0].entityAddress);
      // console.log(
      //   '     Timestamp at which product created ',
      //   supplyChain[0].recivalTimestamp,
      // );
      // console.log('     Distributor Address: ', supplyChain[0].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to distributor: ',
      //   supplyChain[0].transferTimestamp,
      // );
      // console.log('     ', supplyChain[0].)

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

      // console.log('Distributor Details: ');
      // console.log(' Name: ', name);
      // console.log(' Owner: ', owner);
      // console.log(' Contact Address: ', contactAddress);
      // console.log(' Phone: ', phone);
      // console.log(' IPFS Hashs: ', ipfsHashs[0]);

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
      // console.log(manufacturer.address);

      // console.log('Code - 1 details: ');
      // console.log('Product Id: ', productId);
      // console.log('Status: ', status);
      // console.log('Supply Chain Map:');
      // console.log('   Manufacturer:');
      // console.log('     Manufacture Address: ', supplyChain[0].entityAddress);
      // console.log(
      //   '     Timestamp at which product created ',
      //   supplyChain[0].recivalTimestamp,
      // );
      // console.log('     Distributor Address: ', supplyChain[0].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to distributor: ',
      //   supplyChain[0].transferTimestamp,
      // );
      // console.log('   Distributor:');
      // console.log('     Distributor Address: ', supplyChain[1].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by Distributor: ',
      //   supplyChain[1].recivalTimestamp,
      // );
      // console.log('     Wholesaler Address: ', supplyChain[1].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to wholesaler: ',
      //   supplyChain[1].transferTimestamp,
      // );

      expect(productId).to.be.eq(1);
      expect(status).to.be.eq(0);
      expect(supplyChain[0].entityAddress).to.be.eq(manufacturer.address);
      expect(supplyChain[0].recivalTimestamp).to.be.eq(1676286378);
      expect(supplyChain[0].transferTo).to.be.eq(distributor.address);
      expect(supplyChain[0].transferTimestamp).to.be.eq(1676287378);
      expect(supplyChain[1].entityAddress).to.be.eq(distributor.address);
      expect(supplyChain[1].recivalTimestamp).to.be.eq(1676321483);
      expect(supplyChain[1].transferTo).to.be.eq(wholesaler.address);
      expect(supplyChain[1].transferTimestamp).to.be.eq(1675464237);
      // expect(currentOwner).to.be.eq(0x0000000000000000000000000000000000000000);
      expect(isValue).to.be.eq(true);
    });

    it('Should create a new wholesaler', async () => {
      const tx = await wholesalerContract.createSupplyPlayer(
        wholesaler.address,
        'Modi Enterprises',
        'Sohel Modi',
        'BDB203',
        890321456,
        ['Sohel Modi'],
      );
      await tx.wait();

      const [name, owner, contactAddress, phone, ipfsHashs] =
        await wholesalerContract.getWholesaler(wholesaler.address);
      // console.log(name, owner, contactAddress, phone, ipfsHashs);

      // console.log('Wholesaler Details: ');
      // console.log(' Name: ', name);
      // console.log(' Owner: ', owner);
      // console.log(' Contact Address: ', contactAddress);
      // console.log(' Phone: ', phone);
      // console.log(' IPFS Hashs: ', ipfsHashs[0]);

      expect(name).to.be.eq('Modi Enterprises');
      expect(owner).to.be.eq('Sohel Modi');
      expect(contactAddress).to.be.eq('BDB203');
      expect(phone).to.be.eq(890321456);
      expect(ipfsHashs[0]).to.be.eq('Sohel Modi');
    });

    it('Should add the wholesaler to the supply chain of code', async () => {
      const tx = await wholesalerContract
        .connect(wholesaler)
        .addToCodeSupplyChain(1, 1676321973, retailer.address, 1675464237);

      const [productId, status, supplyChain, currentOwner, isValue] =
        await productVerificationContract.getCode(1);
      // console.log(productId, status, supplyChain, currentOwner, isValue);

      // console.log('Code - 1 details: ');
      // console.log('Product Id: ', productId);
      // console.log('Status: ', status);
      // console.log('Supply Chain Map:');
      // console.log('   Manufacturer:');
      // console.log('     Manufacture Address: ', supplyChain[0].entityAddress);
      // console.log(
      //   '     Timestamp at which product created ',
      //   supplyChain[0].recivalTimestamp,
      // );
      // console.log('     Distributor Address: ', supplyChain[0].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to distributor: ',
      //   supplyChain[0].transferTimestamp,
      // );
      // console.log('   Distributor:');
      // console.log('     Distributor Address: ', supplyChain[1].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by Distributor: ',
      //   supplyChain[1].recivalTimestamp,
      // );
      // console.log('     Wholesaler Address: ', supplyChain[1].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to wholesaler: ',
      //   supplyChain[1].transferTimestamp,
      // );
      // console.log('   Wholesaler:');
      // console.log('     Wholesaler Address: ', supplyChain[2].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by wholesaler: ',
      //   supplyChain[2].recivalTimestamp,
      // );
      // console.log('     Retailer Address: ', supplyChain[2].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to retailer: ',
      //   supplyChain[2].transferTimestamp,
      // );

      expect(productId).to.be.eq(1);
      expect(status).to.be.eq(0);
      expect(supplyChain[0].entityAddress).to.be.eq(manufacturer.address);
      expect(supplyChain[0].recivalTimestamp).to.be.eq(1676286378);
      expect(supplyChain[0].transferTo).to.be.eq(distributor.address);
      expect(supplyChain[0].transferTimestamp).to.be.eq(1676287378);
      expect(supplyChain[1].entityAddress).to.be.eq(distributor.address);
      expect(supplyChain[1].recivalTimestamp).to.be.eq(1676321483);
      expect(supplyChain[1].transferTo).to.be.eq(wholesaler.address);
      expect(supplyChain[1].transferTimestamp).to.be.eq(1675464237);
      expect(supplyChain[2].entityAddress).to.be.eq(wholesaler.address);
      expect(supplyChain[2].recivalTimestamp).to.be.eq(1676321973);
      expect(supplyChain[2].transferTo).to.be.eq(retailer.address);
      expect(supplyChain[2].transferTimestamp).to.be.eq(1675464237);
      // expect(currentOwner).to.be.eq(0x0000000000000000000000000000000000000000);
      expect(isValue).to.be.eq(true);
    });

    it('Should create a new retailer', async () => {
      const tx = await retailerContract.createSupplyPlayer(
        retailer.address,
        'Charit Stores',
        'Charit Vinay',
        'BDB223',
        9753102468,
        ['Vinay'],
      );
      await tx.wait();

      const [name, owner, contactAddress, phone, ipfsHashs] =
        await retailerContract.getRetailer(retailer.address);
      // console.log(name, owner, contactAddress, phone, ipfsHashs);

      // console.log('Retailer Details: ');
      // console.log(' Name: ', name);
      // console.log(' Owner: ', owner);
      // console.log(' Contact Address: ', contactAddress);
      // console.log(' Phone: ', phone);
      // console.log(' IPFS Hashs: ', ipfsHashs[0]);

      expect(name).to.be.eq('Charit Stores');
      expect(owner).to.be.eq('Charit Vinay');
      expect(contactAddress).to.be.eq('BDB223');
      expect(phone).to.be.eq(9753102468);
      expect(ipfsHashs[0]).to.be.eq('Vinay');
    });

    it('Should add the retailer to the supply chain of code', async () => {
      const tx = await retailerContract
        .connect(retailer)
        .addToCodeSupplyChain(1, 1676321973, customer.address, 1675464237);
      await tx.wait();

      const [productId, status, supplyChain, currentOwner, isValue] =
        await productVerificationContract.getCode(1);
      // console.log(productId, status, supplyChain, currentOwner, isValue);

      // console.log('Code - 1 details: ');
      // console.log('Product Id: ', productId);
      // console.log('Status: ', status);
      // console.log('Supply Chain Map:');
      // console.log('   Manufacturer:');
      // console.log('     Manufacture Address: ', supplyChain[0].entityAddress);
      // console.log(
      //   '     Timestamp at which product created ',
      //   supplyChain[0].recivalTimestamp,
      // );
      // console.log('     Distributor Address: ', supplyChain[0].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to distributor: ',
      //   supplyChain[0].transferTimestamp,
      // );
      // console.log('   Distributor:');
      // console.log('     Distributor Address: ', supplyChain[1].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by Distributor: ',
      //   supplyChain[1].recivalTimestamp,
      // );
      // console.log('     Wholesaler Address: ', supplyChain[1].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to wholesaler: ',
      //   supplyChain[1].transferTimestamp,
      // );
      // console.log('   Wholesaler:');
      // console.log('     Wholesaler Address: ', supplyChain[2].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by wholesaler: ',
      //   supplyChain[2].recivalTimestamp,
      // );
      // console.log('     Retailer Address: ', supplyChain[2].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to retailer: ',
      //   supplyChain[2].transferTimestamp,
      // );
      // console.log('   Retailer:');
      // console.log('     Retailer Address: ', supplyChain[2].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by retailer: ',
      //   supplyChain[2].recivalTimestamp,
      // );
      // console.log('     Customer Address: ', supplyChain[2].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to customer: ',
      //   supplyChain[2].transferTimestamp,
      // );

      expect(productId).to.be.eq(1);
      expect(status).to.be.eq(0);
      expect(supplyChain[0].entityAddress).to.be.eq(manufacturer.address);
      expect(supplyChain[0].recivalTimestamp).to.be.eq(1676286378);
      expect(supplyChain[0].transferTo).to.be.eq(distributor.address);
      expect(supplyChain[0].transferTimestamp).to.be.eq(1676287378);
      expect(supplyChain[1].entityAddress).to.be.eq(distributor.address);
      expect(supplyChain[1].recivalTimestamp).to.be.eq(1676321483);
      expect(supplyChain[1].transferTo).to.be.eq(wholesaler.address);
      expect(supplyChain[1].transferTimestamp).to.be.eq(1675464237);
      expect(supplyChain[2].entityAddress).to.be.eq(wholesaler.address);
      expect(supplyChain[2].recivalTimestamp).to.be.eq(1676321973);
      expect(supplyChain[2].transferTo).to.be.eq(retailer.address);
      expect(supplyChain[2].transferTimestamp).to.be.eq(1675464237);
      expect(supplyChain[3].entityAddress).to.be.eq(retailer.address);
      expect(supplyChain[3].recivalTimestamp).to.be.eq(1676321973);
      expect(supplyChain[3].transferTo).to.be.eq(customer.address);
      expect(supplyChain[3].transferTimestamp).to.be.eq(1675464237);
      // expect(currentOwner).to.be.eq(0x0000000000000000000000000000000000000000);
      expect(isValue).to.be.eq(true);
    });

    it('Should create a coustomer', async () => {
      const tx = await customerContract
        .connect(customer)
        .createCustomer('Anoop', 'BDB202', 123459876);
      await tx.wait();

      const [name, contactAddress, phoneNumer, products] =
        await customerContract.getCustomer(customer.address);
      // console.log(name, contactAddress, phoneNumer, products);
      // console.log('Customer Details: ');
      // console.log(' Name: ', name);
      // console.log(' Contact Address: ', contactAddress);
      // console.log(' Phone Number: ', phoneNumer);
      // console.log(' Proudcts: ', products);
    });

    it('Should add customer to the supply chain', async () => {
      const tx = await retailerContract.addCustomerToCode(
        1,
        customer.address,
        1675464237,
      );
      await tx.wait();

      const [productId, status, supplyChain, currentOwner, isValue] =
        await productVerificationContract.getCode(1);

      // * console.log(productId, status, supplyChain, currentOwner, isValue);

      // console.log('Code - 1 details: ');
      // console.log('Product Id: ', productId);
      // console.log('Status: ', status);
      // console.log('Supply Chain Map:');
      // console.log('   Manufacturer:');
      // console.log('     Manufacture Address: ', supplyChain[0].entityAddress);
      // console.log(
      //   '     Timestamp at which product created ',
      //   supplyChain[0].recivalTimestamp,
      // );
      // console.log('     Distributor Address: ', supplyChain[0].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to distributor: ',
      //   supplyChain[0].transferTimestamp,
      // );
      // console.log('   Distributor:');
      // console.log('     Distributor Address: ', supplyChain[1].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by Distributor: ',
      //   supplyChain[1].recivalTimestamp,
      // );
      // console.log('     Wholesaler Address: ', supplyChain[1].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to wholesaler: ',
      //   supplyChain[1].transferTimestamp,
      // );
      // console.log('   Wholesaler:');
      // console.log('     Wholesaler Address: ', supplyChain[2].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by wholesaler: ',
      //   supplyChain[2].recivalTimestamp,
      // );
      // console.log('     Retailer Address: ', supplyChain[2].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to retailer: ',
      //   supplyChain[2].transferTimestamp,
      // );
      // console.log('   Retailer:');
      // console.log('     Retailer Address: ', supplyChain[2].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by retailer: ',
      //   supplyChain[2].recivalTimestamp,
      // );
      // console.log('     Customer Address: ', supplyChain[2].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to customer: ',
      //   supplyChain[2].transferTimestamp,
      // );
      // console.log('   Customer:');
      // console.log('     Customer Address: ', supplyChain[3].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by customer: ',
      //   supplyChain[3].recivalTimestamp,
      // );
      // console.log('     Next customer Address: ', supplyChain[3].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to next customer: ',
      //   supplyChain[3].transferTimestamp,
      // );

      expect(productId).to.be.eq(1);
      expect(status).to.be.eq(1);
      expect(supplyChain[0].entityAddress).to.be.eq(manufacturer.address);
      expect(supplyChain[0].recivalTimestamp).to.be.eq(1676286378);
      expect(supplyChain[0].transferTo).to.be.eq(distributor.address);
      expect(supplyChain[0].transferTimestamp).to.be.eq(1676287378);
      expect(supplyChain[1].entityAddress).to.be.eq(distributor.address);
      expect(supplyChain[1].recivalTimestamp).to.be.eq(1676321483);
      expect(supplyChain[1].transferTo).to.be.eq(wholesaler.address);
      expect(supplyChain[1].transferTimestamp).to.be.eq(1675464237);
      expect(supplyChain[2].entityAddress).to.be.eq(wholesaler.address);
      expect(supplyChain[2].recivalTimestamp).to.be.eq(1676321973);
      expect(supplyChain[2].transferTo).to.be.eq(retailer.address);
      expect(supplyChain[2].transferTimestamp).to.be.eq(1675464237);
      expect(supplyChain[3].entityAddress).to.be.eq(retailer.address);
      expect(supplyChain[3].recivalTimestamp).to.be.eq(1676321973);
      expect(supplyChain[3].transferTo).to.be.eq(customer.address);
      expect(supplyChain[3].transferTimestamp).to.be.eq(1675464237);
      expect(supplyChain[4].entityAddress).to.be.eq(customer.address);
      expect(supplyChain[4].recivalTimestamp).to.be.eq(1675464237);
      expect(supplyChain[4].transferTo.toString()).to.be.eq(
        '0x0000000000000000000000000000000000000000',
      );
      expect(supplyChain[4].transferTimestamp).to.be.eq(0);
      expect(currentOwner).to.be.eq(customer.address);
      expect(isValue).to.be.eq(true);
    });

    it('Should the customer details', async () => {
      const [name, contactAddress, phoneNumer, products] =
        await customerContract.getCustomer(customer.address);

      // console.log('Customer Details: ');
      // console.log(' Name: ', name);
      // console.log(' Contact Address: ', contactAddress);
      // console.log(' Phone Number: ', phoneNumer);
      // console.log(' Proudcts: ', products);

      expect(name).to.be.eq('Anoop');
      expect(contactAddress).to.be.eq('BDB202');
      expect(phoneNumer).to.be.eq(123459876);
      expect(products[0]).to.be.eq(1);
    });
  });

  describe('Add another product + new code', () => {
    it('Should add a new product', async () => {
      const tx = await productContract.createProduct(
        'Nike',
        'Air Force 1',
        'Shoe',
        'Nice shoe',
        ['Nike'],
      );
      await tx.wait();

      const [isInProduction, brand, name, model, description, ipfsHashs] =
        await productContract.getProduct(2);

      // console.log('Product deatails:');
      // console.log('Brand : ', brand);
      // console.log('Name : ', name);
      // console.log('Model : ', model);
      // console.log('Description : ', description);
      // console.log('Ipfs Hashs : ', ipfsHashs[0]);
      // console.log('Is In Production : ', isInProduction);

      expect(isInProduction).to.be.eq(true);
      expect(brand).to.be.eq('Nike');
      expect(name).to.be.eq('Air Force 1');
      expect(model).to.be.eq('Shoe');
      expect(description).to.be.eq('Nice shoe');
      expect(ipfsHashs[0]).to.be.eq('Nike');
    });

    it('Should create a code for new product', async () => {
      const tx = await manufacturerContract
        .connect(manufacturer)
        .createNewCode(2, 1676286378, distributor.address, 1676287378);
      await tx.wait();

      const [productId, status, supplyChain, currentOwner, isValue] =
        await productVerificationContract.getCode(2);
      // console.log(productId, status, supplyChain, currentOwner, isValue);

      expect(productId).to.be.eq(2);
      expect(status).to.be.eq(0);
      expect(supplyChain[0].entityAddress).to.be.eq(manufacturer.address);
      expect(supplyChain[0].recivalTimestamp).to.be.eq(1676286378);
      expect(supplyChain[0].transferTo).to.be.eq(distributor.address);
      expect(supplyChain[0].transferTimestamp).to.be.eq(1676287378);
      // expect(currentOwner).to.be.eq(0x0000000000000000000000000000000000000000);
      expect(isValue).to.be.eq(true);
    });

    it('Should add distributor to the supply chain of new product', async () => {
      const tx = await distributorContract
        .connect(distributor)
        .addToCodeSupplyChain(2, 1676321483, wholesaler.address, 1675464237);
      await tx.wait();

      const [productId, status, supplyChain, currentOwner, isValue] =
        await productVerificationContract.getCode(2);
      // console.log(productId, status, supplyChain, currentOwner, isValue);
      // console.log(manufacturer.address);
      expect(productId).to.be.eq(2);
      expect(status).to.be.eq(0);
      expect(supplyChain[0].entityAddress).to.be.eq(manufacturer.address);
      expect(supplyChain[0].recivalTimestamp).to.be.eq(1676286378);
      expect(supplyChain[0].transferTo).to.be.eq(distributor.address);
      expect(supplyChain[0].transferTimestamp).to.be.eq(1676287378);
      expect(supplyChain[1].entityAddress).to.be.eq(distributor.address);
      expect(supplyChain[1].recivalTimestamp).to.be.eq(1676321483);
      expect(supplyChain[1].transferTo).to.be.eq(wholesaler.address);
      expect(supplyChain[1].transferTimestamp).to.be.eq(1675464237);
      // expect(currentOwner).to.be.eq(0x0000000000000000000000000000000000000000);
      expect(isValue).to.be.eq(true);
    });

    it('Should add wholesaler to the supply chain of new product', async () => {
      const tx = await wholesalerContract
        .connect(wholesaler)
        .addToCodeSupplyChain(2, 1676321973, retailer.address, 1675464237);

      const [productId, status, supplyChain, currentOwner, isValue] =
        await productVerificationContract.getCode(2);
      // console.log(productId, status, supplyChain, currentOwner, isValue);

      expect(productId).to.be.eq(2);
      expect(status).to.be.eq(0);
      expect(supplyChain[0].entityAddress).to.be.eq(manufacturer.address);
      expect(supplyChain[0].recivalTimestamp).to.be.eq(1676286378);
      expect(supplyChain[0].transferTo).to.be.eq(distributor.address);
      expect(supplyChain[0].transferTimestamp).to.be.eq(1676287378);
      expect(supplyChain[1].entityAddress).to.be.eq(distributor.address);
      expect(supplyChain[1].recivalTimestamp).to.be.eq(1676321483);
      expect(supplyChain[1].transferTo).to.be.eq(wholesaler.address);
      expect(supplyChain[1].transferTimestamp).to.be.eq(1675464237);
      expect(supplyChain[2].entityAddress).to.be.eq(wholesaler.address);
      expect(supplyChain[2].recivalTimestamp).to.be.eq(1676321973);
      expect(supplyChain[2].transferTo).to.be.eq(retailer.address);
      expect(supplyChain[2].transferTimestamp).to.be.eq(1675464237);
      // expect(currentOwner).to.be.eq(0x0000000000000000000000000000000000000000);
      expect(isValue).to.be.eq(true);
    });

    it('Should add retailer to the supply chain of new product', async () => {
      const tx = await retailerContract
        .connect(retailer)
        .addToCodeSupplyChain(2, 1676321973, customer.address, 1675464237);
      await tx.wait();

      const [productId, status, supplyChain, currentOwner, isValue] =
        await productVerificationContract.getCode(2);
      // console.log(productId, status, supplyChain, currentOwner, isValue);

      expect(productId).to.be.eq(2);
      expect(status).to.be.eq(0);
      expect(supplyChain[0].entityAddress).to.be.eq(manufacturer.address);
      expect(supplyChain[0].recivalTimestamp).to.be.eq(1676286378);
      expect(supplyChain[0].transferTo).to.be.eq(distributor.address);
      expect(supplyChain[0].transferTimestamp).to.be.eq(1676287378);
      expect(supplyChain[1].entityAddress).to.be.eq(distributor.address);
      expect(supplyChain[1].recivalTimestamp).to.be.eq(1676321483);
      expect(supplyChain[1].transferTo).to.be.eq(wholesaler.address);
      expect(supplyChain[1].transferTimestamp).to.be.eq(1675464237);
      expect(supplyChain[2].entityAddress).to.be.eq(wholesaler.address);
      expect(supplyChain[2].recivalTimestamp).to.be.eq(1676321973);
      expect(supplyChain[2].transferTo).to.be.eq(retailer.address);
      expect(supplyChain[2].transferTimestamp).to.be.eq(1675464237);
      expect(supplyChain[3].entityAddress).to.be.eq(retailer.address);
      expect(supplyChain[3].recivalTimestamp).to.be.eq(1676321973);
      expect(supplyChain[3].transferTo).to.be.eq(customer.address);
      expect(supplyChain[3].transferTimestamp).to.be.eq(1675464237);
      // expect(currentOwner).to.be.eq(0x0000000000000000000000000000000000000000);
      expect(isValue).to.be.eq(true);
    });

    it('Should add custoner to the supply chain of new product', async () => {
      const tx = await retailerContract.addCustomerToCode(
        2,
        customer.address,
        1675464237,
      );
      await tx.wait();

      const [productId, status, supplyChain, currentOwner, isValue] =
        await productVerificationContract.getCode(2);

      // * console.log(productId, status, supplyChain, currentOwner, isValue);

      // console.log('Code - 2 details: ');
      // console.log('Product Id: ', productId);
      // console.log('Status: ', status);
      // console.log('Supply Chain Map:');
      // console.log('   Manufacturer:');
      // console.log('     Manufacture Address: ', supplyChain[0].entityAddress);
      // console.log(
      //   '     Timestamp at which product created ',
      //   supplyChain[0].recivalTimestamp,
      // );
      // console.log('     Distributor Address: ', supplyChain[0].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to distributor: ',
      //   supplyChain[0].transferTimestamp,
      // );
      // console.log('   Distributor:');
      // console.log('     Distributor Address: ', supplyChain[1].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by Distributor: ',
      //   supplyChain[1].recivalTimestamp,
      // );
      // console.log('     Wholesaler Address: ', supplyChain[1].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to wholesaler: ',
      //   supplyChain[1].transferTimestamp,
      // );
      // console.log('   Wholesaler:');
      // console.log('     Wholesaler Address: ', supplyChain[2].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by wholesaler: ',
      //   supplyChain[2].recivalTimestamp,
      // );
      // console.log('     Retailer Address: ', supplyChain[2].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to retailer: ',
      //   supplyChain[2].transferTimestamp,
      // );
      // console.log('   Retailer:');
      // console.log('     Retailer Address: ', supplyChain[2].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by retailer: ',
      //   supplyChain[2].recivalTimestamp,
      // );
      // console.log('     Customer Address: ', supplyChain[2].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to customer: ',
      //   supplyChain[2].transferTimestamp,
      // );
      // console.log('   Customer:');
      // console.log('     Customer Address: ', supplyChain[3].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by customer: ',
      //   supplyChain[3].recivalTimestamp,
      // );
      // console.log('     Next customer Address: ', supplyChain[3].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to next customer: ',
      //   supplyChain[3].transferTimestamp,
      // );

      expect(productId).to.be.eq(2);
      expect(status).to.be.eq(1);
      expect(supplyChain[0].entityAddress).to.be.eq(manufacturer.address);
      expect(supplyChain[0].recivalTimestamp).to.be.eq(1676286378);
      expect(supplyChain[0].transferTo).to.be.eq(distributor.address);
      expect(supplyChain[0].transferTimestamp).to.be.eq(1676287378);
      expect(supplyChain[1].entityAddress).to.be.eq(distributor.address);
      expect(supplyChain[1].recivalTimestamp).to.be.eq(1676321483);
      expect(supplyChain[1].transferTo).to.be.eq(wholesaler.address);
      expect(supplyChain[1].transferTimestamp).to.be.eq(1675464237);
      expect(supplyChain[2].entityAddress).to.be.eq(wholesaler.address);
      expect(supplyChain[2].recivalTimestamp).to.be.eq(1676321973);
      expect(supplyChain[2].transferTo).to.be.eq(retailer.address);
      expect(supplyChain[2].transferTimestamp).to.be.eq(1675464237);
      expect(supplyChain[3].entityAddress).to.be.eq(retailer.address);
      expect(supplyChain[3].recivalTimestamp).to.be.eq(1676321973);
      expect(supplyChain[3].transferTo).to.be.eq(customer.address);
      expect(supplyChain[3].transferTimestamp).to.be.eq(1675464237);
      expect(supplyChain[4].entityAddress).to.be.eq(customer.address);
      expect(supplyChain[4].recivalTimestamp).to.be.eq(1675464237);
      expect(supplyChain[4].transferTo.toString()).to.be.eq(
        '0x0000000000000000000000000000000000000000',
      );
      expect(supplyChain[4].transferTimestamp).to.be.eq(0);
      expect(currentOwner).to.be.eq(customer.address);
      expect(isValue).to.be.eq(true);
    });

    it('Should the customer details', async () => {
      const [name, contactAddress, phoneNumer, products] =
        await customerContract.getCustomer(customer.address);

      // console.log(name, contactAddress, phoneNumer, products);
      // console.log('Customer Details: ');
      // console.log(' Name: ', name);
      // console.log(' Contact Address: ', contactAddress);
      // console.log(' Phone Number: ', phoneNumer);
      // console.log(' Proudcts: ', products);

      expect(name).to.be.eq('Anoop');
      expect(contactAddress).to.be.eq('BDB202');
      expect(phoneNumer).to.be.eq(123459876);
      expect(products[0]).to.be.eq(1);
      expect(products[1]).to.be.eq(2);
    });
  });

  describe('Ownership change from one customer to another', () => {
    it('Should create a new coustomer', async () => {
      const tx = await customerContract
        .connect(newCustomer)
        .createCustomer('Amit', 'IIITK', 2233445566);
      await tx.wait();

      const [name, contactAddress, phoneNumer, products] =
        await customerContract.getCustomer(newCustomer.address);
      // console.log(name, contactAddress, phoneNumer, products);

      // console.log('New Customer Details: ');
      // console.log(' Name: ', name);
      // console.log(' Contact Address: ', contactAddress);
      // console.log(' Phone Number: ', phoneNumer);
      // console.log(' Proudcts: ', products);

      expect(name).to.be.eq('Amit');
      expect(contactAddress).to.be.eq('IIITK');
      expect(phoneNumer).to.be.eq(2233445566);
      expect(products.length).to.be.eq(0);
    });

    it('Should change ownership code-1 from Anoop to Amit', async () => {
      let productId, status, supplyChain, currentOwner, isValue;

      // [productId, status, supplyChain, currentOwner, isValue] =
      //   await productVerificationContract.getCode(1);

      // console.log('\n\n Before Ownership change (from Anoop to Amit): \n');
      // console.log('Code - 1 details: ');
      // console.log('Product Id: ', productId);
      // console.log('Status: ', status);
      // console.log('Supply Chain Map:');
      // console.log('   Manufacturer:');
      // console.log('     Manufacture Address: ', supplyChain[0].entityAddress);
      // console.log(
      //   '     Timestamp at which product created ',
      //   supplyChain[0].recivalTimestamp,
      // );
      // console.log('     Distributor Address: ', supplyChain[0].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to distributor: ',
      //   supplyChain[0].transferTimestamp,
      // );
      // console.log('   Distributor:');
      // console.log('     Distributor Address: ', supplyChain[1].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by Distributor: ',
      //   supplyChain[1].recivalTimestamp,
      // );
      // console.log('     Wholesaler Address: ', supplyChain[1].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to wholesaler: ',
      //   supplyChain[1].transferTimestamp,
      // );
      // console.log('   Wholesaler:');
      // console.log('     Wholesaler Address: ', supplyChain[2].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by wholesaler: ',
      //   supplyChain[2].recivalTimestamp,
      // );
      // console.log('     Retailer Address: ', supplyChain[2].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to retailer: ',
      //   supplyChain[2].transferTimestamp,
      // );
      // console.log('   Retailer:');
      // console.log('     Retailer Address: ', supplyChain[2].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by retailer: ',
      //   supplyChain[2].recivalTimestamp,
      // );
      // console.log('     Customer Address: ', supplyChain[2].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to customer: ',
      //   supplyChain[2].transferTimestamp,
      // );
      // console.log('   Customer:');
      // console.log('     Customer Address: ', supplyChain[3].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by customer: ',
      //   supplyChain[3].recivalTimestamp,
      // );
      // console.log('     Next customer Address: ', supplyChain[3].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to next customer: ',
      //   supplyChain[3].transferTimestamp,
      // );

      const tx = await customerContract
        .connect(customer)
        .changeOwnership(1, newCustomer.address);
      await tx.wait();

      [productId, status, supplyChain, currentOwner, isValue] =
        await productVerificationContract.getCode(1);

      // console.log('\n\n After Ownership change (from Anoop to Amit): \n');
      // console.log('Code - 1 details: ');
      // console.log('Product Id: ', productId);
      // console.log('Status: ', status);
      // console.log('Supply Chain Map:');
      // console.log('   Manufacturer:');
      // console.log('     Manufacture Address: ', supplyChain[0].entityAddress);
      // console.log(
      //   '     Timestamp at which product created ',
      //   supplyChain[0].recivalTimestamp,
      // );
      // console.log('     Distributor Address: ', supplyChain[0].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to distributor: ',
      //   supplyChain[0].transferTimestamp,
      // );
      // console.log('   Distributor:');
      // console.log('     Distributor Address: ', supplyChain[1].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by Distributor: ',
      //   supplyChain[1].recivalTimestamp,
      // );
      // console.log('     Wholesaler Address: ', supplyChain[1].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to wholesaler: ',
      //   supplyChain[1].transferTimestamp,
      // );
      // console.log('   Wholesaler:');
      // console.log('     Wholesaler Address: ', supplyChain[2].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by wholesaler: ',
      //   supplyChain[2].recivalTimestamp,
      // );
      // console.log('     Retailer Address: ', supplyChain[2].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to retailer: ',
      //   supplyChain[2].transferTimestamp,
      // );
      // console.log('   Retailer:');
      // console.log('     Retailer Address: ', supplyChain[2].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by retailer: ',
      //   supplyChain[2].recivalTimestamp,
      // );
      // console.log('     Customer Address: ', supplyChain[2].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to customer: ',
      //   supplyChain[2].transferTimestamp,
      // );
      // console.log('   Customer:');
      // console.log('     Customer Address: ', supplyChain[3].entityAddress);
      // console.log(
      //   '     Timestamp at which product recived by customer: ',
      //   supplyChain[3].recivalTimestamp,
      // );
      // console.log('     Next customer Address: ', supplyChain[3].transferTo);
      // console.log(
      //   '     Timestamp at which product is transfered to next customer: ',
      //   supplyChain[3].transferTimestamp,
      // );

      expect(currentOwner).to.be.eq(newCustomer.address);
      expect(status).to.be.eq(2);
    });

    it('Should show the details of new customer(Amit)', async () => {
      const [name, contactAddress, phoneNumer, products] =
        await customerContract.getCustomer(newCustomer.address);
      // console.log(name, contactAddress, phoneNumer, products);

      // console.log('New Customer Details: ');
      // console.log(' Name: ', name);
      // console.log(' Contact Address: ', contactAddress);
      // console.log(' Phone Number: ', phoneNumer);
      // console.log(' Proudcts: ', products);

      expect(name).to.be.eq('Amit');
      expect(contactAddress).to.be.eq('IIITK');
      expect(phoneNumer).to.be.eq(2233445566);
      expect(products[0]).to.be.eq(1);
    });

    it('Should remove the code-1 from anoop', async () => {
      const [name, contactAddress, phoneNumer, products] =
        await customerContract.getCustomer(customer.address);

      // console.log('Old Customer Details : ');
      // console.log(' Name: ', name);
      // console.log(' Contact Address: ', contactAddress);
      // console.log(' Phone Number: ', phoneNumer);
      // console.log(' Proudcts: ', products);

      expect(name).to.be.eq('Anoop');
      expect(contactAddress).to.be.eq('BDB202');
      expect(phoneNumer).to.be.eq(123459876);
      expect(products[0]).to.be.eq(2);
      expect(products.length).to.be.eq(1);
    });
  });
});
