'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const { ObjectId } = require('mongodb');

const { EntryPointsController } = require('@lib/controllers');

describe('/lib/controllers/entry-points.js', () => {
	let entryPointsController, models;

	const sandbox = sinon.createSandbox();

	const list = [
		{
			_id: '620b146162d0ff825d5f46ea',
			name: 'Point A',
			createdAt: new Date(),
			updatedAt: new Date(),
			parkingComplexId: '620b146162d0ff825d5f46ef'
		}
	];

	before(async () => {
		models = await getModels();
		entryPointsController = new EntryPointsController({ models });
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('#constructor', () => {
		it('should load models', async () => {
			expect(entryPointsController.model).to.deep.equal(models.entryPoints);
		});

		it('should throw if no model was provided', async () => {
			expect(function () {
				new EntryPointsController({});
			}).to.throw();
		});

		it('should throw if entry model was provided', async () => {
			expect(function () {
				new EntryPointsController({ models: {} });
			}).to.throw();
		});
	});

	describe('#list', () => {
		beforeEach(function () {
			sandbox.stub(models.entryPoints, 'list').resolves(list);
		});

		it('should return list of all entry points', async () => {
			const entryPoints = await entryPointsController.list(
				list[0].parkingComplexId
			);

			expect(entryPoints).to.deep.equal(list);
		});

		it('should should throw if there was a problem when retrieving entry points list', async () => {
			models.entryPoints.list.rejects(new Error('error'));

			let error;

			try {
				await entryPointsController.list(list[0].parkingComplexId);
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});

	describe('#add', () => {
		beforeEach(function () {
			sandbox.stub(models.entryPoints, 'add').resolves({
				acknowledged: true,
				insertedId: new ObjectId('620b146162d0ff825d5f46eb')
			});
		});

		it('should add new entry point', async () => {
			const entryPoints = await entryPointsController.add(
				list[0].parkingComplexId,
				'Point B'
			);

			expect(entryPoints).to.deep.equal({
				acknowledged: true,
				insertedId: new ObjectId('620b146162d0ff825d5f46eb')
			});
		});

		it('should should throw if there was a problem when retrieving entry points list', async () => {
			models.entryPoints.add.rejects(new Error('error'));

			let error;

			try {
				await entryPointsController.add(list[0].parkingComplexId, 'Point B');
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});
});
