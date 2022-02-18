'use strict';

const { ONE_DAY_IN_HOURS } = require('@lib/constants');
const { InternalServerError, NotFoundError } = require('@lib/utils/errors');
const { timeDiffInHour } = require('@lib/utils/compute');

class UnparkHistories {
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

	/** Execute unpark command
	 * @param {object} details - Vehicle parking details
	 * @param {string} details.plateNumber - Vehicle plate number
	 * @param {Date} [details.unparkTime] - Park time
	 */
	async execute(details) {
		const { plateNumber, unparkTime = new Date() } = details;

		try {
			const parkHistory = await this.models.parkingHistories.getByPlateNumber(
				plateNumber
			);

			if (parkHistory === null) {
				throw new NotFoundError('parking history not found');
			}

			const parkingComplex = await this.models.parkingComplex.getById(
				parkHistory.parkingComplexId.toString()
			);

			if (parkingComplex === null) {
				throw new NotFoundError('parking complex not found');
			}

			parkHistory.unParkTime = new Date(unparkTime);

			const parkingDetails = UnparkHistories.calculateFee(parkHistory, {
				flatRate: parkingComplex.flatRate,
				dayRate: parkingComplex.dayRate
			});

			const recorded = await this.models.parkingHistories.update(
				parkHistory._id.toString(),
				{
					unparkTime: parkHistory.unParkTime,
					isFlatRateConsumed: parkingDetails.isFlatRateConsumed
				}
			);

			if (!recorded.lastErrorObject.updatedExisting) {
				throw new InternalServerError();
			}

			await this.models.parkingSlots.updateSlotAvailability(
				parkHistory.parkingSlotId.toString(),
				false
			);

			return parkingDetails.payable;
		} catch (error) {
			throw new InternalServerError();
		}
	}

	/** Calculate fees
	 * @param {object} historyDetails - Parking history details
	 * @param {string} historyDetails.plateNumber - Vehicle plate number
	 * @param {number} historyDetails.type - Vehicle type
	 * @param {string} historyDetails.entryPointId - Entry point id
	 * @param {string} historyDetails.parkingSlotId - Parking slot id
	 * @param {boolean} historyDetails.isContinuous - Identifier in knowing if the vehicle is on continuous rate
	 * @param {boolean} historyDetails.isFlatRateConsumed - Identifier in knowing if the vehicle already consumed the flat rate
	 * @param {Date} historyDetails.parkTime - The time the vehicle entered the parking complex
	 * @param {Date} historyDetails.unParkTime - The time the vehicle unpark
	 * @param {Date} [historyDetails.initialParkTime] - Initial parkTime of the vehicle if he is on continuous rate
	 * @param {Date} historyDetails.parkingSlotRate - Slot rate per hour
	 * @param {object} parkingComplexDetails - Parking complex details
	 * @param {object} parkingComplexDetails.flatRate - Flat rate details
	 * @param {number} parkingComplexDetails.flatRate.rate - Rate
	 * @param {number} parkingComplexDetails.flatRate.hours - Number of hours
	 * @param {number} parkingComplexDetails.dayRate - Day rate
	 */
	static calculateFee(historyDetails, parkingComplexDetails) {
		const { isContinuous } = historyDetails;

		if (isContinuous) {
			return UnparkHistories.calculateContinuousRate(
				historyDetails,
				parkingComplexDetails
			);
		}

		return UnparkHistories.calculateNormalRate(
			historyDetails,
			parkingComplexDetails
		);
	}

	/** Calculates fees for normal rate
	 * @param {object} historyDetails - Parking history details
	 * @param {Date} historyDetails.parkTime - The time the vehicle entered the parking complex
	 * @param {number} historyDetails.type - Vehicle type
	 * @param {Date} historyDetails.isFlatRateConsumed - The time the vehicle entered the parking complex
	 * @param {Date} [historyDetails.initialParkTime] - Initial parkTime of the vehicle if he is on continuous rate
	 * @param {object} parkingComplexDetails - Parking complex details
	 * @param {object} parkingComplexDetails.flatRate - Flat rate details
	 * @param {number} parkingComplexDetails.rate - Rate
	 * @param {number} parkingComplexDetails.hours - Number of hours
	 * @param {number} parkingComplexDetails.dayRate - Day rate
	 * @returns {number}
	 */
	static calculateNormalRate(historyDetails, parkingComplexDetails) {
		const { parkTime, parkingSlotRate, isFlatRateConsumed, unParkTime } =
			historyDetails;

		const { flatRate, dayRate } = parkingComplexDetails;

		const unParkTimeDiff =
			Math.ceil(timeDiffInHour(unParkTime, parkTime)) - flatRate.hours;

		if (unParkTimeDiff <= 0) {
			return {
				payable: flatRate.rate,
				isFlatRateConsumed
			};
		}

		if (unParkTimeDiff >= ONE_DAY_IN_HOURS) {
			return {
				payable:
					flatRate.rate +
					UnparkHistories.calculateDaysFee(
						unParkTimeDiff,
						parkingSlotRate,
						dayRate
					),
				isFlatRateConsumed
			};
		}

		return {
			payable: flatRate.rate + Math.ceil(unParkTimeDiff) * parkingSlotRate,
			isFlatRateConsumed: true
		};
	}

	/** Calculates fees for continuous rate
	 * @param {object} historyDetails - Parking history details
	 * @param {Date} historyDetails.parkTime - The time the vehicle entered the parking complex
	 * @param {number} historyDetails.type - Vehicle type
	 * @param {Date} historyDetails.isFlatRateConsumed - The time the vehicle entered the parking complex
	 * @param {Date} [historyDetails.initialParkTime] - Initial parkTime of the vehicle if he is on continuous rate
	 * @param {object} parkingComplexDetails - Parking complex details
	 * @param {object} parkingComplexDetails.flatRate - Flat rate details
	 * @param {number} parkingComplexDetails.flatRate.rate - Rate
	 * @param {number} parkingComplexDetails.flatRate.hours - Number of hours
	 * @param {number} parkingComplexDetails.dayRate - Day rate
	 * @returns {number}
	 */
	static calculateContinuousRate(historyDetails, parkingComplexDetails) {
		const {
			parkTime,
			initialParkTime,
			isFlatRateConsumed,
			parkingSlotRate,
			unParkTime
		} = historyDetails;

		const { flatRate, dayRate } = parkingComplexDetails;

		if (isFlatRateConsumed) {
			const unParkTimeDiff = Math.ceil(timeDiffInHour(unParkTime, parkTime));

			return {
				payable: unParkTimeDiff * parkingSlotRate,
				isFlatRateConsumed
			};
		}

		const allTimeDiff =
			Math.ceil(timeDiffInHour(unParkTime, initialParkTime)) - flatRate.hours;

		if (allTimeDiff < 0) {
			return {
				payable: 0,
				isFlatRateConsumed
			};
		}

		if (allTimeDiff >= ONE_DAY_IN_HOURS) {
			return {
				payable: UnparkHistories.calculateDaysFee(
					allTimeDiff,
					parkingSlotRate,
					dayRate
				),
				isFlatRateConsumed
			};
		}

		return {
			payable: Math.ceil(allTimeDiff) * parkingSlotRate,
			isFlatRateConsumed: true
		};
	}

	/** Calculates fees for days
	 * @param {number} timeDiff - Time difference
	 * @param {number} ratePerHour - Rate per hour
	 * @param {number} dayRate - Day rate
	 * @returns {number}
	 */
	static calculateDaysFee(timeDiff, ratePerHour, dayRate) {
		const timeDiffInDays = Math.ceil(timeDiff) / ONE_DAY_IN_HOURS;
		const remainingDayDiff = timeDiff % ONE_DAY_IN_HOURS;

		return (
			Math.floor(timeDiffInDays) * dayRate + remainingDayDiff * ratePerHour
		);
	}
}

module.exports = UnparkHistories;
