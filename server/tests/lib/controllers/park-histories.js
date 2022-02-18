'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const { ParkHistoriesController } = require('@lib/controllers');

describe('/lib/controllers/park-histories.js', () => {
	let parkHistoriesController, models;

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

	const parkingComplex = {
		_id: '620b146162d0ff825d5f46ed',
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

	const parkingHistory = [
		{
			plateNumber: 'AGL5251',
			vehicleType: 0,
			parkingSlotType: 0,
			parkingSlotRate: 20,
			parkingSlotId: '620b146162d0ff825d5f46ef',
			entryPointId: '620b146162d0ff825d5f46ea',
			parkingComplexId: '620b146162d0ff825d5f46ec',
			isContinuous: false,
			isFlatRateConsumed: false
		}
	];

	before(async () => {
		models = await getModels();
		parkHistoriesController = new ParkHistoriesController({ models });
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('#constructor', () => {
		it('should load models', async () => {
			expect(parkHistoriesController.models).to.deep.equal({
				parkingHistories: models.parkingHistories,
				parkingSlots: models.parkingSlots,
				parkingComplex: models.parkingComplex
			});
		});

		it('should throw if no model was provided', async () => {
			expect(function () {
				new ParkHistoriesController({});
			}).to.throw();
		});

		it('should throw if parking history model was provided', async () => {
			expect(function () {
				new ParkHistoriesController({
					models: {
						parkingSlots: models.parkingSlots,
						parkingComplex: models.parkingComplex
					}
				});
			}).to.throw();
		});

		it('should throw if parking slots model was provided', async () => {
			expect(function () {
				new ParkHistoriesController({
					models: {
						parkingHistories: models.parkingHistories,
						parkingComplex: models.parkingComplex
					}
				});
			}).to.throw();
		});

		it('should throw if parking complex model was provided', async () => {
			expect(function () {
				new ParkHistoriesController({
					models: {
						parkingHistories: models.parkingHistories,
						parkingSlots: models.parkingSlots
					}
				});
			}).to.throw();
		});
	});

	describe('#execute', () => {
		beforeEach(function () {
			sandbox.stub(models.parkingSlots, 'getById').resolves(parkingSlot);
			sandbox.stub(models.parkingComplex, 'getById').resolves(parkingComplex);
			sandbox
				.stub(models.parkingHistories, 'getByPlateNumber')
				.resolves(parkingHistory);
			sandbox
				.stub(models.parkingHistories, 'add')
				.resolves({ acknowledged: true });
			sandbox.stub(models.parkingSlots, 'updateSlotAvailability').resolves();
		});

		it('should record parking history', async () => {
			await parkHistoriesController.execute(
				'620b146162d0ff825d5f46fc',
				'620b146162d0ff825d5f46fa',
				{ plateNumber: 'ABC123', type: 0 }
			);

			expect(models.parkingSlots.getById.calledOnce).to.be.true;
			expect(models.parkingComplex.getById.calledOnce).to.be.true;
			expect(models.parkingHistories.getByPlateNumber.calledOnce).to.be.true;
			expect(models.parkingHistories.add.calledOnce).to.be.true;
			expect(models.parkingSlots.updateSlotAvailability.calledOnce).to.be.true;
		});

		it('should record parking history if parking time is provided', async () => {
			await parkHistoriesController.execute(
				'620b146162d0ff825d5f46fc',
				'620b146162d0ff825d5f46fa',
				{
					plateNumber: 'ABC123',
					type: 0,
					parkTime: '2022-02-15T02:48:00.552+00:00'
				}
			);

			expect(models.parkingSlots.getById.calledOnce).to.be.true;
			expect(models.parkingComplex.getById.calledOnce).to.be.true;
			expect(models.parkingHistories.getByPlateNumber.calledOnce).to.be.true;
			expect(models.parkingHistories.add.calledOnce).to.be.true;
			expect(models.parkingSlots.updateSlotAvailability.calledOnce).to.be.true;
		});

		it('should record parking history if initial time from parking history is present', async () => {
			parkingHistory.initialParkTime = '2022-02-15T02:48:00.552+00:00';
			models.parkingHistories.getByPlateNumber.resolves(parkingHistory);

			await parkHistoriesController.execute(
				'620b146162d0ff825d5f46fc',
				'620b146162d0ff825d5f46fa',
				{
					plateNumber: 'ABC123',
					type: 0
				}
			);

			expect(models.parkingSlots.getById.calledOnce).to.be.true;
			expect(models.parkingComplex.getById.calledOnce).to.be.true;
			expect(models.parkingHistories.getByPlateNumber.calledOnce).to.be.true;
			expect(models.parkingHistories.add.calledOnce).to.be.true;
			expect(models.parkingSlots.updateSlotAvailability.calledOnce).to.be.true;
		});

		it('should record parking history if parkTime from parking history is present', async () => {
			parkingHistory.parkTime = '2022-02-15T02:48:00.552+00:00';
			models.parkingHistories.getByPlateNumber.resolves(parkingHistory);

			await parkHistoriesController.execute(
				'620b146162d0ff825d5f46fc',
				'620b146162d0ff825d5f46fa',
				{
					plateNumber: 'ABC123',
					type: 0
				}
			);

			expect(models.parkingSlots.getById.calledOnce).to.be.true;
			expect(models.parkingComplex.getById.calledOnce).to.be.true;
			expect(models.parkingHistories.getByPlateNumber.calledOnce).to.be.true;
			expect(models.parkingHistories.add.calledOnce).to.be.true;
			expect(models.parkingSlots.updateSlotAvailability.calledOnce).to.be.true;
		});

		it('should record parking history if unparkTime from parking history is present', async () => {
			parkingHistory.unparkTime = '2022-02-15T02:48:00.552+00:00';
			models.parkingHistories.getByPlateNumber.resolves(parkingHistory);

			await parkHistoriesController.execute(
				'620b146162d0ff825d5f46fc',
				'620b146162d0ff825d5f46fa',
				{
					plateNumber: 'ABC123',
					type: 0
				}
			);

			expect(models.parkingSlots.getById.calledOnce).to.be.true;
			expect(models.parkingComplex.getById.calledOnce).to.be.true;
			expect(models.parkingHistories.getByPlateNumber.calledOnce).to.be.true;
			expect(models.parkingHistories.add.calledOnce).to.be.true;
			expect(models.parkingSlots.updateSlotAvailability.calledOnce).to.be.true;
		});

		it('should not pass previous time activity if no history record yet', async () => {
			models.parkingHistories.getByPlateNumber.resolves([]);

			await parkHistoriesController.execute(
				'620b146162d0ff825d5f46fc',
				'620b146162d0ff825d5f46fa',
				{ plateNumber: 'ABC123', type: 0 }
			);

			expect(models.parkingSlots.getById.calledOnce).to.be.true;
			expect(models.parkingComplex.getById.calledOnce).to.be.true;
			expect(models.parkingHistories.getByPlateNumber.calledOnce).to.be.true;
			expect(models.parkingHistories.add.calledOnce).to.be.true;
			expect(models.parkingSlots.updateSlotAvailability.calledOnce).to.be.true;
		});

		it('should throw if no parking slot found', async () => {
			models.parkingSlots.getById.resolves(null);

			let error;

			try {
				await parkHistoriesController.execute(
					'620b146162d0ff825d5f46fc',
					'620b146162d0ff825d5f46fa',
					{ plateNumber: 'ABC123', type: 0 }
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if there was a problem when retrieving a slot information', async () => {
			models.parkingSlots.getById.rejects(new Error('error'));

			let error;

			try {
				await parkHistoriesController.execute(
					'620b146162d0ff825d5f46fc',
					'620b146162d0ff825d5f46fa',
					{ plateNumber: 'ABC123', type: 0 }
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if no parking complex found', async () => {
			models.parkingComplex.getById.resolves(null);

			let error;

			try {
				await parkHistoriesController.execute(
					'620b146162d0ff825d5f46fc',
					'620b146162d0ff825d5f46fa',
					{ plateNumber: 'ABC123', type: 0 }
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if there was a problem when retrieving a parking complex information', async () => {
			models.parkingComplex.getById.rejects(new Error('error'));

			let error;

			try {
				await parkHistoriesController.execute(
					'620b146162d0ff825d5f46fc',
					'620b146162d0ff825d5f46fa',
					{ plateNumber: 'ABC123', type: 0 }
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if there was a problem when retrieving a parking log', async () => {
			models.parkingHistories.getByPlateNumber.rejects(new Error('error'));

			let error;

			try {
				await parkHistoriesController.execute(
					'620b146162d0ff825d5f46fc',
					'620b146162d0ff825d5f46fa',
					{ plateNumber: 'ABC123', type: 0 }
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if parking log was not added', async () => {
			models.parkingHistories.add.resolves({ acknowledged: false });

			let error;

			try {
				await parkHistoriesController.execute(
					'620b146162d0ff825d5f46fc',
					'620b146162d0ff825d5f46fa',
					{ plateNumber: 'ABC123', type: 0 }
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if there was an error adding parking log', async () => {
			models.parkingHistories.add.rejects(new Error('error'));

			let error;

			try {
				await parkHistoriesController.execute(
					'620b146162d0ff825d5f46fc',
					'620b146162d0ff825d5f46fa',
					{ plateNumber: 'ABC123', type: 0 }
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if there was an error updating the availability slot', async () => {
			models.parkingSlots.updateSlotAvailability.rejects(new Error('error'));

			let error;

			try {
				await parkHistoriesController.execute(
					'620b146162d0ff825d5f46fc',
					'620b146162d0ff825d5f46fa',
					{ plateNumber: 'ABC123', type: 0 }
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#prepareParkDetails', () => {
		let vehicleDetails;

		beforeEach(function () {
			vehicleDetails = {
				plateNumber: 'ABC123',
				type: 0,
				parkingSlotId: '620b146162d0ff825d5f46fc',
				entryPointId: '620b146162d0ff825d5f46fa',
				parkTime: new Date('2022-02-15T02:48:00.552+00:00'),
				parkingComplexId: '620b146162d0ff825d5f46ff',
				parkingSlotType: 0,
				parkingSlotRate: 20
			};
		});

		it('should prepare parking details', () => {
			const parkingDetails = ParkHistoriesController.prepareParkDetails(
				vehicleDetails,
				{ continuousHourThreshold: 1 }
			);

			expect(parkingDetails).to.deep.equal({
				parkingSlotId: vehicleDetails.parkingSlotId,
				entryPointId: vehicleDetails.entryPointId,
				parkingComplexId: vehicleDetails.parkingComplexId,
				parkTime: vehicleDetails.parkTime,
				parkingSlotType: vehicleDetails.parkingSlotType,
				parkingSlotRate: vehicleDetails.parkingSlotRate,
				plateNumber: vehicleDetails.plateNumber,
				vehicleType: vehicleDetails.type,
				isContinuous: false,
				isFlatRateConsumed: false
			});
		});

		it('should prepare parking details if unpark time from previous activity is provided', () => {
			const parkingDetails = ParkHistoriesController.prepareParkDetails(
				vehicleDetails,
				{ continuousHourThreshold: 1 },
				{
					unparkTime: new Date('2022-02-15T02:50:00.552+00:00')
				}
			);

			expect(parkingDetails).to.deep.equal({
				parkingSlotId: vehicleDetails.parkingSlotId,
				entryPointId: vehicleDetails.entryPointId,
				parkingComplexId: vehicleDetails.parkingComplexId,
				parkTime: vehicleDetails.parkTime,
				parkingSlotType: vehicleDetails.parkingSlotType,
				parkingSlotRate: vehicleDetails.parkingSlotRate,
				plateNumber: vehicleDetails.plateNumber,
				vehicleType: vehicleDetails.type,
				isContinuous: true,
				isFlatRateConsumed: false
			});
		});

		it('should prepare parking details if it is not in continuous rate', () => {
			vehicleDetails.initialParkTime = new Date(
				'2022-02-15T02:48:00.552+00:00'
			);
			vehicleDetails.isFlatRateConsumed = true;

			const parkingDetails = ParkHistoriesController.prepareParkDetails(
				vehicleDetails,
				{ continuousHourThreshold: 1 },
				{
					unparkTime: new Date('2022-02-13T04:50:00.552+00:00')
				}
			);

			expect(parkingDetails).to.deep.equal({
				parkingSlotId: vehicleDetails.parkingSlotId,
				entryPointId: vehicleDetails.entryPointId,
				parkingComplexId: vehicleDetails.parkingComplexId,
				parkTime: vehicleDetails.parkTime,
				parkingSlotType: vehicleDetails.parkingSlotType,
				parkingSlotRate: vehicleDetails.parkingSlotRate,
				plateNumber: vehicleDetails.plateNumber,
				vehicleType: vehicleDetails.type,
				isContinuous: false,
				isFlatRateConsumed: false
			});
		});

		it('should prepare parking details if it is in continuous rate and park time from previous activity is provided', () => {
			const parkingDetails = ParkHistoriesController.prepareParkDetails(
				vehicleDetails,
				{ continuousHourThreshold: 1 },
				{
					unparkTime: new Date('2022-02-15T02:50:00.552+00:00'),
					parkTime: new Date('2022-02-13T04:50:00.552+00:00')
				}
			);

			expect(parkingDetails).to.deep.equal({
				parkingSlotId: vehicleDetails.parkingSlotId,
				entryPointId: vehicleDetails.entryPointId,
				parkingComplexId: vehicleDetails.parkingComplexId,
				parkTime: vehicleDetails.parkTime,
				parkingSlotType: vehicleDetails.parkingSlotType,
				parkingSlotRate: vehicleDetails.parkingSlotRate,
				plateNumber: vehicleDetails.plateNumber,
				vehicleType: vehicleDetails.type,
				initialParkTime: new Date('2022-02-13T04:50:00.552+00:00'),
				isContinuous: true,
				isFlatRateConsumed: false
			});
		});
	});

	describe('#isContinuous', () => {
		beforeEach(function () {});

		it('should return true if in continuous rate', () => {
			const isContinuous = ParkHistoriesController.isContinuous(
				new Date('2022-02-15T02:48:00.553+00:00'),
				new Date('2022-02-15T03:02:00.553+00:00'),
				1
			);

			expect(isContinuous).to.be.true;
		});

		it('should return false if not in continuous rate', () => {
			const isContinuous = ParkHistoriesController.isContinuous(
				new Date('2022-02-15T02:48:00.553+00:00'),
				new Date('2022-02-15T04:48:00.553+00:00'),
				1
			);

			expect(isContinuous).to.be.false;
		});
	});
});
