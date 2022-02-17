'use strict';

const Ajv = require('ajv');

const { VEHICLE_TYPE } = require('@lib/constants');
const { InvalidArgumentError } = require('@lib/utils/errors');

/** Endpoint for getting an available slot  */
class GetParkingSlotRoute {
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
				entryPointId: {
					type: 'string',
					pattern: '^[0-9A-Fa-f]{24}$'
				},
				type: {
					type: 'string',
					enum: ['small', 'medium', 'large']
				}
			},
			required: ['parkingComplexId', 'entryPointId', 'type']
		});
	}

	/** Setup route */
	setupRoute() {
		this.app.get(
			'/v1/parking-slot/get/:parkingComplexId/:entryPointId/:type',
			this.verifyRequest.bind(this),
			this.getAvailableSlot.bind(this)
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

	/** Retrieve available slot */
	async getAvailableSlot(req, res, next) {
		try {
			const slot = await this.controllers.command.execute(
				this.controllers.parkingSlots,
				req.params.parkingComplexId,
				req.params.entryPointId,
				{
					type: VEHICLE_TYPE[req.params.type]
				}
			);

			res.status(200).json({
				ok: true,
				data: slot
			});
		} catch (error) {
			return res.status(error.code).json(error);
		}
	}
}

module.exports = GetParkingSlotRoute;
