'use strict';

const { ObjectId } = require('mongodb');

class EntryPoints {
	constructor(client, options) {
		const { database } = options;

		const db = client.db(database);
		this.collection = db.collection(EntryPoints.getCollectionName());
	}

	/**
	 * Contains the collection name for this model
	 * @returns {string}
	 */
	static getCollectionName() {
		return 'entryPoints';
	}

	/**
	 * List parking entry points by parking complex ID
	 * @param {string} parkingComplexId - Parking complex ID
	 * @returns {Promise<Object[]>}
	 */
	list(parkingComplexId) {
		return this.collection
			.find({
				parkingComplexId: new ObjectId(parkingComplexId)
			})
			.toArray();
	}

	/**
	 * Add new entry point
	 * @param {string} parkingComplexId - Parking complex ID
	 * @param {string} entryPointName - Entry point name
	 * @returns {Promise<Object>}
	 */
	add(parkingComplexId, entryPointName) {
		return this.collection.insertOne({
			name: entryPointName,
			parkingComplexId: new ObjectId(parkingComplexId),
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}
}

module.exports = EntryPoints;
