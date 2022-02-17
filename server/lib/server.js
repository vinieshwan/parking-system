'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const {
	EntryPointsModel,
	ParkingComplexModel,
	ParkingHistoriesModel,
	ParkingSlotsModel
} = require('@lib/models');

const {
	EntryPointsController,
	ParkingComplexController,
	ParkHistoriesController,
	UnparkHistoriesController,
	ParkingSlotsController,
	CommandController
} = require('@lib/controllers');

const {
	ListEntryPointsRoute,
	GetParkingComplexRoute,
	ParkHistoryRoute,
	UnparkHistoryRoute,
	GetParkingSlotRoute,
	AddEntryPointsRoute
} = require('@lib/routes');

const app = express();

class Server {
	constructor(config) {
		this.app = app;
		this.config = config;
		this.models = {};
		this.controllers = {};
	}

	async start() {
		this.loadDependencies();
		await this.loadModels();
		this.loadControllers();
		this.loadRoutes();
		this.startListening();
	}

	loadDependencies() {
		this.app.use(bodyParser.json());
	}

	async loadModels() {
		const { connectionUrl, database } = this.config.mongodb;
		const mongodbClient = new MongoClient(connectionUrl);

		await mongodbClient.connect();

		this.models.entryPoints = new EntryPointsModel(mongodbClient, { database });
		this.models.parkingComplex = new ParkingComplexModel(mongodbClient, {
			database
		});
		this.models.parkingHistories = new ParkingHistoriesModel(mongodbClient, {
			database
		});
		this.models.parkingSlots = new ParkingSlotsModel(mongodbClient, {
			database
		});
	}

	loadControllers() {
		this.controllers.entryPoints = new EntryPointsController({
			models: {
				entryPoints: this.models.entryPoints
			}
		});

		this.controllers.parkingComplex = new ParkingComplexController({
			models: {
				parkingComplex: this.models.parkingComplex
			}
		});

		this.controllers.parkingSlots = new ParkingSlotsController({
			models: {
				parkingSlots: this.models.parkingSlots
			}
		});

		this.controllers.parkHistories = new ParkHistoriesController({
			models: {
				parkingHistories: this.models.parkingHistories,
				parkingSlots: this.models.parkingSlots,
				parkingComplex: this.models.parkingComplex
			}
		});

		this.controllers.unparkHistories = new UnparkHistoriesController({
			models: {
				parkingHistories: this.models.parkingHistories,
				parkingSlots: this.models.parkingSlots,
				parkingComplex: this.models.parkingComplex
			}
		});
	}

	loadRoutes() {
		new GetParkingComplexRoute(this.app, {
			controllers: {
				parkingComplex: this.controllers.parkingComplex
			}
		}).setupRoute();

		new ListEntryPointsRoute(this.app, {
			controllers: {
				entryPoints: this.controllers.entryPoints
			}
		}).setupRoute();

		new AddEntryPointsRoute(this.app, {
			controllers: {
				entryPoints: this.controllers.entryPoints
			}
		}).setupRoute();

		new ParkHistoryRoute(this.app, {
			controllers: {
				parkHistories: this.controllers.parkHistories,
				command: new CommandController()
			}
		}).setupRoute();

		new UnparkHistoryRoute(this.app, {
			controllers: {
				unparkHistories: this.controllers.unparkHistories,
				command: new CommandController()
			}
		}).setupRoute();

		new GetParkingSlotRoute(this.app, {
			controllers: {
				parkingSlots: this.controllers.parkingSlots,
				command: new CommandController()
			}
		}).setupRoute();
	}

	startListening() {
		const { port } = this.config;

		this.app.listen(port, () => {
			console.log(`Listening to port: ${port}`);
		});
	}
}

module.exports = Server;
