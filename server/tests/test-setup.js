'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const {
	EntryPointsModel,
	ParkingComplexModel,
	ParkingSlotsModel,
	ParkingHistoriesModel
} = require('@lib/models');
const {
	EntryPointsController,
	ParkingComplexController,
	ParkingSlotsController,
	CommandController,
	ParkHistoriesController,
	UnparkHistoriesController
} = require('@lib/controllers');

const http = require('http');
const port = 2222;

const config = {
	host: `http://localhost:${port}`,
	port,
	mongodb: {
		connectionUrl: `mongodb://admin:k<Zq1M*2eqdZ@localhost:27017/?authSource=parkingSystem`,
		database: 'parkingSystem'
	}
};

const app = express();
app.use(bodyParser.json());

function mockServer() {
	return http.createServer(app);
}

async function mongodbConnection() {
	const mongodbClient = new MongoClient(config.mongodb.connectionUrl);

	await mongodbClient.connect();

	return mongodbClient;
}

async function getModels() {
	const client = await mongodbConnection();
	const database = config.mongodb.database;

	return {
		entryPoints: new EntryPointsModel(client, {
			database
		}),
		parkingComplex: new ParkingComplexModel(client, {
			database
		}),
		parkingSlots: new ParkingSlotsModel(client, {
			database
		}),
		parkingHistories: new ParkingHistoriesModel(client, {
			database
		})
	};
}

async function getControllers() {
	const models = await getModels();

	return {
		entryPoints: new EntryPointsController({
			models
		}),
		parkingComplex: new ParkingComplexController({ models }),
		parkingSlots: new ParkingSlotsController({ models }),
		parkHistories: new ParkHistoriesController({ models }),
		unparkHistories: new UnparkHistoriesController({ models }),
		command: new CommandController()
	};
}

global.config = config;
global.appServer = mockServer();
global.getControllers = getControllers;
global.getModels = getModels;
global.app = app;
global.mongodbClient = mongodbConnection;
