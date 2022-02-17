'use strict';

const { expect, assert } = require('chai');
const sinon = require('sinon');

const { ParkingComplexModel } = require('@lib/models');

describe('/lib/models/parking-complex.js', () => {
	let parkingComplexModel, client;

	const sandbox = sinon.createSandbox();

	const parkingComplexData = {
		name: 'Sample Parking Complex',
		noOfSlots: 12,
		noOfEntryPoints: 3,
		flatRate: {
			rate: 40,
			hours: 3
		},
		dayRate: 5000,
		continuousHourThreshold: 1,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	before(async () => {
		client = await mongodbClient();

		parkingComplexModel = new ParkingComplexModel(client, {
			database: config.mongodb.database
		});

		await parkingComplexModel.collection.insertOne(parkingComplexData);
	});

	afterEach(() => {
		sandbox.restore();
	});

	after(async () => {
		await parkingComplexModel.collection.deleteMany({
			name: 'Sample Parking Complex'
		});
	});

	describe('#getByName', () => {
		it('should get parking complex by name', async () => {
			const parkingComplex = await parkingComplexModel.getByName(
				parkingComplexData.name
			);

			expect(parkingComplex).to.deep.equal(parkingComplexData);
		});

		it('should return null if no found document', async () => {
			const parkingComplex = await parkingComplexModel.getByName('Sample');

			expect(parkingComplex).to.deep.equal(null);
		});

		it('should throw error if there was an error occurred while retrieving parking complex information', async () => {
			sandbox
				.stub(parkingComplexModel.collection, 'findOne')
				.rejects(new Error('Error'));

			let error;

			try {
				await parkingComplexModel.getByName(parkingComplexData.name);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#getById', () => {
		it('should get parking complex by id', async () => {
			const parkingComplex = await parkingComplexModel.getById(
				parkingComplexData._id
			);

			expect(parkingComplex).to.deep.equal(parkingComplexData);
		});

		it('should return null if no found document', async () => {
			const parkingComplex = await parkingComplexModel.getById(
				'620b146162d0ff825d5f46ea'
			);

			expect(parkingComplex).to.deep.equal(null);
		});

		it('should throw error if there was an error occurred while retrieving parking complex information by id', async () => {
			sandbox
				.stub(parkingComplexModel.collection, 'findOne')
				.rejects(new Error('Error'));

			let error;

			try {
				await parkingComplexModel.getById(parkingComplexData._id);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});
});
