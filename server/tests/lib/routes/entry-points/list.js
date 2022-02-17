'use strict';

const sinon = require('sinon');
const axios = require('axios');
const { expect } = require('chai');

const { ListEntryPointsRoute } = require('@lib/routes');
const { InternalServerError } = require('@lib/utils/errors');

describe('lib/routes/entry-points/list.js', function () {
	let controllers, route, server;

	const entryPointsList = [
		{
			_id: '620b146162d0ff825d5f46ea',
			name: 'Entry Point A'
		},
		{
			_id: '620b146162d0ff825d5f46eb',
			name: 'Entry Point B'
		},
		{
			_id: '620b146162d0ff825d5f46ec',
			name: 'Entry Point C'
		}
	];

	const sandbox = sinon.createSandbox();

	before(async function () {
		server = appServer;
		controllers = await getControllers();
		route = new ListEntryPointsRoute(app, {
			controllers
		});

		route.setupRoute();

		server.listen(config.port);
	});

	beforeEach(() => {
		sandbox.stub(controllers.entryPoints, 'list').resolves(entryPointsList);
	});

	after(function (done) {
		server.close(done);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('success', function () {
		it('should retrieve entry points list', async function () {
			const response = await axios.get(
				`${config.host}/v1/entry-points/list/620b146162d0ff825d5f46ee`
			);

			expect(response.status).to.equal(200);
			expect(response.data).to.be.an('object');
			expect(response.data).to.deep.equal({
				ok: true,
				data: entryPointsList
			});
		});
	});

	describe('errors', function () {
		describe('validation errors', function () {
			it('should respond with error if provided parking complex Id is not a valid object id', async function () {
				let error;

				try {
					await axios.get(`${config.host}/v1/entry-points/list/complexId`);
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
					await axios.get(`${config.host}/v1/entry-points/list/ /`);
				} catch (err) {
					error = err;
				}

				expect(error.response.data).to.deep.equal({
					name: 'InvalidArgumentError',
					code: 400
				});
			});
		});

		it('should respond with error if there was an error occurred when retrieving entry points list', async function () {
			let error;

			controllers.entryPoints.list.rejects(new InternalServerError());

			try {
				await axios.get(
					`${config.host}/v1/entry-points/list/620b146162d0ff825d5f46ee`
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
