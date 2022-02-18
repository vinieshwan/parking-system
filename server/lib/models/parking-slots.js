'use strict';

const { ObjectId } = require('mongodb');

class ParkingSlots {
	constructor(client, options) {
		const { database } = options;

		const db = client.db(database);
		this.collection = db.collection(ParkingSlots.getCollectionName());
	}

	/**
	 * Contains the collection name for this model
	 * @returns {string}
	 */
	static getCollectionName() {
		return 'parkingSlots';
	}

	/**
	 * Get an available slots that is nearest to the vehicle entry point
	 * @param {string} parkingComplexId - Parking complex ID
	 * @param {string} entryPointId - Entry point ID
	 * @param {object} vehicleDetails - Contains the vehicle information
	 * @param {string} vehicleDetails.type - Type of the vehicle
	 * @returns {Promise<Object>}
	 */
	getAvailableSlot(parkingComplexId, entryPointId, vehicleDetails) {
		const { type } = vehicleDetails;

		return this.collection.findOne(
			{
				parkingComplexId: new ObjectId(parkingComplexId),
				type: {
					$gte: type
				},
				isOccupied: false
			},
			{
				sort: {
					[`distances.${new ObjectId(entryPointId)}`]: 1,
					type: 1
				}
			}
		);
	}

	/**
	 * Get parking slot details by ID
	 * @param {string} parkingSlotId - Parking slot ID
	 * @returns {Promise<Object>}
	 */
	getById(parkingSlotId) {
		return this.collection.findOne({
			_id: new ObjectId(parkingSlotId)
		});
	}

	/**
	 * Update slot availability
	 * @param {string} parkingSlotId - Parking slot ID
	 * @param {boolean} isOccupied - Identifier if a slot is available
	 * @returns {Promise<Object>}
	 */
	updateSlotAvailability(parkingSlotId, isOccupied) {
		return this.collection.findOneAndUpdate(
			{
				_id: new ObjectId(parkingSlotId)
			},
			{
				$set: {
					isOccupied,
					updatedAt: new Date()
				}
			}
		);
	}
}
module.exports = ParkingSlots;
