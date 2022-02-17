'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const { ParkingComplexController } = require('@lib/controllers');

describe('/lib/controllers/parking-complex.js', () => {
	let parkingComplexController, models;

	const sandbox = sinon.createSandbox();

	const parkingComplexData = {
		_id: '620b146162d0ff825d5f46ea',
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
		models = await getModels();
		parkingComplexController = new ParkingComplexController({ models });
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('#constructor', () => {
		it('should load models', async () => {
			expect(parkingComplexController.model).to.deep.equal(
				models.parkingComplex
			);
		});

		it('should throw if no model was provided', async () => {
			expect(function () {
				new ParkingComplexController({});
			}).to.throw();
		});

		it('should throw if parking complex model was provided', async () => {
			expect(function () {
				new ParkingComplexController({ models: {} });
			}).to.throw();
		});
	});

	describe('#get', () => {
		beforeEach(function () {
			sandbox
				.stub(models.parkingComplex, 'getByName')
				.resolves(parkingComplexData);
		});

		it('should return parking complex information', async () => {
			const parkingComplex = await parkingComplexController.get(
				parkingComplexData.name
			);

			expect(parkingComplex).to.deep.equal(parkingComplexData);
		});

		it('should should throw if parking complex not found', async () => {
			models.parkingComplex.getByName.resolves(null);

			let error;

			try {
				await parkingComplexController.get(parkingComplexData.name);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should should throw if there was a problem when retrieving parking complex information', async () => {
			models.parkingComplex.getByName.rejects(new Error('error'));

			let error;

			try {
				await parkingComplexController.get(parkingComplexData.name);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});
});
