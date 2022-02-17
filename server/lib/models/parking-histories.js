'use strict';

const { ObjectId } = require('mongodb');

class ParkingHistories {
	constructor(client, options) {
		const { database } = options;

		const db = client.db(database);
		this.collection = db.collection(ParkingHistories.getCollectionName());
	}

	/**
	 * Contains the collection name for this model
	 * @returns {string}
	 */
	static getCollectionName() {
		return 'parkingHistories';
	}

	/**
	 * Record parking history
	 * @param {object} parkingDetails - Parking details
	 * @param {string} parkingDetails.plateNumber - Parking details
	 * @param {number} parkingDetails.vehicleType - Vehicle type
	 * @param {number} parkingDetails.parkingSlotType - Parking slot type
	 * @param {number} parkingDetails.parkingSlotRate - Parking slot rate
	 * @param {string} parkingDetails.parkingSlotId - Parking slot ID
	 * @param {string} parkingDetails.entryPointId - Entry point ID
	 * @param {string} parkingDetails.parkingComplexId - Parking complex ID
	 * @param {boolean} parkingDetails.isContinuous - Identifier if a vehicle is on continuous rate
	 * @param {boolean} parkingDetails.isFlatRateConsumed - Identifier if a vehicle already consumed the flat rate
	 * @param {initialParkTime} [parkingDetails.initialParkTime] - Initial park time
	 * @param {Date} parkingDetails.parkTime - Park time
	 * @returns {Promise<Object>}
	 */
	add(parkingDetails) {
		const {
			plateNumber,
			vehicleType,
			parkingSlotType,
			parkingSlotRate,
			parkingSlotId,
			entryPointId,
			parkingComplexId,
			isContinuous,
			isFlatRateConsumed,
			parkTime
		} = parkingDetails;

		const details = {
			plateNumber,
			vehicleType,
			parkingSlotType,
			parkingSlotRate,
			parkingSlotId: new ObjectId(parkingSlotId),
			entryPointId: new ObjectId(entryPointId),
			parkingComplexId: new ObjectId(parkingComplexId),
			isContinuous,
			isFlatRateConsumed,
			parkTime
		};

		if (parkingDetails.initialParkTime) {
			details.initialParkTime = parkingDetails.initialParkTime;
		}

		return this.collection.insertOne(details);
	}

	/**
	 * Update parking history by ID
	 * @param {string} parkingHistoryId - Parking history ID
	 * @param {object} parkingDetails - Parking details
	 * @param {boolean} parkingDetails.isFlatRateConsumed - Identifier if a vehicle already consumed the flat rate
	 * @param {Date} parkingDetails.unparkTime - Unpark time
	 * @returns {Promise<Object>}
	 */
	update(parkingHistoryId, parkingDetails) {
		return this.collection.findOneAndUpdate(
			{
				_id: new ObjectId(parkingHistoryId)
			},
			{
				$set: {
					...parkingDetails
				}
			}
		);
	}

	/**
	 * Get the parking history details by vehicle plate number
	 * @param {string} plateNumber - Vehicle plate number
	 * @returns {Promise<Object>}
	 */
	getByPlateNumber(plateNumber) {
		return this.collection.findOne(
			{ plateNumber },
			{
				sort: {
					parkTime: -1
				}
			}
		);
	}
}

module.exports = ParkingHistories;
