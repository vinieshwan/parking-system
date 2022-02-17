'use strict';

const { expect } = require('chai');

const { timeDiffInHour } = require('@lib/utils/compute');

describe('/lib/utils/compute.js', () => {
	describe('#timeDiffInHour', () => {
		it('should return positive integer', () => {
			const diff = timeDiffInHour(
				new Date('2022-02-15T02:48:00.553+00:00'),
				new Date('2022-02-15T01:48:00.553+00:00')
			);

			expect(diff).to.equal(1);
		});

		it('should return negative integer', () => {
			const diff = timeDiffInHour(
				new Date('2022-02-15T01:48:00.553+00:00'),
				new Date('2022-02-15T02:48:00.553+00:00')
			);

			expect(diff).to.equal(-1);
		});
	});
});
