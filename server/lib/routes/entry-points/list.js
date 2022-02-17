'use strict';

const Ajv = require('ajv');

const { InvalidArgumentError } = require('@lib/utils/errors');

/** Endpoint for retrieving of entry points list  */
class ListEntryPointsRoute {
	constructor(app, context) {
		this.app = app;
		this.config = context.config;
		this.controllers = context.controllers;

		const ajv = new Ajv();

		this.validate = ajv.compile({
			type: 'object',
			additionalProperties: false,
			properties: {
				parkingComplexId: {
					type: 'string',
					pattern: '^[0-9A-Fa-f]{24}$'
				}
			},
			required: ['parkingComplexId']
		});
	}

	/** Setup route */
	setupRoute() {
		this.app.get(
			'/v1/entry-points/list/:parkingComplexId',
			this.verifyRequest.bind(this),
			this.getEntryPointsList.bind(this)
		);
	}

	/** Validate request */
	verifyRequest(req, res, next) {
		if (!this.validate(req.params)) {
			const error = new InvalidArgumentError(this.validate.errors[0].message);

			return res.status(error.code).json(error);
		}

		next();
	}

	/** Retrieve entry points list */
	async getEntryPointsList(req, res, next) {
		try {
			const entryPoints = await this.controllers.entryPoints.list(
				req.params.parkingComplexId
			);

			res.status(200).json({
				ok: true,
				data: entryPoints
			});
		} catch (error) {
			return res.status(error.code).json(error);
		}
	}
}

module.exports = ListEntryPointsRoute;
