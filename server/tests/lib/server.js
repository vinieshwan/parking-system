'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const Server = require('@lib/server');

const {
	EntryPointsModel,
	ParkingComplexModel,
	ParkingHistoriesModel,
	ParkingSlotsModel
} = require('../../lib/models');

const {
	EntryPointsController,
	ParkingComplexController,
	ParkHistoriesController,
	UnparkHistoriesController,
	ParkingSlotsController
} = require('../../lib/controllers');

const {
	ListEntryPointsRoute,
	GetParkingComplexRoute,
	ParkHistoryRoute,
	UnparkHistoryRoute,
	GetParkingSlotRoute,
	AddEntryPointsRoute
} = require('../../lib//routes');

describe('lib/server.js', function () {
	let server;

	const sandbox = sinon.createSandbox();

	before(function () {
		server = new Server(config);
	});

	afterEach(function () {
		sandbox.restore();
	});

	describe('#Constructor', function () {
		it('should instantiate config', function () {
			expect(server.config).to.deep.equal(config);
			expect(server.app).to.be.a('function');
			expect(server.models).to.deep.equal({});
			expect(server.controllers).to.deep.equal({});
		});
	});

	describe('#start', function () {
		beforeEach(() => {
			sandbox.spy(server, 'loadDependencies');
			sandbox.spy(server, 'loadModels');
			sandbox.spy(server, 'loadControllers');
			sandbox.spy(server, 'loadRoutes');
			sandbox.spy(server, 'startListening');
		});

		it('should load all methods', async function () {
			await server.start();

			expect(server.loadDependencies.calledOnce).to.be.true;
			expect(server.loadModels.calledOnce).to.be.true;
			expect(server.loadModels.calledAfter(server.loadDependencies)).to.be.true;
			expect(server.loadControllers.calledOnce).to.be.true;
			expect(server.loadControllers.calledAfter(server.loadModels)).to.be.true;
			expect(server.loadRoutes.calledOnce).to.be.true;
			expect(server.loadRoutes.calledAfter(server.loadControllers)).to.be.true;
			expect(server.startListening.calledOnce).to.be.true;
			expect(server.startListening.calledAfter(server.loadRoutes)).to.be.true;
		});
	});

	describe('#loadDependencies', function () {
		beforeEach(() => {
			sandbox.spy(server.app, 'use');
		});

		it('should load all dependencies', function () {
			server.loadDependencies();

			expect(server.app.use.callCount).to.equal(1);
			expect(server.app.use.getCall(0).args[0]).to.be.a('function');
		});
	});

	describe('#loadModels', function () {
		it('should load all models', async function () {
			await server.loadModels();

			expect(server.models.entryPoints).to.be.an.instanceOf(EntryPointsModel);
			expect(server.models.parkingComplex).to.be.an.instanceOf(
				ParkingComplexModel
			);
			expect(server.models.parkingHistories).to.be.an.instanceOf(
				ParkingHistoriesModel
			);
			expect(server.models.parkingSlots).to.be.an.instanceOf(ParkingSlotsModel);
		});
	});

	describe('#loadControllers', function () {
		it('should load all controllers', function () {
			server.loadControllers();

			expect(server.controllers.entryPoints).to.be.an.instanceOf(
				EntryPointsController
			);
			expect(server.controllers.parkingComplex).to.be.an.instanceOf(
				ParkingComplexController
			);
			expect(server.controllers.parkingSlots).to.be.an.instanceOf(
				ParkingSlotsController
			);
			expect(server.controllers.parkHistories).to.be.an.instanceOf(
				ParkHistoriesController
			);
			expect(server.controllers.unparkHistories).to.be.an.instanceOf(
				UnparkHistoriesController
			);
		});
	});

	describe('#loadRoutes', function () {
		beforeEach(() => {
			sandbox.spy(GetParkingComplexRoute.prototype, 'setupRoute');
			sandbox.spy(ListEntryPointsRoute.prototype, 'setupRoute');
			sandbox.spy(AddEntryPointsRoute.prototype, 'setupRoute');
			sandbox.spy(ParkHistoryRoute.prototype, 'setupRoute');
			sandbox.spy(UnparkHistoryRoute.prototype, 'setupRoute');
			sandbox.spy(GetParkingSlotRoute.prototype, 'setupRoute');
		});

		it('should load all controllers', function () {
			server.loadRoutes();

			expect(GetParkingComplexRoute.prototype.setupRoute.calledOnce).to.be.true;
			expect(ListEntryPointsRoute.prototype.setupRoute.calledOnce).to.be.true;
			expect(
				ListEntryPointsRoute.prototype.setupRoute.calledAfter(
					GetParkingComplexRoute.prototype.setupRoute
				)
			).to.be.true;
			expect(AddEntryPointsRoute.prototype.setupRoute.calledOnce).to.be.true;
			expect(
				AddEntryPointsRoute.prototype.setupRoute.calledAfter(
					ListEntryPointsRoute.prototype.setupRoute
				)
			).to.be.true;
			expect(ParkHistoryRoute.prototype.setupRoute.calledOnce).to.be.true;
			expect(
				ParkHistoryRoute.prototype.setupRoute.calledAfter(
					AddEntryPointsRoute.prototype.setupRoute
				)
			).to.be.true;
			expect(UnparkHistoryRoute.prototype.setupRoute.calledOnce).to.be.true;
			expect(
				UnparkHistoryRoute.prototype.setupRoute.calledAfter(
					ParkHistoryRoute.prototype.setupRoute
				)
			).to.be.true;
			expect(GetParkingSlotRoute.prototype.setupRoute.calledOnce).to.be.true;
			expect(
				GetParkingSlotRoute.prototype.setupRoute.calledAfter(
					UnparkHistoryRoute.prototype.setupRoute
				)
			).to.be.true;
		});
	});

	describe('#startListening', function () {
		beforeEach(() => {
			sandbox.stub(server.app, 'listen');

			server.startListening();
		});

		it('should server start listening', function () {
			expect(server.app.listen.calledOnce).to.be.true;
			expect(server.app.listen.getCall(0).args.length).to.equal(2);
			expect(server.app.listen.getCall(0).args[0]).to.equal(config.port);
			expect(server.app.listen.getCall(0).args[1]).to.be.a('function');
		});
	});
});
