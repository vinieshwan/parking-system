'use strict';

const { expect, assert } = require('chai');
const sinon = require('sinon');

const {
	ParkingComplexModel,
	EntryPointsModel,
	ParkingHistoriesModel,
	ParkingSlotsModel
} = require('@lib/models');

describe('/lib/models/parking-histories.js', () => {
	let parkingComplexModel,
		entryPointsModel,
		client,
		parkingComplex,
		parkingHistoriesModel,
		parkingSlotsModel,
		list,
		parkingDetails;

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

		parkingHistoriesModel = new ParkingHistoriesModel(client, {
			database: config.mongodb.database
		});

		parkingSlotsModel = new ParkingSlotsModel(client, {
			database: config.mongodb.database
		});

		parkingComplexModel = new ParkingComplexModel(client, {
			database: config.mongodb.database
		});

		entryPointsModel = new EntryPointsModel(client, {
			database: config.mongodb.database
		});

		await parkingComplexModel.collection.insertOne(parkingComplexData);

		list = await entryPointsModel.collection.insertMany(
			setEntryPointsList(parkingComplexData._id)
		);

		await parkingSlotsModel.collection.insertMany(
			setParkingSlots(parkingComplexData._id, list)
		);

		const availableParkingSlot = await parkingSlotsModel.getAvailableSlot(
			parkingComplexData._id.toString(),
			list.insertedIds[0].toString(),
			{ type: 0 }
		);

		parkingDetails = {
			plateNumber: 'AGL5251',
			vehicleType: 0,
			parkingSlotType: availableParkingSlot.type,
			parkingSlotRate: availableParkingSlot.ratePerHour,
			parkingSlotId: availableParkingSlot._id,
			entryPointId: list.insertedIds[0],
			parkingComplexId: parkingComplexData._id,
			isContinuous: false,
			isFlatRateConsumed: false,
			parkTime: new Date()
		};
	});

	afterEach(async () => {
		sandbox.restore();
		await parkingHistoriesModel.collection.deleteMany({});
	});

	after(async () => {
		await parkingComplexModel.collection.deleteMany({
			name: 'Sample Parking Complex'
		});

		await entryPointsModel.collection.deleteMany({
			parkingComplexId: parkingComplexData._id
		});

		await parkingSlotsModel.collection.deleteMany({
			parkingComplexId: parkingComplexData._id
		});

		await parkingHistoriesModel.collection.deleteMany({});
	});

	function setParkingSlots(parkingComplexId, entryPoints) {
		return [
			{
				name: 'Parking Slot 1',
				type: 0,
				ratePerHour: 20,
				isOccupied: false,
				parkingComplexId,
				createdAt: new Date(),
				updatedAt: new Date(),
				distances: {
					[entryPoints.insertedIds[0]]: 1,
					[entryPoints.insertedIds[1]]: 2,
					[entryPoints.insertedIds[2]]: 3
				}
			},
			{
				name: 'Parking Slot 2',
				type: 1,
				ratePerHour: 60,
				isOccupied: false,
				parkingComplexId,
				createdAt: new Date(),
				updatedAt: new Date(),
				distances: {
					[entryPoints.insertedIds[0]]: 3,
					[entryPoints.insertedIds[1]]: 2,
					[entryPoints.insertedIds[2]]: 1
				}
			},
			{
				name: 'Parking Slot 3',
				type: 2,
				ratePerHour: 100,
				isOccupied: false,
				parkingComplexId,
				createdAt: new Date(),
				updatedAt: new Date(),
				distances: {
					[entryPoints.insertedIds[0]]: 2,
					[entryPoints.insertedIds[1]]: 0,
					[entryPoints.insertedIds[2]]: 4
				}
			}
		];
	}

	function setEntryPointsList(parkingComplexId) {
		return [
			{
				name: 'Point A',
				createdAt: new Date(),
				updatedAt: new Date(),
				parkingComplexId
			},
			{
				name: 'Point B',
				createdAt: new Date(),
				updatedAt: new Date(),
				parkingComplexId
			},
			{
				name: 'Point C',
				createdAt: new Date(),
				updatedAt: new Date(),
				parkingComplexId
			}
		];
	}

	describe('#add', () => {
		it('should log a parking history', async () => {
			const log = await parkingHistoriesModel.add(parkingDetails);

			expect(log).to.be.an('object');
			assert.match(log.insertedId, /^[A-Fa-f0-9]{24}$/);
			expect(log.acknowledged).to.be.true;
		});

		it('should log a parking history if initial time is added', async () => {
			parkingDetails.initialParkTime = new Date(Date.now() - 1000 * 1800);

			const log = await parkingHistoriesModel.add(parkingDetails);

			expect(log).to.be.an('object');
			assert.match(log.insertedId, /^[A-Fa-f0-9]{24}$/);
			expect(log.acknowledged).to.be.true;
		});

		it('should throw error if there was an error occurred while logging parking history', async () => {
			sandbox
				.stub(parkingHistoriesModel.collection, 'insertOne')
				.rejects(new Error('Error'));

			let error;

			try {
				await parkingHistoriesModel.add(parkingDetails);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#update', () => {
		let log;

		beforeEach(async () => {
			log = await parkingHistoriesModel.add(parkingDetails);
		});

		it('should update a parking history log', async () => {
			const update = await parkingHistoriesModel.update(
				log.insertedId.toString(),
				{
					isContinuous: true,
					unparkTime: new Date()
				}
			);

			expect(update).to.be.an('object');
			expect(update.lastErrorObject).to.deep.equal({
				n: 1,
				updatedExisting: true
			});
			expect(update.ok).to.deep.equal(1);
		});

		it('should not update a parking history log if history id is not found', async () => {
			const update = await parkingHistoriesModel.update(
				'620b18814faeef24db27ac69',
				{
					isContinuous: true,
					unparkTime: new Date()
				}
			);

			expect(update).to.be.an('object');
			expect(update.lastErrorObject).to.deep.equal({
				n: 0,
				updatedExisting: false
			});
			expect(update.ok).to.deep.equal(1);
		});

		it('should throw error if there was an error occurred while logging parking history', async () => {
			sandbox
				.stub(parkingHistoriesModel.collection, 'findOneAndUpdate')
				.rejects(new Error('Error'));

			let error;

			try {
				await parkingHistoriesModel.update(log.insertedId.toString(), {
					isContinuous: true,
					unparkTime: new Date()
				});
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#getByPlateNumber', () => {
		beforeEach(async () => {
			await parkingHistoriesModel.add(parkingDetails);
		});

		it('should retrieve a parking history log', async () => {
			const log = await parkingHistoriesModel.getByPlateNumber(
				parkingDetails.plateNumber
			);

			expect(log).to.be.an('array');
			assert.match(log[0]._id, /^[A-Fa-f0-9]{24}$/);
			delete log[0]._id;

			expect(log[0]).to.deep.equal(parkingDetails);
		});

		it('should retrieve the latest parking history log', async () => {
			const parkingDetailsOld = {
				...parkingDetails
			};

			parkingDetailsOld.parkTime = new Date(Date.now() - 1000 * 1800);

			await parkingHistoriesModel.add(parkingDetailsOld);

			const log = await parkingHistoriesModel.getByPlateNumber(
				parkingDetails.plateNumber
			);

			expect(log).to.be.an('array');
			assert.match(log[0]._id, /^[A-Fa-f0-9]{24}$/);
			delete log[0]._id;

			expect(log[0]).to.deep.equal(parkingDetails);
		});

		it('should return null if no vehicle parking history retrieved', async () => {
			const log = await parkingHistoriesModel.getByPlateNumber('AGL5252');

			expect(log).to.deep.equal([]);
		});

		it('should throw error if there was an error occurred while logging parking history', async () => {
			sandbox.stub(parkingHistoriesModel.collection, 'find').callsFake(() => {
				return {
					toArray: sandbox.stub().rejects(new Error('Error'))
				};
			});

			let error;

			try {
				await parkingHistoriesModel.getByPlateNumber(
					parkingDetails.plateNumber
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});
});
