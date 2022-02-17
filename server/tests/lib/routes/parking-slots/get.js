'use strict';

const sinon = require('sinon');
const axios = require('axios');
const { expect } = require('chai');

const { GetParkingSlotRoute } = require('@lib/routes');
const { InternalServerError } = require('@lib/utils/errors');

describe('lib/routes/parking-slots/get.js', function () {
	let controllers, route, server;

	const parkingSlot = {
		_id: '620b146162d0ff825d5f46ea',
		name: 'Parking Slot SP 1',
		type: 'small',
		rate: 20
	};

	const sandbox = sinon.createSandbox();

	before(async function () {
		server = appServer;
		controllers = await getControllers();
		route = new GetParkingSlotRoute(app, {
			controllers
		});

		route.setupRoute();

		server.listen(config.port);
	});

	beforeEach(() => {
		sandbox.stub(controllers.command, 'execute').resolves(parkingSlot);
	});

	after(function (done) {
		server.close(done);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('success', function () {
		it('should retrieve available slot', async function () {
			const response = await axios.get(
				`${config.host}/v1/parking-slot/get/620b146162d0ff825d5f46ee/620b146162d0ff825d5f46ef/small`
			);

			expect(response.status).to.equal(200);
			expect(response.data).to.be.an('object');
			expect(response.data).to.deep.equal({
				ok: true,
				data: parkingSlot
			});
		});
	});

	describe('errors', function () {
		describe('validation errors', function () {
			it('should respond with error if provided parking complex Id is not a valid object id', async function () {
				let error;

				try {
					await axios.get(
						`${config.host}/v1/parking-slot/get/complexId/620b146162d0ff825d5f46ef/small`
					);
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided entry point Id is invalid', async function () {
				let error;

				try {
					await axios.get(
						`${config.host}/v1/parking-slot/get/620b146162d0ff825d5f46ee/entryPointId/small`
					);
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided vehicle type invalid', async function () {
				let error;

				try {
					await axios.get(
						`${config.host}/v1/parking-slot/get/620b146162d0ff825d5f46ee/620b146162d0ff825d5f46ef/xl`
					);
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if required parking complex Id is missing', async function () {
				let error;

				try {
					await axios.get(
						`${config.host}/v1/parking-slot/get/ /620b146162d0ff825d5f46ef/xl`
					);
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if required entry point Id is missing', async function () {
				let error;

				try {
					await axios.get(
						`${config.host}/v1/parking-slot/get/620b146162d0ff825d5f46ea/ /xl`
					);
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if required vehicle type is missing', async function () {
				let error;

				try {
					await axios.get(
						`${config.host}/v1/parking-slot/get/620b146162d0ff825d5f46ea/620b146162d0ff825d5f46ef/ /`
					);
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});
		});

		it('should respond with error if there was an error occurred when retrieving a parking slot', async function () {
			let error;

			controllers.command.execute.rejects(new InternalServerError());

			try {
				await axios.get(
					`${config.host}/v1/parking-slot/get/620b146162d0ff825d5f46ee/620b146162d0ff825d5f46ef/small`
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
