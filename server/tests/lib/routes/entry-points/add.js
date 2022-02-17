'use strict';

const sinon = require('sinon');
const axios = require('axios');
const { expect } = require('chai');

const { AddEntryPointsRoute } = require('@lib/routes');
const { InternalServerError } = require('@lib/utils/errors');

describe('lib/routes/entry-points/add.js', function () {
	let controllers, route, server;

	const sandbox = sinon.createSandbox();

	before(async function () {
		server = appServer;
		controllers = await getControllers();
		route = new AddEntryPointsRoute(app, {
			controllers
		});

		route.setupRoute();

		server.listen(config.port);
	});

	beforeEach(() => {
		sandbox.stub(controllers.entryPoints, 'add').resolves();
	});

	after(function (done) {
		server.close(done);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('success', function () {
		it('should add new entry point', async function () {
			const response = await axios.post(`${config.host}/v1/entry-points/add`, {
				parkingComplexId: '620cd6103525a4d3a1866c5e',
				entryPointName: '620cd6103525a4d3a1866c5f'
			});

			expect(response.status).to.equal(200);
			expect(response.data).to.be.an('object');
			expect(response.data).to.deep.equal({
				ok: true
			});
		});
	});

	describe('errors', function () {
		describe('validation errors', function () {
			it('should respond with error if provided parking complex Id is not a valid object id', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/entry-points/add`, {
						parkingComplexId: 'smething',
						entryPointName: 'Entry Point Name'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided parking complex Id is not a string', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/entry-points/add`, {
						parkingComplexId: 123,
						entryPointName: 'Entry Point Name'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided parking complex Id is not provided', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/entry-points/add`, {
						entryPointName: 'Entry Point Name'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided entry point name is less than 2 characters', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/entry-points/add`, {
						parkingComplexId: '620cd6103525a4d3a1866c5f',
						entryPointName: 'a'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided entry point name is not a string', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/entry-points/add`, {
						parkingComplexId: '620cd6103525a4d3a1866c5f',
						entryPointName: 123
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided entry point name is not provided', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/entry-points/add`, {
						parkingComplexId: '620cd6103525a4d3a1866c5f'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if another property is added', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/entry-points/add`, {
						parkingComplexId: '620cd6103525a4d3a1866c5f',
						entryPointName: 'Something',
						new: 'one'
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

		it('should respond with error if there was an error occurred when adding a new entry point', async function () {
			let error;

			controllers.entryPoints.add.rejects(new InternalServerError());

			try {
				await axios.post(`${config.host}/v1/entry-points/add`, {
					parkingComplexId: '620cd6103525a4d3a1866c5f',
					entryPointName: 'Something'
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
