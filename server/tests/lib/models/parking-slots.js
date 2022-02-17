'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const {
	ParkingSlotsModel,
	ParkingComplexModel,
	EntryPointsModel
} = require('@lib/models');

describe('/lib/models/parking-slots.js', () => {
	let parkingSlotsModel,
		parkingComplexModel,
		entryPointsModel,
		client,
		parkingComplex,
		list,
		slots;

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

	const sandbox = sinon.createSandbox();

	before(async () => {
		client = await mongodbClient();

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

		slots = await parkingSlotsModel.collection
			.find({
				parkingComplexId: parkingComplexData._id
			})
			.toArray();
	});

	afterEach(() => {
		sandbox.restore();
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
	});

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

	describe('#getAvailableSlot', () => {
		it('should get an available slot by type of vehicle and entry point id if vehicle the type of vehicle is small and it is comimg from `Entry Point A`', async () => {
			const availableParkingSlot = await parkingSlotsModel.getAvailableSlot(
				parkingComplexData._id.toString(),
				list.insertedIds[0],
				{ type: 0 }
			);

			expect(availableParkingSlot).to.deep.equal(slots[0]);
		});

		it('should get an available slot by type of vehicle and entry point id if vehicle the type of vehicle is small and it is comimg from `Entry Point B`', async () => {
			const availableParkingSlot = await parkingSlotsModel.getAvailableSlot(
				parkingComplexData._id.toString(),
				list.insertedIds[1],
				{ type: 0 }
			);

			expect(availableParkingSlot).to.deep.equal(slots[2]);
		});

		it('should get an available slot by type of vehicle and entry point id if vehicle the type of vehicle is small and it is comimg from `Entry Point C`', async () => {
			const availableParkingSlot = await parkingSlotsModel.getAvailableSlot(
				parkingComplexData._id.toString(),
				list.insertedIds[2],
				{ type: 0 }
			);

			expect(availableParkingSlot).to.deep.equal(slots[1]);
		});

		it('should get an available slot by type of vehicle and entry point id if vehicle the type of vehicle is medium and it is comimg from `Entry Point A`', async () => {
			const availableParkingSlot = await parkingSlotsModel.getAvailableSlot(
				parkingComplexData._id.toString(),
				list.insertedIds[0],
				{ type: 1 }
			);

			expect(availableParkingSlot).to.deep.equal(slots[2]);
		});

		it('should get an available slot by type of vehicle and entry point id if vehicle the type of vehicle is medium and it is comimg from `Entry Point B`', async () => {
			const availableParkingSlot = await parkingSlotsModel.getAvailableSlot(
				parkingComplexData._id.toString(),
				list.insertedIds[2],
				{ type: 1 }
			);

			expect(availableParkingSlot).to.deep.equal(slots[1]);
		});

		it('should get an available slot by type of vehicle and entry point id if vehicle the type of vehicle is medium and it is comimg from `Entry Point C`', async () => {
			const availableParkingSlot = await parkingSlotsModel.getAvailableSlot(
				parkingComplexData._id.toString(),
				list.insertedIds[2],
				{ type: 1 }
			);

			expect(availableParkingSlot).to.deep.equal(slots[1]);
		});

		it('should get an available slot by type of vehicle and entry point id if vehicle the type of vehicle is large and it is comimg from `Entry Point A`', async () => {
			const availableParkingSlot = await parkingSlotsModel.getAvailableSlot(
				parkingComplexData._id.toString(),
				list.insertedIds[0],
				{ type: 2 }
			);

			expect(availableParkingSlot).to.deep.equal(slots[2]);
		});

		it('should get an available slot by type of vehicle and entry point id if vehicle the type of vehicle is large and it is comimg from `Entry Point B`', async () => {
			const availableParkingSlot = await parkingSlotsModel.getAvailableSlot(
				parkingComplexData._id.toString(),
				list.insertedIds[1],
				{ type: 2 }
			);

			expect(availableParkingSlot).to.deep.equal(slots[2]);
		});

		it('should get an available slot by type of vehicle and entry point id if vehicle the type of vehicle is large and it is comimg from `Entry Point C`', async () => {
			const availableParkingSlot = await parkingSlotsModel.getAvailableSlot(
				parkingComplexData._id.toString(),
				list.insertedIds[2],
				{ type: 2 }
			);
			expect(availableParkingSlot).to.deep.equal(slots[2]);
		});

		it('should return null if no found document', async () => {
			const availableParkingSlot = await parkingSlotsModel.getAvailableSlot(
				'620b146162d0ff825d5f46f2',
				list.insertedIds[2],
				{ type: 0 }
			);

			expect(availableParkingSlot).to.deep.equal(null);
		});

		it('should throw error if there was an error occurred while retrieving available parking slot', async () => {
			sandbox
				.stub(parkingSlotsModel.collection, 'findOne')
				.rejects(new Error('Error'));

			let error;

			try {
				await parkingSlotsModel.getAvailableSlot(
					parkingComplexData._id.toString(),
					list.insertedIds[0],
					{ type: 1 }
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#getById', () => {
		it('should get parking slot by id', async () => {
			const slotDetail = await parkingSlotsModel.getById(
				slots[0]._id.toString()
			);

			expect(slotDetail).to.deep.equal(slots[0]);
		});

		it('should return null if no found document', async () => {
			const slotDetail = await parkingSlotsModel.getById(
				'620b146162d0ff825d5f46ea'
			);

			expect(slotDetail).to.deep.equal(null);
		});

		it('should throw error if there was an error occurred while retrieving parking slot information by id', async () => {
			sandbox
				.stub(parkingSlotsModel.collection, 'findOne')
				.rejects(new Error('Error'));

			let error;

			try {
				await parkingSlotsModel.getById(slots[0]._id.toString());
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#updateSlotAvailability', () => {
		it('should update slot availability', async () => {
			const updated = await parkingSlotsModel.updateSlotAvailability(
				slots[0]._id.toString(),
				true
			);

			expect(updated.lastErrorObject).to.deep.equal({
				n: 1,
				updatedExisting: true
			});
		});

		it('should not update if document not found', async () => {
			const updated = await parkingSlotsModel.updateSlotAvailability(
				'62065a2769c4828413a96d0e',
				true
			);

			expect(updated.lastErrorObject).to.deep.equal({
				n: 0,
				updatedExisting: false
			});
		});

		it('should throw error if there was an error occurred while updating a parking slot', async () => {
			sandbox
				.stub(parkingSlotsModel.collection, 'findOneAndUpdate')
				.rejects(new Error('Error'));

			let error;

			try {
				await parkingSlotsModel.updateSlotAvailability(
					slots[0]._id.toString(),
					true
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});
});
