'use strict';

const { InternalServerError, NotFoundError } = require('@lib/utils/errors');
const { timeDiffInHour } = require('@lib/utils/compute');

/** Controller for park history management */
class ParkHistories {
	constructor(context) {
		if (context.models === undefined) {
			throw new Error('Models were not provided');
		}

		if (context.models.parkingHistories === undefined) {
			throw new Error('Entry point model was not provided');
		}

		if (context.models.parkingSlots === undefined) {
			throw new Error('Parking slot model was not provided');
		}

		if (context.models.parkingComplex === undefined) {
			throw new Error('Parking complex model was not provided');
		}

		this.models = {
			parkingHistories: context.models.parkingHistories,
			parkingSlots: context.models.parkingSlots,
			parkingComplex: context.models.parkingComplex
		};
	}

	/** Execute park command
	 * @param {string} parkingSlotId - Parking slot id
	 * @param {string} entryPointId - Entry point id
	 * @param {object} details - Vehicle parking details
	 * @param {string} details.plateNumber - Vehicle plate number
	 * @param {number} details.type - Vehicle type
	 * @param {Date} [details.parkTime] - Park time
	 */
	async execute(parkingSlotId, entryPointId, details) {
		const { plateNumber, type, parkTime = new Date() } = details;

		const vehicleDetails = {
			plateNumber,
			type,
			entryPointId,
			parkingSlotId,
			parkTime: new Date(parkTime)
		};

		try {
			const slot = await this.models.parkingSlots.getById(parkingSlotId);

			if (slot === null) {
				throw new NotFoundError('parking slot not found');
			}

			vehicleDetails.parkingSlotType = slot.type;
			vehicleDetails.parkingSlotRate = slot.ratePerHour;

			const parkingComplex = await this.models.parkingComplex.getById(
				slot.parkingComplexId.toString()
			);

			if (parkingComplex === null) {
				throw new NotFoundError('parking complex not found');
			}

			vehicleDetails.parkingComplexId = parkingComplex._id.toString();

			const parkHistory = await this.models.parkingHistories.getByPlateNumber(
				plateNumber
			);

			const prevTimeAct = {};

			if (parkHistory) {
				vehicleDetails.isFlatRateConsumed = parkHistory.isFlatRateConsumed;

				if (parkHistory.initialParkTime) {
					vehicleDetails.initialParkTime = parkHistory.initialParkTime;
				}

				if (parkHistory.parkTime) {
					prevTimeAct.parkTime = parkHistory.parkTime;
				}

				if (parkHistory.unparkTime) {
					prevTimeAct.unparkTime = parkHistory.unparkTime;
				}
			}

			const parkingDetails = ParkHistories.prepareParkDetails(
				vehicleDetails,
				{
					continuousHourThreshold: parkingComplex.continuousHourThreshold
				},
				prevTimeAct
			);

			const recorded = await this.models.parkingHistories.add(parkingDetails);

			if (!recorded.acknowledged) {
				throw new InternalServerError();
			}

			await this.models.parkingSlots.updateSlotAvailability(
				parkingSlotId,
				true
			);
		} catch (error) {
			throw new InternalServerError();
		}
	}

	/** Prepare parking details
	 * @param {object} vehicleDetails - Vehicle parking details
	 * @param {string} vehicleDetails.plateNumber - Vehicle plate number
	 * @param {number} vehicleDetails.type - Vehicle type
	 * @param {string} vehicleDetails.parkingComplexId - Parking complex id
	 * @param {string} vehicleDetails.entryPointId - Entry point id
	 * @param {string} vehicleDetails.parkingSlotId - Parking slot id
	 * @param {string} vehicleDetails.parkingSlotType - Parking slot type
	 * @param {string} vehicleDetails.parkingSlotRate - Parking slot rate
	 * @param {Date} [vehicleDetails.parkTime] - Park time
	 * @param {object} parkingComplexDetails - Parking complex details
	 * @param {number} parkingComplexDetails.continuousHourThreshold - Continuous hour threshold
	 * @param {Object} [prevTimeAct={}] - Previous time activity
	 * @param {Date} [prevTimeAct.parkTime] - Previous parkTime
	 * @param {Date} [prevTimeAct.unparkTime] - Previous unparkTime
	 */
	static prepareParkDetails(
		vehicleDetails,
		parkingComplexDetails,
		prevTimeAct = {}
	) {
		const {
			plateNumber,
			type,
			entryPointId,
			parkingSlotId,
			parkingComplexId,
			parkTime,
			parkingSlotType,
			parkingSlotRate,
			initialParkTime,
			isContinuous = false,
			isFlatRateConsumed = false
		} = vehicleDetails;

		const parkingDetails = {
			plateNumber,
			entryPointId,
			parkingSlotId,
			parkingComplexId,
			vehicleType: type,
			parkingSlotType,
			parkTime,
			parkingSlotRate,
			isContinuous,
			isFlatRateConsumed
		};

		if (prevTimeAct.unparkTime) {
			parkingDetails.isContinuous = ParkHistories.isContinuous(
				prevTimeAct.unparkTime,
				parkingDetails.parkTime,
				parkingComplexDetails.continuousHourThreshold
			);
		}

		if (!parkingDetails.isContinuous) {
			parkingDetails.isFlatRateConsumed = false;
			delete parkingDetails.initialParkTime;
		}

		if (parkingDetails.isContinuous && prevTimeAct.parkTime) {
			parkingDetails.initialParkTime = initialParkTime || prevTimeAct.parkTime;
		}

		return parkingDetails;
	}

	/** Computes the time difference in hour
	 * @param {Date} prevUnparkTime - Previous unpark time
	 * @param {Date} currentParkTime - Current park time
	 * @param {number} continuousHourThreshold - Continuous hour threshold
	 * @returns {boolean}
	 */
	static isContinuous(
		prevUnparkTime,
		currentParkTime,
		continuousHourThreshold
	) {
		if (
			timeDiffInHour(currentParkTime, prevUnparkTime) <= continuousHourThreshold
		) {
			return true;
		}

		return false;
	}
}

module.exports = ParkHistories;
