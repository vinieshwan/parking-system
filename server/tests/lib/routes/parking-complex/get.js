'use strict';

const sinon = require('sinon');
const axios = require('axios');
const { expect } = require('chai');

const { GetParkingComplexRoute } = require('@lib/routes');
const { InternalServerError } = require('@lib/utils/errors');

describe('lib/routes/parking-complex/get.js', function () {
	let controllers, route, server;

	const parkingComplex = {
		_id: '620b146162d0ff825d5f46ea',
		name: 'Ayala Mall Parking Complex'
	};

	const sandbox = sinon.createSandbox();

	before(async function () {
		server = appServer;
		controllers = await getControllers();
		route = new GetParkingComplexRoute(app, {
			controllers
		});

		route.setupRoute();

		server.listen(config.port);
	});

	beforeEach(() => {
		sandbox.stub(controllers.parkingComplex, 'get').resolves(parkingComplex);
	});

	after(function (done) {
		server.close(done);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('success', function () {
		it('should retrieve parking complex information', async function () {
			const response = await axios.get(
				`${config.host}/v1/parking-complex/get/Ayala%20Mall%20Parking%20Complex`
			);

			expect(response.status).to.equal(200);
			expect(response.data).to.be.an('object');
			expect(response.data).to.deep.equal({
				ok: true,
				data: parkingComplex
			});
		});
	});

	describe('errors', function () {
		describe('validation errors', function () {
			it('should respond with error if provided parking complex name is lesser than 2 characters', async function () {
				let error;

				try {
					await axios.get(`${config.host}/v1/parking-complex/get/a`);
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided parking complex name is not provided', async function () {
				let error;

				try {
					await axios.get(`${config.host}/v1/parking-complex/get/ /`);
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});
		});

		it('should respond with error if there was an error occurred when retrieving parking complex information', async function () {
			let error;

			controllers.parkingComplex.get.rejects(new InternalServerError());

			try {
				await axios.get(
					`${config.host}/v1/parking-complex/get/Ayala%20Mall%20Parking%20Complex`
				);
			} catch (err) {
				error = err;
			}

			expect(error.response.data).to.deep.equal({
				name: 'InternalServerError',
				code: 500
			});
		});
	});
});
