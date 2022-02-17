'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const { ParkingSlotsController } = require('@lib/controllers');

describe('/lib/controllers/parking-slots.js', () => {
	let parkingSlotsController, models;

	const sandbox = sinon.createSandbox();

	const parkingSlot = {
		_id: '620b146162d0ff825d5f46ea',
		name: 'Parking Slot 1',
		type: 0,
		ratePerHour: 20,
		isOccupied: false,
		parkingComplexId: '620b146162d0ff825d5f46ed',
		createdAt: new Date(),
		updatedAt: new Date(),
		distances: {
			'620b146162d0ff825d5f56ef': 1,
			'620b146162d0ff825d5f56ec': 2,
			'620b146162d0ff825d5f56ee': 3
		}
	};

	before(async () => {
		models = await getModels();
		parkingSlotsController = new ParkingSlotsController({ models });
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('#constructor', () => {
		it('should load models', async () => {
			expect(parkingSlotsController.model).to.deep.equal(models.parkingSlots);
		});

		it('should throw if no model was provided', async () => {
			expect(function () {
				new ParkingSlotsController({});
			}).to.throw();
		});

		it('should throw if parking slots model was provided', async () => {
			expect(function () {
				new ParkingSlotsController({ models: {} });
			}).to.throw();
		});
	});

	describe('#execute', () => {
		beforeEach(function () {
			sandbox
				.stub(models.parkingSlots, 'getAvailableSlot')
				.resolves(parkingSlot);
		});

		it('should return the available slot', async () => {
			const slot = await parkingSlotsController.execute(
				'620b146162d0ff825d5f46fc',
				'620b146162d0ff825d5f46fa',
				{ type: 0 }
			);

			expect(slot).to.deep.equal(parkingSlot);
		});

		it('should should throw if there was a problem when retrieving available slot', async () => {
			models.parkingSlots.getAvailableSlot.rejects(new Error('error'));

			let error;

			try {
				await parkingSlotsController.execute(
					'620b146162d0ff825d5f46fc',
					'620b146162d0ff825d5f46fa',
					{ type: 0 }
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});
});
