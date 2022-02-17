'use strict';

const { InternalServerError } = require('@lib/utils/errors');

/** Controller for parking slot management */
class ParkingSlots {
	constructor(config) {
		if (config.models === undefined) {
			throw new Error('Models were not provided');
		}

		if (config.models.parkingSlots === undefined) {
			throw new Error('Parking slots model was not provided');
		}

		this.model = config.models.parkingSlots;
	}

	/**
	 * Execute Retrieving of available parking slot
	 * @param {string} parkingComplexId - Parking complex ID
	 * @param {string} entryPointId - Entry point ID
	 * @param {object} vehicleDetails - vehicle details
	 * @param {number} vehicleDetails.type - vehicle type
	 * @returns {Promise<objectp[]>}
	 */
	async execute(parkingComplexId, entryPointId, vehicleDetails) {
		try {
			return await this.model.getAvailableSlot(
				parkingComplexId,
				entryPointId,
				vehicleDetails
			);
		} catch (error) {
			throw new InternalServerError();
		}
	}
}

module.exports = ParkingSlots;
