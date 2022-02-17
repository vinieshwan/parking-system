'use strict';

const { expect, assert } = require('chai');
const sinon = require('sinon');

const { ParkingComplexModel, EntryPointsModel } = require('@lib/models');

describe('/lib/models/entry-points.js', () => {
	let parkingComplexModel, entryPointsModel, client, parkingComplex, list;

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

		entryPointsModel = new EntryPointsModel(client, {
			database: config.mongodb.database
		});

		await parkingComplexModel.collection.insertOne(parkingComplexData);

		await entryPointsModel.collection.insertMany(
			setEntryPointsList(parkingComplexData._id)
		);

		list = await entryPointsModel.collection
			.find({ parkingComplexId: parkingComplexData._id })
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

	describe('#list', () => {
		it('should entry point list', async () => {
			const entryPoints = await entryPointsModel.list(
				parkingComplexData._id.toString()
			);

			expect(entryPoints).to.be.an('array');
			expect(entryPoints.length).to.be.equal(3);
			expect(entryPoints).to.deep.equal(list);
		});

		it('should return null if no found document', async () => {
			const entryPoints = await entryPointsModel.list(
				'62065a2769c4828413a95d08'
			);

			expect(entryPoints).to.deep.equal([]);
		});

		it('should throw error if there was an error occurred while retrieving available parking slot', async () => {
			sandbox.stub(entryPointsModel.collection, 'find').callsFake(() => {
				return {
					toArray: sandbox.stub().rejects(new Error('Error'))
				};
			});

			let error;

			try {
				await entryPointsModel.list(parkingComplex._id.toString());
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#add', () => {
		it('should add new entry point', async () => {
			const entryPoints = await entryPointsModel.add(
				parkingComplexData._id.toString(),
				'Point D'
			);

			expect(entryPoints).to.be.an('object');
			expect(entryPoints.acknowledged).to.be.true;
			assert.match(entryPoints.insertedId, /^[A-Fa-f0-9]{24}$/);
		});

		it('should throw error if there was an error occurred while retrieving available parking slot', async () => {
			sandbox
				.stub(entryPointsModel.collection, 'insertOne')
				.rejects(new Error('Error'));

			let error;

			try {
				await entryPointsModel.add(
					parkingComplexData._id.toString(),
					'Point D'
				);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});
});
