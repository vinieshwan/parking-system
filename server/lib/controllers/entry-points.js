'use strict';

const { InternalServerError } = require('@lib/utils/errors');

/** Controller for entry points management */
class EntryPoints {
	constructor(context) {
		if (context.models === undefined) {
			throw new Error('Models were not provided');
		}

		if (context.models.entryPoints === undefined) {
			throw new Error('Entry point model was not provided');
		}

		this.model = context.models.entryPoints;
	}

	/**
	 * List all entry points from a parking complex
	 * @param {string} parkingComplexId - Parking complex Id
	 * @returns {Promise<object[]>}
	 */
	async list(parkingComplexId) {
		try {
			return await this.model.list(parkingComplexId);
		} catch (error) {
			throw new InternalServerError();
		}
	}

	/**
	 * Add new entry point
	 * @param {string} parkingComplexId - Parking complex Id
	 * @param {string} entryPointName - Entry point name
	 * @returns {Promise<object>}
	 */
	async add(parkingComplexId, entryPointName) {
		try {
			return await this.model.add(parkingComplexId, entryPointName);
		} catch (error) {
			throw new InternalServerError();
		}
	}
}

module.exports = EntryPoints;
