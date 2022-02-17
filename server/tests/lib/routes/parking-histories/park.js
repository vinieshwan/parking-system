'use strict';

const sinon = require('sinon');
const axios = require('axios');
const { expect } = require('chai');

const { ParkHistoryRoute } = require('@lib/routes');
const { InternalServerError } = require('@lib/utils/errors');

describe('lib/routes/parking-histories/park.js', function () {
	let controllers, route, server;

	const sandbox = sinon.createSandbox();

	before(async function () {
		server = appServer;
		controllers = await getControllers();
		route = new ParkHistoryRoute(app, {
			controllers
		});

		route.setupRoute();

		server.listen(config.port);
	});

	beforeEach(() => {
		sandbox.stub(controllers.command, 'execute').resolves();
	});

	after(function (done) {
		server.close(done);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('success', function () {
		it('should record a park histories', async function () {
			const response = await axios.post(
				`${config.host}/v1/parking-history/park`,
				{
					parkingSlotId: '620cd6103525a4d3a1866c5e',
					entryPointId: '620cd6103525a4d3a1866c5f',
					type: 'small',
					plateNumber: 'abc123'
				}
			);

			expect(response.status).to.equal(200);
			expect(response.data).to.be.an('object');
			expect(response.data).to.deep.equal({
				ok: true
			});
		});

		it('should record a park histories if park time is provided', async function () {
			const response = await axios.post(
				`${config.host}/v1/parking-history/park`,
				{
					parkingSlotId: '620cd6103525a4d3a1866c5e',
					entryPointId: '620cd6103525a4d3a1866c5f',
					type: 'small',
					plateNumber: 'abc123',
					parkTime: '2022-03-13T07:50:00.552+00:00'
				}
			);

			expect(response.status).to.equal(200);
			expect(response.data).to.be.an('object');
			expect(response.data).to.deep.equal({
				ok: true
			});
		});
	});

	describe('errors', function () {
		describe('validation errors', function () {
			it('should respond with error if provided parking slot id is not a valid object id', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						parkingSlotId: 'fddf',
						entryPointId: '620cd6103525a4d3a1866c5f',
						type: 'small',
						plateNumber: 'abc123',
						parkTime: '2022-03-13T07:50:00.552+00:00'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided parking slot id is not a string', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						parkingSlotId: 123,
						entryPointId: '620cd6103525a4d3a1866c5f',
						type: 'small',
						plateNumber: 'abc123',
						parkTime: '2022-03-13T07:50:00.552+00:00'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided parking slot id is not provided', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						entryPointId: '620cd6103525a4d3a1866c5f',
						type: 'small',
						plateNumber: 'abc123',
						parkTime: '2022-03-13T07:50:00.552+00:00'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided entry point id is not a valid object id', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						parkingSlotId: '620cd6103525a4d3a1866c5e',
						entryPointId: 'something',
						type: 'small',
						plateNumber: 'abc123',
						parkTime: '2022-03-13T07:50:00.552+00:00'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided entry point id is not a string', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						parkingSlotId: '620cd6103525a4d3a1866c5e',
						entryPointId: 123,
						type: 'small',
						plateNumber: 'abc123',
						parkTime: '2022-03-13T07:50:00.552+00:00'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided entry point id is not provided', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						parkingSlotId: '620cd6103525a4d3a1866c5e',
						type: 'small',
						plateNumber: 'abc123',
						parkTime: '2022-03-13T07:50:00.552+00:00'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided type is not from the list', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						parkingSlotId: '620cd6103525a4d3a1866c5e',
						entryPointId: '620cd6103525a4d3a1866cf',
						type: 'xl',
						plateNumber: 'abc123',
						parkTime: '2022-03-13T07:50:00.552+00:00'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided type is not a string', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						parkingSlotId: '620cd6103525a4d3a1866c5e',
						entryPointId: '620cd6103525a4d3a1866cf',
						type: 123,
						plateNumber: 'abc123',
						parkTime: '2022-03-13T07:50:00.552+00:00'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided type is not provided', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						parkingSlotId: '620cd6103525a4d3a1866c5e',
						entryPointId: '620cd6103525a4d3a1866cf',
						plateNumber: 'abc123',
						parkTime: '2022-03-13T07:50:00.552+00:00'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided plateNumber is lesser 4 characters', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						parkingSlotId: '620cd6103525a4d3a1866c5e',
						entryPointId: '620cd6103525a4d3a1866cf',
						type: 'small',
						plateNumber: 'aaa',
						parkTime: '2022-03-13T07:50:00.552+00:00'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided plateNumber is not a string', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						parkingSlotId: '620cd6103525a4d3a1866c5e',
						entryPointId: '620cd6103525a4d3a1866cf',
						type: 'small',
						plateNumber: 122,
						parkTime: '2022-03-13T07:50:00.552+00:00'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided plateNumber is not provided', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						parkingSlotId: '620cd6103525a4d3a1866c5e',
						entryPointId: '620cd6103525a4d3a1866cf',
						type: 'small',
						parkTime: '2022-03-13T07:50:00.552+00:00'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided park time is not a date', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						parkingSlotId: '620cd6103525a4d3a1866c5e',
						entryPointId: '620cd6103525a4d3a1866cf',
						type: 'small',
						plateNumber: 'abc123',
						parkTime: 'something'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided park time is not a string', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/park`, {
						parkingSlotId: '620cd6103525a4d3a1866c5e',
						entryPointId: '620cd6103525a4d3a1866cf',
						type: 'small',
						plateNumber: 'abc123',
						parkTime: 123
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});
		});

		it('should respond with error if there was an error occurred when recording a parking history', async function () {
			let error;

			controllers.command.execute.rejects(new InternalServerError());

			try {
				await axios.post(`${config.host}/v1/parking-history/park`, {
					parkingSlotId: '620cd6103525a4d3a1866c5e',
					entryPointId: '620cd6103525a4d3a1866c5f',
					type: 'small',
					plateNumber: 'abc124',
					parkTime: '2022-03-13T07:50:00.552+00:00'
				});
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
