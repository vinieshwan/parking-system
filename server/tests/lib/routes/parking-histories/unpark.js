'use strict';

const sinon = require('sinon');
const axios = require('axios');
const { expect } = require('chai');

const { UnparkHistoryRoute } = require('@lib/routes');
const { InternalServerError } = require('@lib/utils/errors');

describe('lib/routes/parking-histories/unpark.js', function () {
	let controllers, route, server;

	const sandbox = sinon.createSandbox();

	before(async function () {
		server = appServer;
		controllers = await getControllers();
		route = new UnparkHistoryRoute(app, {
			controllers
		});

		route.setupRoute();

		server.listen(config.port);
	});

	beforeEach(() => {
		sandbox.stub(controllers.command, 'execute').resolves(40);
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
				`${config.host}/v1/parking-history/unpark`,
				{
					plateNumber: 'abc123'
				}
			);

			expect(response.status).to.equal(200);
			expect(response.data).to.be.an('object');
			expect(response.data).to.deep.equal({
				ok: true,
				data: 40
			});
		});

		it('should record a park histories if unpark time is provided', async function () {
			const response = await axios.post(
				`${config.host}/v1/parking-history/unpark`,
				{
					plateNumber: 'abc123',
					unparkTime: '2022-03-13T07:50:00.552+00:00'
				}
			);

			expect(response.status).to.equal(200);
			expect(response.data).to.be.an('object');
			expect(response.data).to.deep.equal({
				ok: true,
				data: 40
			});
		});
	});

	describe('errors', function () {
		describe('validation errors', function () {
			it('should respond with error if provided plateNumber is lesser 4 characters', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/unpark`, {
						plateNumber: 'aaa',
						unparkTime: '2022-03-13T07:50:00.552+00:00'
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
					await axios.post(`${config.host}/v1/parking-history/unpark`, {
						plateNumber: 122,
						unparkTime: '2022-03-13T07:50:00.552+00:00'
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
					await axios.post(`${config.host}/v1/parking-history/unpark`, {
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

			it('should respond with error if provided unpark time is not a date', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/unpark`, {
						plateNumber: 'abc123',
						unparkTime: 'something'
					});
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});

			it('should respond with error if provided unpark time is not a string', async function () {
				let error;

				try {
					await axios.post(`${config.host}/v1/parking-history/unpark`, {
						plateNumber: 'abc123',
						unparkTime: 123
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
				await axios.post(`${config.host}/v1/parking-history/unpark`, {
					plateNumber: 'abc124',
					unparkTime: '2022-03-13T07:50:00.552+00:00'
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
