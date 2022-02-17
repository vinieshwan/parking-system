'use strict';

const { ObjectId } = require('mongodb');

class ParkingComplex {
	constructor(client, options) {
		const { database } = options;

		const db = client.db(database);
		this.collection = db.collection(ParkingComplex.getCollectionName());
	}

	/**
	 * Contains the collection name for this model
	 * @returns {string}
	 */
	static getCollectionName() {
		return 'parkingComplex';
	}

	/**
	 * Get the parking complex details by name
	 * @param {string} parkingComplexName - Parking complex name
	 * @returns {Promise<Object>}
	 */
	getByName(parkingComplexName) {
		return this.collection.findOne({ name: parkingComplexName });
	}

	/**
	 * Get the parking complex details by ID
	 * @param {string} parkingComplexName - Parking complex name
	 * @returns {Promise<Object>}
	 */
	getById(parkingComplexId) {
		return this.collection.findOne({ _id: new ObjectId(parkingComplexId) });
	}
}

module.exports = ParkingComplex;
