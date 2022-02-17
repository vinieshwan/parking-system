'use strict';

const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const { InvalidArgumentError } = require('@lib/utils/errors');
const { VEHICLE_TYPE } = require('@lib/constants');

/** Endpoint for recording parking history  */
class ParkHistoryRoute {
	constructor(app, context) {
		this.app = app;
		this.config = context.config;
		this.controllers = context.controllers;

		const ajv = new Ajv();
		addFormats(ajv);

		this.validate = ajv.compile({
			type: 'object',
			additionalProperties: false,
			properties: {
				plateNumber: {
					type: 'string',
					minLength: 4,
					maxLength: 10
				},
				parkingSlotId: {
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
				},
				parkTime: {
					type: 'string',
					format: 'date-time'
				}
			},
			required: ['plateNumber', 'parkingSlotId', 'entryPointId', 'type']
		});
	}

	/** Setup route */
	setupRoute() {
		this.app.post(
			'/v1/parking-history/park',
			this.verifyRequest.bind(this),
			this.recordParkingHistory.bind(this)
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

	/** Record parking history */
	async recordParkingHistory(req, res, next) {
		const details = {
			type: VEHICLE_TYPE[req.body.type],
			plateNumber: req.body.plateNumber.toLowerCase()
		};

		if (req.body.parkTime) {
			details.parkTime = req.body.parkTime;
		}

		try {
			await this.controllers.command.execute(
				this.controllers.parkHistories,
				req.body.parkingSlotId,
				req.body.entryPointId,
				details
			);
		} catch (error) {
			return res.status(error.code).json(error);
		}

		res.status(200).json({
			ok: true
		});
	}
}

module.exports = ParkHistoryRoute;
