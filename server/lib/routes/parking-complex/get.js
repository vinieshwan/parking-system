'use strict';

const Ajv = require('ajv');

const { InvalidArgumentError } = require('@lib/utils/errors');

/** Endpoint for getting a parking complex  */
class GetParkingComplexRoute {
	constructor(app, context) {
		this.app = app;
		this.config = context.config;
		this.controllers = context.controllers;

		const ajv = new Ajv();

		this.validate = ajv.compile({
			type: 'object',
			additionalProperties: false,
			properties: {
				parkingComplexName: {
					type: 'string',
					minLength: 2
				}
			},
			required: ['parkingComplexName']
		});
	}

	/** Setup route */
	setupRoute() {
		this.app.get(
			'/v1/parking-complex/get/:parkingComplexName',
			this.verifyRequest.bind(this),
			this.getParkingComplex.bind(this)
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

	/** Retrieve parking complex information */
	async getParkingComplex(req, res, next) {
		try {
			const parkingComplex = await this.controllers.parkingComplex.get(
				req.params.parkingComplexName
			);

			res.status(200).json({
				ok: true,
				data: parkingComplex
			});
		} catch (error) {
			return res.status(error.code).json(error);
		}
	}
}

module.exports = GetParkingComplexRoute;
