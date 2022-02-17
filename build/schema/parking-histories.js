module.exports = {
	bsonType: 'object',
	required: [
		'plateNumber',
		'vehicleType',
		'parkingSlotType',
		'parkingSlotRate',
		'entryPointId',
		'parkingSlotId',
		'parkingComplexId',
		'isContinuous',
		'isFlatRateConsumed',
		'parkTime'
	],
	properties: {
		plateNumber: {
			bsonType: 'string',
			description: 'Vehicle plate number.'
		},
		vehicleType: {
			bsonType: 'int',
			enum: [0, 1, 2],
			description:
				'Vehicle type. 0 for small size vehicles, 1 for medium size vehicles and 2 for large size vehicles.'
		},
		parkingSlotType: {
			bsonType: 'int',
			enum: [0, 1, 2],
			description:
				'Parking slot type. 0 for small size vehicles, 1 for medium size vehicles and 2 for large size vehicles.'
		},
		parkingSlotRate: {
			bsonType: 'int',
			description:
				'Vehicle type. 0 for small size vehicles, 1 for medium size vehicles and 2 for large size vehicles.'
		},
		parkingSlotId: {
			bsonType: 'objectId',
			description: 'The parking slot Id where the vehicle occupied.'
		},
		entryPointId: {
			bsonType: 'objectId',
			description: 'Entry point id where the vehicle entered from.'
		},
		parkingComplexId: {
			bsonType: 'objectId',
			description: 'Parking complex ID.'
		},
		isContinuous: {
			bsonType: 'bool',
			description: 'Identifier to know if the vehicle is on continuous rate.'
		},
		isFlatRateConsumed: {
			bsonType: 'bool',
			description:
				'Identifier to know if the vehicle already consumed the flat rate.'
		},
		initialParkTime: {
			bsonType: 'date',
			description:
				'The initial start time the vehicle entered the parking complex if he is on continuous rate.'
		},
		parkTime: {
			bsonType: 'date',
			description: 'The time the vehicle entered the parking complex.'
		},
		unparkTime: {
			bsonType: 'date',
			description: 'The time the vehicle unparked from the parking complex.'
		}
	}
};
