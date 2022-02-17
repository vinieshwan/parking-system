'use strict';

const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const { InvalidArgumentError } = require('@lib/utils/errors');

/** Endpoint for recording unparking history  */
class UnparkHistoryRoute {
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
				unparkTime: {
					type: 'string',
					format: 'date-time'
				}
			},
			required: ['plateNumber']
		});
	}

	/** Setup route */
	setupRoute() {
		this.app.post(
			'/v1/parking-history/unpark',
			this.verifyRequest.bind(this),
			this.recordUnparkingHistory.bind(this)
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

	/** Record unparking history */
	async recordUnparkingHistory(req, res, next) {
		const details = {
			plateNumber: req.body.plateNumber.toLowerCase()
		};

		if (req.body.unparkTime) {
			details.unparkTime = req.body.unparkTime;
		}

		try {
			const payable = await this.controllers.command.execute(
				this.controllers.unparkHistories,
				details
			);

			res.status(200).json({
				ok: true,
				data: payable
			});
		} catch (error) {
			return res.status(error.code).json(error);
		}
	}
}

module.exports = UnparkHistoryRoute;
