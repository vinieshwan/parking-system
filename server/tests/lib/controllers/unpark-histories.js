'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const { UnparkHistoriesController } = require('@lib/controllers');

describe('/lib/controllers/unpark-histories.js', () => {
	let unparkHistoriesController, models, historyDetails, parkingDetails;

	const sandbox = sinon.createSandbox();

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
			_id: '620b146162d0ff825d5f46ee',
			plateNumber: 'AGL5251',
			vehicleType: 0,
			parkingSlotType: 0,
			parkingSlotRate: 20,
			parkingSlotId: '620b146162d0ff825d5f46ef',
			entryPointId: '620b146162d0ff825d5f46ea',
			parkingComplexId: '620b146162d0ff825d5f46ec',
			parkTime: new Date('2022-02-15T02:48:00.552+00:00'),
			isContinuous: false,
			isFlatRateConsumed: false
		}
	];

	before(async () => {
		models = await getModels();
		unparkHistoriesController = new UnparkHistoriesController({ models });
	});

	beforeEach(() => {
		historyDetails = {
			plateNumber: 'ABC123',
			type: 0,
			parkingSlotId: '620b146162d0ff825d5f46fc',
			entryPointId: '620b146162d0ff825d5f46fa',
			isContinuous: true,
			isFlatRateConsumed: false,
			parkTime: new Date('2022-02-15T02:48:00.552+00:00'),
			initialParkTime: new Date('2022-02-15T02:48:00.552+00:00'),
			unParkTime: new Date('2022-02-15T03:30:00.552+00:00'),
			parkingSlotRate: 20
		};

		parkingDetails = {
			flatRate: {
				rate: 40,
				hours: 3
			},
			dayRate: 5000
		};
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('#constructor', () => {
		it('should load models', async () => {
			expect(unparkHistoriesController.models).to.deep.equal({
				parkingHistories: models.parkingHistories,
				parkingSlots: models.parkingSlots,
				parkingComplex: models.parkingComplex
			});
		});

		it('should throw if no model was provided', async () => {
			expect(function () {
				new UnparkHistoriesController({});
			}).to.throw();
		});

		it('should throw if parking history model was provided', async () => {
			expect(function () {
				new UnparkHistoriesController({
					models: {
						parkingSlots: models.parkingSlots,
						parkingComplex: models.parkingComplex
					}
				});
			}).to.throw();
		});

		it('should throw if parking slots model was provided', async () => {
			expect(function () {
				new UnparkHistoriesController({
					models: {
						parkingHistories: models.parkingHistories,
						parkingComplex: models.parkingComplex
					}
				});
			}).to.throw();
		});

		it('should throw if parking complex model was provided', async () => {
			expect(function () {
				new UnparkHistoriesController({
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
			sandbox.stub(models.parkingComplex, 'getById').resolves(parkingComplex);
			sandbox
				.stub(models.parkingHistories, 'getByPlateNumber')
				.resolves(parkingHistory);
			sandbox
				.stub(models.parkingHistories, 'update')
				.resolves({ lastErrorObject: { updatedExisting: true } });
			sandbox.stub(models.parkingSlots, 'updateSlotAvailability').resolves();
		});

		it('should return parking payable', async () => {
			const payable = await unparkHistoriesController.execute({
				plateNumber: 'ABC123'
			});

			expect(payable).to.be.greaterThan(5000);

			expect(models.parkingComplex.getById.calledOnce).to.be.true;
			expect(models.parkingHistories.getByPlateNumber.calledOnce).to.be.true;
			expect(models.parkingHistories.update.calledOnce).to.be.true;
			expect(models.parkingSlots.updateSlotAvailability.calledOnce).to.be.true;
		});

		it('should return parking payable if unpark time is provided', async () => {
			const payable = await unparkHistoriesController.execute({
				plateNumber: 'ABC123',
				unparkTime: '2022-02-15T05:49:00.552+00:00'
			});

			expect(payable).to.equal(60);

			expect(models.parkingComplex.getById.calledOnce).to.be.true;
			expect(models.parkingHistories.getByPlateNumber.calledOnce).to.be.true;
			expect(models.parkingHistories.update.calledOnce).to.be.true;
			expect(models.parkingSlots.updateSlotAvailability.calledOnce).to.be.true;
		});

		it('should throw if parking history is empty', async () => {
			models.parkingHistories.getByPlateNumber.resolves(null);

			let error;

			try {
				await unparkHistoriesController.execute({
					plateNumber: 'ABC123'
				});
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if there was a problem when retrieving a parking history', async () => {
			models.parkingHistories.getByPlateNumber.rejects(new Error('error'));

			let error;

			try {
				await unparkHistoriesController.execute({
					plateNumber: 'ABC123'
				});
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if no parking complex found', async () => {
			models.parkingComplex.getById.resolves(null);

			let error;

			try {
				await unparkHistoriesController.execute({
					plateNumber: 'ABC123'
				});
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if there was a problem when retrieving a parking complex information', async () => {
			models.parkingComplex.getById.rejects(new Error('error'));

			let error;

			try {
				await unparkHistoriesController.execute({
					plateNumber: 'ABC123'
				});
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if updating a parking history is not a success', async () => {
			models.parkingHistories.update.resolves({
				lastErrorObject: {
					updatedExisting: false
				}
			});

			let error;

			try {
				await unparkHistoriesController.execute({
					plateNumber: 'ABC123'
				});
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if there was an error updating a parking history', async () => {
			models.parkingHistories.update.rejects(new Error('error'));

			let error;

			try {
				await unparkHistoriesController.execute({
					plateNumber: 'ABC123'
				});
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});

		it('should throw if there was an error updating the availability slot', async () => {
			models.parkingSlots.updateSlotAvailability.rejects(new Error('error'));

			let error;

			try {
				await unparkHistoriesController.execute({
					plateNumber: 'ABC123'
				});
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#calculateFee', () => {
		it('should calculate fee for continuous rate', () => {
			const fee = UnparkHistoriesController.calculateFee(
				historyDetails,
				parkingDetails
			);

			expect(fee).to.deep.equal({ payable: 0, isFlatRateConsumed: false });
		});

		it('should calculate fee for normal rate', () => {
			historyDetails.isContinuous = false;

			const fee = UnparkHistoriesController.calculateFee(
				historyDetails,
				parkingDetails
			);

			expect(fee).to.deep.equal({ payable: 40, isFlatRateConsumed: false });
		});
	});

	describe('#calculateNormalRate', () => {
		beforeEach(function () {});

		it('should return payable for normal rate', () => {
			historyDetails.isContinuous = false;
			historyDetails.unParkTime = new Date('2022-02-15T07:30:00.552+00:00');

			const fee = UnparkHistoriesController.calculateNormalRate(
				historyDetails,
				parkingDetails
			);

			expect(fee).to.deep.equal({ payable: 80, isFlatRateConsumed: true });
		});

		it('should return payable for normal rate if time is within the flat rate threshold', () => {
			historyDetails.unParkTime = new Date('2022-02-15T03:30:00.552+00:00');

			const fee = UnparkHistoriesController.calculateNormalRate(
				historyDetails,
				parkingDetails
			);

			expect(fee).to.deep.equal({ payable: 40, isFlatRateConsumed: false });
		});

		it('should return payable for normal rate if it goes beyond 24 hours', () => {
			historyDetails.unParkTime = new Date('2022-02-16T07:30:00.552+00:00');

			const fee = UnparkHistoriesController.calculateContinuousRate(
				historyDetails,
				parkingDetails
			);

			expect(fee).to.deep.equal({ payable: 5040, isFlatRateConsumed: false });
		});

		it('should return payable for continuous rate if vehicle exceeded 24 hours', () => {
			historyDetails.unParkTime = new Date('2022-02-16T07:30:00.552+00:00');

			const fee = UnparkHistoriesController.calculateContinuousRate(
				historyDetails,
				parkingDetails
			);

			expect(fee).to.deep.equal({ payable: 5040, isFlatRateConsumed: false });
		});
	});

	describe('#calculateContinuousRate', () => {
		beforeEach(function () {});

		it('should return payable for continuous rate', () => {
			historyDetails.unParkTime = new Date('2022-02-15T07:30:00.552+00:00');

			const fee = UnparkHistoriesController.calculateContinuousRate(
				historyDetails,
				parkingDetails
			);

			expect(fee).to.deep.equal({ payable: 40, isFlatRateConsumed: true });
		});

		it('should return payable for continuous rate if flat rate is already consumed', () => {
			historyDetails.previousUnparkTime = new Date(
				'2022-02-15T02:50:00.552+00:00'
			);
			historyDetails.isFlatRateConsumed = true;

			const fee = UnparkHistoriesController.calculateContinuousRate(
				historyDetails,
				parkingDetails
			);

			expect(fee).to.deep.equal({ payable: 20, isFlatRateConsumed: true });
		});

		it('should return payable for continuous rate if flat rate is not yet consumed', () => {
			const fee = UnparkHistoriesController.calculateContinuousRate(
				historyDetails,
				parkingDetails
			);

			expect(fee).to.deep.equal({ payable: 0, isFlatRateConsumed: false });
		});

		it('should return payable for continuous rate if vehicle exceeded 24 hours', () => {
			historyDetails.unParkTime = new Date('2022-02-16T07:30:00.552+00:00');

			const fee = UnparkHistoriesController.calculateContinuousRate(
				historyDetails,
				parkingDetails
			);

			expect(fee).to.deep.equal({ payable: 5040, isFlatRateConsumed: false });
		});
	});

	describe('#calculateDaysFee', () => {
		beforeEach(function () {});

		it('should return payable for days rate', () => {
			const payable = UnparkHistoriesController.calculateDaysFee(25, 20, 5000);

			expect(payable).to.equal(5020);
		});
	});
});
