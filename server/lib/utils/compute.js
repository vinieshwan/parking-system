'use strict';

module.exports = {
	/** Computes the time difference in hour
	 * @param {Date} start - start/previous time
	 * @param {Date} end - end/current time
	 * @returns {number}
	 */
	timeDiffInHour: function (start, end) {
		return (start - end) / 3600000;
	}
};
