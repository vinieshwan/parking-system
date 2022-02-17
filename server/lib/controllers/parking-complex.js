'use strict';

const { InternalServerError, NotFoundError } = require('@lib/utils/errors');

/** Controller for parking complex management */
class ParkingComplex {
	constructor(config) {
		if (config.models === undefined) {
			throw new Error('Models were not provided');
		}

		if (config.models.parkingComplex === undefined) {
			throw new Error('Parking complex model was not provided');
		}

		this.model = config.models.parkingComplex;
	}

	/**
	 * Retrieve parking complex information
	 * @param {string} parkingComplexName - Parking complex name
	 * @returns {Promise<objectp[]>}
	 */
	async get(parkingComplexName) {
		try {
			const parkingComplex = await this.model.getByName(parkingComplexName);

			if (parkingComplex === null) {
				throw new NotFoundError('no parking complex found');
			}

			return parkingComplex;
		} catch (error) {
			throw new InternalServerError();
		}
	}
}

module.exports = ParkingComplex;
