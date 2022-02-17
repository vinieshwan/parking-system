'use strict';

const Ajv = require('ajv');

const { InvalidArgumentError } = require('@lib/utils/errors');

/** Endpoint for adding new entry point  */
class AddEntryPointsRoute {
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
				},
				entryPointName: {
					type: 'string',
					minLength: 2
				}
			},
			required: ['parkingComplexId', 'entryPointName']
		});
	}

	/** Setup route */
	setupRoute() {
		this.app.post(
			'/v1/entry-points/add',
			this.verifyRequest.bind(this),
			this.addEntryPoint.bind(this)
		);
	}

	/** Validate request */
	verifyRequest(req, res, next) {
		if (!this.validate(req.body)) {
			const error = new InvalidArgumentError(this.validate.errors[0].message);

			return res.status(error.code).json(error);
		}

		next();
	}

	/** Add entry point */
	async addEntryPoint(req, res, next) {
		try {
			await this.controllers.entryPoints.add(
				req.body.parkingComplexId,
				req.body.entryPointName
			);

			res.status(200).json({
				ok: true
			});
		} catch (error) {
			return res.status(error.code).json(error);
		}
	}
}

module.exports = AddEntryPointsRoute;
